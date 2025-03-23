// src/modules/datasets/services/datasetService.js
import { getAuth } from 'firebase/auth';

const API_ENDPOINT = 'http://localhost:5001/api';

const datasetService = {
  /**
   * Get Firebase authentication token
   * @returns {Promise<string>} Firebase ID token
   */
  async getFirebaseToken() {
    const auth = getAuth();
    const user = auth.currentUser;

    if (!user) {
      console.error('No authenticated user found when trying to upload dataset');
      throw new Error('User not authenticated. Please login again.');
    }

    try {
      // Force token refresh to ensure we have the latest one
      return await user.getIdToken(true);
    } catch (error) {
      console.error('Error getting Firebase token:', error);
      throw new Error('Failed to get authentication token. Please try logging in again.');
    }
  },

  /**
   * Upload a dataset file
   * @param {File} file - The file to upload
   * @param {Object} metadata - Dataset metadata (name, description, dataType)
   * @param {Function} [progressCallback] - Optional progress tracking callback
   * @returns {Promise} - Promise that resolves with the upload response
   */
  async uploadDataset(file, metadata, progressCallback) {
    try {
      console.log("Dataset Service: Uploading file:", file.name);

      // Get Firebase authentication token
      const token = await this.getFirebaseToken();

      // Create form data object
      const formData = new FormData();
      formData.append('file', file);

      // Add metadata fields to the form data
      Object.keys(metadata).forEach(key => {
        formData.append(key, metadata[key]);
      });

      // Create XMLHttpRequest for progress tracking
      return new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();

        // Progress tracking
        if (progressCallback) {
          xhr.upload.onprogress = (event) => {
            if (event.lengthComputable) {
              const percentComplete = (event.loaded / event.total) * 100;
              progressCallback(percentComplete, 'Uploading...');
            }
          };
        }

        // Success handler
        xhr.onload = () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            try {
              const response = JSON.parse(xhr.responseText);
              resolve({
                dataset: response,
                status: xhr.status
              });
            } catch (parseError) {
              console.error('Failed to parse upload response:', parseError);
              reject(new Error('Invalid server response'));
            }
          } else {
            // Parse error response
            try {
              const errorResponse = JSON.parse(xhr.responseText);
              reject(new Error(errorResponse.error || `Upload failed with status ${xhr.status}`));
            } catch {
              reject(new Error(`Upload failed with status ${xhr.status}`));
            }
          }
        };

        // Error handler
        xhr.onerror = () => {
          console.error('Network error during file upload');
          reject(new Error('Network error. Please check your connection.'));
        };

        // Open and send the request
        xhr.open('POST', `${API_ENDPOINT}/datasets/upload`, true);

        // Set authorization header
        xhr.setRequestHeader('Authorization', `Bearer ${token}`);

        // Send the form data
        xhr.send(formData);
      });
    } catch (error) {
      console.error('Dataset Service: Upload error:', error);
      throw error;
    }
  },

  /**
   * Get all datasets for the current user with authentication
   * @returns {Promise} Promise that resolves with datasets
   */
  async getUserDatasets() {
    try {
      const token = await this.getFirebaseToken();

      const response = await fetch(`${API_ENDPOINT}/datasets`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch datasets');
      }

      const data = await response.json();
      return data.datasets || [];
    } catch (error) {
      console.error('Dataset Service: Get datasets error:', error);
      throw error;
    }
  },

  /**
   * Delete a dataset
   * @param {string} datasetId - ID of the dataset to delete
   * @returns {Promise} Promise that resolves when the dataset is deleted
   */
  async deleteDataset(datasetId) {
    try {
      const token = await this.getFirebaseToken();

      const response = await fetch(`${API_ENDPOINT}/datasets/${datasetId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete dataset');
      }

      return { success: true };
    } catch (error) {
      console.error('Dataset Service: Delete dataset error:', error);
      throw error;
    }
  },

  /**
   * Get schema for a dataset
   * @param {string} datasetId - ID of the dataset to get schema for
   * @returns {Promise<Object>} - Promise that resolves with the schema
   */
  async getDatasetSchema(datasetId) {
    try {
      console.log('Dataset Service: Fetching schema for dataset:', datasetId);
      const token = await this.getFirebaseToken();

      const response = await fetch(`${API_ENDPOINT}/datasets/${datasetId}/schema`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch dataset schema');
      }

      const data = await response.json();
      console.log('Dataset Service: Schema data received:', data);
      return data.schema || {};
    } catch (error) {
      console.error('Dataset Service: Get schema error:', error);
      throw error;
    }
  },

  /**
   * Get a single dataset by ID
   * @param {string} datasetId - ID of the dataset to retrieve
   * @returns {Promise<Object>} - Promise that resolves with the dataset
   */
  async getSingleDataset(datasetId) {
    try {
      console.log('Dataset Service: Fetching single dataset:', datasetId);
      const token = await this.getFirebaseToken();

      // Add cache-busting parameter to prevent browser caching
      const url = `${API_ENDPOINT}/datasets/${datasetId}?t=${Date.now()}`;

      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch dataset');
      }

      const data = await response.json();
      console.log('Dataset Service: Single dataset received:', data);
      return data.dataset || {};
    } catch (error) {
      console.error('Dataset Service: Get single dataset error:', error);
      throw error;
    }
  },

  /**
   * Update dataset metadata
   * @param {string} datasetId - ID of the dataset to update
   * @param {Object} metadata - Updated metadata (name, description)
   * @returns {Promise<Object>} - Promise that resolves with the updated dataset
   */
  async updateDataset(datasetId, metadata) {
    try {
      const token = await this.getFirebaseToken();

      const response = await fetch(`${API_ENDPOINT}/datasets/${datasetId}`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(metadata)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update dataset');
      }

      const data = await response.json();
      return data.dataset || {};
    } catch (error) {
      console.error('Dataset Service: Update dataset error:', error);
      throw error;
    }
  },

  /**
   * Update schema for a dataset (column types and descriptions)
   * @param {string} datasetId - ID of the dataset to update schema for
   * @param {Object} schemaData - Updated schema data with columns array
   * @returns {Promise<Object>} - Promise that resolves with the updated schema
   */
  async updateSchema(datasetId, schemaData) {
    try {
      console.log('Dataset Service: Updating schema for dataset:', datasetId);
      const token = await this.getFirebaseToken();

      const response = await fetch(`${API_ENDPOINT}/datasets/${datasetId}/schema`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ columns: schemaData.columns })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update schema');
      }

      const data = await response.json();
      console.log('Dataset Service: Schema update response:', data);
      return data.schema || {};
    } catch (error) {
      console.error('Dataset Service: Update schema error:', error);
      throw error;
    }
  },

  /**
   * Update dataset context information (overview data)
   * @param {string} datasetId - ID of the dataset to update context for
   * @param {Object} contextData - Updated context data (context, purpose, source, notes)
   * @returns {Promise<Object>} - Promise that resolves with the updated dataset
   */
  async updateDatasetContext(datasetId, contextData) {
    try {
      console.log('Dataset Service: Updating context for dataset:', datasetId);
      const token = await this.getFirebaseToken();

      const response = await fetch(`${API_ENDPOINT}/datasets/${datasetId}/context`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(contextData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update dataset context');
      }

      const data = await response.json();
      return data.dataset || {};
    } catch (error) {
      console.error('Dataset Service: Update context error:', error);
      throw error;
    }
  },

  /**
   * Get dataset preview data (sample rows)
   * @param {string} datasetId - ID of the dataset to get preview for
   * @param {number} [limit=100] - Maximum number of rows to return
   * @returns {Promise<Array>} - Promise that resolves with preview data rows
   */
  async getDatasetPreview(datasetId, limit = 100) {
    try {
      console.log('Dataset Service: Fetching preview for dataset:', datasetId);
      const token = await this.getFirebaseToken();

      const response = await fetch(`${API_ENDPOINT}/datasets/${datasetId}/preview?limit=${limit}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to get dataset preview');
      }

      const data = await response.json();
      return data.preview || [];
    } catch (error) {
      console.error('Dataset Service: Get preview error:', error);
      throw error;
    }
  }
};

// Export as default
export default datasetService;
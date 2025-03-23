// src/core/api/index.js
/**
 * API Core Module
 *
 * This module provides base API functionality for making authenticated requests.
 * Other service modules will use this for specific API endpoints.
 */

import { getAuth } from 'firebase/auth';

// API base URL - can be overridden with environment variable
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || '/api';

/**
 * Get the current authentication token from Firebase
 * @returns {Promise<string>} Firebase auth token
 */
export async function getAuthToken() {
  const auth = getAuth();
  const user = auth.currentUser;

  if (!user) {
    console.error('API Core: No authenticated user found');
    throw new Error('User not authenticated. Please login again.');
  }

  try {
    // Force token refresh to ensure we have the latest token
    return await user.getIdToken(true);
  } catch (error) {
    console.error('API Core: Error getting Firebase token:', error);
    throw new Error('Failed to get authentication token. Please try logging in again.');
  }
}

/**
 * Make an authenticated API request
 * @param {string} endpoint - API endpoint (without base URL)
 * @param {Object} options - Fetch options
 * @returns {Promise<any>} API response
 */
export async function apiRequest(endpoint, options = {}) {
  try {
    // Get auth token
    const token = await getAuthToken();

    // Set up default headers with authentication
    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
      ...options.headers
    };

    // Make the request
    const url = `${API_BASE_URL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;

    console.log(`API Core: Making ${options.method || 'GET'} request to ${url}`);

    const response = await fetch(url, {
      ...options,
      headers
    });

    // Check if response is OK
    if (!response.ok) {
      let errorData;
      try {
        errorData = await response.json();
      } catch (e) {
        errorData = { error: `HTTP error ${response.status}` };
      }

      console.error('API Core: Error response:', errorData);
      throw new Error(errorData.error || `Request failed with status ${response.status}`);
    }

    // Parse and return response
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      return await response.json();
    }

    return await response.text();
  } catch (error) {
    console.error('API Core: Request error:', error);
    throw error;
  }
}

/**
 * Convenience method for GET requests
 * @param {string} endpoint - API endpoint
 * @param {Object} options - Additional fetch options
 * @returns {Promise<any>} API response
 */
export function get(endpoint, options = {}) {
  return apiRequest(endpoint, {
    method: 'GET',
    ...options
  });
}

/**
 * Convenience method for POST requests
 * @param {string} endpoint - API endpoint
 * @param {Object} data - Request body data
 * @param {Object} options - Additional fetch options
 * @returns {Promise<any>} API response
 */
export function post(endpoint, data, options = {}) {
  return apiRequest(endpoint, {
    method: 'POST',
    body: JSON.stringify(data),
    ...options
  });
}

/**
 * Convenience method for PUT requests
 * @param {string} endpoint - API endpoint
 * @param {Object} data - Request body data
 * @param {Object} options - Additional fetch options
 * @returns {Promise<any>} API response
 */
export function put(endpoint, data, options = {}) {
  return apiRequest(endpoint, {
    method: 'PUT',
    body: JSON.stringify(data),
    ...options
  });
}

/**
 * Convenience method for PATCH requests
 * @param {string} endpoint - API endpoint
 * @param {Object} data - Request body data
 * @param {Object} options - Additional fetch options
 * @returns {Promise<any>} API response
 */
export function patch(endpoint, data, options = {}) {
  return apiRequest(endpoint, {
    method: 'PATCH',
    body: JSON.stringify(data),
    ...options
  });
}

/**
 * Convenience method for DELETE requests
 * @param {string} endpoint - API endpoint
 * @param {Object} options - Additional fetch options
 * @returns {Promise<any>} API response
 */
export function del(endpoint, options = {}) {
  return apiRequest(endpoint, {
    method: 'DELETE',
    ...options
  });
}

/**
 * Upload a file with authentication
 * @param {string} endpoint - API endpoint
 * @param {FormData} formData - Form data with file
 * @param {Function} [progressCallback] - Optional progress callback
 * @returns {Promise<any>} API response
 */
export function uploadFile(endpoint, formData, progressCallback) {
  return new Promise(async (resolve, reject) => {
    try {
      // Get auth token
      const token = await getAuthToken();

      // Create XMLHttpRequest for progress tracking
      const xhr = new XMLHttpRequest();

      // Configure progress tracking
      if (progressCallback && typeof progressCallback === 'function') {
        xhr.upload.onprogress = (event) => {
          if (event.lengthComputable) {
            const percentComplete = (event.loaded / event.total) * 100;
            progressCallback(percentComplete, 'Uploading...');
          }
        };
      }

      // Handle response
      xhr.onload = () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          try {
            const response = JSON.parse(xhr.responseText);
            resolve(response);
          } catch (e) {
            // Handle case where response is not JSON
            resolve(xhr.responseText);
          }
        } else {
          try {
            const errorData = JSON.parse(xhr.responseText);
            reject(new Error(errorData.error || `Upload failed with status ${xhr.status}`));
          } catch (e) {
            reject(new Error(`Upload failed with status ${xhr.status}`));
          }
        }
      };

      // Handle errors
      xhr.onerror = () => {
        reject(new Error('Network error during file upload'));
      };

      // Set up and send request
      const url = `${API_BASE_URL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;
      xhr.open('POST', url, true);
      xhr.setRequestHeader('Authorization', `Bearer ${token}`);
      xhr.send(formData);
    } catch (error) {
      reject(error);
    }
  });
}

// Compatibility layer for apiService
export const apiService = {
  formatConversationHistory(messages) {
    if (!messages || messages.length === 0) {
      console.log("API Service: No messages to format");
      return [];
    }

    console.log("API Service: Formatting", messages.length, "messages");

    const formatted = messages
      .filter(msg => msg.role === 'user' || msg.role === 'assistant')
      .map(msg => ({
        role: msg.role,
        content: msg.content
      }));

    console.log("API Service: Formatted", formatted.length, "messages");
    return formatted;
  },

  async sendQuery(userQuery, conversationHistory = [], datasetId = null) {
    console.log("API Service: Sending query:", userQuery);
    console.log("API Service: With conversation history:", conversationHistory.length, "messages");
    console.log("API Service: For dataset ID:", datasetId);

    if (!datasetId) {
      console.warn("API Service: No dataset ID provided for query");
    }

    try {
      // Get auth token
      const token = await getAuthToken();
      console.log("API Service: Got authentication token");

      // Log the complete request for debugging
      const requestBody = {
        userQuery,
        conversationHistory,
        datasetId // Include the dataset ID in the request
      };
      console.log("API Service: Full request:", JSON.stringify(requestBody, null, 2));

      const response = await post('query', requestBody);

      // Debug the response status
      console.log("API Service: Response received");

      // Add dataset ID to response if it wasn't included
      if (datasetId && !response.datasetId) {
        response.datasetId = datasetId;
      }

      return response;
    } catch (error) {
      console.error('API Service: Error:', error);
      throw error;
    }
  },

  // Placeholder for getDatasetSchema to maintain API compatibility
  async getDatasetSchema(datasetId) {
    return get(`datasets/${datasetId}/schema`);
  }
};

// Export all API methods as default object
export default {
  getAuthToken,
  apiRequest,
  get,
  post,
  put,
  patch,
  delete: del,
  uploadFile,
  apiService
};
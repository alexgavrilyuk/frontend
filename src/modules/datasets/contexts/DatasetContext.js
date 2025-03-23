// src/modules/datasets/contexts/DatasetContext.js
import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from '../../auth';
import datasetService from '../services/datasetService';

// Create a context
const DatasetContext = createContext();

// Custom hook to use the dataset context
export function useDatasets() {
  return useContext(DatasetContext);
}

// Provider component for dataset management
export function DatasetProvider({ children }) {
  const { currentUser } = useAuth();
  const [datasets, setDatasets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeDataset, setActiveDataset] = useState(null);

  // Fetch user's datasets when user changes
  useEffect(() => {
    // Reset state when user changes
    setDatasets([]);
    setActiveDataset(null);
    setError(null);

    // Only fetch if there's a logged in user
    if (!currentUser) {
      setLoading(false);
      return;
    }

    // Fetch datasets
    const fetchDatasets = async () => {
      try {
        setLoading(true);
        setError(null);

        const fetchedDatasets = await datasetService.getUserDatasets();

        console.log("Fetched datasets:", fetchedDatasets);
        setDatasets(fetchedDatasets);

        // Set the first dataset as active if there are any
        if (fetchedDatasets.length > 0 && !activeDataset) {
          setActiveDataset(fetchedDatasets[0]);
        }
      } catch (err) {
        console.error("Error fetching datasets:", err);
        setError("Failed to load datasets: " + err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchDatasets();
  }, [currentUser]);

  // Upload a new dataset
  const uploadDataset = async (file, metadata, progressCallback) => {
    try {
      setError(null);

      // Call the upload service with optional progress callback
      const result = await datasetService.uploadDataset(file, metadata, progressCallback);

      // Get the uploaded dataset details
      const newDataset = result.dataset;

      // Add the new dataset to the state
      setDatasets(prev => [newDataset, ...prev]);

      // Set as active dataset
      setActiveDataset(newDataset);

      return newDataset;
    } catch (err) {
      console.error("Error uploading dataset:", err);
      setError("Failed to upload dataset: " + err.message);
      throw err;
    }
  };

  // Delete a dataset
  const deleteDataset = async (datasetId) => {
    try {
      setError(null);

      // Call the delete service
      await datasetService.deleteDataset(datasetId);

      // Remove from state
      setDatasets(prev => prev.filter(dataset => dataset.id !== datasetId));

      // If we deleted the active dataset, set the first available one as active
      if (activeDataset && activeDataset.id === datasetId) {
        const remainingDatasets = datasets.filter(dataset => dataset.id !== datasetId);
        setActiveDataset(remainingDatasets.length > 0 ? remainingDatasets[0] : null);
      }

      return { success: true };
    } catch (err) {
      console.error("Error deleting dataset:", err);
      setError("Failed to delete dataset: " + err.message);
      throw err;
    }
  };

  // Update dataset metadata
  const updateDataset = async (datasetId, metadata) => {
    try {
      setError(null);

      // Call the update service
      const updatedDataset = await datasetService.updateDataset(datasetId, metadata);

      // Update in state
      setDatasets(prev => prev.map(dataset =>
        dataset.id === datasetId ? updatedDataset : dataset
      ));

      // If this is the active dataset, update it
      if (activeDataset && activeDataset.id === datasetId) {
        setActiveDataset(updatedDataset);
      }

      return updatedDataset;
    } catch (err) {
      console.error("Error updating dataset:", err);
      setError("Failed to update dataset: " + err.message);
      throw err;
    }
  };

  // Get a dataset's schema
  const getDatasetSchema = async (datasetId) => {
    try {
      setError(null);
      console.log("DatasetContext: Attempting to fetch schema for dataset:", datasetId);

      // Make sure the function exists
      if (typeof datasetService.getDatasetSchema !== 'function') {
        console.error("DatasetContext: getDatasetSchema is not available in datasetService", datasetService);
        throw new Error("Schema fetching functionality is not available");
      }

      // Call the service
      const schemaData = await datasetService.getDatasetSchema(datasetId);
      console.log("DatasetContext: Schema data received:", schemaData);

      return schemaData;
    } catch (err) {
      console.error("Error fetching dataset schema:", err);
      setError("Failed to fetch schema: " + err.message);
      throw err;
    }
  };

  // Update dataset schema
  const updateSchema = async (datasetId, schemaData) => {
    try {
      setError(null);

      // Call the service
      const updatedSchema = await datasetService.updateSchema(datasetId, schemaData);

      return updatedSchema;
    } catch (err) {
      console.error("Error updating schema:", err);
      setError("Failed to update schema: " + err.message);
      throw err;
    }
  };

  // Update dataset context information
  const updateDatasetContext = async (datasetId, contextData) => {
    try {
      setError(null);

      // Call the service
      const updatedDataset = await datasetService.updateDatasetContext(datasetId, contextData);

      // Update in state
      setDatasets(prev => prev.map(dataset =>
        dataset.id === datasetId ? { ...dataset, ...updatedDataset } : dataset
      ));

      // If this is the active dataset, update it
      if (activeDataset && activeDataset.id === datasetId) {
        setActiveDataset({ ...activeDataset, ...updatedDataset });
      }

      return updatedDataset;
    } catch (err) {
      console.error("Error updating dataset context:", err);
      setError("Failed to update dataset context: " + err.message);
      throw err;
    }
  };

  // Get dataset preview data
  const getDatasetPreview = async (datasetId, limit = 100) => {
    try {
      setError(null);

      // Call the service
      const previewData = await datasetService.getDatasetPreview(datasetId, limit);

      return previewData;
    } catch (err) {
      console.error("Error getting dataset preview:", err);
      setError("Failed to get dataset preview: " + err.message);
      throw err;
    }
  };

  // Set which dataset is active
  const setActiveDatasetById = (datasetId) => {
    const dataset = datasets.find(d => d.id === datasetId);
    if (dataset) {
      setActiveDataset(dataset);
      return true;
    }
    return false;
  };

  // Value to provide in context
  const value = {
    datasets,
    loading,
    error,
    activeDataset,
    uploadDataset,
    deleteDataset,
    updateDataset,
    getDatasetSchema,
    updateSchema,
    updateDatasetContext,
    getDatasetPreview,
    setActiveDataset: setActiveDatasetById
  };

  return (
    <DatasetContext.Provider value={value}>
      {children}
    </DatasetContext.Provider>
  );
}

export default DatasetContext;
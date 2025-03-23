// src/modules/datasets/components/DatasetDetails.js
import React, { useState, useEffect } from 'react';
import { useDatasets } from '../contexts/DatasetContext';
import { Card, Button, LoadingSpinner, StatusMessage } from '../../shared/components';
import DatasetSchemaView from './DatasetSchemaView';
import DatasetOverview from './DatasetOverview';
import DataPreview from './DataPreview';
import datasetService from '../services/datasetService';

function DatasetDetails({ datasetId, initialActiveTab = 'overview', onClose }) {
  const { datasets, getDatasetSchema } = useDatasets();
  const [dataset, setDataset] = useState(null);
  const [schema, setSchema] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState(initialActiveTab);

  // Fetch fresh dataset details directly from API to ensure latest data
  const fetchDatasetDetails = async () => {
    try {
      console.log("Fetching fresh dataset details for:", datasetId);
      setLoading(true);

      // Call the API directly to get fresh dataset details
      const freshDataset = await datasetService.getSingleDataset(datasetId);
      console.log("Fresh dataset details received:", freshDataset);

      setDataset(freshDataset);
      setError(null);
    } catch (err) {
      console.error("Error fetching dataset details:", err);
      setError("Failed to load dataset details: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  // Find and set the dataset when datasetId changes
  useEffect(() => {
    if (datasetId) {
      // First, use the dataset from context if available (for immediate display)
      const cachedDataset = datasets.find(d => d.id === datasetId);
      if (cachedDataset) {
        setDataset(cachedDataset);
      }

      // Then fetch fresh data directly from API to ensure we have latest values
      fetchDatasetDetails();

      // Reset state when dataset changes
      setSchema(null);
      setError(null);
    }
  }, [datasetId, datasets]);

  // Fetch schema when dataset changes or when activeTab is schema
  useEffect(() => {
    if (!dataset || activeTab !== 'schema') {
      return;
    }

    const fetchSchema = async () => {
      try {
        setLoading(true);
        setError(null);

        console.log("DatasetDetails: Attempting to fetch schema for dataset:", dataset.id);
        console.log("DatasetDetails: getDatasetSchema function available:",
                   typeof getDatasetSchema === 'function' ? "Yes" : "No");

        // Only attempt to fetch schema if we're in the schema tab and the function exists
        if (typeof getDatasetSchema === 'function') {
          const schemaData = await getDatasetSchema(dataset.id);
          console.log("DatasetDetails: Schema data received:", schemaData);
          setSchema(schemaData);
        } else {
          console.error("DatasetDetails: Schema fetching function not available");
          setError("Schema functionality is not available");
        }
      } catch (err) {
        console.error("Error fetching schema:", err);
        setError("Failed to load schema: " + err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchSchema();
  }, [dataset, activeTab, getDatasetSchema]);

  // Handle tab change
  const handleTabChange = (tab) => {
    setActiveTab(tab);
  };

  // Handle schema update
  const handleSchemaUpdate = (updatedSchema) => {
    setSchema(updatedSchema);
  };

  // Handle dataset update (for context information)
  const handleDatasetUpdate = (updatedDataset) => {
    console.log("Dataset updated in DatasetDetails:", updatedDataset);
    // Update the dataset information in the component state
    setDataset(prevDataset => ({
      ...prevDataset,
      ...updatedDataset
    }));

    // Refresh dataset details to ensure we have the latest data
    fetchDatasetDetails();
  };

  // Format date for display
  const formatDate = (timestamp) => {
    if (!timestamp) return 'Unknown';
    const date = timestamp instanceof Date ? timestamp : new Date(timestamp);
    return date.toLocaleString();
  };

  if (!dataset) {
    return (
      <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <Card className="max-w-md w-full animate-fade-in-up">
          <div className="p-6 text-center">
            <LoadingSpinner size="lg" color="blue" centered />
            <p className="text-gray-300 mt-4">Loading dataset details...</p>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <Card className="max-w-4xl w-full animate-fade-in-up max-h-[90vh] flex flex-col">
        {/* Header with close button */}
        <div className="flex justify-between items-center p-6 border-b border-gray-700/50">
          <h3 className="text-xl font-bold text-white">{dataset.name}</h3>
          <Button
            variant="ghost"
            color="gray"
            onClick={onClose}
            aria-label="Close"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </Button>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-700/50">
          <div className="flex">
            <button
              onClick={() => handleTabChange('overview')}
              className={`px-6 py-3 text-sm font-medium ${
                activeTab === 'overview'
                  ? 'bg-blue-900/20 text-blue-400 border-b-2 border-blue-500'
                  : 'text-gray-400 hover:text-white hover:bg-gray-700/30'
              } transition-colors duration-200`}
            >
              Overview
            </button>
            <button
              onClick={() => handleTabChange('schema')}
              className={`px-6 py-3 text-sm font-medium ${
                activeTab === 'schema'
                  ? 'bg-purple-900/20 text-purple-400 border-b-2 border-purple-500'
                  : 'text-gray-400 hover:text-white hover:bg-gray-700/30'
              } transition-colors duration-200`}
            >
              Schema
            </button>
            <button
              onClick={() => handleTabChange('preview')}
              className={`px-6 py-3 text-sm font-medium ${
                activeTab === 'preview'
                  ? 'bg-cyan-900/20 text-cyan-400 border-b-2 border-cyan-500'
                  : 'text-gray-400 hover:text-white hover:bg-gray-700/30'
              } transition-colors duration-200`}
            >
              Data Preview
            </button>
          </div>
        </div>

        {/* Content area with scrolling */}
        <div className="flex-grow overflow-y-auto p-6">
          {activeTab === 'overview' ? (
            // Overview Tab
            <DatasetOverview
              dataset={dataset}
              datasetId={datasetId}
              onDatasetUpdate={handleDatasetUpdate}
            />
          ) : activeTab === 'schema' ? (
            // Schema Tab
            loading ? (
              <LoadingSpinner size="md" color="blue" centered />
            ) : error ? (
              <StatusMessage type="error">{error}</StatusMessage>
            ) : (
              <DatasetSchemaView
                schema={schema}
                datasetId={datasetId}
                onSchemaUpdate={handleSchemaUpdate}
              />
            )
          ) : (
            // Preview Tab
            <DataPreview datasetId={datasetId} limit={100} />
          )}
        </div>

        {/* Footer with actions */}
        <div className="p-4 border-t border-gray-700/50 flex justify-between">
          <Button
            variant="secondary"
            color="gray"
            onClick={onClose}
          >
            Close
          </Button>
          <div className="flex space-x-2">
            <Button
              variant="primary"
              color="purple"
              leftIcon={
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z" clipRule="evenodd" />
                </svg>
              }
            >
              Query Data
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}

export default DatasetDetails;
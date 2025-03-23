// src/modules/datasets/components/DatasetSelector.js
import React, { useState, useEffect } from 'react';
import { useDatasets } from '../contexts/DatasetContext';
import { Card, Button, LoadingSpinner, StatusMessage } from '../../shared/components';

/**
 * Dataset selector component that allows users to choose which dataset to query
 * @param {Object} props
 * @param {string} props.selectedDatasetId - Currently selected dataset ID
 * @param {Function} props.onSelectDataset - Callback when dataset is selected
 * @param {string} props.className - Additional class names
 */
function DatasetSelector({ selectedDatasetId, onSelectDataset, className = '' }) {
  const { datasets, loading, error, activeDataset, setActiveDataset } = useDatasets();
  const [showSelector, setShowSelector] = useState(false);

  useEffect(() => {
    // If no dataset is selected but we have datasets, select the first one
    if (!selectedDatasetId && datasets.length > 0 && !activeDataset) {
      handleSelectDataset(datasets[0].id);
    }
  }, [datasets, selectedDatasetId, activeDataset]);

  // Handle dataset selection
  const handleSelectDataset = (datasetId) => {
    const selectedDataset = datasets.find(d => d.id === datasetId);

    if (selectedDataset) {
      // Update the active dataset in context
      setActiveDataset(datasetId);

      // Call the parent component's callback
      if (typeof onSelectDataset === 'function') {
        onSelectDataset(datasetId, selectedDataset);
      }

      // Close the selector
      setShowSelector(false);
    }
  };

  // Get the currently selected dataset object
  const currentDataset = datasets.find(d => d.id === selectedDatasetId) || activeDataset;

  // Show loading state
  if (loading) {
    return <LoadingSpinner size="sm" color="blue" />;
  }

  // Show error message
  if (error) {
    return <StatusMessage type="error" className="mb-0 text-sm">{error}</StatusMessage>;
  }

  // Show empty state if no datasets
  if (datasets.length === 0) {
    return (
      <div className={`text-center py-2 ${className}`}>
        <p className="text-sm text-gray-400">No datasets available. Please upload a dataset first.</p>
        <Button
          variant="primary"
          color="blue"
          size="sm"
          className="mt-2"
          onClick={() => {
            // Navigate to dataset upload page
            window.location.href = '/account/datasets';
          }}
        >
          Upload Dataset
        </Button>
      </div>
    );
  }

  return (
    <div className={`relative ${className}`}>
      {/* Selected dataset display */}
      <div
        className="flex items-center gap-2 p-2 bg-gray-800/50 rounded-lg border border-gray-700/50 hover:border-blue-500/50 cursor-pointer transition-all"
        onClick={() => setShowSelector(!showSelector)}
      >
        <div className="w-8 h-8 bg-blue-900/30 rounded-lg flex items-center justify-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
            <path d="M3 12v3c0 1.657 3.134 3 7 3s7-1.343 7-3v-3c0 1.657-3.134 3-7 3s-7-1.343-7-3z" />
            <path d="M3 7v3c0 1.657 3.134 3 7 3s7-1.343 7-3V7c0 1.657-3.134 3-7 3S3 8.657 3 7z" />
            <path d="M17 5c0 1.657-3.134 3-7 3S3 6.657 3 5s3.134-3 7-3 7 1.343 7 3z" />
          </svg>
        </div>
        <div className="flex-grow min-w-0">
          <h3 className="text-sm font-medium text-white truncate">{currentDataset?.name || 'Select Dataset'}</h3>
          <p className="text-xs text-gray-400 truncate">
            {currentDataset ? `${currentDataset.rowCount?.toLocaleString() || '?'} rows, ${currentDataset.columnCount || '?'} columns` : 'No dataset selected'}
          </p>
        </div>
        <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 text-gray-400 transition-transform ${showSelector ? 'transform rotate-180' : ''}`} viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
        </svg>
      </div>

      {/* Dataset selector dropdown */}
      {showSelector && (
        <Card className="absolute top-full left-0 right-0 mt-1 z-10 max-h-60 overflow-y-auto">
          <div className="space-y-1 py-1">
            {datasets.map(dataset => (
              <div
                key={dataset.id}
                className={`flex items-center gap-2 p-2 rounded-lg cursor-pointer transition-all ${
                  dataset.id === selectedDatasetId
                    ? 'bg-blue-900/30 text-blue-400'
                    : 'hover:bg-gray-700/50 text-white'
                }`}
                onClick={() => handleSelectDataset(dataset.id)}
              >
                <div className="w-6 h-6 bg-gray-700/50 rounded-md flex items-center justify-center">
                  {dataset.id === selectedDatasetId ? (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M3 12v3c0 1.657 3.134 3 7 3s7-1.343 7-3v-3c0 1.657-3.134 3-7 3s-7-1.343-7-3z" />
                      <path d="M3 7v3c0 1.657 3.134 3 7 3s7-1.343 7-3V7c0 1.657-3.134 3-7 3S3 8.657 3 7z" />
                      <path d="M17 5c0 1.657-3.134 3-7 3S3 6.657 3 5s3.134-3 7-3 7 1.343 7 3z" />
                    </svg>
                  )}
                </div>
                <div className="flex-grow min-w-0">
                  <h4 className="text-sm font-medium truncate">{dataset.name}</h4>
                  <p className="text-xs text-gray-400 truncate">
                    {dataset.dataType.toUpperCase()} • {dataset.rowCount?.toLocaleString() || '?'} rows
                  </p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}

export default DatasetSelector;
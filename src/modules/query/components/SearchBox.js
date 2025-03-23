// src/modules/query/components/SearchBox.js
import React, { useState } from 'react';
import { useDatasets, DatasetSelector, SchemaViewer } from '../../datasets';
import { StatusMessage } from '../../shared/components';

function SearchBox({ onQuerySubmit }) {
  const [queryInput, setQueryInput] = useState('');
  const [selectedDatasetId, setSelectedDatasetId] = useState(null);
  const [error, setError] = useState(null);
  const [showSchema, setShowSchema] = useState(false);
  const { activeDataset } = useDatasets();

  const handleSubmit = (e) => {
    e.preventDefault();

    // Validate input
    if (!queryInput.trim()) {
      return;
    }

    // Validate dataset selection
    if (!selectedDatasetId && !activeDataset?.id) {
      setError("Please select a dataset to query");
      return;
    }

    // Use the selected dataset ID or active dataset ID from context
    const datasetId = selectedDatasetId || activeDataset?.id;

    // Clear error if any
    setError(null);

    // Submit query with dataset ID
    onQuerySubmit(queryInput, datasetId);
    setQueryInput(''); // Clear the input after submission
  };

  const handleExampleClick = (exampleQuery) => {
    setQueryInput(exampleQuery);
  };

  const handleDatasetSelect = (datasetId) => {
    setSelectedDatasetId(datasetId);
    setError(null); // Clear any dataset-related errors
  };

  return (
    <div className="flex flex-col justify-center items-center w-full h-full">
      <div className="flex flex-col justify-center items-center flex-grow px-4 w-full">
        <div className="w-full max-w-3xl mb-6">
          {/* Dataset selector */}
          <DatasetSelector
            selectedDatasetId={selectedDatasetId || activeDataset?.id}
            onSelectDataset={handleDatasetSelect}
            className="mb-4"
          />

          {/* Error message */}
          {error && (
            <StatusMessage type="error" className="mb-4" animate={true}>
              {error}
            </StatusMessage>
          )}

          {/* Schema viewer - only show when dataset is selected */}
          {(selectedDatasetId || activeDataset?.id) && (
            <SchemaViewer
              datasetId={selectedDatasetId || activeDataset?.id}
              collapsed={true}
              className="mt-2"
            />
          )}
        </div>

        <div className="w-full max-w-3xl mb-8 relative">
          {/* Subtle pulse animation around the search box */}
          <div className="absolute -inset-4 rounded-xl blur-xl opacity-70 animate-pulse bg-gradient-to-r from-purple-500/10 via-pink-500/10 to-purple-500/10"></div>

          <form onSubmit={handleSubmit} className="bg-gray-800/80 backdrop-blur-sm rounded-xl p-2 border border-gray-700/50 shadow-lg relative z-10">
            <div className="flex items-center">
              <input
                type="text"
                value={queryInput}
                onChange={(e) => setQueryInput(e.target.value)}
                className="bg-transparent text-white placeholder-gray-400 flex-grow px-4 py-3 focus:outline-none"
                placeholder={
                  selectedDatasetId || activeDataset?.id
                    ? "Ask for a report or analysis about your data..."
                    : "Select a dataset, then ask for a report..."
                }
                aria-label="Query input"
              />
              <button
                type="submit"
                className={`${(!selectedDatasetId && !activeDataset?.id)
                  ? 'bg-gray-600 cursor-not-allowed'
                  : 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700'
                  } rounded-full p-3 ml-2 transition-all duration-200 shadow hover:shadow-lg transform hover:scale-105`}
                aria-label="Submit query"
                disabled={!selectedDatasetId && !activeDataset?.id}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
          </form>
        </div>

        {/* Example report queries */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full max-w-3xl mb-12">
          <div
            className="bg-gray-800/60 backdrop-blur-sm rounded-lg p-4 border border-gray-700/50 hover:border-purple-500/50 cursor-pointer transition-all duration-200 hover:shadow-md hover:shadow-purple-500/10 transform hover:-translate-y-1 group"
            onClick={() => handleExampleClick("Generate a comprehensive report analyzing sales trends over the last year")}
          >
            <h3 className="text-gray-300 font-medium mb-2 group-hover:text-purple-400 transition-colors duration-200">Sales Trend Report</h3>
            <p className="text-gray-400 text-sm">Generate a comprehensive report analyzing sales trends over the last year</p>
          </div>

          <div
            className="bg-gray-800/60 backdrop-blur-sm rounded-lg p-4 border border-gray-700/50 hover:border-pink-500/50 cursor-pointer transition-all duration-200 hover:shadow-md hover:shadow-pink-500/10 transform hover:-translate-y-1 group"
            onClick={() => handleExampleClick("Create a detailed report showing customer demographics and purchase patterns")}
          >
            <h3 className="text-gray-300 font-medium mb-2 group-hover:text-pink-400 transition-colors duration-200">Customer Analysis</h3>
            <p className="text-gray-400 text-sm">Create a detailed report showing customer demographics and purchase patterns</p>
          </div>

          <div
            className="bg-gray-800/60 backdrop-blur-sm rounded-lg p-4 border border-gray-700/50 hover:border-purple-500/50 cursor-pointer transition-all duration-200 hover:shadow-md hover:shadow-purple-500/10 transform hover:-translate-y-1 group"
            onClick={() => handleExampleClick("Analyze product performance and identify top selling items")}
          >
            <h3 className="text-gray-300 font-medium mb-2 group-hover:text-purple-400 transition-colors duration-200">Product Performance</h3>
            <p className="text-gray-400 text-sm">Analyze product performance and identify top selling items</p>
          </div>

          <div
            className="bg-gray-800/60 backdrop-blur-sm rounded-lg p-4 border border-gray-700/50 hover:border-pink-500/50 cursor-pointer transition-all duration-200 hover:shadow-md hover:shadow-pink-500/10 transform hover:-translate-y-1 group"
            onClick={() => handleExampleClick("Generate a summary report of regional sales with visualizations")}
          >
            <h3 className="text-gray-300 font-medium mb-2 group-hover:text-pink-400 transition-colors duration-200">Regional Report</h3>
            <p className="text-gray-400 text-sm">Generate a summary report of regional sales with visualizations</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SearchBox;
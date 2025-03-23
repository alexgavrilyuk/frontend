// src/modules/chat/components/ChatInput.js
import React, { useState } from 'react';
import { useDatasets, DatasetSelector, SchemaViewer } from '../../datasets';

function ChatInput({ onSendMessage, isLoading }) {
  const [message, setMessage] = useState('');
  const [error, setError] = useState(null);
  const { activeDataset, datasets } = useDatasets();
  const [selectedDatasetId, setSelectedDatasetId] = useState(null);
  const [showSchema, setShowSchema] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!message.trim() || isLoading) {
      return;
    }

    // Validate dataset selection
    const datasetId = selectedDatasetId || activeDataset?.id;
    if (!datasetId) {
      setError("Please select a dataset to query");
      return;
    }

    // Clear error
    setError(null);

    // Send message with dataset ID
    onSendMessage(message, datasetId);
    setMessage('');
  };

  const handleDatasetSelect = (datasetId) => {
    setSelectedDatasetId(datasetId);
    setError(null); // Clear any dataset-related errors
  };

  // Get the currently displayed dataset name
  const currentDataset = datasets.find(d => d.id === (selectedDatasetId || activeDataset?.id));
  const datasetName = currentDataset?.name || 'No dataset selected';

  return (
    <div className="mt-auto bg-gray-800/80 backdrop-blur-sm border-t border-gray-700/50">
      {/* Dataset selector */}
      <div className="px-2 pt-2">
        <DatasetSelector
          selectedDatasetId={selectedDatasetId || activeDataset?.id}
          onSelectDataset={handleDatasetSelect}
        />

        {/* Error message */}
        {error && (
          <div className="text-red-400 text-xs px-2 py-1 mt-1">
            {error}
          </div>
        )}

        {/* Toggle schema button */}
        {(selectedDatasetId || activeDataset?.id) && (
          <button
            onClick={() => setShowSchema(!showSchema)}
            className="text-xs text-blue-400 hover:text-blue-300 mt-1 ml-2 flex items-center"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M5 4a3 3 0 00-3 3v6a3 3 0 003 3h10a3 3 0 003-3V7a3 3 0 00-3-3H5zm-1 9v-1h5v2H5a1 1 0 01-1-1zm7 1h4a1 1 0 001-1v-1h-5v2zm0-4h5V8h-5v2zM9 8H4v2h5V8z" clipRule="evenodd" />
            </svg>
            {showSchema ? "Hide Schema" : "Show Schema"}
          </button>
        )}

        {/* Schema viewer */}
        {showSchema && (selectedDatasetId || activeDataset?.id) && (
          <div className="mt-2">
            <SchemaViewer
              datasetId={selectedDatasetId || activeDataset?.id}
              collapsed={false}
            />
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit} className="p-2">
        <div className="flex items-center">
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="bg-gray-700/50 border border-gray-600 rounded-lg flex-grow p-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder={selectedDatasetId || activeDataset?.id
              ? `Ask about ${datasetName}...`
              : "Select a dataset first"}
            disabled={isLoading || (!selectedDatasetId && !activeDataset?.id)}
          />
          <button
            type="submit"
            disabled={isLoading || !message.trim() || (!selectedDatasetId && !activeDataset?.id)}
            className={`ml-2 p-2 rounded-full ${
              isLoading || !message.trim() || (!selectedDatasetId && !activeDataset?.id)
                ? 'bg-gray-600 cursor-not-allowed'
                : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700'
            } transition-all duration-200`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
          </button>
        </div>
      </form>
    </div>
  );
}

export default ChatInput;
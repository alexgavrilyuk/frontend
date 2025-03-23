// src/modules/datasets/components/DatasetOverview.js
import React, { useState } from 'react';
import { Button, StatusMessage, TextArea, Input } from '../../shared/components';
import datasetService from '../services/datasetService';

/**
 * Component to display and edit dataset overview information
 *
 * @param {Object} props
 * @param {Object} props.dataset - The dataset object with metadata
 * @param {string} props.datasetId - The ID of the dataset
 * @param {Function} props.onDatasetUpdate - Callback function when dataset is updated
 */
function DatasetOverview({ dataset, datasetId, onDatasetUpdate }) {
  const [isEditing, setIsEditing] = useState(false);
  const [contextData, setContextData] = useState({
    context: dataset?.context || '',
    purpose: dataset?.purpose || '',
    source: dataset?.source || '',
    notes: dataset?.notes || ''
  });
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  // Handle entering edit mode
  const handleEdit = () => {
    setContextData({
      context: dataset?.context || '',
      purpose: dataset?.purpose || '',
      source: dataset?.source || '',
      notes: dataset?.notes || ''
    });
    setIsEditing(true);
    setError(null);
    setSuccess(false);
  };

  // Handle canceling edit mode
  const handleCancel = () => {
    setIsEditing(false);
    setError(null);
    setSuccess(false);
  };

  // Handle input changes
  const handleInputChange = (field, value) => {
    setContextData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Save changes
  const handleSave = async () => {
    if (!datasetId) return;

    try {
      setIsSaving(true);
      setError(null);
      setSuccess(false);

      // Call API to update dataset context
      const updatedDataset = await datasetService.updateDatasetContext(datasetId, contextData);

      // Exit edit mode and show success message
      setIsEditing(false);
      setSuccess(true);

      // Notify parent component of the update
      if (typeof onDatasetUpdate === 'function') {
        onDatasetUpdate(updatedDataset);
      }
    } catch (err) {
      console.error("Error saving dataset context:", err);
      setError(err.message || "Failed to save dataset context");
    } finally {
      setIsSaving(false);
    }
  };

  // Format date for display
  const formatDate = (timestamp) => {
    if (!timestamp) return 'Unknown';
    const date = timestamp instanceof Date ? timestamp : new Date(timestamp);
    return date.toLocaleString();
  };

  return (
    <div className="space-y-6">
      {/* Success message */}
      {success && (
        <StatusMessage type="success" className="mb-4">
          Dataset information saved successfully!
        </StatusMessage>
      )}

      {/* Error message */}
      {error && (
        <StatusMessage type="error" className="mb-4">
          {error}
        </StatusMessage>
      )}

      {/* Edit/Save/Cancel buttons */}
      <div className="flex justify-end">
        {isEditing ? (
          <div className="flex space-x-2">
            <Button
              variant="secondary"
              color="gray"
              onClick={handleCancel}
              disabled={isSaving}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              color="blue"
              onClick={handleSave}
              isLoading={isSaving}
            >
              Save Changes
            </Button>
          </div>
        ) : (
          <Button
            variant="secondary"
            color="blue"
            onClick={handleEdit}
            leftIcon={
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
              </svg>
            }
          >
            Edit Information
          </Button>
        )}
      </div>

      {/* Dataset general info */}
      <div>
        <h4 className="text-lg font-medium text-white mb-2">Dataset Info</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-gray-800/50 rounded-lg p-4">
            <h5 className="text-sm font-medium text-gray-400 mb-1">Name</h5>
            <p className="text-white">{dataset?.name || 'Unnamed dataset'}</p>
          </div>
          <div className="bg-gray-800/50 rounded-lg p-4">
            <h5 className="text-sm font-medium text-gray-400 mb-1">Type</h5>
            <p className="text-white">{dataset?.dataType || 'Unknown'}</p>
          </div>
          <div className="bg-gray-800/50 rounded-lg p-4">
            <h5 className="text-sm font-medium text-gray-400 mb-1">Created</h5>
            <p className="text-white">{formatDate(dataset?.createdAt)}</p>
          </div>
          <div className="bg-gray-800/50 rounded-lg p-4">
            <h5 className="text-sm font-medium text-gray-400 mb-1">Last Updated</h5>
            <p className="text-white">{formatDate(dataset?.updatedAt)}</p>
          </div>
        </div>
      </div>

      {/* Dataset statistics */}
      <div>
        <h4 className="text-lg font-medium text-white mb-2">Statistics</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-gray-800/50 rounded-lg p-4">
            <h5 className="text-sm font-medium text-gray-400 mb-1">Rows</h5>
            <p className="text-white text-xl">{dataset?.rowCount?.toLocaleString() || 'Unknown'}</p>
          </div>
          <div className="bg-gray-800/50 rounded-lg p-4">
            <h5 className="text-sm font-medium text-gray-400 mb-1">Columns</h5>
            <p className="text-white text-xl">{dataset?.columnCount?.toLocaleString() || 'Unknown'}</p>
          </div>
          <div className="bg-gray-800/50 rounded-lg p-4">
            <h5 className="text-sm font-medium text-gray-400 mb-1">File Size</h5>
            <p className="text-white text-xl">{dataset?.fileSizeMB && typeof dataset.fileSizeMB === 'number' ? `${dataset.fileSizeMB.toFixed(2)} MB` : 'Unknown'}</p>
          </div>
        </div>
      </div>

      {/* Dataset context - editable section */}
      <div>
        <h4 className="text-lg font-medium text-white mb-2">Dataset Context</h4>
        <div className="space-y-4">
          <div className="bg-gray-800/50 rounded-lg p-4">
            <h5 className="text-sm font-medium text-gray-400 mb-1">Description</h5>
            {isEditing ? (
              <TextArea
                rows={3}
                value={contextData.context}
                onChange={(e) => handleInputChange('context', e.target.value)}
                placeholder="Describe what this dataset contains..."
                className="mt-1"
                inputClassName="bg-gray-700/50"
              />
            ) : (
              <p className="text-white">{dataset?.context || 'No description provided'}</p>
            )}
          </div>

          <div className="bg-gray-800/50 rounded-lg p-4">
            <h5 className="text-sm font-medium text-gray-400 mb-1">Purpose</h5>
            {isEditing ? (
              <TextArea
                rows={2}
                value={contextData.purpose}
                onChange={(e) => handleInputChange('purpose', e.target.value)}
                placeholder="What is this dataset used for..."
                className="mt-1"
                inputClassName="bg-gray-700/50"
              />
            ) : (
              <p className="text-white">{dataset?.purpose || 'No purpose specified'}</p>
            )}
          </div>

          <div className="bg-gray-800/50 rounded-lg p-4">
            <h5 className="text-sm font-medium text-gray-400 mb-1">Data Source</h5>
            {isEditing ? (
              <Input
                type="text"
                value={contextData.source}
                onChange={(e) => handleInputChange('source', e.target.value)}
                placeholder="Where this data comes from..."
                className="mt-1"
                inputClassName="bg-gray-700/50"
              />
            ) : (
              <p className="text-white">{dataset?.source || 'No source specified'}</p>
            )}
          </div>

          <div className="bg-gray-800/50 rounded-lg p-4">
            <h5 className="text-sm font-medium text-gray-400 mb-1">Notes</h5>
            {isEditing ? (
              <TextArea
                rows={2}
                value={contextData.notes}
                onChange={(e) => handleInputChange('notes', e.target.value)}
                placeholder="Additional information about this dataset..."
                className="mt-1"
                inputClassName="bg-gray-700/50"
              />
            ) : (
              <p className="text-white">{dataset?.notes || 'No notes provided'}</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default DatasetOverview;
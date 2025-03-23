// src/modules/datasets/components/DatasetList.js
import React, { useState, useEffect } from 'react';
import { useDatasets } from '../contexts/DatasetContext';
import { Card, Button, Input, TextArea, StyledRadioButtons, FileUploader, FileUploadProgress, LoadingSpinner, StatusMessage } from '../../shared/components';
import DatasetDetails from './DatasetDetails';

function DatasetList() {
  const { datasets, loading, error, uploadDataset, deleteDataset } = useDatasets();

  // UI state
  const [showAddModal, setShowAddModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [detailsTarget, setDetailsTarget] = useState(null);
  const [initialActiveTab, setInitialActiveTab] = useState('overview');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadError, setUploadError] = useState(null);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [uploadStatus, setUploadStatus] = useState('');

  // Form data
  const [newDatasetForm, setNewDatasetForm] = useState({
    name: '',
    description: '',
    dataType: 'csv',
    file: null
  });

  // Reset form when modal is closed
  useEffect(() => {
    if (!showAddModal) {
      setNewDatasetForm({
        name: '',
        description: '',
        dataType: 'csv',
        file: null
      });
      setUploadError(null);
      setUploadSuccess(false);
      setUploadProgress(0);
      setUploadStatus('');
    }
  }, [showAddModal]);

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setNewDatasetForm(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  // Handle file selection
  const handleFileSelect = (file) => {
    // If the file name contains valid extension, auto-detect file type
    const fileName = file.name.toLowerCase();
    let detectedType = 'csv'; // Default to CSV

    if (fileName.endsWith('.xlsx') || fileName.endsWith('.xls')) {
      detectedType = 'excel';
    }

    // Auto-fill name if it's empty
    const nameWithoutExtension = file.name.split('.').slice(0, -1).join('.');

    setNewDatasetForm(prev => ({
      ...prev,
      file: file,
      dataType: detectedType,
      // Only update name if it's currently empty
      name: prev.name ? prev.name : nameWithoutExtension
    }));
  };

  // Handle add dataset submission
  const handleAddDataset = async (e) => {
    e.preventDefault();

    if (!newDatasetForm.file) {
      setUploadError("Please select a file to upload.");
      return;
    }

    if (!newDatasetForm.name.trim()) {
      setUploadError("Please provide a name for the dataset.");
      return;
    }

    try {
      setIsUploading(true);
      setUploadError(null);
      setUploadSuccess(false);
      setUploadProgress(0);
      setUploadStatus('Preparing upload...');

      // Prepare metadata
      const metadata = {
        name: newDatasetForm.name.trim(),
        description: newDatasetForm.description.trim(),
        dataType: newDatasetForm.dataType
      };

      // Use uploadMonitor to track progress
      const uploadMonitor = (progress, status) => {
        setUploadProgress(progress);
        if (status) setUploadStatus(status);
      };

      // Call uploadDataset method from context
      const result = await uploadDataset(newDatasetForm.file, metadata, uploadMonitor);

      // Set completion status
      setUploadProgress(100);
      setUploadStatus('Upload complete!');
      setUploadSuccess(true);

      // Close modal after a short delay on success
      setTimeout(() => {
        setShowAddModal(false);
      }, 1500);
    } catch (err) {
      console.error("Error uploading dataset:", err);
      setUploadError(err.message || "Failed to upload dataset. Please try again.");
      setUploadProgress(0);
      setUploadStatus('Upload failed');
    } finally {
      setIsUploading(false);
    }
  };

  // Handle delete confirmation
  const confirmDelete = (datasetId) => {
    setDeleteTarget(datasetId);
    setShowDeleteModal(true);
  };

  // Handle delete dataset
  const handleDeleteDataset = async () => {
    if (!deleteTarget) return;

    try {
      await deleteDataset(deleteTarget);
    } catch (err) {
      console.error("Error deleting dataset:", err);
      // You could show an error message here
    } finally {
      setShowDeleteModal(false);
      setDeleteTarget(null);
    }
  };

  // Handle showing dataset details
  const handleShowDetails = (datasetId) => {
    setDetailsTarget(datasetId);
    setInitialActiveTab('overview');
    setShowDetailsModal(true);
  };

  // Handle showing dataset schema
  const handleShowSchema = (datasetId) => {
    setDetailsTarget(datasetId);
    setInitialActiveTab('schema');
    setShowDetailsModal(true);
  };

  // Render loading state
  if (loading) {
    return (
      <div className="flex justify-center items-center p-12">
        <LoadingSpinner size="lg" color="purple" centered />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto min-h-[calc(100vh-200px)]">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-white">Your Datasets</h2>
          <p className="text-gray-400">Manage your data sources for AI analysis</p>
        </div>
        <Button
          onClick={() => setShowAddModal(true)}
          variant="primary"
          color="purple"
          gradient={true}
          leftIcon={
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
            </svg>
          }
        >
          Add Dataset
        </Button>
      </div>

      {/* Error display */}
      {error && (
        <StatusMessage type="error" animate={true} className="mb-6">
          {error}
        </StatusMessage>
      )}

      {/* Datasets List */}
      {datasets.length === 0 ? (
        <Card variant="default" className="p-8 text-center">
          <div className="w-20 h-20 mx-auto mb-4 bg-purple-900/30 rounded-full flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-purple-400" viewBox="0 0 20 20" fill="currentColor">
              <path d="M3 12v3c0 1.657 3.134 3 7 3s7-1.343 7-3v-3c0 1.657-3.134 3-7 3s-7-1.343-7-3z" />
              <path d="M3 7v3c0 1.657 3.134 3 7 3s7-1.343 7-3V7c0 1.657-3.134 3-7 3S3 8.657 3 7z" />
              <path d="M17 5c0 1.657-3.134 3-7 3S3 6.657 3 5s3.134-3 7-3 7 1.343 7 3z" />
            </svg>
          </div>
          <h3 className="text-xl font-semibold text-white mb-2">No Datasets Yet</h3>
          <p className="text-gray-400 mb-6 max-w-md mx-auto">
            Add your first dataset to start analyzing your data with AI. Upload CSV or Excel files to get started.
          </p>
          <Button
            onClick={() => setShowAddModal(true)}
            variant="primary"
            gradient={true}
            color="purple"
          >
            Add Your First Dataset
          </Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {datasets.map(dataset => (
            <Card
              key={dataset.id}
              variant="hover"
              className="p-6"
              accentColor="purple"
            >
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-lg font-semibold text-white mb-1">{dataset.name}</h3>
                  <p className="text-gray-400 text-sm mb-3">{dataset.description}</p>
                </div>
                <div className="flex">
                  <Button
                    variant="ghost"
                    color="blue"
                    size="sm"
                    className="p-1"
                    title="View Dataset Details"
                    aria-label="View Dataset Details"
                    onClick={() => handleShowDetails(dataset.id)}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                      <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                    </svg>
                  </Button>
                  <Button
                    variant="ghost"
                    color="red"
                    size="sm"
                    className="p-1"
                    title="Delete Dataset"
                    aria-label="Delete Dataset"
                    onClick={() => confirmDelete(dataset.id)}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                  </Button>
                </div>
              </div>

              {/* Dataset metadata */}
              <div className="grid grid-cols-2 gap-2 mb-4">
                <div className="bg-gray-700/40 rounded-lg p-2">
                  <p className="text-xs text-gray-400">Type</p>
                  <p className="text-sm text-white">{dataset.dataType}</p>
                </div>
                <div className="bg-gray-700/40 rounded-lg p-2">
                  <p className="text-xs text-gray-400">Rows</p>
                  <p className="text-sm text-white">{dataset.rowCount?.toLocaleString() || 'Unknown'}</p>
                </div>
                <div className="bg-gray-700/40 rounded-lg p-2">
                  <p className="text-xs text-gray-400">Created</p>
                  <p className="text-sm text-white">
                    {dataset.createdAt instanceof Date ?
                      dataset.createdAt.toLocaleDateString() :
                      new Date(dataset.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <div className="bg-gray-700/40 rounded-lg p-2">
                  <p className="text-xs text-gray-400">Last Updated</p>
                  <p className="text-sm text-white">
                    {dataset.updatedAt instanceof Date ?
                      dataset.updatedAt.toLocaleDateString() :
                      new Date(dataset.updatedAt).toLocaleDateString()}
                  </p>
                </div>
              </div>

              {/* Action buttons */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                <Button
                  variant="secondary"
                  color="blue"
                  size="sm"
                  onClick={() => handleShowDetails(dataset.id)}
                  leftIcon={
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                      <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                    </svg>
                  }
                >
                  Details
                </Button>
                <Button
                  variant="secondary"
                  color="cyan"
                  size="sm"
                  onClick={() => handleShowSchema(dataset.id)}
                  leftIcon={
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M3 5a2 2 0 012-2h10a2 2 0 012 2v10a2 2 0 01-2 2H5a2 2 0 01-2-2V5zm11 1H6v8l4-2 4 2V6z" clipRule="evenodd" />
                    </svg>
                  }
                >
                  Schema
                </Button>
                <Button
                  variant="secondary"
                  color="purple"
                  size="sm"
                  leftIcon={
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M7 2a1 1 0 00-.707 1.707L7 4.414v3.758a1 1 0 01-.293.707l-4 4C.817 14.769 2.156 18 4.828 18h10.343c2.673 0 4.012-3.231 2.122-5.121l-4-4A1 1 0 0113 8.172V4.414l.707-.707A1 1 0 0013 2H7zm2 6.172V4h2v4.172a3 3 0 00.879 2.12l1.027 1.028a4 4 0 00-2.171.102l-.47.156a4 4 0 01-2.53 0l-.563-.187a1.993 1.993 0 00-.114-.035l1.063-1.063A3 3 0 009 8.172z" clipRule="evenodd" />
                    </svg>
                  }
                >
                  Query
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Add Dataset Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 overflow-y-auto">
          <div className="flex min-h-screen justify-center items-center px-4 py-6">
            <div className="relative w-full max-w-sm mx-auto max-h-[80vh]">
              <Card className="w-full animate-fade-in-up overflow-y-auto max-h-[75vh] scale-90 transform">
                <div className="flex justify-between items-center p-4 border-b border-gray-700/50">
                  <h3 className="text-lg font-bold text-white">Add New Dataset</h3>
                  <Button
                    variant="ghost"
                    color="gray"
                    onClick={() => setShowAddModal(false)}
                    aria-label="Close"
                    disabled={isUploading}
                    className="p-1"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </Button>
                </div>

                <form onSubmit={handleAddDataset} className="p-4">
                  {/* Show error if any */}
                  {uploadError && (
                    <StatusMessage type="error" animate={true} className="mb-3 text-sm">
                      {uploadError}
                    </StatusMessage>
                  )}

                  {/* Show success message */}
                  {uploadSuccess && (
                    <StatusMessage type="success" className="mb-3 text-sm">
                      Dataset uploaded successfully!
                    </StatusMessage>
                  )}

                  <Input
                    type="text"
                    id="name"
                    name="name"
                    label="Dataset Name"
                    value={newDatasetForm.name}
                    onChange={handleInputChange}
                    placeholder="e.g. Sales Data 2024"
                    required
                    disabled={isUploading}
                    className="mb-3 text-sm"
                    labelClassName="text-sm"
                    inputClassName="py-1.5 text-sm"
                  />

                  <TextArea
                    id="description"
                    name="description"
                    label="Description"
                    rows="2"
                    value={newDatasetForm.description}
                    onChange={handleInputChange}
                    placeholder="Brief description of this dataset"
                    disabled={isUploading}
                    className="mb-3 text-sm"
                    labelClassName="text-sm"
                    textareaClassName="py-1.5 text-sm"
                  />

                  <div className="mb-4">
                    <label className="block text-gray-300 text-xs font-medium mb-1">
                      File Type
                    </label>
                    <StyledRadioButtons
                      name="dataType"
                      options={[
                        {
                          value: 'csv',
                          label: 'CSV'
                        },
                        {
                          value: 'excel',
                          label: 'Excel'
                        }
                      ]}
                      value={newDatasetForm.dataType}
                      onChange={handleInputChange}
                      layout="horizontal"
                      disabled={isUploading}
                      className="text-sm"
                    />

                    <div className="mt-3">
                      <FileUploader
                        onFileSelect={handleFileSelect}
                        acceptedFileTypes={['.csv', '.xlsx', '.xls']}
                        maxSizeMB={100}
                        disabled={isUploading}
                        className="text-xs"
                      />
                      {newDatasetForm.file && (
                        <div className="mt-2 p-1.5 bg-gray-700/30 rounded-lg flex items-center">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-green-400 mr-1.5" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                          <div className="flex-grow">
                            <p className="text-xs text-white truncate">{newDatasetForm.file.name}</p>
                            <p className="text-xs text-gray-400">
                              {(newDatasetForm.file.size / 1024 / 1024).toFixed(2)} MB
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Upload progress bar */}
                  {isUploading && (
                    <FileUploadProgress
                      progress={uploadProgress}
                      status={uploadStatus}
                      fileName={newDatasetForm.file?.name || 'file'}
                    />
                  )}

                  <div className="flex justify-end space-x-3 mt-4">
                    <Button
                      type="button"
                      variant="secondary"
                      onClick={() => setShowAddModal(false)}
                      disabled={isUploading}
                      size="sm"
                      className="text-xs py-1 px-3"
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      variant="primary"
                      gradient={true}
                      color="purple"
                      isLoading={isUploading}
                      disabled={isUploading || !newDatasetForm.file}
                      size="sm"
                      className="text-xs py-1 px-3"
                    >
                      {isUploading ? 'Uploading...' : 'Upload Dataset'}
                    </Button>
                  </div>
                </form>
              </Card>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 overflow-y-auto">
          <div className="flex min-h-screen justify-center items-center px-4 py-6">
            <div className="relative w-full max-w-xs mx-auto max-h-[80vh]">
              <Card className="w-full animate-fade-in overflow-y-auto max-h-[75vh] scale-90 transform">
                <div className="p-4">
                  <div className="flex flex-col items-center text-center mb-4">
                    <div className="w-12 h-12 bg-red-900/30 rounded-full flex items-center justify-center mb-3">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-red-500" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <h3 className="text-lg font-bold text-white mb-2">Delete Dataset?</h3>
                    <p className="text-gray-300 text-sm">
                      Are you sure you want to delete this dataset? This action cannot be undone and all data will be permanently removed.
                    </p>
                  </div>

                  <div className="flex justify-center space-x-3">
                    <Button
                      variant="secondary"
                      onClick={() => setShowDeleteModal(false)}
                      className="min-w-[80px] text-xs py-1 px-3"
                      size="sm"
                    >
                      Cancel
                    </Button>
                    <Button
                      variant="danger"
                      onClick={handleDeleteDataset}
                      className="min-w-[80px] text-xs py-1 px-3"
                      size="sm"
                    >
                      Delete
                    </Button>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </div>
      )}

      {/* Dataset Details Modal */}
      {showDetailsModal && (
        <DatasetDetails
          datasetId={detailsTarget}
          initialActiveTab={initialActiveTab}
          onClose={() => setShowDetailsModal(false)}
        />
      )}
    </div>
  );
}

export default DatasetList;
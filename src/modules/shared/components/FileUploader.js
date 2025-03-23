// src/modules/shared/components/FileUploader.js
import React, { useState, useRef } from 'react';
import Button from './Button';

/**
 * File uploader component with drag and drop support
 *
 * @param {Object} props
 * @param {Function} props.onFileSelect - Callback when file is selected
 * @param {Array} props.acceptedFileTypes - Array of accepted file types (e.g. ['.csv', '.xlsx'])
 * @param {number} props.maxSizeMB - Maximum file size in MB
 * @param {boolean} props.disabled - Whether the uploader is disabled
 * @param {string} props.className - Additional class names
 */
const FileUploader = ({
  onFileSelect,
  acceptedFileTypes = ['.csv', '.xlsx', '.xls'],
  maxSizeMB = 100,
  disabled = false,
  className = ''
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const fileInputRef = useRef(null);

  // Convert accepted file types to a string for the file input
  const acceptedTypesString = acceptedFileTypes.join(',');

  // Convert maxSizeMB to bytes
  const maxSizeBytes = maxSizeMB * 1024 * 1024;

  // Handle file selection
  const handleFileSelect = (event) => {
    const files = event.target.files || (event.dataTransfer && event.dataTransfer.files);

    if (!files || files.length === 0) {
      return;
    }

    const file = files[0]; // Only handle the first file

    // Validate file type
    const fileExtension = '.' + file.name.split('.').pop().toLowerCase();
    if (!acceptedFileTypes.includes(fileExtension)) {
      setErrorMessage(`Invalid file type. Accepted types: ${acceptedFileTypes.join(', ')}`);
      return;
    }

    // Validate file size
    if (file.size > maxSizeBytes) {
      setErrorMessage(`File size exceeds the maximum limit of ${maxSizeMB}MB`);
      return;
    }

    // Clear any previous errors
    setErrorMessage('');

    // Call the callback with the selected file
    if (onFileSelect) {
      onFileSelect(file);
    }
  };

  // Handle click on the upload area
  const handleUploadClick = () => {
    if (!disabled && fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  // Handle drag events
  const handleDragEnter = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!disabled) {
      setIsDragging(true);
    }
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!disabled) {
      setIsDragging(true);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    if (!disabled) {
      handleFileSelect(e);
    }
  };

  return (
    <div className={`${className}`}>
      <div
        className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors cursor-pointer ${
          isDragging
            ? 'border-blue-500 bg-blue-500/10'
            : disabled
              ? 'border-gray-600 bg-gray-800/50 cursor-not-allowed'
              : 'border-gray-600 hover:border-blue-500/50 hover:bg-gray-700/50'
        }`}
        onClick={handleUploadClick}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className={`h-10 w-10 mx-auto mb-2 ${
            isDragging
              ? 'text-blue-400'
              : disabled
                ? 'text-gray-500'
                : 'text-gray-400'
          }`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
        </svg>

        <p className={`${disabled ? 'text-gray-500' : 'text-gray-400'} mb-1`}>
          {isDragging ? 'Drop your file here' : 'Drag your file here, or'}
        </p>

        <button
          type="button"
          className={`font-medium ${
            disabled
              ? 'text-gray-500 cursor-not-allowed'
              : 'text-blue-400 hover:text-blue-300'
          }`}
          disabled={disabled}
        >
          browse files
        </button>

        <p className="text-gray-500 text-xs mt-2">
          Accepted file types: {acceptedFileTypes.join(', ')} • Max size: {maxSizeMB}MB
        </p>

        {errorMessage && (
          <p className="text-red-400 text-xs mt-2">{errorMessage}</p>
        )}
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept={acceptedTypesString}
        onChange={handleFileSelect}
        className="hidden"
        disabled={disabled}
      />
    </div>
  );
};

export default FileUploader;
// src/modules/shared/components/FileUploadProgress.js
import React from 'react';

function FileUploadProgress({ progress, status, fileName }) {
  return (
    <div className="mt-4">
      <div className="flex justify-between mb-1">
        <span className="text-xs text-gray-400">{fileName}</span>
        <span className="text-xs text-gray-400">{Math.round(progress)}%</span>
      </div>
      <div className="h-1.5 bg-gray-700 rounded-full overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-300"
          style={{ width: `${progress}%` }}
        ></div>
      </div>
      {status && (
        <p className="text-xs text-gray-400 mt-1">{status}</p>
      )}
    </div>
  );
}

export default FileUploadProgress;
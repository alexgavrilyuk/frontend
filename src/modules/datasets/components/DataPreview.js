// src/modules/datasets/components/DataPreview.js
import React, { useState, useEffect } from 'react';
import { Card, LoadingSpinner, StatusMessage, Button } from '../../shared/components';
import datasetService from '../services/datasetService';

/**
 * Component to display a preview of the dataset's rows
 *
 * @param {Object} props
 * @param {string} props.datasetId - The ID of the dataset
 * @param {number} [props.limit=100] - The maximum number of rows to display
 */
function DataPreview({ datasetId, limit = 100 }) {
  const [previewData, setPreviewData] = useState([]);
  const [columns, setColumns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [rowLimit, setRowLimit] = useState(limit);

  // Fetch preview data when datasetId changes
  useEffect(() => {
    const fetchPreviewData = async () => {
      if (!datasetId) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        // Fetch preview data from API
        const data = await datasetService.getDatasetPreview(datasetId, rowLimit);

        // Extract column names from the first row (if available)
        if (data && data.length > 0) {
          setColumns(Object.keys(data[0]));
        } else {
          setColumns([]);
        }

        setPreviewData(data || []);
      } catch (err) {
        console.error("Error fetching dataset preview:", err);
        setError(err.message || "Failed to load dataset preview");
      } finally {
        setLoading(false);
      }
    };

    fetchPreviewData();
  }, [datasetId, rowLimit]);

  // Format cell value for display
  const formatCellValue = (value) => {
    if (value === null || value === undefined) {
      return <span className="text-gray-500">null</span>;
    }

    if (typeof value === 'object') {
      try {
        return JSON.stringify(value);
      } catch (e) {
        return String(value);
      }
    }

    return String(value);
  };

  // Get CSS class for a cell based on value type
  const getCellClass = (value) => {
    if (value === null || value === undefined) {
      return "text-gray-500 italic";
    }

    switch (typeof value) {
      case 'number':
        return "text-green-400";
      case 'boolean':
        return "text-yellow-400";
      case 'string':
        if (
          !isNaN(Date.parse(value)) &&
          (value.includes('-') || value.includes('/')) &&
          value.length >= 8
        ) {
          return "text-purple-400"; // Possibly a date
        }
        return "text-blue-400";
      default:
        return "text-gray-300";
    }
  };

  // Increase the row limit
  const handleLoadMore = () => {
    setRowLimit(prev => prev + 100);
  };

  // Show loading state
  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <LoadingSpinner size="lg" color="blue" label="Loading preview data..." />
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <StatusMessage type="error" className="my-4">
        {error}
      </StatusMessage>
    );
  }

  // Show empty state
  if (!previewData || previewData.length === 0) {
    return (
      <div className="text-center py-12">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto text-gray-600 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
        </svg>
        <p className="text-gray-400 text-lg">No data available for preview</p>
        <p className="text-gray-500 mt-2">
          The dataset might be empty or preview is not available for this dataset.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h4 className="text-lg font-medium text-white">Data Preview</h4>
          <p className="text-sm text-gray-400">Showing {previewData.length} of {rowLimit} rows</p>
        </div>
      </div>

      <Card variant="default" noPadding className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-700">
            <thead>
              <tr className="bg-gray-800/70">
                {/* Row number column */}
                <th className="px-3 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider sticky left-0 bg-gray-800/70 z-10 border-r border-gray-700/50">
                  #
                </th>

                {/* Data columns */}
                {columns.map((column, idx) => (
                  <th
                    key={idx}
                    className="px-3 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider"
                  >
                    {column}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700/50">
              {previewData.map((row, rowIndex) => (
                <tr key={rowIndex} className={rowIndex % 2 === 0 ? 'bg-gray-800/40' : 'bg-gray-800/20'}>
                  {/* Row number */}
                  <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-400 sticky left-0 bg-inherit z-10 border-r border-gray-700/50">
                    {rowIndex + 1}
                  </td>

                  {/* Row data */}
                  {columns.map((column, colIndex) => (
                    <td
                      key={`${rowIndex}-${colIndex}`}
                      className={`px-3 py-2 whitespace-nowrap text-sm ${getCellClass(row[column])}`}
                    >
                      {formatCellValue(row[column])}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Load more button */}
      {previewData.length === rowLimit && (
        <div className="flex justify-center mt-4">
          <Button
            variant="secondary"
            color="blue"
            onClick={handleLoadMore}
          >
            Load More Rows
          </Button>
        </div>
      )}
    </div>
  );
}

export default DataPreview;
// src/modules/datasets/components/SchemaViewer.js
import React, { useState, useEffect } from 'react';
import { useDatasets } from '../contexts/DatasetContext';
import { useAuth } from '../../auth';
import datasetService from '../services/datasetService';
import { Card, Button, LoadingSpinner, StatusMessage } from '../../shared/components';

/**
 * SchemaViewer component to display column information for a dataset
 * Helps users formulate better queries by showing available columns
 *
 * @param {Object} props
 * @param {string} props.datasetId - ID of the dataset to show schema for
 * @param {boolean} props.collapsed - Whether the viewer is initially collapsed
 * @param {string} props.className - Additional class names
 */
function SchemaViewer({ datasetId, collapsed = true, className = '' }) {
  const [schema, setSchema] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isCollapsed, setIsCollapsed] = useState(collapsed);
  const { datasets } = useDatasets();
  const { currentUser } = useAuth();

  // Find the current dataset name
  const currentDataset = datasets.find(d => d.id === datasetId);
  const datasetName = currentDataset?.name || 'Selected Dataset';

  // Fetch schema when dataset changes
  useEffect(() => {
    if (!datasetId || !currentUser) {
      setSchema(null);
      setError(null);
      return;
    }

    const fetchSchema = async () => {
      try {
        setLoading(true);
        setError(null);

        // Use the datasetService from DatasetContext instead of apiService directly
        // This ensures authentication is handled properly
        const schemaData = await datasetService.getDatasetSchema(datasetId);

        setSchema(schemaData.schema);
      } catch (err) {
        console.error("Error fetching schema:", err);

        // Set a more user-friendly error message
        if (err.message && err.message.includes('authentication')) {
          setError("Authentication error. Please refresh and try again.");
        } else {
          setError("Failed to load schema: " + err.message);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchSchema();
  }, [datasetId, currentUser]);

  // Toggle collapsed state
  const toggleCollapse = () => {
    setIsCollapsed(!isCollapsed);
  };

  // Handle copy column name
  const handleCopyColumnName = (columnName) => {
    navigator.clipboard.writeText(columnName)
      .then(() => {
        // Could show a temporary success message here
        console.log(`Copied column name: ${columnName}`);
      })
      .catch(err => {
        console.error('Failed to copy column name:', err);
      });
  };

  // Show loading state
  if (loading) {
    return (
      <Card className={`${className}`}>
        <LoadingSpinner size="sm" color="blue" label="Loading schema" />
      </Card>
    );
  }

  // Show error state
  if (error) {
    return (
      <Card className={`${className}`}>
        <StatusMessage type="error">{error}</StatusMessage>
      </Card>
    );
  }

  // Show empty state if no schema
  if (!schema || !schema.columns || schema.columns.length === 0) {
    return (
      <Card className={`${className}`}>
        <div className="flex justify-between items-center mb-2">
          <h3 className="text-sm font-medium text-white">{datasetName} Schema</h3>
          <Button
            variant="ghost"
            color="blue"
            size="sm"
            onClick={toggleCollapse}
            className="p-1"
          >
            {isCollapsed ? 'Show' : 'Hide'}
          </Button>
        </div>
        <p className="text-sm text-gray-400">Schema information not available</p>
      </Card>
    );
  }

  return (
    <Card className={`${className}`}>
      <div className="flex justify-between items-center mb-2">
        <div className="flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-blue-400 mr-2" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M3 5a2 2 0 012-2h10a2 2 0 012 2v10a2 2 0 01-2 2H5a2 2 0 01-2-2V5zm11 1H6v8l4-2 4 2V6z" clipRule="evenodd" />
          </svg>
          <h3 className="text-sm font-medium text-white">{datasetName} Schema</h3>
          <span className="ml-2 text-xs text-gray-400">({schema.columns.length} columns)</span>
        </div>
        <Button
          variant="ghost"
          color="blue"
          size="sm"
          onClick={toggleCollapse}
          className="p-1"
        >
          {isCollapsed ? 'Show Schema' : 'Hide Schema'}
        </Button>
      </div>

      {/* Collapsible content */}
      {!isCollapsed && (
        <div className="mt-3 overflow-x-auto">
          <div className="text-xs mb-2 text-gray-400">
            <p>Use these column names in your questions for better results</p>
          </div>
          <table className="min-w-full divide-y divide-gray-700 text-sm">
            <thead>
              <tr className="bg-gray-700/30">
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Column Name
                </th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-3 py-2 text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700/50">
              {schema.columns.map((column, index) => (
                <tr key={index} className={index % 2 === 0 ? 'bg-gray-800/50' : 'bg-gray-800/20'}>
                  <td className="px-3 py-2 whitespace-nowrap font-medium text-white">
                    {column.name}
                    {column.primaryKey && (
                      <span className="ml-2 text-yellow-500" title="Primary Key">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 inline" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                        </svg>
                      </span>
                    )}
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap text-gray-300">
                    {column.type}
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap text-right text-xs">
                    <Button
                      variant="ghost"
                      color="blue"
                      size="sm"
                      onClick={() => handleCopyColumnName(column.name)}
                      className="py-1 px-2"
                    >
                      Copy
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Sample queries based on schema */}
          <div className="mt-4 pt-3 border-t border-gray-700/50">
            <h4 className="text-xs font-medium text-gray-300 mb-2">Sample Questions</h4>
            <div className="grid grid-cols-1 gap-2">
              {generateSampleQueries(schema.columns).map((query, index) => (
                <div
                  key={index}
                  className="text-xs text-gray-300 p-2 bg-gray-700/30 rounded cursor-pointer hover:bg-gray-700/50"
                  onClick={() => {
                    navigator.clipboard.writeText(query);
                    // Could show toast notification here
                  }}
                >
                  {query}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </Card>
  );
}

/**
 * Generate sample queries based on schema columns
 * @param {Array} columns - Array of column objects
 * @returns {Array} Array of sample query strings
 */
function generateSampleQueries(columns) {
  const queries = [];

  // Find potential numeric and date columns
  const numericColumns = columns.filter(col =>
    ['integer', 'number', 'float', 'decimal', 'numeric'].some(type =>
      col.type?.toLowerCase().includes(type)
    )
  );

  const dateColumns = columns.filter(col =>
    ['date', 'time', 'datetime', 'timestamp'].some(type =>
      col.type?.toLowerCase().includes(type)
    )
  );

  const stringColumns = columns.filter(col =>
    ['text', 'string', 'varchar', 'char'].some(type =>
      col.type?.toLowerCase().includes(type)
    )
  );

  // Basic "show all" query
  queries.push(`Show me all data from this dataset`);

  // If we have date columns, add time-based query
  if (dateColumns.length > 0) {
    const dateCol = dateColumns[0].name;
    queries.push(`Show me the latest 10 records sorted by ${dateCol}`);
  }

  // If we have numeric columns, add aggregate query
  if (numericColumns.length > 0) {
    const numCol = numericColumns[0].name;

    // If we also have categorical columns, add group by query
    if (stringColumns.length > 0) {
      const stringCol = stringColumns[0].name;
      queries.push(`What's the sum of ${numCol} grouped by ${stringCol}?`);
    } else {
      queries.push(`What's the average ${numCol}?`);
    }
  }

  // Add filter query
  if (numericColumns.length > 0) {
    const numCol = numericColumns[0].name;
    queries.push(`Show records where ${numCol} is greater than 100`);
  }

  // Add sorting query
  if (columns.length >= 2) {
    const col1 = columns[0].name;
    const col2 = columns[1].name;
    queries.push(`Sort data by ${col1} and then by ${col2}`);
  }

  // Add column selection query
  if (columns.length >= 3) {
    const selectedCols = columns.slice(0, 3).map(col => col.name).join(', ');
    queries.push(`Show me only the ${selectedCols} columns`);
  }

  return queries;
}

export default SchemaViewer;
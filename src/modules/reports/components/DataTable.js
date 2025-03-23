// src/modules/reports/components/DataTable.js
import React, { useState, useMemo } from 'react';
import { Card } from '../../shared/components';

/**
 * Enhanced table component for displaying data in reports
 *
 * @param {Object} props
 * @param {Object} props.visualization - Visualization specification for table
 * @param {string} props.visualization.title - Table title
 * @param {Array} props.visualization.data - Table data
 * @param {Object} props.visualization.config - Table configuration
 */
const DataTable = ({ visualization }) => {
  const { title, data: rawData = [], config = {} } = visualization;
  const [currentPage, setCurrentPage] = useState(0);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'none' });

  // Make sure we have a valid data array
  const data = useMemo(() => {
    return Array.isArray(rawData) ? rawData : [];
  }, [rawData]);

  // Number of rows per page
  const rowsPerPage = config.rowsPerPage || 10;

  // Extract columns from the first data row or use provided columns
  const columns = useMemo(() => {
    if (!data.length) return [];

    return config.columns
      ? config.columns
      : Object.keys(data[0]).map(key => ({ key, label: formatColumnLabel(key) }));
  }, [config.columns, data]);

  // Determine pagination
  const totalPages = Math.max(1, Math.ceil(data.length / rowsPerPage));
  const startIndex = currentPage * rowsPerPage;
  const endIndex = Math.min(startIndex + rowsPerPage, data.length);

  // Format a column label from a key (e.g., "user_id" -> "User Id")
  function formatColumnLabel(key) {
    return key
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }

  // Handle sorting
  const handleSort = (key) => {
    let direction = 'ascending';

    if (sortConfig.key === key) {
      direction = sortConfig.direction === 'ascending' ? 'descending' :
                 sortConfig.direction === 'descending' ? 'none' : 'ascending';
    }

    setSortConfig({ key, direction });
  };

  // Sort and paginate data
  const sortedData = useMemo(() => {
    if (!data.length) return [];

    let sortableData = [...data];

    if (sortConfig.key && sortConfig.direction !== 'none') {
      sortableData.sort((a, b) => {
        const aValue = a[sortConfig.key];
        const bValue = b[sortConfig.key];

        // Handle numbers
        if (typeof aValue === 'number' && typeof bValue === 'number') {
          return sortConfig.direction === 'ascending' ? aValue - bValue : bValue - aValue;
        }

        // Handle strings
        if (aValue < bValue) {
          return sortConfig.direction === 'ascending' ? -1 : 1;
        }
        if (aValue > bValue) {
          return sortConfig.direction === 'ascending' ? 1 : -1;
        }
        return 0;
      });
    }

    return sortableData.slice(startIndex, endIndex);
  }, [data, sortConfig, startIndex, endIndex]);

  // Format cell value based on data type
  const formatCell = (value, columnKey) => {
    if (value === null || value === undefined) return '-';

    if (typeof value === 'number') {
      // Check if it's a percentage
      if (columnKey.toLowerCase().includes('percent') || columnKey.toLowerCase().includes('rate')) {
        return `${value.toFixed(2)}%`;
      }
      // Format large numbers with commas
      return value.toLocaleString(undefined, {
        maximumFractionDigits: 2
      });
    }

    if (typeof value === 'boolean') {
      return value ? 'Yes' : 'No';
    }

    if (value instanceof Date) {
      return value.toLocaleString();
    }

    // Check if string is a date
    if (typeof value === 'string') {
      const dateRegex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.*$/;
      if (dateRegex.test(value)) {
        return new Date(value).toLocaleString();
      }
    }

    return String(value);
  };

  // Handle pagination
  const handlePreviousPage = () => {
    setCurrentPage(Math.max(0, currentPage - 1));
  };

  const handleNextPage = () => {
    setCurrentPage(Math.min(totalPages - 1, currentPage + 1));
  };

  // Render empty state if no data
  if (!data.length) {
    return (
      <Card variant="glass" className="p-4">
        <h4 className="text-sm font-medium text-gray-300 mb-4">{title || 'Data Table'}</h4>
        <div className="text-center text-gray-400 py-6">
          <p>No data available</p>
        </div>
      </Card>
    );
  }

  return (
    <Card variant="glass" className="p-4">
      <h4 className="text-sm font-medium text-gray-300 mb-4">{title || 'Data Table'}</h4>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-700">
          <thead className="bg-gray-800/50">
            <tr>
              {columns.map((column) => (
                <th
                  key={column.key}
                  scope="col"
                  className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider cursor-pointer hover:bg-gray-700/30"
                  onClick={() => handleSort(column.key)}
                >
                  <div className="flex items-center">
                    {column.label}
                    {sortConfig.key === column.key && (
                      <span className="ml-1">
                        {sortConfig.direction === 'ascending' ? '↑' :
                         sortConfig.direction === 'descending' ? '↓' : ''}
                      </span>
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-700/50">
            {sortedData.map((row, rowIndex) => (
              <tr
                key={rowIndex}
                className="hover:bg-gray-700/20"
              >
                {columns.map((column) => (
                  <td
                    key={`${rowIndex}-${column.key}`}
                    className="px-4 py-2 text-sm text-gray-300 whitespace-nowrap"
                  >
                    {formatCell(row[column.key], column.key)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination controls */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-4 text-xs text-gray-400">
          <div>
            Showing {startIndex + 1}-{endIndex} of {data.length} items
          </div>
          <div className="flex space-x-2">
            <button
              onClick={handlePreviousPage}
              disabled={currentPage === 0}
              className={`px-2 py-1 rounded border border-gray-700 ${
                currentPage === 0
                  ? 'text-gray-600 cursor-not-allowed'
                  : 'text-gray-300 hover:bg-gray-700/30'
              }`}
            >
              Previous
            </button>
            <span className="px-2 py-1">
              Page {currentPage + 1} of {totalPages}
            </span>
            <button
              onClick={handleNextPage}
              disabled={currentPage === totalPages - 1}
              className={`px-2 py-1 rounded border border-gray-700 ${
                currentPage === totalPages - 1
                  ? 'text-gray-600 cursor-not-allowed'
                  : 'text-gray-300 hover:bg-gray-700/30'
              }`}
            >
              Next
            </button>
          </div>
        </div>
      )}
    </Card>
  );
};

export default DataTable;
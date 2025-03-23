// src/modules/visualizations/components/DataTable.js
import React, { useState, useMemo } from 'react';

/**
 * DataTable component for tabular data visualization
 *
 * @param {Object} props
 * @param {Array} props.data - The data to be displayed in the table
 * @param {Object} props.config - Configuration options for the table
 * @param {Array} props.config.columns - Column definitions (array of objects with key and label)
 * @param {string} props.config.sortBy - Initial sort column
 * @param {string} props.config.sortDirection - Initial sort direction ('asc' or 'desc')
 * @param {number} props.config.pageSize - Number of rows per page
 * @param {boolean} props.config.showPagination - Whether to show pagination controls
 * @param {boolean} props.config.showSearch - Whether to show search functionality
 * @param {boolean} props.config.striped - Whether to use striped rows
 * @param {Function} props.onRowClick - Callback when a row is clicked
 * @param {string} props.className - Additional CSS classes
 */
const DataTable = ({
  data = [],
  config = {},
  onRowClick,
  className = ''
}) => {
  // Extract configuration options with defaults
  const {
    columns = [],
    sortBy: initialSortBy = null,
    sortDirection: initialSortDirection = 'asc',
    pageSize = 10,
    showPagination = true,
    showSearch = true,
    striped = true
  } = config;

  // State for sorting
  const [sortConfig, setSortConfig] = useState({
    key: initialSortBy,
    direction: initialSortDirection
  });

  // State for pagination
  const [currentPage, setCurrentPage] = useState(0);

  // State for search
  const [searchTerm, setSearchTerm] = useState('');

  // Derived columns from data if not provided
  const derivedColumns = useMemo(() => {
    if (columns && columns.length > 0) return columns;
    if (!data || data.length === 0) return [];

    // Extract column keys from the first data item
    return Object.keys(data[0]).map(key => ({
      key,
      label: key.charAt(0).toUpperCase() + key.slice(1).replace(/_/g, ' ')
    }));
  }, [columns, data]);

  // Sort and filter data
  const processedData = useMemo(() => {
    let result = [...data];

    // Apply search filter if search term exists
    if (searchTerm) {
      const lowerSearchTerm = searchTerm.toLowerCase();
      result = result.filter(item => {
        return derivedColumns.some(column => {
          const value = item[column.key];
          if (value === null || value === undefined) return false;
          return String(value).toLowerCase().includes(lowerSearchTerm);
        });
      });
    }

    // Apply sorting if sort key exists
    if (sortConfig.key) {
      result.sort((a, b) => {
        const aValue = a[sortConfig.key];
        const bValue = b[sortConfig.key];

        // Handle null/undefined values
        if (aValue === null || aValue === undefined) return sortConfig.direction === 'asc' ? -1 : 1;
        if (bValue === null || bValue === undefined) return sortConfig.direction === 'asc' ? 1 : -1;

        // Sort numbers numerically
        if (typeof aValue === 'number' && typeof bValue === 'number') {
          return sortConfig.direction === 'asc' ? aValue - bValue : bValue - aValue;
        }

        // Sort everything else as strings
        const aString = String(aValue).toLowerCase();
        const bString = String(bValue).toLowerCase();

        if (aString < bString) {
          return sortConfig.direction === 'asc' ? -1 : 1;
        }
        if (aString > bString) {
          return sortConfig.direction === 'asc' ? 1 : -1;
        }
        return 0;
      });
    }

    return result;
  }, [data, derivedColumns, searchTerm, sortConfig]);

  // Calculate pagination
  const paginatedData = useMemo(() => {
    if (!showPagination) return processedData;
    const start = currentPage * pageSize;
    const end = start + pageSize;
    return processedData.slice(start, end);
  }, [processedData, currentPage, pageSize, showPagination]);

  // Calculate total pages
  const totalPages = useMemo(() => {
    return Math.ceil(processedData.length / pageSize);
  }, [processedData, pageSize]);

  // Handler for column header click (sorting)
  const handleHeaderClick = (key) => {
    setSortConfig(prevSortConfig => {
      if (prevSortConfig.key === key) {
        // Toggle direction if same column
        if (prevSortConfig.direction === 'asc') {
          return { key, direction: 'desc' };
        } else if (prevSortConfig.direction === 'desc') {
          return { key: null, direction: 'asc' };
        }
      }
      // Sort new column ascending
      return { key, direction: 'asc' };
    });
  };

  // Handler for pagination
  const handlePageChange = (newPage) => {
    if (newPage >= 0 && newPage < totalPages) {
      setCurrentPage(newPage);
    }
  };

  // Handler for search input
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(0); // Reset to first page on search
  };

  // Format a cell value based on its type
  const formatCellValue = (value) => {
    if (value === null || value === undefined) {
      return '-';
    }

    if (typeof value === 'boolean') {
      return value ? 'Yes' : 'No';
    }

    if (value instanceof Date) {
      return value.toLocaleString();
    }

    // Check if it's a date string
    if (typeof value === 'string' && value.match(/^\d{4}-\d{2}-\d{2}/)) {
      try {
        return new Date(value).toLocaleDateString();
      } catch (e) {
        return value;
      }
    }

    // Format numbers nicely
    if (typeof value === 'number') {
      // If it appears to be a percentage
      if (value >= 0 && value <= 1) {
        return `${(value * 100).toFixed(1)}%`;
      }
      // If it's a whole number
      if (Number.isInteger(value)) {
        return value.toLocaleString();
      }
      // If it's a decimal
      return value.toLocaleString(undefined, {
        minimumFractionDigits: 1,
        maximumFractionDigits: 2
      });
    }

    return String(value);
  };

  // If no data, show a message
  if (!data || data.length === 0) {
    return (
      <div className={`data-table ${className}`}>
        <div className="bg-gray-800/50 border border-gray-700/50 rounded-lg p-6 text-center">
          <p className="text-gray-400">No data available</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`data-table ${className}`}>
      {/* Search bar */}
      {showSearch && (
        <div className="mb-4">
          <input
            type="text"
            placeholder="Search..."
            value={searchTerm}
            onChange={handleSearchChange}
            className="w-full p-2 bg-gray-700/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      )}

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-700/50 border border-gray-700/50 rounded-lg overflow-hidden">
          <thead className="bg-gray-800">
            <tr>
              {derivedColumns.map((column) => (
                <th
                  key={column.key}
                  className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider cursor-pointer hover:bg-gray-700/30"
                  onClick={() => handleHeaderClick(column.key)}
                >
                  <div className="flex items-center">
                    {column.label || column.key}
                    {sortConfig.key === column.key && (
                      <span className="ml-1">
                        {sortConfig.direction === 'asc' ? '↑' : '↓'}
                      </span>
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-700/50 bg-gray-900/20">
            {paginatedData.map((row, rowIndex) => (
              <tr
                key={rowIndex}
                className={`hover:bg-gray-700/20 transition-colors duration-150 ease-in-out ${
                  onRowClick ? 'cursor-pointer' : ''
                } ${striped && rowIndex % 2 ? 'bg-gray-800/30' : ''}`}
                onClick={() => onRowClick && onRowClick(row)}
              >
                {derivedColumns.map((column) => (
                  <td
                    key={`${rowIndex}-${column.key}`}
                    className="px-4 py-2 text-sm text-gray-300 whitespace-nowrap"
                  >
                    {formatCellValue(row[column.key])}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {showPagination && totalPages > 1 && (
        <div className="flex items-center justify-between mt-4 text-sm text-gray-400">
          <div>
            Showing {currentPage * pageSize + 1}-{Math.min((currentPage + 1) * pageSize, processedData.length)} of {processedData.length} items
          </div>
          <div className="flex space-x-2">
            <button
              onClick={() => handlePageChange(0)}
              disabled={currentPage === 0}
              className={`px-2 py-1 rounded border border-gray-700 ${
                currentPage === 0
                  ? 'text-gray-600 cursor-not-allowed'
                  : 'text-gray-300 hover:bg-gray-700/30'
              }`}
            >
              &laquo;
            </button>
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 0}
              className={`px-2 py-1 rounded border border-gray-700 ${
                currentPage === 0
                  ? 'text-gray-600 cursor-not-allowed'
                  : 'text-gray-300 hover:bg-gray-700/30'
              }`}
            >
              &lsaquo;
            </button>
            <span className="px-2 py-1">
              Page {currentPage + 1} of {totalPages}
            </span>
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages - 1}
              className={`px-2 py-1 rounded border border-gray-700 ${
                currentPage === totalPages - 1
                  ? 'text-gray-600 cursor-not-allowed'
                  : 'text-gray-300 hover:bg-gray-700/30'
              }`}
            >
              &rsaquo;
            </button>
            <button
              onClick={() => handlePageChange(totalPages - 1)}
              disabled={currentPage === totalPages - 1}
              className={`px-2 py-1 rounded border border-gray-700 ${
                currentPage === totalPages - 1
                  ? 'text-gray-600 cursor-not-allowed'
                  : 'text-gray-300 hover:bg-gray-700/30'
              }`}
            >
              &raquo;
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default DataTable;
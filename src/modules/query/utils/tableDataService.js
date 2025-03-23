// src/modules/query/utils/tableDataService.js

/**
 * Utility service for handling table data operations
 */
const tableDataService = {
  /**
   * Normalize table data to ensure consistent structure
   * @param {Array} rawResults - The raw results from the API
   * @param {Object} schema - Optional schema information
   * @returns {Array} - Normalized results
   */
  normalizeTableData: (rawResults, schema = {}) => {
    if (!rawResults || !Array.isArray(rawResults) || rawResults.length === 0) {
      console.warn('tableDataService: No results to normalize');
      return [];
    }

    // Check if this is already in the expected format
    if (typeof rawResults[0] === 'object' && !Array.isArray(rawResults[0])) {
      console.log('tableDataService: Results already in object format');
      return rawResults;
    }

    // Handle array of arrays format
    if (Array.isArray(rawResults[0])) {
      console.log('tableDataService: Converting array of arrays format');
      // Assume the first row contains headers
      const headers = rawResults[0];
      const dataRows = rawResults.slice(1);

      return dataRows.map(row => {
        const rowObj = {};
        headers.forEach((header, i) => {
          rowObj[header] = row[i];
        });
        return rowObj;
      });
    }

    // If we've reached here, format is unexpected
    console.warn('tableDataService: Unexpected results format:', rawResults[0]);
    return rawResults;
  },

  /**
   * Preserve column order for display
   * @param {Array} results - The results to process
   * @returns {Object} - Object with results and columnOrder
   */
  preserveColumnOrder: (results) => {
    if (!results || !Array.isArray(results) || results.length === 0) {
      return { results: [], columnOrder: [] };
    }

    // Extract column names from the first result
    const columnOrder = Object.keys(results[0]);

    return { results, columnOrder };
  },

  /**
   * Format a cell value based on type and column name
   * @param {any} value - The value to format
   * @param {string} columnName - Name of the column
   * @param {Object} schema - Optional schema information
   * @returns {string} - Formatted value
   */
  formatCellValue: (value, columnName = '', schema = {}) => {
    if (value === null || value === undefined) {
      return '-';
    }

    // Get column type from schema if available
    let columnType = '';
    if (schema && schema.columns) {
      const column = schema.columns.find(col => col.name === columnName);
      if (column) {
        columnType = column.type;
      }
    }

    // Determine if column is a percentage based on name
    const isPercentage = columnName.toLowerCase().includes('percent') ||
                        columnName.toLowerCase().includes('ratio') ||
                        columnName.toLowerCase().includes('rate');

    // Format based on type
    if (columnType === 'date' || value instanceof Date) {
      return value.toLocaleString();
    } else if (columnType === 'boolean' || typeof value === 'boolean') {
      return value ? 'Yes' : 'No';
    } else if (columnType === 'number' || typeof value === 'number') {
      // Format numbers nicely
      if (isPercentage) {
        // Format as percentage
        return `${(value * 100).toFixed(1)}%`;
      } else if (Number.isInteger(value)) {
        // Format integers with commas
        return value.toLocaleString();
      } else {
        // Format decimals
        return value.toLocaleString(undefined, {
          minimumFractionDigits: 1,
          maximumFractionDigits: 2
        });
      }
    } else if (typeof value === 'string') {
      // Check if it's an ISO date string
      if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/.test(value)) {
        try {
          const date = new Date(value);
          return date.toLocaleDateString();
        } catch (e) {
          // Not a valid date, return as is
          return value;
        }
      }
      return value;
    }

    // Default - convert to string
    return String(value);
  },

  /**
   * Extract results from messages
   * @param {Array} messages - Array of chat messages
   * @returns {Object} - Object with results and metadata
   */
  extractResultsFromMessages: (messages) => {
    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return { results: [], error: null, retries: 0 };
    }

    // Look for assistant messages with results
    for (let i = messages.length - 1; i >= 0; i--) {
      const message = messages[i];
      if (message.role === 'assistant') {
        if (message.results && Array.isArray(message.results)) {
          return {
            results: message.results,
            error: message.error || null,
            retries: message.retries || 0
          };
        }
      }
    }

    return { results: [], error: null, retries: 0 };
  },

  /**
   * Process report data into table format
   * @param {Object} report - The report object
   * @returns {Array} - Processed data for table display
   */
  processReportDataForTable: (report) => {
    if (!report || !report.data || !Array.isArray(report.data)) {
      return [];
    }

    // If the data is already in the expected format, return it
    if (report.data.length > 0 && typeof report.data[0] === 'object') {
      return report.data;
    }

    // Otherwise, try to extract tabular data from visualizations
    if (report.visualizations && Array.isArray(report.visualizations)) {
      // Find table visualizations first
      const tableViz = report.visualizations.find(viz => viz.type === 'table');
      if (tableViz && tableViz.data) {
        return tableViz.data;
      }

      // If no table visualization, use the first visualization with data
      for (const viz of report.visualizations) {
        if (viz.data && Array.isArray(viz.data) && viz.data.length > 0) {
          return viz.data;
        }
      }
    }

    return [];
  },

  /**
   * Extract insights from report
   * @param {Object} report - The report object
   * @returns {Array} - Array of insight objects
   */
  extractInsightsFromReport: (report) => {
    if (!report || !report.insights || !Array.isArray(report.insights)) {
      return [];
    }

    return report.insights;
  },

  /**
   * Analyze columns to determine best visualization type
   * @param {Array} data - The data to analyze
   * @returns {string} - Recommended visualization type
   */
  recommendVisualizationType: (data) => {
    if (!data || !Array.isArray(data) || data.length === 0) {
      return 'table';
    }

    const firstRow = data[0];
    const columns = Object.keys(firstRow);

    // Count types of columns
    let dateColumns = 0;
    let numberColumns = 0;
    let categoryColumns = 0;

    columns.forEach(col => {
      const value = firstRow[col];

      if (value instanceof Date ||
          (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}/.test(value))) {
        dateColumns++;
      } else if (typeof value === 'number') {
        numberColumns++;
      } else {
        categoryColumns++;
      }
    });

    // Make recommendations based on column types
    if (dateColumns > 0 && numberColumns > 0) {
      return 'line'; // Time series data
    } else if (categoryColumns > 0 && numberColumns > 0) {
      return categoryColumns === 1 && numberColumns === 1 ? 'pie' : 'bar';
    }

    // Default to table for unknown patterns
    return 'table';
  }
};

export default tableDataService;
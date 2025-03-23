// src/modules/query/index.js
/**
 * Query Module
 *
 * This module handles all query-related functionality, including search interfaces,
 * result display, and data transformation.
 */

// Import components
import SearchBox from './components/SearchBox';
import ResultsTable from './components/ResultsTable';

// Import hooks
import useQueryManager from './hooks/useQueryManager';

// Import utilities
import tableDataService from './utils/tableDataService';

// Define module routes
export const routes = [
  // Query routes will be added here when needed
];

// Export public API
export {
  SearchBox,
  ResultsTable,
  useQueryManager,
  tableDataService
};
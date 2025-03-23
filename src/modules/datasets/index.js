// src/modules/datasets/index.js
/**
 * Datasets Module
 *
 * This module handles dataset management, including uploading, viewing, and querying datasets.
 */

// Import components
import DatasetList from './components/DatasetList';
import DatasetSelector from './components/DatasetSelector';
import DatasetDetails from './components/DatasetDetails';
import DatasetSchemaView from './components/DatasetSchemaView';
import SchemaViewer from './components/SchemaViewer';

// Import contexts
import { DatasetProvider, useDatasets } from './contexts/DatasetContext';

// Import services
import datasetService from './services/datasetService';

// Define module routes
export const routes = [
  {
    path: '/datasets',
    element: DatasetList
  }
];

// Export public API
export {
  DatasetList,
  DatasetSelector,
  DatasetDetails,
  DatasetSchemaView,
  SchemaViewer,
  DatasetProvider,
  useDatasets,
  datasetService
};
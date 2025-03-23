This README is in frontend/src/modules/datasets

# Datasets Module

## Purpose

The Datasets module handles all dataset-related functionality in the application, including uploading, viewing, managing, and querying datasets. It provides a complete system for users to work with their data files (CSV and Excel) and make them available for AI-powered analysis.

## Features

- Dataset uploading (with support for both small and large files)
- Dataset management (viewing, updating, deleting)
- Schema visualization, exploration, and editing
- Dataset context management and editing
- Data preview for viewing sample rows
- Dataset selection for queries
- Progress tracking for uploads
- Error handling for dataset operations

## Public API

This module exports:

### Components
- `DatasetList`: Component for displaying and managing all user datasets
- `DatasetSelector`: Dropdown component for selecting active dataset
- `DatasetDetails`: Modal component showing detailed dataset information
- `DatasetSchemaView`: Component for displaying and editing dataset schema information
- `DatasetOverview`: Component for displaying and editing dataset context information
- `DataPreview`: Component for displaying sample data from a dataset
- `SchemaViewer`: Standalone component for showing dataset structure in query interface

### Context & Hooks
- `DatasetProvider`: Context provider for dataset state
- `useDatasets`: Hook for accessing dataset state and operations

### Services
- `datasetService`: Service for interacting with dataset API endpoints

### Routes
- Dataset management route configuration

## Dependencies

This module depends on:

### Core
- API services for backend communication
- Firebase Authentication

### Other Modules
- Auth (for user authentication)
- Shared (for UI components)

### External Libraries
- React (UI components)
- Fetch API (for network requests)

## Configuration

The Datasets module integrates with the following API endpoints:

- `GET /api/datasets`: List all datasets
- `GET /api/datasets/:datasetId`: Get single dataset details
- `POST /api/datasets/upload`: Upload new dataset
- `GET /api/datasets/:datasetId/schema`: Get dataset schema
- `PATCH /api/datasets/:datasetId/schema`: Update dataset schema
- `PATCH /api/datasets/:datasetId`: Update dataset metadata
- `PATCH /api/datasets/:datasetId/context`: Update dataset context information
- `GET /api/datasets/:datasetId/preview`: Get dataset data preview
- `DELETE /api/datasets/:datasetId`: Delete dataset
- `POST /api/chunked-upload/init`: Initialize chunked upload
- `POST /api/chunked-upload/:uploadId/chunk`: Upload chunk
- `GET /api/chunked-upload/:uploadId/status`: Check upload status

## Schema Enhancement Features

The module now supports enhanced dataset schema management:

### Schema Editing
- Edit column types (string, integer, float, date, boolean)
- Add and edit column descriptions
- Save schema changes to improve AI query generation

### Dataset Context
- Add descriptive information about datasets
- Fields for context, purpose, source, and notes
- Enhanced AI understanding of dataset semantics

### Data Preview
- View sample rows from the dataset
- Visual representation of data types
- "Load More" functionality for viewing additional rows

## Usage Examples

### Accessing Datasets

```jsx
import { useDatasets } from '../modules/datasets';

function MyComponent() {
  const { datasets, loading, error } = useDatasets();

  if (loading) return <p>Loading datasets...</p>;
  if (error) return <p>Error: {error}</p>;

  return (
    <div>
      <h2>Your Datasets</h2>
      <ul>
        {datasets.map(dataset => (
          <li key={dataset.id}>{dataset.name}</li>
        ))}
      </ul>
    </div>
  );
}
```

### Dataset Selection

```jsx
import { DatasetSelector } from '../modules/datasets';

function QueryInterface() {
  const handleDatasetSelect = (datasetId) => {
    console.log(`Selected dataset: ${datasetId}`);
    // Perform operations with selected dataset
  };

  return (
    <div className="query-form">
      <h3>Select a dataset to query</h3>
      <DatasetSelector
        onSelectDataset={handleDatasetSelect}
      />
      {/* Rest of query interface */}
    </div>
  );
}
```

### Viewing Dataset Details

```jsx
import { useState } from 'react';
import { DatasetDetails } from '../modules/datasets';

function DatasetManagement() {
  const [selectedDatasetId, setSelectedDatasetId] = useState(null);
  const [showDetails, setShowDetails] = useState(false);

  const handleViewDetails = (datasetId) => {
    setSelectedDatasetId(datasetId);
    setShowDetails(true);
  };

  const handleCloseDetails = () => {
    setShowDetails(false);
  };

  return (
    <div>
      {/* Dataset list with buttons to view details */}

      {showDetails && selectedDatasetId && (
        <DatasetDetails
          datasetId={selectedDatasetId}
          onClose={handleCloseDetails}
        />
      )}
    </div>
  );
}
```

## Implementation Details

### Dataset Management Flow

1. **Retrieving Datasets**:
   - On module initialization, `useDatasets` hook fetches user's datasets
   - Datasets are stored in context state for app-wide access
   - Components can access the list through the `datasets` property

2. **Uploading Process**:
   - Small files (<50MB): Direct upload
   - Large files (>50MB): Chunked upload process
   - Progress tracking via callback function
   - Automatic dataset list refresh on completion

3. **Schema Management**:
   - Schema is fetched and displayed in the DatasetDetails component
   - Edit mode allows modification of column types and descriptions
   - Changes are saved to the backend to improve AI query understanding

4. **Context Information**:
   - Dataset context, purpose, source, and notes can be edited
   - Information is saved to enhance AI understanding of data
   - Forms the basis for improved query generation

5. **Data Preview**:
   - Sample rows are displayed in a tabular format
   - Data types are visually indicated with colors
   - Additional rows can be loaded on demand

## Error Handling

The module handles these common error scenarios:

- Network failures during upload or fetch
- Invalid file types
- File size restrictions
- Server-side processing errors
- Authentication errors
- Type conversion errors in BigQuery
- Schema validation issues

Error messages are propagated through the `error` property in the dataset context.

## Future Enhancements

Planned improvements for this module:

1. Advanced type conversion strategies for schema changes
2. Enhanced data preview with sorting and filtering
3. Improved schema visualization with relationship diagrams
4. Dataset sharing between users
5. Custom tagging and categorization
6. AI-assisted schema detection and correction

## Contributing Guidelines

When developing for this module:

1. Follow the modular architecture pattern
2. Add proper JSDoc comments to all functions
3. Thoroughly test any changes with both small and large datasets
4. Update documentation when adding new features
5. Consider BigQuery type conversion limitations when making schema changes
this README is in frontend/src/modules/query

# Query Module

## Purpose

The Query module handles all query-related functionality, including search interfaces, result display, and data transformation. It provides components and hooks for querying datasets and displaying the results.

## Features

- Natural language query interface
- Results display and formatting
- Data transformation and normalization
- Query state management
- Support for comprehensive reports and visualizations
- Detection of report-oriented queries

## Public API

This module exports:

### Components
- `SearchBox`: Component for entering and submitting queries (now with report generation option)
- `ResultsTable`: Component for displaying query results in a table format

### Hooks
- `useQueryManager`: Hook for managing query state and operations (now with report generation support)

### Utilities
- `tableDataService`: Utility for table data operations and formatting (enhanced for report data)

## Dependencies

This module depends on:

- Core:
  - API services
  - Firebase Authentication

- Other Modules:
  - Auth (for user authentication)
  - Datasets (for dataset selection and context)
  - Chat (for conversation context)
  - Reports (for report generation and display)
  - Shared (for UI components)

## Integration Points

This module integrates with:
- Chat module for sending and receiving queries
- Datasets module for selecting which dataset to query
- Reports module for generating comprehensive reports
- Dashboard for displaying query results

## Report Generation Features

The Query module now supports comprehensive report generation:

- **Query Detection**: Automatically identifies when a user query is asking for a report
- **Report Generation**: Integration with the Reports module for creating detailed reports
- **Specialized UI**: Toggle in SearchBox for explicitly requesting a report
- **UI Adaptation**: Different example queries are shown based on query type
- **Data Processing**: Enhanced tableDataService for handling report-specific data structures

## Report Integration

The Query module now properly detects and handles visualization data from backend responses:

- When a query includes visualization-related terms, the backend generates visualizations
- The `handleRegularQueryResponse` function in `useQueryManager.js` checks for visualization data
- If visualizations are present, it creates a report object for the ReportViewer component
- The report is attached to the assistant message and displayed in the chat flow

### Visualization Detection

Queries containing terms like "graph", "chart", "visualize", etc. will trigger this behavior. The backend response includes:
- `visualizations`: Array of visualization specifications
- `insights`: Array of data insights
- `narrative`: Text explanation of the data

These are automatically processed into a report format compatible with the ReportViewer component.

## Example Usage

```jsx
import { SearchBox, useQueryManager } from '../modules/query';

function QueryInterface() {
  const { handleQuerySubmit, isLoading, queryResults, error } = useQueryManager();

  return (
    <div className="query-container">
      <SearchBox onQuerySubmit={handleQuerySubmit} />

      {isLoading && <p>Loading results...</p>}

      {error && <p className="error">{error}</p>}

      {queryResults && (
        <div className="results-container">
          <h3>Results</h3>
          {/* Display query results */}
        </div>
      )}
    </div>
  );
}
```

## Report Data Processing

The enhanced tableDataService now provides these report-specific functions:

- `processReportDataForTable()`: Extracts and formats tabular data from reports
- `extractInsightsFromReport()`: Extracts insights from report objects
- `recommendVisualizationType()`: Analyzes data to suggest optimal visualization types
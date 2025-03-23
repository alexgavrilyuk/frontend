this README is in frontend/src/modules/reports

# Reports Module

## Purpose

The Reports module provides functionality for generating and displaying comprehensive, AI-driven reports with visualizations, narrative analysis, and actionable insights. This module transforms natural language queries into full-fledged, interactive reports.

## Features

- Report generation from natural language queries
- Comprehensive reports with visualizations, narrative text, and data tables
- Organized sections based on question complexity
- Interactive visualizations (basic in Phase 1, enhanced in Phase 3)
- User-friendly loading states
- Report management (view, list, delete)
- Embedding reports within chat conversations

## Structure

```
reports/
├── components/            # Report UI components
│   ├── ReportViewer.js    # Main container for displaying reports
│   ├── ReportHeader.js    # Report title, timestamp, and query info
│   ├── ReportSection.js   # Single section of a report with content
│   ├── ChartDisplay.js    # Chart visualization component
│   ├── DataTable.js       # Enhanced table component
│   ├── NarrativeText.js   # Formatted text with insights
│   └── LoadingReport.js   # Loading state during generation
├── services/              # API services
│   └── reportService.js   # API interactions for reports
├── hooks/                 # Custom hooks
│   └── useReport.js       # State management for reports
└── index.js               # Module exports and routes
```

## Components

### ReportViewer.js

The main container component for displaying reports. It handles:
- Fetching report data by ID (if not provided directly)
- Displaying loading and error states
- Rendering report header and sections
- Navigation between multiple sections
- Support for both standalone and embedded usage (in chat)

### ReportHeader.js

Displays report metadata including:
- Report title with gradient text styling
- Timestamp when the report was generated
- The original natural language query that generated the report

### ReportSection.js

Displays a single section of a report, including:
- Section title with optional collapsible functionality
- Key Performance Indicators (KPIs) in a responsive grid
- Chart visualizations of different types
- Narrative text explaining insights
- Data tables for detailed information
- Smart organization of different visualization types

### ChartDisplay.js

Renders various chart types based on visualization specifications:
- Currently handles KPI cards with full implementation
- Provides placeholders for bar, line, pie, scatter, and combo charts
- Will be enhanced with full chart implementations in Phase 3
- Displays preview of data and appropriate fallbacks

### DataTable.js

Enhanced table component with advanced features:
- Sorting by clicking on column headers
- Pagination for large datasets
- Smart formatting based on data types (numbers, dates, percentages)
- Responsive design with horizontal scrolling
- Empty state handling

### NarrativeText.js

Displays formatted narrative text with highlighting:
- Markdown-like formatting (headings, bold, italic, lists)
- Special tags for insights, metrics, and warnings
- Option to display with or without card wrapper
- Consistent styling with the application

### LoadingReport.js

Shows animated loading skeleton while reports are being generated:
- Realistic layout preview of what the report will look like
- Animated pulse effects for a polished experience
- Placeholders for all major report components
- Works in both embedded and standalone modes

## Services

### reportService.js

Provides API communication for all report operations:
- `generateReport()` - Create a new report based on natural language query
- `getReport()` - Retrieve a specific report by ID
- `getAllReports()` - Get all reports for the current user
- `deleteReport()` - Delete a report by ID
- `exportReport()` - Placeholder for PDF export (Phase 4)

## Hooks

### useReport.js

Custom hook that manages report state and operations:
- Maintains state for current report, loading, and errors
- Provides functions for all report operations
- Integrates with authentication
- Handles proper error messages and loading states
- Manages list of all user reports

## Query Integration

The Reports module now integrates with regular query responses that contain visualization data:

- Reports can be generated directly from query responses
- The Dashboard component automatically switches to report view when visualization data is detected
- Toggle buttons allow users to switch between table and report views

### Report Structure

Reports generated from query responses follow this structure:
- Title based on the original query
- Sections containing visualizations and narrative content
- Data tables with the raw query results
- Insights extracted from the data

Phase 1 implementation includes basic placeholder visualizations, with full interactive charts planned for Phase 3.

## Integration Points

The Reports module integrates with:

1. **Chat Module** - For embedding reports in conversation
2. **Query Module** - For converting queries to reports instead of simple results
3. **Dashboard** - For displaying reports in the main UI
4. **Backend API** - For generating and retrieving report data

## Usage Examples

### Generating a Report

```javascript
import { useReport } from '../modules/reports';

function QueryComponent() {
  const { generateReport, loading, error } = useReport();

  const handleGenerateReport = async () => {
    const query = "Analyze sales by region for Q1 2023";
    const datasetId = "your-dataset-id";

    const report = await generateReport(query, datasetId);
    if (report) {
      console.log("Report generated:", report.id);
    }
  };

  return (
    <button onClick={handleGenerateReport} disabled={loading}>
      Generate Report
    </button>
  );
}
```

### Displaying a Report

```javascript
import { ReportViewer } from '../modules/reports';

function ReportPage({ reportId }) {
  return (
    <div className="container">
      <ReportViewer reportId={reportId} />
    </div>
  );
}
```

### Embedding a Report in Chat

```javascript
import { ReportViewer } from '../modules/reports';

function ChatMessage({ message }) {
  // Check if the message has a report attached
  if (message.report) {
    return (
      <div className="message">
        <ReportViewer reportData={message.report} isEmbedded={true} />
      </div>
    );
  }

  // Regular message display
  return <div className="message">{message.content}</div>;
}
```

## Future Enhancements

Future phases will add:
- Advanced visualizations with Chart.js or D3.js (Phase 3)
- Interactive elements within reports (Phase 3)
- PDF export functionality (Phase 4)
- Report sharing capabilities
- Customization options for report appearance
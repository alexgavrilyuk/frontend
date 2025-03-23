/**
 * Reports Module
 *
 * This module provides functionality for generating and displaying AI-driven reports
 * with visualizations, narrative analysis, and insights.
 */

// Export components
export { default as ReportViewer } from './components/ReportViewer';
export { default as ReportHeader } from './components/ReportHeader';
export { default as ReportSection } from './components/ReportSection';
export { default as ChartDisplay } from './components/ChartDisplay';
export { default as DataTable } from './components/DataTable';
export { default as NarrativeText } from './components/NarrativeText';
export { default as LoadingReport } from './components/LoadingReport';

// Export services
export { default as reportService } from './services/reportService';

// Export hooks
export { default as useReport } from './hooks/useReport';

// Define routes
export const routes = [
  {
    path: '/reports/:reportId',
    element: 'ReportViewer',
    protected: true
  }
];
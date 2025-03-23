// src/modules/visualizations/index.js
/**
 * Visualization Module
 *
 * This module provides visualization components for displaying data in various chart formats.
 * It's designed to work with the Reports module to render different types of data visualizations.
 */

// Export components
export { default as LineChart } from './components/LineChart';
export { default as BarChart } from './components/BarChart';
export { default as PieChart } from './components/PieChart';
export { default as DataTable } from './components/DataTable';

// Export utilities
export { default as chartUtils } from './utils/chartUtils';
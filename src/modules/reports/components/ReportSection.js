// src/modules/reports/components/ReportSection.js
import React, { useState } from 'react';
import ChartDisplay from './ChartDisplay';
import NarrativeText from './NarrativeText';
import DataTable from './DataTable';

/**
 * Displays a single section of a report
 *
 * @param {Object} props
 * @param {string} props.title - Section title
 * @param {string} props.content - Section narrative content (markdown formatted)
 * @param {Array} props.visualizations - Array of visualization specifications
 * @param {Array} props.insights - Array of insight objects
 * @param {boolean} props.collapsible - Whether the section can be collapsed
 * @param {boolean} props.defaultCollapsed - Whether the section starts collapsed
 */
const ReportSection = ({
  title,
  content,
  visualizations = [],
  insights = [], // Add insights prop
  collapsible = false,
  defaultCollapsed = false
}) => {
  const [isCollapsed, setIsCollapsed] = useState(defaultCollapsed);

  // Toggle collapse state if section is collapsible
  const toggleCollapse = () => {
    if (collapsible) {
      setIsCollapsed(!isCollapsed);
    }
  };

  // Diagnostic logging for section content
  console.log("ReportSection rendering with:", {
    title,
    contentLength: content?.length,
    visualizationsCount: visualizations?.length,
    insightsCount: insights?.length
  });

  // Group visualizations by type for better layout
  const chartVisualizations = visualizations ? visualizations.filter(viz =>
    viz && ['bar', 'line', 'pie', 'scatter', 'combo', 'heatmap'].includes(viz.type)
  ) : [];

  const kpiVisualizations = visualizations ? visualizations.filter(viz =>
    viz && viz.type === 'kpi'
  ) : [];

  const tableVisualizations = visualizations ? visualizations.filter(viz =>
    viz && viz.type === 'table'
  ) : [];

  return (
    <div className="report-section mb-6">
      {/* Section Header (collapsible if specified) */}
      {title && (
        <div
          className={`flex items-center mb-4 ${collapsible ? 'cursor-pointer' : ''}`}
          onClick={toggleCollapse}
        >
          <h3 className="text-lg font-semibold text-white">{title}</h3>

          {collapsible && (
            <button className="ml-2 text-gray-400 hover:text-gray-300 focus:outline-none">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className={`h-5 w-5 transition-transform ${isCollapsed ? '' : 'transform rotate-180'}`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
          )}
        </div>
      )}

      {/* Section Content (hidden if collapsed) */}
      {!isCollapsed && (
        <div className="space-y-6">
          {/* KPI Visualizations (rendered at top, in a grid) */}
          {kpiVisualizations.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mb-6">
              {kpiVisualizations.map((viz, index) => (
                <ChartDisplay key={`kpi-${index}`} visualization={viz} />
              ))}
            </div>
          )}

          {/* Chart Visualizations */}
          {chartVisualizations.length > 0 && (
            <div className="space-y-6 mb-6">
              {chartVisualizations.map((viz, index) => (
                <ChartDisplay key={`chart-${index}`} visualization={viz} />
              ))}
            </div>
          )}

          {/* Insights Section */}
          {insights && insights.length > 0 && (
            <div className="space-y-4 mb-6">
              <h4 className="text-sm font-medium text-blue-400">Key Insights</h4>
              <div className="grid grid-cols-1 gap-4">
                {insights.map((insight, index) => (
                  <div key={`insight-${index}`} className="bg-gray-800/50 border border-gray-700/30 rounded-lg p-4">
                    <h5 className="text-sm font-medium text-white mb-2">{insight.title}</h5>
                    <p className="text-sm text-gray-300">{insight.description}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Narrative Text */}
          {content && (
            <NarrativeText content={content} />
          )}

          {/* Table Visualizations */}
          {tableVisualizations.length > 0 && (
            <div className="space-y-6 mt-6">
              {tableVisualizations.map((viz, index) => (
                <DataTable key={`table-${index}`} visualization={viz} />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ReportSection;
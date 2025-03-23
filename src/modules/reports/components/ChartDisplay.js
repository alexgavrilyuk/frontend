// src/modules/reports/components/ChartDisplay.js
import React from 'react';
import { Card } from '../../shared/components';
// Import the visualization components
import { BarChart, LineChart, PieChart, DataTable } from '../../visualizations';

/**
 * Renders various chart types based on visualization specification
 *
 * @param {Object} props
 * @param {Object} props.visualization - Visualization specification
 * @param {string} props.visualization.type - Chart type (bar, line, pie, etc.)
 * @param {string} props.visualization.title - Chart title
 * @param {Array} props.visualization.data - Data for the chart
 * @param {Object} props.visualization.config - Configuration options
 */
const ChartDisplay = ({ visualization }) => {
  // For debugging
  console.log('ChartDisplay rendering visualization:', {
    type: visualization?.type,
    title: visualization?.title,
    dataLength: visualization?.data?.length || 0
  });

  const { type, title, data, config } = visualization || {};

  // Return early if no data is provided
  if (!data || data.length === 0) {
    return (
      <Card variant="glass" className="p-4">
        <div className="text-center text-gray-400 py-6">
          <p>No data available for visualization</p>
        </div>
      </Card>
    );
  }

  // Basic rendering for KPI cards
  if (type === 'kpi') {
    return (
      <Card variant="glass" className="p-4">
        <h4 className="text-sm text-gray-400 mb-2">{title}</h4>
        <div className="flex flex-col items-center justify-center py-2">
          {Array.isArray(data) ? (
            <div className="grid grid-cols-1 gap-2 w-full">
              {data.map((item, idx) => (
                <div key={idx} className="text-center">
                  <div className="text-2xl font-bold text-blue-400">
                    {typeof item.value === 'number'
                      ? item.value.toLocaleString(undefined, {
                          maximumFractionDigits: 2
                        })
                      : item.value}
                  </div>
                  <div className="text-sm text-gray-400">{item.label}</div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-400">
                {typeof data.value === 'number'
                  ? data.value.toLocaleString(undefined, {
                      maximumFractionDigits: 2
                    })
                  : data.value}
              </div>
              <div className="text-sm text-gray-400">{data.label}</div>
            </div>
          )}
        </div>
      </Card>
    );
  }

  // Render the appropriate chart component based on type
  return (
    <Card variant="glass" className="p-4">
      <h4 className="text-sm font-medium text-gray-300 mb-4">{title}</h4>

      <div className="min-h-[200px]">
        {type === 'bar' && <BarChart data={data} config={config} title={title} />}
        {type === 'line' && <LineChart data={data} config={config} title={title} />}
        {type === 'pie' && <PieChart data={data} config={config} title={title} />}
        {type === 'table' && <DataTable data={data} config={config} title={title} />}

        {/* Fallback for other visualization types not yet implemented */}
        {!['bar', 'line', 'pie', 'table', 'kpi'].includes(type) && (
          <div className="relative bg-gray-900/50 rounded-md p-4 border border-gray-700/50 min-h-[200px] flex items-center justify-center">
            <div className="text-center">
              <p className="text-gray-400 mb-2">{`${type.charAt(0).toUpperCase() + type.slice(1)} Chart`}</p>
              <p className="text-xs text-gray-500">
                {type === 'scatter' && 'Scatter plot showing data correlation'}
                {type === 'combo' && 'Combined chart with multiple data series'}
                {!['scatter', 'combo'].includes(type) && 'Data visualization'}
              </p>

              {/* Chart data preview */}
              <div className="mt-4 text-xs text-left bg-gray-800/70 p-2 rounded overflow-hidden max-w-xs mx-auto">
                <div className="text-gray-400 mb-1">Data preview:</div>
                <code className="text-green-400 break-all">
                  {JSON.stringify(data.slice(0, 2)).substring(0, 100)}
                  {JSON.stringify(data.slice(0, 2)).length > 100 ? '...' : ''}
                </code>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="mt-2 text-xs text-gray-500 italic">
        Full interactive charts will be implemented in Phase 3
      </div>
    </Card>
  );
};

export default ChartDisplay;
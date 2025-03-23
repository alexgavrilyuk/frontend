// src/modules/visualizations/components/LineChart.js
import React, { useEffect, useRef } from 'react';
import chartUtils from '../utils/chartUtils';

/**
 * LineChart component for rendering line charts
 *
 * @param {Object} props
 * @param {Array} props.data - The data to be displayed in the chart
 * @param {Object} props.config - Configuration options for the chart
 * @param {string} props.config.xAxis - The data key for x-axis values
 * @param {string|Array} props.config.yAxis - The data key(s) for y-axis values
 * @param {Array} props.config.series - Multiple series configuration
 * @param {string} props.config.sortBy - Key to sort data by (usually date for line charts)
 * @param {string} props.config.sortDirection - Sort direction ('asc' or 'desc')
 * @param {Object} props.config.colors - Custom colors for the chart
 * @param {boolean} props.config.showLegend - Whether to show the legend
 * @param {boolean} props.config.showGrid - Whether to show grid lines
 * @param {boolean} props.config.showTooltip - Whether to show tooltips
 * @param {string} props.title - Chart title
 * @param {string} props.className - Additional CSS classes
 * @param {number} props.height - Chart height (default: 300px)
 */
const LineChart = ({
  data = [],
  config = {},
  title,
  className = '',
  height = 300
}) => {
  const chartRef = useRef(null);
  const chartInstance = useRef(null);

  // Extract configuration options with defaults
  const {
    xAxis = 'x',
    yAxis = 'y',
    series = [],
    sortBy,
    sortDirection = 'asc',
    colors = chartUtils.defaultColors,
    showLegend = true,
    showGrid = true,
    showTooltip = true
  } = config;

  useEffect(() => {
    if (!chartRef.current || !data || data.length === 0) return;

    // Process the data
    let processedData = [...data];

    // Sort data if specified
    if (sortBy) {
      processedData = chartUtils.sortData(processedData, sortBy, sortDirection);
    }

    // Clean up any existing chart
    if (chartInstance.current) {
      chartInstance.current.destroy();
    }

    // Create a canvas context for drawing
    const ctx = chartRef.current.getContext('2d');

    // Get labels (x-axis values)
    const labels = processedData.map(item => item[xAxis]);

    // Prepare datasets based on configuration
    let datasets = [];

    // Handle single y-axis
    if (typeof yAxis === 'string') {
      datasets.push({
        label: chartUtils.formatLabel(yAxis),
        data: processedData.map(item => item[yAxis]),
        borderColor: colors[0],
        backgroundColor: chartUtils.adjustOpacity(colors[0], 0.1),
        tension: 0.4,
        fill: true
      });
    }
    // Handle multiple series
    else if (series && series.length > 0) {
      datasets = series.map((seriesItem, index) => ({
        label: seriesItem.name || chartUtils.formatLabel(seriesItem.key),
        data: processedData.map(item => item[seriesItem.key]),
        borderColor: colors[index % colors.length],
        backgroundColor: chartUtils.adjustOpacity(colors[index % colors.length], 0.1),
        tension: 0.4,
        fill: false
      }));
    }
    // Handle array of y-axes
    else if (Array.isArray(yAxis)) {
      datasets = yAxis.map((axis, index) => ({
        label: chartUtils.formatLabel(axis),
        data: processedData.map(item => item[axis]),
        borderColor: colors[index % colors.length],
        backgroundColor: chartUtils.adjustOpacity(colors[index % colors.length], 0.1),
        tension: 0.4,
        fill: false
      }));
    }

    // Create the chart - placeholder for actual chart.js implementation
    // In a real implementation, we would use chart.js here
    // For now, we'll just mock the behavior
    chartInstance.current = {
      data: { labels, datasets },
      config: {
        type: 'line',
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              display: showLegend,
              position: 'top',
            },
            tooltip: {
              enabled: showTooltip
            }
          },
          scales: {
            x: {
              grid: {
                display: showGrid
              }
            },
            y: {
              grid: {
                display: showGrid
              }
            }
          }
        }
      },
      destroy: () => {
        // Clean up function
        console.log('Chart instance destroyed');
      }
    };

    // Draw a placeholder visualization
    drawPlaceholderChart(ctx, chartInstance.current.data, height);

    // Return a cleanup function
    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }
    };
  }, [data, config, height, xAxis, yAxis, series, sortBy, sortDirection, colors, showLegend, showGrid, showTooltip]);

  /**
   * Draw a placeholder chart visualization to show the concept
   * This will be replaced with actual Chart.js rendering in Phase 3
   */
  const drawPlaceholderChart = (ctx, chartData, height) => {
    const { labels, datasets } = chartData;
    if (!labels || !labels.length || !datasets || !datasets.length) return;

    // Clear the canvas
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

    const width = ctx.canvas.width;
    const margin = { top: 30, right: 20, bottom: 40, left: 50 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    // Draw title if provided
    if (title) {
      ctx.font = 'bold 14px Arial';
      ctx.fillStyle = '#e5e7eb'; // text-gray-200
      ctx.textAlign = 'center';
      ctx.fillText(title, width / 2, 20);
    }

    // Draw background
    ctx.fillStyle = 'rgba(31, 41, 55, 0.5)'; // bg-gray-800/50
    ctx.fillRect(margin.left, margin.top, innerWidth, innerHeight);
    ctx.strokeStyle = 'rgba(75, 85, 99, 0.5)'; // border-gray-600/50
    ctx.strokeRect(margin.left, margin.top, innerWidth, innerHeight);

    // Draw axes
    ctx.beginPath();
    ctx.moveTo(margin.left, margin.top);
    ctx.lineTo(margin.left, margin.top + innerHeight);
    ctx.lineTo(margin.left + innerWidth, margin.top + innerHeight);
    ctx.strokeStyle = 'rgba(156, 163, 175, 0.5)'; // text-gray-400/50
    ctx.stroke();

    // Draw data series (just a placeholder representation)
    const dataset = datasets[0];
    const data = dataset.data;
    const maxValue = Math.max(...data);
    const minValue = Math.min(...data);
    const dataRange = maxValue - minValue;

    ctx.beginPath();
    for (let i = 0; i < data.length; i++) {
      const x = margin.left + (i / (data.length - 1)) * innerWidth;
      const normalizedValue = dataRange === 0
        ? 0.5
        : (data[i] - minValue) / dataRange;
      const y = margin.top + innerHeight - (normalizedValue * innerHeight);

      if (i === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    }
    ctx.strokeStyle = dataset.borderColor;
    ctx.lineWidth = 2;
    ctx.stroke();

    // Fill area under the line
    ctx.lineTo(margin.left + innerWidth, margin.top + innerHeight);
    ctx.lineTo(margin.left, margin.top + innerHeight);
    ctx.closePath();
    ctx.fillStyle = dataset.backgroundColor;
    ctx.fill();

    // Draw x-axis labels (just a few for illustration)
    ctx.fillStyle = 'rgba(209, 213, 219, 0.8)'; // text-gray-300/80
    ctx.font = '10px Arial';
    ctx.textAlign = 'center';

    // Draw 5 labels evenly spaced
    const labelsToShow = Math.min(5, labels.length);
    for (let i = 0; i < labelsToShow; i++) {
      const labelIndex = Math.floor((i / (labelsToShow - 1)) * (labels.length - 1));
      const x = margin.left + (labelIndex / (labels.length - 1)) * innerWidth;
      ctx.fillText(
        String(labels[labelIndex]).substring(0, 10),
        x,
        margin.top + innerHeight + 15
      );
    }

    // Draw placeholder y-axis labels
    ctx.textAlign = 'right';
    for (let i = 0; i <= 5; i++) {
      const y = margin.top + (1 - i / 5) * innerHeight;
      const value = minValue + (i / 5) * dataRange;
      ctx.fillText(
        String(Math.round(value * 100) / 100),
        margin.left - 10,
        y + 4
      );
    }

    // Draw legend if needed
    if (showLegend && datasets.length > 0) {
      const legendY = margin.top + innerHeight + 30;
      ctx.textAlign = 'left';

      datasets.forEach((dataset, index) => {
        const legendX = margin.left + (index * (innerWidth / datasets.length));

        // Draw color box
        ctx.fillStyle = dataset.borderColor;
        ctx.fillRect(legendX, legendY, 10, 10);

        // Draw label
        ctx.fillStyle = 'rgba(209, 213, 219, 0.8)'; // text-gray-300/80
        ctx.fillText(dataset.label, legendX + 15, legendY + 8);
      });
    }

    // Add placeholder note for development
    ctx.fillStyle = 'rgba(156, 163, 175, 0.7)'; // text-gray-400/70
    ctx.font = 'italic 10px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('Phase 1 Placeholder - Full Chart.js implementation in Phase 3', width / 2, height - 5);
  };

  return (
    <div className={`line-chart ${className}`}>
      <canvas
        ref={chartRef}
        height={height}
        style={{ width: '100%', height: `${height}px` }}
      />
    </div>
  );
};

export default LineChart;
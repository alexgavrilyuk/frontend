// src/modules/visualizations/components/BarChart.js
import React, { useEffect, useRef } from 'react';
import chartUtils from '../utils/chartUtils';

/**
 * BarChart component for rendering bar charts
 *
 * @param {Object} props
 * @param {Array} props.data - The data to be displayed in the chart
 * @param {Object} props.config - Configuration options for the chart
 * @param {string} props.config.xAxis - The data key for x-axis values
 * @param {string|Array} props.config.yAxis - The data key(s) for y-axis values
 * @param {string} props.config.sortBy - Key to sort data by
 * @param {string} props.config.sortDirection - Sort direction ('asc' or 'desc')
 * @param {boolean} props.config.stacked - Whether to stack the bars
 * @param {boolean} props.config.horizontal - Whether to render horizontal bars
 * @param {Object} props.config.colors - Custom colors for the chart
 * @param {boolean} props.config.showLegend - Whether to show the legend
 * @param {boolean} props.config.showGrid - Whether to show grid lines
 * @param {boolean} props.config.showTooltip - Whether to show tooltips
 * @param {string} props.title - Chart title
 * @param {string} props.className - Additional CSS classes
 * @param {number} props.height - Chart height (default: 300px)
 */
const BarChart = ({
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
    sortBy,
    sortDirection = 'desc',
    stacked = false,
    horizontal = false,
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

    // Limit the number of bars to prevent overcrowding
    const maxBars = 20;
    if (processedData.length > maxBars) {
      processedData = processedData.slice(0, maxBars);
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
        backgroundColor: colors[0],
        borderColor: chartUtils.adjustOpacity(colors[0], 0.8),
        borderWidth: 1
      });
    }
    // Handle array of y-axes for grouped or stacked bars
    else if (Array.isArray(yAxis)) {
      datasets = yAxis.map((axis, index) => ({
        label: chartUtils.formatLabel(axis),
        data: processedData.map(item => item[axis]),
        backgroundColor: colors[index % colors.length],
        borderColor: chartUtils.adjustOpacity(colors[index % colors.length], 0.8),
        borderWidth: 1
      }));
    }

    // Create the chart - placeholder for actual chart.js implementation
    // In a real implementation, we would use chart.js here
    // For now, we'll just mock the behavior
    chartInstance.current = {
      data: { labels, datasets },
      config: {
        type: horizontal ? 'horizontalBar' : 'bar',
        options: {
          responsive: true,
          maintainAspectRatio: false,
          indexAxis: horizontal ? 'y' : 'x',
          plugins: {
            legend: {
              display: showLegend && datasets.length > 1,
              position: 'top',
            },
            tooltip: {
              enabled: showTooltip
            }
          },
          scales: {
            x: {
              stacked: stacked,
              grid: {
                display: showGrid
              }
            },
            y: {
              stacked: stacked,
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
    drawPlaceholderChart(ctx, chartInstance.current.data, height, horizontal, stacked);

    // Return a cleanup function
    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }
    };
  }, [data, config, height, xAxis, yAxis, sortBy, sortDirection, stacked, horizontal, colors, showLegend, showGrid, showTooltip]);

  /**
   * Draw a placeholder chart visualization to show the concept
   * This will be replaced with actual Chart.js rendering in Phase 3
   */
  const drawPlaceholderChart = (ctx, chartData, height, horizontal, stacked) => {
    const { labels, datasets } = chartData;
    if (!labels || !labels.length || !datasets || !datasets.length) return;

    // Clear the canvas
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

    const width = ctx.canvas.width;
    const margin = { top: 30, right: 20, bottom: 50, left: 50 };
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

    // Determine max value for scaling
    let maxValue = 0;
    if (stacked) {
      // For stacked charts, we need the sum of values at each position
      for (let i = 0; i < labels.length; i++) {
        let sum = 0;
        for (const dataset of datasets) {
          sum += dataset.data[i] || 0;
        }
        maxValue = Math.max(maxValue, sum);
      }
    } else {
      // For regular charts, find the max value across all datasets
      for (const dataset of datasets) {
        maxValue = Math.max(maxValue, ...dataset.data);
      }
    }

    // Add a little padding to the max value
    maxValue *= 1.1;

    // Draw placeholder bars
    const barWidth = innerWidth / labels.length / (stacked ? 1 : datasets.length);
    const barSpacing = barWidth * 0.2;
    const effectiveBarWidth = barWidth - barSpacing;

    // For each dataset
    datasets.forEach((dataset, datasetIndex) => {
      // For each data point
      dataset.data.forEach((value, index) => {
        const normalizedValue = value / maxValue;

        if (horizontal) {
          // Horizontal bars
          const y = margin.top + (index * innerHeight / labels.length) +
            (stacked ? 0 : datasetIndex * (innerHeight / labels.length / datasets.length));
          const barHeight = innerHeight / labels.length / (stacked ? 1 : datasets.length) - barSpacing;

          let x = margin.left;
          if (stacked && datasetIndex > 0) {
            // Calculate the starting position based on previous datasets
            let stackOffset = 0;
            for (let i = 0; i < datasetIndex; i++) {
              stackOffset += (datasets[i].data[index] || 0) / maxValue;
            }
            x += stackOffset * innerWidth;
          }

          // Draw the bar
          ctx.fillStyle = dataset.backgroundColor;
          ctx.fillRect(
            x,
            y,
            normalizedValue * innerWidth,
            barHeight
          );
        } else {
          // Vertical bars
          const x = margin.left + (index * innerWidth / labels.length) +
            (stacked ? 0 : datasetIndex * (innerWidth / labels.length / datasets.length));
          const barWidth = innerWidth / labels.length / (stacked ? 1 : datasets.length) - barSpacing;

          let y = margin.top + innerHeight;
          if (stacked && datasetIndex > 0) {
            // Calculate the starting position based on previous datasets
            let stackOffset = 0;
            for (let i = 0; i < datasetIndex; i++) {
              stackOffset += (datasets[i].data[index] || 0) / maxValue;
            }
            y -= stackOffset * innerHeight;
          }

          // Draw the bar
          ctx.fillStyle = dataset.backgroundColor;
          ctx.fillRect(
            x,
            y,
            barWidth,
            -normalizedValue * innerHeight
          );
        }
      });
    });

    // Draw x-axis labels
    ctx.fillStyle = 'rgba(209, 213, 219, 0.8)'; // text-gray-300/80
    ctx.font = '10px Arial';
    ctx.textAlign = 'center';

    if (horizontal) {
      // Y-axis labels for horizontal bars
      labels.forEach((label, index) => {
        const y = margin.top + (index + 0.5) * (innerHeight / labels.length);
        ctx.fillText(
          String(label).substring(0, 10) + (String(label).length > 10 ? '...' : ''),
          margin.left - 10,
          y,
          40
        );
      });

      // X-axis values
      for (let i = 0; i <= 5; i++) {
        const x = margin.left + (i / 5) * innerWidth;
        const value = (i / 5) * maxValue;
        ctx.fillText(
          String(Math.round(value * 100) / 100),
          x,
          margin.top + innerHeight + 15
        );
      }
    } else {
      // X-axis labels for vertical bars
      labels.forEach((label, index) => {
        const x = margin.left + (index + 0.5) * (innerWidth / labels.length);
        ctx.fillText(
          String(label).substring(0, 8) + (String(label).length > 8 ? '...' : ''),
          x,
          margin.top + innerHeight + 15
        );
      });

      // Y-axis values
      for (let i = 0; i <= 5; i++) {
        const y = margin.top + innerHeight - (i / 5) * innerHeight;
        const value = (i / 5) * maxValue;
        ctx.textAlign = 'right';
        ctx.fillText(
          String(Math.round(value * 100) / 100),
          margin.left - 5,
          y + 4
        );
      }
    }

    // Draw legend if needed
    if (showLegend && datasets.length > 1) {
      const legendY = margin.top + innerHeight + 30;
      ctx.textAlign = 'left';

      datasets.forEach((dataset, index) => {
        const legendX = margin.left + (index * (innerWidth / datasets.length));

        // Draw color box
        ctx.fillStyle = dataset.backgroundColor;
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
    <div className={`bar-chart ${className}`}>
      <canvas
        ref={chartRef}
        height={height}
        style={{ width: '100%', height: `${height}px` }}
      />
    </div>
  );
};

export default BarChart;
// src/modules/visualizations/components/PieChart.js
import React, { useEffect, useRef } from 'react';
import chartUtils from '../utils/chartUtils';

/**
 * PieChart component for rendering pie and donut charts
 *
 * @param {Object} props
 * @param {Array} props.data - The data to be displayed in the chart
 * @param {Object} props.config - Configuration options for the chart
 * @param {string} props.config.valueField - The data key for the values
 * @param {string} props.config.labelField - The data key for the labels
 * @param {boolean} props.config.isDonut - Whether to render as a donut chart
 * @param {number} props.config.donutRatio - Inner radius ratio for donut charts (0-1)
 * @param {Object} props.config.colors - Custom colors for the chart
 * @param {boolean} props.config.showLegend - Whether to show the legend
 * @param {boolean} props.config.showTooltip - Whether to show tooltips
 * @param {boolean} props.config.showLabels - Whether to show labels on the chart
 * @param {boolean} props.config.showPercentages - Whether to show percentages in labels
 * @param {string} props.title - Chart title
 * @param {string} props.className - Additional CSS classes
 * @param {number} props.height - Chart height (default: 300px)
 */
const PieChart = ({
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
    valueField = 'value',
    labelField = 'label',
    isDonut = false,
    donutRatio = 0.6,
    colors = chartUtils.defaultColors,
    showLegend = true,
    showTooltip = true,
    showLabels = false,
    showPercentages = true
  } = config;

  useEffect(() => {
    if (!chartRef.current || !data || data.length === 0) return;

    // Process the data
    let processedData = [...data];

    // Limit the number of segments to prevent overcrowding
    const maxSegments = 10;
    if (processedData.length > maxSegments) {
      // Sort by value descending
      processedData.sort((a, b) => b[valueField] - a[valueField]);

      // Take top segments and group the rest as "Other"
      const topSegments = processedData.slice(0, maxSegments - 1);
      const otherSegments = processedData.slice(maxSegments - 1);

      if (otherSegments.length > 0) {
        const otherValue = otherSegments.reduce((sum, item) => sum + item[valueField], 0);
        topSegments.push({
          [labelField]: 'Other',
          [valueField]: otherValue
        });
        processedData = topSegments;
      }
    }

    // Clean up any existing chart
    if (chartInstance.current) {
      chartInstance.current.destroy();
    }

    // Create a canvas context for drawing
    const ctx = chartRef.current.getContext('2d');

    // Extract values and labels
    const values = processedData.map(item => item[valueField]);
    const labels = processedData.map(item => item[labelField]);

    // Calculate total for percentages
    const total = values.reduce((sum, value) => sum + value, 0);

    // Create dataset
    const dataset = {
      data: values,
      backgroundColor: values.map((_, index) => colors[index % colors.length]),
      borderColor: values.map((_, index) => chartUtils.adjustOpacity(colors[index % colors.length], 0.8)),
      borderWidth: 1
    };

    // Create the chart - placeholder for actual chart.js implementation
    // In a real implementation, we would use chart.js here
    // For now, we'll just mock the behavior
    chartInstance.current = {
      data: { labels, datasets: [dataset] },
      config: {
        type: isDonut ? 'doughnut' : 'pie',
        options: {
          responsive: true,
          maintainAspectRatio: false,
          cutout: isDonut ? `${donutRatio * 100}%` : 0,
          plugins: {
            legend: {
              display: showLegend,
              position: 'right',
            },
            tooltip: {
              enabled: showTooltip
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
    drawPlaceholderChart(ctx, chartInstance.current.data, height, isDonut, donutRatio, showLabels, showPercentages);

    // Return a cleanup function
    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }
    };
  }, [data, config, height, valueField, labelField, isDonut, donutRatio, colors, showLegend, showTooltip, showLabels, showPercentages]);

  /**
   * Draw a placeholder chart visualization to show the concept
   * This will be replaced with actual Chart.js rendering in Phase 3
   */
  const drawPlaceholderChart = (ctx, chartData, height, isDonut, donutRatio, showLabels, showPercentages) => {
    const { labels, datasets } = chartData;
    if (!labels || !labels.length || !datasets || !datasets.length) return;

    const values = datasets[0].data;
    const colors = datasets[0].backgroundColor;
    const total = values.reduce((sum, value) => sum + value, 0);

    // Clear the canvas
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

    const width = ctx.canvas.width;
    const centerX = width / 2;
    const centerY = height / 2;
    const radius = Math.min(centerX - 50, centerY - 50);

    // Draw title if provided
    if (title) {
      ctx.font = 'bold 14px Arial';
      ctx.fillStyle = '#e5e7eb'; // text-gray-200
      ctx.textAlign = 'center';
      ctx.fillText(title, centerX, 20);
    }

    // Draw pie/donut chart
    let startAngle = 0;

    values.forEach((value, index) => {
      const sliceAngle = (value / total) * 2 * Math.PI;

      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.arc(centerX, centerY, radius, startAngle, startAngle + sliceAngle);
      ctx.closePath();

      ctx.fillStyle = colors[index];
      ctx.fill();

      ctx.strokeStyle = '#1f2937'; // Dark border
      ctx.lineWidth = 1;
      ctx.stroke();

      // Draw labels if enabled
      if (showLabels) {
        const midAngle = startAngle + sliceAngle / 2;
        const labelRadius = radius * 0.7; // Position label inside the slice

        const labelX = centerX + Math.cos(midAngle) * labelRadius;
        const labelY = centerY + Math.sin(midAngle) * labelRadius;

        ctx.font = 'bold 12px Arial';
        ctx.fillStyle = '#ffffff';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        let labelText = labels[index];
        if (showPercentages) {
          const percentage = ((value / total) * 100).toFixed(1);
          labelText = `${percentage}%`;
        }

        ctx.fillText(labelText, labelX, labelY);
      }

      startAngle += sliceAngle;
    });

    // Draw donut hole if needed
    if (isDonut) {
      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.arc(centerX, centerY, radius * donutRatio, 0, 2 * Math.PI);
      ctx.fillStyle = '#1f2937'; // bg-gray-800
      ctx.fill();
    }

    // Draw legend
    if (labels.length > 0) {
      const legendX = width - 120;
      let legendY = 40;

      ctx.textAlign = 'left';
      ctx.font = '12px Arial';

      labels.forEach((label, index) => {
        // Don't draw too many legend items
        if (index < 8) {
          // Draw color box
          ctx.fillStyle = colors[index];
          ctx.fillRect(legendX, legendY, 12, 12);
          ctx.strokeStyle = '#1f2937';
          ctx.lineWidth = 0.5;
          ctx.strokeRect(legendX, legendY, 12, 12);

          // Draw label
          ctx.fillStyle = '#e5e7eb'; // text-gray-200

          // Format label with percentage
          const percentage = ((values[index] / total) * 100).toFixed(1);
          const displayLabel = label.length > 15 ? label.substring(0, 12) + '...' : label;
          const legendText = showPercentages
            ? `${displayLabel} (${percentage}%)`
            : displayLabel;

          ctx.fillText(legendText, legendX + 20, legendY + 9);

          legendY += 20;
        } else if (index === 8) {
          // Indicate there are more items
          ctx.fillStyle = '#e5e7eb'; // text-gray-200
          ctx.fillText('...', legendX + 20, legendY + 9);
        }
      });
    }

    // Add placeholder note for development
    ctx.fillStyle = 'rgba(156, 163, 175, 0.7)'; // text-gray-400/70
    ctx.font = 'italic 10px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('Phase 1 Placeholder - Full Chart.js implementation in Phase 3', width / 2, height - 10);
  };

  return (
    <div className={`pie-chart ${className}`}>
      <canvas
        ref={chartRef}
        height={height}
        style={{ width: '100%', height: `${height}px` }}
      />
    </div>
  );
};

export default PieChart;
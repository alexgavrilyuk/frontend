// src/modules/visualizations/utils/chartUtils.js

/**
 * Utility functions for chart components
 */
const chartUtils = {
  /**
   * Default color palette for charts
   * Colors are designed to look good on dark backgrounds and be colorblind-friendly
   */
  defaultColors: [
    '#3B82F6', // blue-500
    '#8B5CF6', // purple-500
    '#EC4899', // pink-500
    '#10B981', // emerald-500
    '#F59E0B', // amber-500
    '#EF4444', // red-500
    '#06B6D4', // cyan-500
    '#6366F1', // indigo-500
    '#F97316', // orange-500
    '#14B8A6', // teal-500
    '#A855F7', // purple-500 (lighter)
    '#84CC16', // lime-500
  ],

  /**
   * Adjust the opacity of a color
   * @param {string} color - HEX color code
   * @param {number} opacity - Opacity value (0-1)
   * @returns {string} - RGBA color string
   */
  adjustOpacity(color, opacity) {
    // Convert hex to rgb
    let r, g, b;

    if (color.startsWith('#')) {
      // Handle hex color
      const hex = color.slice(1);

      // Convert 3-digit hex to 6-digit
      const expandedHex = hex.length === 3
        ? hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2]
        : hex;

      r = parseInt(expandedHex.substring(0, 2), 16);
      g = parseInt(expandedHex.substring(2, 4), 16);
      b = parseInt(expandedHex.substring(4, 6), 16);
    } else if (color.startsWith('rgb')) {
      // Handle rgb/rgba color
      const rgbValues = color.match(/\d+/g);
      r = parseInt(rgbValues[0], 10);
      g = parseInt(rgbValues[1], 10);
      b = parseInt(rgbValues[2], 10);
    } else {
      // Default fallback
      return color;
    }

    return `rgba(${r}, ${g}, ${b}, ${opacity})`;
  },

  /**
   * Format a column key into a readable label
   * @param {string} key - Column key
   * @returns {string} - Formatted label
   */
  formatLabel(key) {
    if (!key) return '';

    // Remove underscores and capitalize first letter of each word
    return key
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  },

  /**
   * Sort data by a specific key
   * @param {Array} data - Data array
   * @param {string} key - Sort key
   * @param {string} direction - Sort direction ('asc' or 'desc')
   * @returns {Array} - Sorted data
   */
  sortData(data, key, direction = 'asc') {
    if (!data || !key) return data;

    const sortDirectionMultiplier = direction === 'asc' ? 1 : -1;

    return [...data].sort((a, b) => {
      const aValue = a[key];
      const bValue = b[key];

      // Handle null/undefined values
      if (aValue === null || aValue === undefined) return sortDirectionMultiplier * -1;
      if (bValue === null || bValue === undefined) return sortDirectionMultiplier * 1;

      // Handle numbers
      if (typeof aValue === 'number' && typeof bValue === 'number') {
        return sortDirectionMultiplier * (aValue - bValue);
      }

      // Handle dates
      if (aValue instanceof Date && bValue instanceof Date) {
        return sortDirectionMultiplier * (aValue.getTime() - bValue.getTime());
      }

      // Try to parse dates from strings
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        const aDate = new Date(aValue);
        const bDate = new Date(bValue);
        if (!isNaN(aDate) && !isNaN(bDate)) {
          return sortDirectionMultiplier * (aDate.getTime() - bDate.getTime());
        }
      }

      // Default string comparison
      const aString = String(aValue).toLowerCase();
      const bString = String(bValue).toLowerCase();

      if (aString < bString) return sortDirectionMultiplier * -1;
      if (aString > bString) return sortDirectionMultiplier * 1;
      return 0;
    });
  },

  /**
   * Format a value based on its type and context
   * @param {any} value - The value to format
   * @param {string} key - The column key (for context)
   * @returns {string} - Formatted value
   */
  formatValue(value, key = '') {
    if (value === null || value === undefined) {
      return '-';
    }

    // Format boolean values
    if (typeof value === 'boolean') {
      return value ? 'Yes' : 'No';
    }

    // Format date objects
    if (value instanceof Date) {
      return value.toLocaleDateString();
    }

    // Check for percentage in key name
    const isPercentage = key.toLowerCase().includes('percent') ||
                         key.toLowerCase().includes('ratio') ||
                         key.toLowerCase().includes('rate');

    // Format numbers
    if (typeof value === 'number') {
      if (isPercentage) {
        // Display as percentage
        return `${(value * 100).toFixed(1)}%`;
      } else if (Number.isInteger(value)) {
        // Format whole numbers with commas
        return value.toLocaleString();
      } else {
        // Format decimals
        return value.toLocaleString(undefined, {
          minimumFractionDigits: 1,
          maximumFractionDigits: 2
        });
      }
    }

    // Check if string is a date
    if (typeof value === 'string') {
      // Attempt to parse ISO date strings
      const datePattern = /^\d{4}-\d{2}-\d{2}(T|\s)/;
      if (datePattern.test(value)) {
        try {
          const date = new Date(value);
          if (!isNaN(date.getTime())) {
            return date.toLocaleDateString();
          }
        } catch (e) {
          // Not a valid date, return as is
        }
      }
    }

    // Default: return as string
    return String(value);
  },

  /**
   * Generate a placeholder dataset for testing
   * @param {number} points - Number of data points
   * @param {string} type - Type of data ('line', 'bar', 'pie')
   * @returns {Array} - Sample dataset
   */
  generatePlaceholderData(points = 10, type = 'line') {
    if (type === 'pie') {
      return Array.from({ length: points }, (_, i) => ({
        label: `Category ${i + 1}`,
        value: Math.floor(Math.random() * 100) + 20
      }));
    }

    if (type === 'bar') {
      return Array.from({ length: points }, (_, i) => ({
        category: `Category ${i + 1}`,
        value: Math.floor(Math.random() * 100) + 20,
        secondaryValue: Math.floor(Math.random() * 80) + 10
      }));
    }

    // Default: line chart data (time series)
    const today = new Date();
    return Array.from({ length: points }, (_, i) => {
      const date = new Date(today);
      date.setDate(date.getDate() - (points - i - 1));

      return {
        date: date.toISOString().split('T')[0],
        value: Math.floor(Math.random() * 100) + 20,
        trend: Math.floor(Math.random() * 80) + 10
      };
    });
  },

  /**
   * Calculate appropriate tick values for a numerical axis
   * @param {number} min - Minimum value
   * @param {number} max - Maximum value
   * @param {number} tickCount - Desired number of ticks
   * @returns {Array} - Array of tick values
   */
  calculateTicks(min, max, tickCount = 5) {
    if (min === max) {
      return [min];
    }

    // Add some padding
    const range = max - min;
    const paddedMin = min - (range * 0.1);
    const paddedMax = max + (range * 0.1);

    const adjustedRange = paddedMax - paddedMin;
    const tickInterval = adjustedRange / (tickCount - 1);

    // Round to a nice number
    const magnitude = Math.pow(10, Math.floor(Math.log10(tickInterval)));
    const normalizedInterval = tickInterval / magnitude;

    // Choose a nice interval: 1, 2, 5, 10, 20, 50, 100, etc.
    let niceInterval;
    if (normalizedInterval < 1.5) {
      niceInterval = 1;
    } else if (normalizedInterval < 3) {
      niceInterval = 2;
    } else if (normalizedInterval < 7) {
      niceInterval = 5;
    } else {
      niceInterval = 10;
    }

    niceInterval *= magnitude;

    // Generate ticks
    const niceMin = Math.floor(paddedMin / niceInterval) * niceInterval;
    const niceMax = Math.ceil(paddedMax / niceInterval) * niceInterval;

    const ticks = [];
    for (let tick = niceMin; tick <= niceMax; tick += niceInterval) {
      ticks.push(tick);
    }

    return ticks;
  }
};

export default chartUtils;
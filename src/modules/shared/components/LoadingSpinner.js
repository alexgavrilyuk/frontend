// src/modules/shared/components/LoadingSpinner.js
import React from 'react';

/**
 * A flexible loading spinner component with customizable appearance
 *
 * @param {Object} props
 * @param {string} [props.size='md'] - Size of the spinner: 'sm', 'md', 'lg'
 * @param {string} [props.color='blue'] - Color theme: 'blue', 'purple', 'green', 'cyan'
 * @param {string} [props.label] - Optional text to display
 * @param {string} [props.className] - Additional class names
 * @param {boolean} [props.centered=false] - Whether to center the spinner in its container
 */
const LoadingSpinner = ({
  size = 'md',
  color = 'blue',
  label,
  className = '',
  centered = false
}) => {
  // Size mappings
  const sizeClasses = {
    sm: { container: 'w-10 h-10', border: 'border-2' },
    md: { container: 'w-16 h-16', border: 'border-4' },
    lg: { container: 'w-20 h-20', border: 'border-4' }
  };

  // Color mappings - maintaining your existing color scheme
  const colorClasses = {
    blue: { bg: 'bg-blue-500/20', border: 'border-blue-500', text: 'text-blue-400' },
    purple: { bg: 'bg-purple-500/20', border: 'border-purple-500', text: 'text-purple-400' },
    green: { bg: 'bg-green-500/20', border: 'border-green-500', text: 'text-green-400' },
    cyan: { bg: 'bg-cyan-500/20', border: 'border-cyan-500', text: 'text-cyan-400' },
    red: { bg: 'bg-red-500/20', border: 'border-red-500', text: 'text-red-400' },
  };

  // Get the appropriate classes based on props
  const { container: sizeContainer, border: sizeBorder } = sizeClasses[size] || sizeClasses.md;
  const { bg: colorBg, border: colorBorder, text: colorText } = colorClasses[color] || colorClasses.blue;

  // Determine if we need to center the spinner
  const centerClasses = centered ? 'flex justify-center items-center py-12' : '';

  return (
    <div className={`${centerClasses} ${className}`}>
      <div className={`relative ${sizeContainer}`}>
        {/* Background circle */}
        <div className={`absolute top-0 left-0 w-full h-full ${sizeBorder} ${colorBg} rounded-full`}></div>

        {/* Spinning border */}
        <div className={`absolute top-0 left-0 w-full h-full ${sizeBorder} border-transparent ${colorBorder} rounded-full animate-spin`}></div>

        {/* Optional label */}
        {label && (
          <div className={`absolute top-0 left-0 w-full h-full flex items-center justify-center ${colorText} text-sm`}>
            {label}
          </div>
        )}
      </div>
    </div>
  );
};

export default LoadingSpinner;
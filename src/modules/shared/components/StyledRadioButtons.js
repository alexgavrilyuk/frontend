// src/modules/shared/components/StyledRadioButtons.js
import React from 'react';

/**
 * StyledRadioButtons component that renders radio options as nice styled buttons
 *
 * @param {Object} props
 * @param {string} [props.name] - Name for the radio input group
 * @param {Array} props.options - Array of option objects with value, label, icon, and disabled properties
 * @param {string} props.value - Currently selected value
 * @param {Function} props.onChange - Change handler function
 * @param {string} [props.layout='vertical'] - Layout direction: 'vertical', 'horizontal', or 'grid'
 * @param {number} [props.columns=2] - Number of columns when layout is 'grid'
 * @param {string} [props.className] - Additional class names
 */
const StyledRadioButtons = ({
  name,
  options = [],
  value,
  onChange,
  layout = 'vertical',
  columns = 2,
  className = '',
}) => {
  // Layout classes
  const layoutClasses = {
    vertical: 'flex flex-col space-y-2',
    horizontal: 'flex flex-row space-x-4',
    grid: `grid grid-cols-${columns} gap-4`
  };

  // Handle radio change
  const handleRadioChange = (e) => {
    if (typeof onChange === 'function') {
      onChange(e);
    }
  };

  return (
    <div className={`${layoutClasses[layout] || layoutClasses.vertical} ${className}`}>
      {options.map((option) => (
        <label
          key={option.value}
          className={`flex items-center ${option.icon ? 'justify-center' : ''} p-4 border rounded-lg cursor-pointer transition-all duration-200 ${
            value === option.value
              ? 'bg-purple-900/30 border-purple-500/50 text-white'
              : 'bg-gray-700/30 border-gray-600 text-gray-300 hover:bg-gray-700/50'
          } ${option.disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          <input
            type="radio"
            name={name}
            value={option.value}
            checked={value === option.value}
            onChange={handleRadioChange}
            disabled={option.disabled}
            className="sr-only" // Hide the actual radio button
          />
          {option.icon && <span className="mr-2">{option.icon}</span>}
          <span>{option.label}</span>
        </label>
      ))}
    </div>
  );
};

export default StyledRadioButtons;
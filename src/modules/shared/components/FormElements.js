// src/modules/shared/components/FormElements.js
import React from 'react';

/**
 * Input component with consistent styling
 */
export const Input = ({
  label,
  id,
  error,
  icon,
  className = '',
  labelClassName = '',
  inputClassName = '',
  helpText,
  ...props
}) => {
  return (
    <div className={`mb-4 ${className}`}>
      {label && (
        <label className={`block text-gray-300 text-sm font-medium mb-2 ${labelClassName}`} htmlFor={id}>
          {label}
        </label>
      )}
      <div className="relative">
        {icon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            {icon}
          </div>
        )}
        <input
          id={id}
          className={`w-full bg-gray-700/50 border ${error ? 'border-red-500' : 'border-gray-600'} rounded-lg py-2 px-4 ${
            icon ? 'pl-10' : ''
          } text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${inputClassName}`}
          {...props}
        />
      </div>
      {helpText && <p className="mt-1 text-xs text-gray-400">{helpText}</p>}
      {error && <p className="mt-1 text-xs text-red-400">{error}</p>}
    </div>
  );
};

/**
 * Textarea component with consistent styling
 */
export const TextArea = ({
  label,
  id,
  error,
  className = '',
  labelClassName = '',
  textareaClassName = '',
  helpText,
  ...props
}) => {
  return (
    <div className={`mb-4 ${className}`}>
      {label && (
        <label className={`block text-gray-300 text-sm font-medium mb-2 ${labelClassName}`} htmlFor={id}>
          {label}
        </label>
      )}
      <textarea
        id={id}
        className={`w-full bg-gray-700/50 border ${
          error ? 'border-red-500' : 'border-gray-600'
        } rounded-lg py-2 px-4 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${textareaClassName}`}
        {...props}
      ></textarea>
      {helpText && <p className="mt-1 text-xs text-gray-400">{helpText}</p>}
      {error && <p className="mt-1 text-xs text-red-400">{error}</p>}
    </div>
  );
};

/**
 * Select component with consistent styling
 */
export const Select = ({
  label,
  id,
  options = [],
  error,
  className = '',
  labelClassName = '',
  selectClassName = '',
  helpText,
  ...props
}) => {
  return (
    <div className={`mb-4 ${className}`}>
      {label && (
        <label className={`block text-gray-300 text-sm font-medium mb-2 ${labelClassName}`} htmlFor={id}>
          {label}
        </label>
      )}
      <select
        id={id}
        className={`w-full bg-gray-700/50 border ${
          error ? 'border-red-500' : 'border-gray-600'
        } rounded-lg py-2 px-4 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${selectClassName}`}
        {...props}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value} disabled={option.disabled}>
            {option.label}
          </option>
        ))}
      </select>
      {helpText && <p className="mt-1 text-xs text-gray-400">{helpText}</p>}
      {error && <p className="mt-1 text-xs text-red-400">{error}</p>}
    </div>
  );
};

/**
 * Checkbox component with consistent styling
 */
export const Checkbox = ({
  label,
  id,
  error,
  className = '',
  labelClassName = '',
  helpText,
  ...props
}) => {
  return (
    <div className={`flex items-center ${className}`}>
      <input
        type="checkbox"
        id={id}
        className="h-4 w-4 text-blue-500 bg-gray-700 border-gray-600 rounded focus:ring-blue-500 focus:ring-offset-gray-800"
        {...props}
      />
      {label && (
        <label htmlFor={id} className={`ml-2 text-gray-300 text-sm ${labelClassName}`}>
          {label}
        </label>
      )}
      {helpText && <p className="ml-6 text-xs text-gray-400">{helpText}</p>}
      {error && <p className="ml-6 text-xs text-red-400">{error}</p>}
    </div>
  );
};

/**
 * Toggle/Switch component with consistent styling
 */
export const Toggle = ({
  label,
  id,
  checked,
  onChange,
  description,
  error,
  className = '',
  ...props
}) => {
  return (
    <div className={`flex items-center justify-between ${className}`}>
      <div>
        {label && (
          <h4 className="text-sm font-medium text-white">{label}</h4>
        )}
        {description && (
          <p className="text-xs text-gray-400">{description}</p>
        )}
      </div>
      <label className="relative inline-flex items-center cursor-pointer">
        <input
          type="checkbox"
          id={id}
          checked={checked}
          onChange={onChange}
          className="sr-only peer"
          {...props}
        />
        <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-500 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
      </label>
      {error && <p className="text-xs text-red-400">{error}</p>}
    </div>
  );
};

/**
 * Radio Group component
 */
export const RadioGroup = ({
  label,
  options = [],
  name,
  value,
  onChange,
  error,
  className = '',
  layout = 'vertical', // 'vertical' or 'horizontal'
  ...props
}) => {
  return (
    <div className={`mb-4 ${className}`}>
      {label && <label className="block text-gray-300 text-sm font-medium mb-2">{label}</label>}
      <div className={`${layout === 'horizontal' ? 'flex space-x-4' : 'space-y-2'}`}>
        {options.map((option) => (
          <label key={option.value} className="flex items-center cursor-pointer">
            <input
              type="radio"
              name={name}
              value={option.value}
              checked={value === option.value}
              onChange={onChange}
              className="h-4 w-4 text-blue-500 bg-gray-700 border-gray-600 focus:ring-blue-500 focus:ring-offset-gray-800"
              {...props}
            />
            <span className="ml-2 text-gray-300 text-sm">{option.label}</span>
          </label>
        ))}
      </div>
      {error && <p className="mt-1 text-xs text-red-400">{error}</p>}
    </div>
  );
};

/**
 * Form section container
 */
export const FormSection = ({
  title,
  description,
  children,
  className = ''
}) => {
  return (
    <div className={`mb-6 ${className}`}>
      {title && <h3 className="text-lg font-semibold text-white mb-2">{title}</h3>}
      {description && <p className="text-gray-400 text-sm mb-4">{description}</p>}
      <div className="space-y-4">
        {children}
      </div>
    </div>
  );
};

/**
 * Form action buttons container (typically for submit/cancel)
 */
export const FormActions = ({
  children,
  className = '',
  align = 'end' // 'start', 'center', 'end'
}) => {
  const alignmentClasses = {
    start: 'justify-start',
    center: 'justify-center',
    end: 'justify-end'
  };

  return (
    <div className={`flex ${alignmentClasses[align] || 'justify-end'} space-x-4 mt-6 pt-6 border-t border-gray-700/50 ${className}`}>
      {children}
    </div>
  );
};
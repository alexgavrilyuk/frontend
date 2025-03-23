// src/modules/shared/components/Button.js
import React from 'react';

/**
 * Customizable button component with various styles
 *
 * @param {Object} props
 * @param {ReactNode} props.children - Button content
 * @param {string} [props.variant='primary'] - Button style: 'primary', 'secondary', 'outline', 'ghost', 'danger'
 * @param {string} [props.color='blue'] - Color theme: 'blue', 'purple', 'green', 'cyan', 'red', 'gray'
 * @param {string} [props.size='md'] - Button size: 'sm', 'md', 'lg'
 * @param {boolean} [props.fullWidth=false] - Whether button should take full width
 * @param {boolean} [props.isLoading=false] - Whether to show loading state
 * @param {ReactNode} [props.leftIcon] - Optional icon to show before text
 * @param {ReactNode} [props.rightIcon] - Optional icon to show after text
 * @param {boolean} [props.isRounded=false] - Whether to use fully rounded corners (for icon buttons)
 * @param {boolean} [props.gradient=false] - Whether to use gradient background (only for primary variant)
 * @param {string} [props.className] - Additional class names
 */
const Button = ({
  children,
  variant = 'primary',
  color = 'blue',
  size = 'md',
  fullWidth = false,
  isLoading = false,
  leftIcon,
  rightIcon,
  isRounded = false,
  gradient = false,
  className = '',
  ...rest
}) => {
  // Size classes
  const sizeClasses = {
    sm: 'px-3 py-1 text-xs',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base'
  };

  // Base classes for all buttons
  const baseClasses = `
    font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-opacity-50
    ${isRounded ? 'rounded-full' : 'rounded-lg'}
    ${fullWidth ? 'w-full' : ''}
    ${sizeClasses[size] || sizeClasses.md}
    ${isLoading ? 'cursor-not-allowed opacity-70' : ''}
  `;

  // Variant-specific classes
  const variantClasses = {
    primary: {
      blue: gradient
        ? 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white focus:ring-blue-500'
        : 'bg-blue-600 hover:bg-blue-700 text-white focus:ring-blue-500',
      purple: gradient
        ? 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white focus:ring-purple-500'
        : 'bg-purple-600 hover:bg-purple-700 text-white focus:ring-purple-500',
      green: 'bg-green-600 hover:bg-green-700 text-white focus:ring-green-500',
      cyan: 'bg-cyan-600 hover:bg-cyan-700 text-white focus:ring-cyan-500',
      red: 'bg-red-600 hover:bg-red-700 text-white focus:ring-red-500',
      gray: 'bg-gray-600 hover:bg-gray-700 text-white focus:ring-gray-500'
    },
    secondary: {
      blue: 'bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 border border-blue-600/30 focus:ring-blue-500/50',
      purple: 'bg-purple-600/20 hover:bg-purple-600/30 text-purple-400 border border-purple-600/30 focus:ring-purple-500/50',
      green: 'bg-green-600/20 hover:bg-green-600/30 text-green-400 border border-green-600/30 focus:ring-green-500/50',
      cyan: 'bg-cyan-600/20 hover:bg-cyan-600/30 text-cyan-400 border border-cyan-600/30 focus:ring-cyan-500/50',
      red: 'bg-red-600/20 hover:bg-red-600/30 text-red-400 border border-red-600/30 focus:ring-red-500/50',
      gray: 'bg-gray-700/50 hover:bg-gray-700/70 text-gray-300 border border-gray-600/30 focus:ring-gray-500/50'
    },
    outline: {
      blue: 'bg-transparent hover:bg-blue-600/10 text-blue-400 border border-blue-600/50 focus:ring-blue-500/50',
      purple: 'bg-transparent hover:bg-purple-600/10 text-purple-400 border border-purple-600/50 focus:ring-purple-500/50',
      green: 'bg-transparent hover:bg-green-600/10 text-green-400 border border-green-600/50 focus:ring-green-500/50',
      cyan: 'bg-transparent hover:bg-cyan-600/10 text-cyan-400 border border-cyan-600/50 focus:ring-cyan-500/50',
      red: 'bg-transparent hover:bg-red-600/10 text-red-400 border border-red-600/50 focus:ring-red-500/50',
      gray: 'bg-transparent hover:bg-gray-700/50 text-gray-400 border border-gray-600/50 focus:ring-gray-500/50'
    },
    ghost: {
      blue: 'bg-transparent hover:bg-blue-600/10 text-blue-400 focus:ring-blue-500/30',
      purple: 'bg-transparent hover:bg-purple-600/10 text-purple-400 focus:ring-purple-500/30',
      green: 'bg-transparent hover:bg-green-600/10 text-green-400 focus:ring-green-500/30',
      cyan: 'bg-transparent hover:bg-cyan-600/10 text-cyan-400 focus:ring-cyan-500/30',
      red: 'bg-transparent hover:bg-red-600/10 text-red-400 focus:ring-red-500/30',
      gray: 'bg-transparent hover:bg-gray-700/50 text-gray-400 focus:ring-gray-500/30'
    },
    danger: 'bg-red-600 hover:bg-red-700 text-white focus:ring-red-500'
  };

  // Get the appropriate classes for the variant and color
  let colorClass = '';
  if (variant === 'danger') {
    colorClass = variantClasses.danger;
  } else {
    colorClass = variantClasses[variant]?.[color] || variantClasses.primary.blue;
  }

  // Combine all classes
  const buttonClasses = `${baseClasses} ${colorClass} ${className}`;

  return (
    <button className={buttonClasses} disabled={isLoading} {...rest}>
      <span className="flex items-center justify-center">
        {isLoading && (
          <svg className="animate-spin -ml-1 mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        )}
        {leftIcon && <span className={`${children ? 'mr-2' : ''}`}>{leftIcon}</span>}
        {children}
        {rightIcon && <span className={`${children ? 'ml-2' : ''}`}>{rightIcon}</span>}
      </span>
    </button>
  );
};

export default Button;
// src/modules/shared/components/Card.js
import React from 'react';

/**
 * Glass-effect card component with customizable appearance
 *
 * @param {Object} props
 * @param {ReactNode} props.children - Card content
 * @param {string} [props.variant='default'] - Card style variant: 'default', 'glass', 'hover', 'accent'
 * @param {string} [props.className] - Additional class names
 * @param {function} [props.onClick] - Optional click handler
 * @param {string} [props.accentColor] - Optional accent color (used with accent variant)
 * @param {boolean} [props.noPadding=false] - Whether to remove default padding
 * @param {Object} [props.headerProps] - Optional header configuration
 * @param {ReactNode} [props.headerProps.title] - Header title
 * @param {ReactNode} [props.headerProps.subtitle] - Header subtitle
 * @param {ReactNode} [props.headerProps.action] - Header action (button, etc.)
 * @param {Object} [props.headerProps.icon] - Optional icon configuration
 */
const Card = ({
  children,
  variant = 'default',
  className = '',
  onClick,
  accentColor = 'blue',
  noPadding = false,
  headerProps,
  ...rest
}) => {
  // Base card classes
  const baseClasses = 'rounded-xl border border-gray-700/50 shadow-xl overflow-hidden';

  // Variant-specific classes
  const variantClasses = {
    default: 'bg-gray-800/80 backdrop-blur-sm',
    glass: 'bg-gray-800/60 backdrop-blur-sm',
    hover: 'bg-gray-800/60 backdrop-blur-sm hover:bg-gray-700/70 transition-colors duration-200',
    accent: `bg-gray-800/60 backdrop-blur-sm border-l-4 border-l-${accentColor}-500`
  };

  // Padding classes
  const paddingClasses = noPadding ? '' : 'p-6';

  // Combine all classes
  const cardClasses = `${baseClasses} ${variantClasses[variant] || variantClasses.default} ${paddingClasses} ${className}`;

  // Render header if provided
  const renderHeader = () => {
    if (!headerProps) return null;

    const { title, subtitle, action, icon } = headerProps;

    return (
      <div className={`flex justify-between items-center ${children ? 'mb-4' : ''}`}>
        <div className="flex items-center">
          {icon && (
            <div className={`w-10 h-10 rounded-full bg-${accentColor}-900/20 flex items-center justify-center mr-3`}>
              {icon}
            </div>
          )}
          <div>
            {title && (typeof title === 'string' ? <h3 className="text-lg font-semibold text-white">{title}</h3> : title)}
            {subtitle && (typeof subtitle === 'string' ? <p className="text-gray-400">{subtitle}</p> : subtitle)}
          </div>
        </div>
        {action && <div>{action}</div>}
      </div>
    );
  };

  return (
    <div
      className={cardClasses}
      onClick={onClick}
      {...rest}
    >
      <div className={noPadding && headerProps ? 'p-6 pb-0' : ''}>
        {renderHeader()}
      </div>
      {children}
    </div>
  );
};

export default Card;
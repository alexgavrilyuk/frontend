// src/modules/shared/components/StatusMessage.js
import React from 'react';

/**
 * Status message component for errors, success messages, warnings, and info
 *
 * @param {Object} props
 * @param {string} [props.type='info'] - Message type: 'error', 'success', 'warning', 'info'
 * @param {ReactNode} props.children - Message content
 * @param {string} [props.className] - Additional class names
 * @param {boolean} [props.animate=false] - Whether to animate the message (shake for errors, fade for others)
 * @param {boolean} [props.dismissible=false] - Whether the message can be dismissed
 * @param {function} [props.onDismiss] - Callback when dismissed
 */
const StatusMessage = ({
  type = 'info',
  children,
  className = '',
  animate = false,
  dismissible = false,
  onDismiss,
  ...rest
}) => {
  // Type-specific styles
  const typeStyles = {
    error: {
      bg: 'bg-red-900/30',
      border: 'border-red-700',
      text: 'text-red-400',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-red-500" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
        </svg>
      ),
      animation: animate ? 'animate-shake' : ''
    },
    success: {
      bg: 'bg-green-900/30',
      border: 'border-green-700',
      text: 'text-green-400',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-500" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
        </svg>
      ),
      animation: animate ? 'animate-fade-in' : ''
    },
    warning: {
      bg: 'bg-yellow-900/30',
      border: 'border-yellow-700',
      text: 'text-yellow-400',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-yellow-500" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
        </svg>
      ),
      animation: animate ? 'animate-fade-in' : ''
    },
    info: {
      bg: 'bg-blue-900/30',
      border: 'border-blue-700',
      text: 'text-blue-400',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-500" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
        </svg>
      ),
      animation: animate ? 'animate-fade-in' : ''
    }
  };

  // Get styles for the selected type
  const { bg, border, text, icon, animation } = typeStyles[type] || typeStyles.info;

  return (
    <div
      className={`${bg} border ${border} rounded-lg p-4 mb-6 ${animation} ${className}`}
      {...rest}
    >
      <div className="flex items-start">
        <div className="flex-shrink-0 mr-3">{icon}</div>
        <div className={`flex-grow ${text}`}>
          {typeof children === 'string' ? <p>{children}</p> : children}
        </div>
        {dismissible && (
          <button
            type="button"
            onClick={onDismiss}
            className="flex-shrink-0 ml-3 text-gray-400 hover:text-gray-300 transition-colors duration-200"
            aria-label="Dismiss"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
};

export default StatusMessage;
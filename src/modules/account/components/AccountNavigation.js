// src/modules/account/components/AccountNavigation.js
import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';

function AccountNavigation({ activeTab, onTabChange }) {
  const location = useLocation();

  // If activeTab is not explicitly passed, determine it from the location
  const getActiveTabFromLocation = () => {
    const path = location.pathname;
    if (path.includes('/account/datasets')) return 'datasets';
    if (path.includes('/account/ai-settings')) return 'ai-settings';
    if (path.includes('/account/settings')) return 'settings';
    return 'profile'; // Default to profile
  };

  const currentTab = activeTab || getActiveTabFromLocation();

  return (
    <div className="md:w-64 bg-gray-800/50 backdrop-blur-sm border-r border-gray-700/50 p-4">
      {/* Main Navigation */}
      <nav className="space-y-2">
        <NavLink
          to="/account/profile"
          className={({ isActive }) =>
            `flex items-center px-4 py-3 rounded-lg transition-all duration-200 ${
              isActive || currentTab === 'profile'
                ? 'bg-blue-600/20 text-blue-400 border-l-4 border-blue-500'
                : 'hover:bg-gray-700/50 text-gray-300 hover:text-white'
            }`
          }
          onClick={() => onTabChange && onTabChange('profile')}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
          </svg>
          Profile
        </NavLink>

        <NavLink
          to="/account/settings"
          className={({ isActive }) =>
            `flex items-center px-4 py-3 rounded-lg transition-all duration-200 ${
              isActive || currentTab === 'settings'
                ? 'bg-green-600/20 text-green-400 border-l-4 border-green-500'
                : 'hover:bg-gray-700/50 text-gray-300 hover:text-white'
            }`
          }
          onClick={() => onTabChange && onTabChange('settings')}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
          </svg>
          Settings
        </NavLink>

        <NavLink
          to="/account/datasets"
          className={({ isActive }) =>
            `flex items-center px-4 py-3 rounded-lg transition-all duration-200 ${
              isActive || currentTab === 'datasets'
                ? 'bg-purple-600/20 text-purple-400 border-l-4 border-purple-500'
                : 'hover:bg-gray-700/50 text-gray-300 hover:text-white'
            }`
          }
          onClick={() => onTabChange && onTabChange('datasets')}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3" viewBox="0 0 20 20" fill="currentColor">
            <path d="M3 12v3c0 1.657 3.134 3 7 3s7-1.343 7-3v-3c0 1.657-3.134 3-7 3s-7-1.343-7-3z" />
            <path d="M3 7v3c0 1.657 3.134 3 7 3s7-1.343 7-3V7c0 1.657-3.134 3-7 3S3 8.657 3 7z" />
            <path d="M17 5c0 1.657-3.134 3-7 3S3 6.657 3 5s3.134-3 7-3 7 1.343 7 3z" />
          </svg>
          Datasets
        </NavLink>

        <NavLink
          to="/account/ai-settings"
          className={({ isActive }) =>
            `flex items-center px-4 py-3 rounded-lg transition-all duration-200 ${
              isActive || currentTab === 'ai-settings'
                ? 'bg-cyan-600/20 text-cyan-400 border-l-4 border-cyan-500'
                : 'hover:bg-gray-700/50 text-gray-300 hover:text-white'
            }`
          }
          onClick={() => onTabChange && onTabChange('ai-settings')}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3" viewBox="0 0 20 20" fill="currentColor">
            <path d="M10 3.5a1.5 1.5 0 013 0V4a1 1 0 001 1h3a1 1 0 011 1v3a1 1 0 01-1 1h-.5a1.5 1.5 0 000 3h.5a1 1 0 011 1v3a1 1 0 01-1 1h-3a1 1 0 01-1-1v-.5a1.5 1.5 0 00-3 0v.5a1 1 0 01-1 1H6a1 1 0 01-1-1v-3a1 1 0 00-1-1h-.5a1.5 1.5 0 010-3H4a1 1 0 001-1V6a1 1 0 011-1h3a1 1 0 001-1v-.5z" />
          </svg>
          AI Settings
        </NavLink>
      </nav>

      {/* Additional Resources Section */}
      <div className="mt-8 pt-4 border-t border-gray-700/50">
        <h3 className="text-xs uppercase text-gray-500 font-semibold tracking-wider mb-3">Resources</h3>
        <div className="space-y-2">
          <a
            href="https://docs.yourdomain.com"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center px-4 py-2 text-sm text-gray-400 hover:text-blue-400 transition-colors duration-200"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" viewBox="0 0 20 20" fill="currentColor">
              <path d="M9 4.804A7.968 7.968 0 005.5 4c-1.255 0-2.443.29-3.5.804v10A7.969 7.969 0 015.5 14c1.669 0 3.218.51 4.5 1.385A7.962 7.962 0 0114.5 14c1.255 0 2.443.29 3.5.804v-10A7.968 7.968 0 0014.5 4c-1.255 0-2.443.29-3.5.804V12a1 1 0 11-2 0V4.804z" />
            </svg>
            Documentation
          </a>

          <a
            href="mailto:support@yourdomain.com"
            className="flex items-center px-4 py-2 text-sm text-gray-400 hover:text-blue-400 transition-colors duration-200"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" viewBox="0 0 20 20" fill="currentColor">
              <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
              <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
            </svg>
            Support
          </a>

          <a
            href="#"
            className="flex items-center px-4 py-2 text-sm text-gray-400 hover:text-blue-400 transition-colors duration-200"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
            </svg>
            Help Center
          </a>
        </div>
      </div>

      {/* Product Version Information */}
      <div className="mt-8 pt-4 text-xs text-gray-500">
        <p className="px-4">Version 1.0.0</p>
        <p className="px-4 mt-1">© 2025 Alexander Gavrilyuk</p>
      </div>
    </div>
  );
}

export default AccountNavigation;
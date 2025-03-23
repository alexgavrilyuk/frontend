// src/modules/account/index.js
/**
 * Account Module
 *
 * This module handles user account management, profile settings,
 * and user preferences.
 */

// Import components from the module's components directory
import AccountManagement from './components/AccountManagement';
import UserProfile from './components/UserProfile';
import ProfileSettings from './components/ProfileSettings';
import AISettings from './components/AISettings';
import AccountNavigation from './components/AccountNavigation';

// Define module routes
export const routes = [
  {
    path: '/account/*',
    element: AccountManagement,
    protected: true
  }
];

// Export public components
export {
  AccountManagement,
  UserProfile,
  ProfileSettings,
  AISettings,
  AccountNavigation
};
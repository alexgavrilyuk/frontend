// src/modules/account/components/AccountManagement.js
import React, { useState, useEffect } from 'react';
import { useNavigate, Routes, Route, useLocation } from 'react-router-dom';
import { useAuth } from '../../../modules/auth';
import UserProfile from './UserProfile';
import ProfileSettings from './ProfileSettings';
import AccountNavigation from './AccountNavigation';
import { DatasetList } from '../../../modules/datasets';
import AISettings from './AISettings';

// Import UI components from shared module
import { AnimatedBackground, Button } from '../../shared/components';

function AccountManagement() {
  const [fadeIn, setFadeIn] = useState(false);
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Determine which tab is active based on the current path
  const getActiveTab = () => {
    const path = location.pathname;
    if (path.includes('/account/datasets')) return 'datasets';
    if (path.includes('/account/ai-settings')) return 'ai-settings';
    if (path.includes('/account/settings')) return 'settings';
    return 'profile'; // Default to profile
  };

  const [activeTab, setActiveTab] = useState(getActiveTab());

  // Update active tab when route changes
  useEffect(() => {
    setActiveTab(getActiveTab());
  }, [location]);

  // Fade-in animation on component mount
  useEffect(() => {
    setFadeIn(true);
  }, []);

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error("Failed to logout:", error);
    }
  };

  // Navigate back to dashboard
  const handleBackToDashboard = () => {
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col relative overflow-hidden">
      {/* Using our new AnimatedBackground component */}
      <AnimatedBackground />

      {/* Header - similar to Dashboard for consistency */}
      <header className="bg-gray-800/70 backdrop-blur-md p-4 flex justify-between items-center border-b border-gray-700/30 shadow-lg z-10">
        <div className="flex items-center">
          {/* Back button */}
          <Button
            variant="ghost"
            color="gray"
            onClick={handleBackToDashboard}
            className="mr-4"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
          </Button>

          {/* Logo/icon for the account page */}
          <div className="w-8 h-8 mr-3 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center shadow-md">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
            </svg>
          </div>

          {/* Title with improved styling */}
          <h1 className="text-xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-cyan-400 text-transparent bg-clip-text drop-shadow-sm">
            Account Management
          </h1>
        </div>

        <div className="flex items-center">
          {/* User profile section with improved styling */}
          <div className="flex items-center mr-4 bg-gray-700/50 rounded-full py-1 px-2 border border-gray-600/30">
            <div className="h-8 w-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center shadow-sm">
              <span className="text-white font-medium">
                {currentUser?.email ? currentUser.email.charAt(0).toUpperCase() : 'U'}
              </span>
            </div>
            <span className="text-gray-200 text-sm ml-2 hidden sm:inline font-medium">{currentUser?.email}</span>
          </div>

          {/* Logout button */}
          <Button
            variant="secondary"
            color="gray"
            onClick={handleLogout}
            size="md"
          >
            Logout
          </Button>
        </div>
      </header>

      {/* Main content area with side navigation and content */}
      <div className="flex flex-col md:flex-row flex-grow min-h-0">
        {/* Side Navigation using the AccountNavigation component */}
        <AccountNavigation
          activeTab={activeTab}
          onTabChange={setActiveTab}
        />

        {/* Main content area */}
        <div className="flex-grow p-6 overflow-y-auto">
          <div className={`transition-all duration-500 ${fadeIn ? 'opacity-100 transform translate-y-0' : 'opacity-0 transform translate-y-4'}`}>
            <Routes>
              <Route path="/" element={<UserProfile />} />
              <Route path="/profile" element={<UserProfile />} />
              <Route path="/settings" element={<ProfileSettings />} />
              <Route path="/datasets" element={<DatasetList />} />
              <Route path="/ai-settings" element={<AISettings />} />
            </Routes>
          </div>
        </div>
      </div>

      {/* Copyright footer with subtle styling - consistent with Dashboard */}
      <div className="p-2 mt-auto text-center text-gray-500 text-xs border-t border-gray-800 bg-gray-900/80 backdrop-blur-sm">
        &copy; Alexander Gavrilyuk 2025
      </div>
    </div>
  );
}

export default AccountManagement;
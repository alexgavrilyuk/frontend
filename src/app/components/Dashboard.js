// src/app/components/Dashboard.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../modules/auth';
import { useChat, ChatPanel } from '../../modules/chat';
import { SearchBox, ResultsTable, useQueryManager } from '../../modules/query';
import { ReportViewer } from '../../modules/reports';
import { AnimatedBackground, LoadingSpinner, Card, Button } from '../../modules/shared/components';

function Dashboard() {
  const [fadeIn, setFadeIn] = useState(false);
  const [hasInteracted, setHasInteracted] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [activeView, setActiveView] = useState('results'); // 'results' or 'report'
  const [activeReportId, setActiveReportId] = useState(null);
  const [activeReport, setActiveReport] = useState(null);
  const [reportUpdateCounter, setReportUpdateCounter] = useState(0);
  const { currentUser, logout } = useAuth();
  const { forceInitialView, currentMessages } = useChat();
  const navigate = useNavigate();

  // Use our new custom hook to manage queries
  const {
    queryResults,
    isLoading,
    isGeneratingReport,
    error,
    retries,
    handleQuerySubmit,
    handleClearResults,
    handleNewChat
  } = useQueryManager(setHasInteracted);

  // Force a report refresh when needed
  const forceReportRefresh = () => {
    console.log("Forcing report refresh");
    setReportUpdateCounter(prev => prev + 1);
  };

  // Fade-in animation on component mount
  useEffect(() => {
    setFadeIn(true);

    // On login/initial load, check for new login session
    if (currentUser) {
      // If this is a new login session (determined by checking hasLoggedIn in sessionStorage)
      if (!sessionStorage.getItem('hasLoggedIn')) {
        console.log("New login detected, showing single textbox view");

        // Force the single textbox view for new login sessions
        setHasInteracted(false);
        sessionStorage.removeItem('hasInteracted');

        // Tell ChatContext to force single view mode too
        forceInitialView();

        // Mark that user has logged in in this session
        sessionStorage.setItem('hasLoggedIn', 'true');
      } else {
        // For continuing sessions, respect the previous interaction state
        const hasUserInteracted = sessionStorage.getItem('hasInteracted') === 'true';
        setHasInteracted(hasUserInteracted);
      }
    }
  }, [currentUser, forceInitialView]);

  // Close user menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showUserMenu && !event.target.closest('.user-menu-container')) {
        setShowUserMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showUserMenu]);

  // Check for reports in messages and set active report if found
  useEffect(() => {
    console.log("Report update counter changed or messages changed:", reportUpdateCounter);
    if (currentMessages && currentMessages.length > 0) {
      console.log("Current messages count:", currentMessages.length);

      // Look for the most recent message with a report
      let foundReport = false;
      for (let i = currentMessages.length - 1; i >= 0; i--) {
        if (currentMessages[i].report) {
          console.log("Found report in message index", i, currentMessages[i].report);
          setActiveReportId(currentMessages[i].report.id || null);
          setActiveReport(currentMessages[i].report);
          setActiveView('report'); // Automatically switch to report view when a report is found
          foundReport = true;
          break;
        }
      }

      if (!foundReport) {
        console.log("No reports found in messages");
        setActiveReport(null);
        setActiveReportId(null);
      }
    } else {
      console.log("No messages available");
      setActiveReport(null);
      setActiveReportId(null);
    }
  }, [currentMessages, reportUpdateCounter]);

  // Listen for report update events
  useEffect(() => {
    const handleReportUpdate = () => {
      console.log("Report update event received");
      forceReportRefresh();
    };

    window.addEventListener('reportUpdate', handleReportUpdate);
    return () => {
      window.removeEventListener('reportUpdate', handleReportUpdate);
    };
  }, []);

  // Listen for clearQueryResults event
  useEffect(() => {
    const handleClearQueryResults = () => {
      console.log("Clearing active report from event");
      setActiveReport(null);
      setActiveReportId(null);
    };

    window.addEventListener('clearQueryResults', handleClearQueryResults);
    return () => {
      window.removeEventListener('clearQueryResults', handleClearQueryResults);
    };
  }, []);

  const handleLogout = async () => {
    try {
      await logout();
      // Clear session storage on logout
      sessionStorage.removeItem('hasInteracted');
      sessionStorage.removeItem('hasLoggedIn'); // Clear login session marker
    } catch (error) {
      console.error("Failed to logout:", error);
    }
  };

  const navigateToAccount = () => {
    navigate('/account/profile');
    setShowUserMenu(false);
  };

  // Toggle between results and report views
  const toggleView = (view) => {
    if (view === 'results' || view === 'report') {
      setActiveView(view);

      // When switching to report view, refresh the report
      if (view === 'report') {
        forceReportRefresh();
      }
    }
  };

  // Determine if we should show the chat panel (split view)
  const shouldShowChatPanel = hasInteracted;

  // Find active report from messages
  const getActiveReport = () => {
    if (!currentMessages) return null;

    for (let i = currentMessages.length - 1; i >= 0; i--) {
      const message = currentMessages[i];
      if (message.report) {
        return message.report;
      }
    }
    return null;
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col relative overflow-hidden">
      {/* Use the AnimatedBackground component */}
      <AnimatedBackground particleCount={15} />

      {/* Modernized header with glass effect */}
      <header className="bg-gray-800/70 backdrop-blur-md p-4 flex justify-between items-center border-b border-gray-700/30 shadow-lg z-10">
        <div className="flex items-center">
          {/* Logo/icon for the dashboard - adds a professional touch */}
          <div className="w-8 h-8 mr-3 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center shadow-md">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" viewBox="0 0 20 20" fill="currentColor">
              <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" />
            </svg>
          </div>

          {/* Title with improved styling */}
          <h1 className="text-xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-cyan-400 text-transparent bg-clip-text drop-shadow-sm">
            Financial Dashboard
          </h1>
        </div>

        <div className="flex items-center">
          {/* User profile section with improved styling and dropdown */}
          <div className="relative user-menu-container">
            <div
              className="flex items-center mr-4 bg-gray-700/50 hover:bg-gray-700/70 rounded-full py-1 px-2 border border-gray-600/30 cursor-pointer transition-all duration-200"
              onClick={() => setShowUserMenu(!showUserMenu)}
            >
              <div className="h-8 w-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center shadow-sm">
                <span className="text-white font-medium">
                  {currentUser?.email ? currentUser.email.charAt(0).toUpperCase() : 'U'}
                </span>
              </div>
              <span className="text-gray-200 text-sm ml-2 hidden sm:inline font-medium">{currentUser?.email}</span>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-2 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>

            {/* User dropdown menu */}
            {showUserMenu && (
              <div className="absolute right-0 mt-2 py-2 w-48 bg-gray-800/95 backdrop-blur-sm rounded-lg shadow-xl border border-gray-700/50 z-10 animate-fade-in">
                <div className="px-4 py-2 border-b border-gray-700/50">
                  <p className="text-sm font-medium text-white truncate">{currentUser?.email}</p>
                </div>
                <button
                  onClick={navigateToAccount}
                  className="w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-gray-700/50 hover:text-white flex items-center"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  Account Settings
                </button>
                <button
                  onClick={handleLogout}
                  className="w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-gray-700/50 hover:text-white flex items-center"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {shouldShowChatPanel ? (
        // Split view for chat and data
        <div className="flex flex-grow h-[calc(100vh-64px-40px)]">
          {/* Chat panel (1/3 width) */}
          <div className="w-1/3 h-full">
            <ChatPanel onNewChat={handleNewChat} />
          </div>

          {/* Data visualization panel (2/3 width) */}
          <div className="w-2/3 h-full overflow-auto p-6">
            {(queryResults || isLoading || error || activeReport) ? (
              // Results view with animations and view toggle
              <div className={`flex flex-col h-full transition-opacity duration-500 ${fadeIn ? 'opacity-100' : 'opacity-0'}`}>
                {/* Back button with hover effect */}
                <div className="flex items-center justify-between mb-6">
                  <Button
                    variant="ghost"
                    color="blue"
                    onClick={handleClearResults}
                    className="w-fit"
                    leftIcon={
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M9.707 14.707a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 1.414L7.414 9H15a1 1 0 110 2H7.414l2.293 2.293a1 1 0 010 1.414z" clipRule="evenodd" />
                      </svg>
                    }
                  >
                    Clear results
                  </Button>

                  {/* View toggle buttons - always show when we have results */}
                  <div className="flex rounded-lg overflow-hidden border border-gray-700">
                    <button
                      className={`px-4 py-2 text-sm ${activeView === 'results' ? 'bg-gray-700 text-white' : 'bg-gray-800/50 text-gray-300 hover:bg-gray-700/30'}`}
                      onClick={() => toggleView('results')}
                    >
                      Table View
                    </button>
                    <button
                      className={`px-4 py-2 text-sm ${activeView === 'report' ? 'bg-gray-700 text-white' : 'bg-gray-800/50 text-gray-300 hover:bg-gray-700/30'}`}
                      onClick={() => toggleView('report')}
                    >
                      Report View
                    </button>
                  </div>
                </div>

                {/* Loading indicator with improved animation */}
                {(isLoading || isGeneratingReport) && (
                  <LoadingSpinner size="md" color="blue" label={isGeneratingReport ? "Generating Report" : "Loading"} centered />
                )}

                {/* Force report refresh hidden element - to ensure component reacts to changes */}
                <div className="hidden">{reportUpdateCounter}</div>

                {/* Content area - switch between report and table views */}
                {!isLoading && !isGeneratingReport && (
                  <>
                    {activeView === 'report' ? (
                      // Report viewer - force refresh with key
                      activeReport ? (
                        <ReportViewer
                          reportData={activeReport}
                          key={`report-${reportUpdateCounter}-${activeReport?.id || 'none'}`}
                        />
                      ) : (
                        // If no report, show a message
                        <div className="text-center py-12">
                          <p className="text-gray-400 text-lg">No report available for this query.</p>
                          <p className="text-gray-500 mt-2">Try switching to Table View or run a new query.</p>
                          <button
                            className="mt-4 px-4 py-2 bg-gray-700 rounded text-white hover:bg-gray-600 transition-colors"
                            onClick={forceReportRefresh}
                          >
                            Refresh Report View
                          </button>
                        </div>
                      )
                    ) : (
                      // Results table component
                      <ResultsTable queryResults={queryResults} error={error} retries={retries} />
                    )}
                  </>
                )}
              </div>
            ) : (
              // Initial welcome view
              <div className={`flex flex-col justify-center items-center h-full transition-all duration-700 ${fadeIn ? 'opacity-100 transform translate-y-0' : 'opacity-0 transform translate-y-8'}`}>
                <div className="text-center max-w-2xl">
                  <div className="mb-6">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-20 w-20 mx-auto text-blue-500 opacity-80" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <h2 className="text-2xl font-bold mb-4 bg-gradient-to-r from-blue-400 via-purple-400 to-cyan-400 text-transparent bg-clip-text">
                    Ask Questions About Your Financial Data
                  </h2>
                  <p className="text-gray-300 mb-8">
                    Use the chat panel on the left to ask questions about your data. Results will be displayed here.
                  </p>

                  <Card variant="glass" className="p-6">
                    <h3 className="text-lg font-medium text-gray-200 mb-2">Try asking questions like:</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-left">
                      <div className="flex items-start">
                        <div className="flex-shrink-0 h-5 w-5 text-blue-400 mt-0.5">
                          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                        </div>
                        <p className="ml-2 text-gray-300">"Show me a graph of top 10 clients by sales"</p>
                      </div>

                      <div className="flex items-start">
                        <div className="flex-shrink-0 h-5 w-5 text-purple-400 mt-0.5">
                          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                        </div>
                        <p className="ml-2 text-gray-300">"What's the total revenue by therapy area?"</p>
                      </div>

                      <div className="flex items-start">
                        <div className="flex-shrink-0 h-5 w-5 text-cyan-400 mt-0.5">
                          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                        </div>
                        <p className="ml-2 text-gray-300">"List all tracker projects over $100,000"</p>
                      </div>

                      <div className="flex items-start">
                        <div className="flex-shrink-0 h-5 w-5 text-green-400 mt-0.5">
                          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                        </div>
                        <p className="ml-2 text-gray-300">"Generate a report analyzing recent trends"</p>
                      </div>
                    </div>
                  </Card>
                </div>
              </div>
            )}
          </div>
        </div>
      ) : (
        // Original full-width view with the single search box - Now using the SearchBox component
        <div className={`flex-grow flex items-center justify-center transition-all duration-700 ${fadeIn ? 'opacity-100 transform translate-y-0' : 'opacity-0 transform translate-y-8'}`}>
          <SearchBox
            onQuerySubmit={handleQuerySubmit}
          />
        </div>
      )}

      {/* Copyright footer with subtle styling */}
      <div className="p-2 mt-auto text-center text-gray-500 text-xs border-t border-gray-800 bg-gray-900/80 backdrop-blur-sm">
        &copy; Alexander Gavrilyuk 2025
      </div>
    </div>
  );
}

export default Dashboard;
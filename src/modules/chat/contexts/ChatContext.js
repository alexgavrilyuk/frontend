// src/modules/chat/contexts/ChatContext.js
import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from '../../auth';

// Enable for verbose logging
const DEBUG = true;

const log = (...args) => {
  if (DEBUG) console.log("[ChatContext]", ...args);
};

const error = (...args) => {
  console.error("[ChatContext]", ...args);
};

const ChatContext = createContext();

export function useChat() {
  return useContext(ChatContext);
}

export function ChatProvider({ children }) {
  const { currentUser } = useAuth();
  const [currentMessages, setCurrentMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [chatError, setChatError] = useState(null);
  // Add state for tracking reports
  const [reports, setReports] = useState([]);

  // Subscribe to auth changes
  useEffect(() => {
    log("Auth state changed:", currentUser?.uid || "No user");

    if (!currentUser) {
      log("User logged out, clearing chat state");
      setCurrentMessages([]);
      setReports([]);
    }
  }, [currentUser]);

  // Add a message to the current chat
  const addMessage = async (role, content, data = {}) => {
    try {
      log(`Adding ${role} message to chat`);

      const message = {
        role,
        content,
        timestamp: new Date().toISOString(),
        ...data
      };

      log("Message content:", JSON.stringify(message));

      // Track report data if present
      if (data.report) {
        log("Report data found in message");
        setReports(prev => [...prev, {
          id: data.report.id || `report-${Date.now()}`,
          messageIndex: currentMessages.length,
          report: data.report
        }]);
      }

      // Update local state for immediate feedback
      setCurrentMessages(prev => [...prev, message]);

      return true;
    } catch (err) {
      error("Error adding message:", err);
      setChatError("Failed to send message: " + err.message);
      return false;
    }
  };

  // Clear all messages
  const clearMessages = () => {
    log("Clearing all messages");
    setCurrentMessages([]);
    setReports([]);
    setChatError(null);

    // Dispatch an event to clear results
    window.dispatchEvent(new CustomEvent('clearQueryResults'));
  };

  // Get a report by ID
  const getReportByID = (reportId) => {
    const reportEntry = reports.find(r => r.id === reportId);
    return reportEntry ? reportEntry.report : null;
  };

  // Get all reports
  const getAllReports = () => {
    return reports;
  };

  // Force single box view on login
  const forceInitialView = () => {
    log("Forcing initial single box view");
    setCurrentMessages([]);
    setReports([]);
  };

  const value = {
    currentMessages,
    loading,
    error: chatError,
    reports,
    addMessage,
    clearMessages,
    forceInitialView,
    getReportByID,
    getAllReports
  };

  return (
    <ChatContext.Provider value={value}>
      {children}
    </ChatContext.Provider>
  );
}
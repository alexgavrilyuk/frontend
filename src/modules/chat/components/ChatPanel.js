// src/modules/chat/components/ChatPanel.js
import React, { useRef, useEffect, useState } from 'react';
import { useChat } from '../contexts/ChatContext';
import ChatMessage from './ChatMessage';
import ChatInput from './ChatInput';
import { apiService } from '../../../core/api';
import { tableDataService } from '../../query';
import { LoadingReport } from '../../reports';

function ChatPanel({ onNewChat }) {
  const { currentMessages, addMessage, clearMessages } = useChat();
  const [isLoading, setIsLoading] = useState(false);
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);
  const messagesEndRef = useRef(null);
  const hasChatMounted = useRef(false);

  // Auto-scroll to bottom of chat
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [currentMessages]);

  // Initialize component state
  useEffect(() => {
    hasChatMounted.current = true;

    return () => {
      hasChatMounted.current = false;
    };
  }, []);

  useEffect(() => {
    const handleResultsUpdate = async (event) => {
      console.log("ChatPanel received queryResultsUpdate event:", event.detail);
    };

    window.addEventListener('queryResultsUpdate', handleResultsUpdate);

    return () => {
      window.removeEventListener('queryResultsUpdate', handleResultsUpdate);
    };
  }, []);

  const handleSendMessage = async (message, datasetId) => {
    // Don't process empty messages
    if (!message.trim()) return;

    // Validate dataset selection
    if (!datasetId) {
      console.error("No dataset selected for query");
      return;
    }

    // Check if message requests a report specifically
    const isReportRequest = message.toLowerCase().includes("generate report") ||
                            message.toLowerCase().includes("create report") ||
                            message.toLowerCase().includes("show me a report") ||
                            message.toLowerCase().includes("analyze");

    setIsLoading(true);

    try {
      // Add user's message
      await addMessage('user', message, {
        query: message,
        datasetId: datasetId
      });

      // Format conversation history for context
      const formattedHistory = apiService.formatConversationHistory(currentMessages);

      if (isReportRequest) {
        // Handle report generation
        setIsGeneratingReport(true);

        try {
          // Call the report generation service
          const reportService = (await import('../../reports/services/reportService')).default;
          const report = await reportService.generateReport(
            message,
            datasetId,
            formattedHistory
          );

          // Add the assistant's response with embedded report
          await addMessage('assistant', "I've generated a report based on your query:", {
            report: report,
            datasetId: datasetId
          });

          // Dispatch report update event to notify Dashboard
          window.dispatchEvent(new CustomEvent('reportUpdate'));
        } catch (error) {
          console.error("Error generating report:", error);
          await addMessage('assistant', `Error generating report: ${error.message}`, {
            error: error.message,
            datasetId: datasetId
          });
        } finally {
          setIsGeneratingReport(false);
        }
      } else {
        // Handle regular query
        const response = await apiService.sendQuery(message, formattedHistory, datasetId);
        console.log("ChatPanel received API response:", response);

        // Process the response
        let responseContent = "Request Successful";
        if (response.error) {
          responseContent = `Error: ${response.error}`;
        } else if (!response.results || response.results.length === 0) {
          responseContent = "No results found for your query.";
        }

        // Normalize the results if they exist
        let normalizedResults = null;
        let columnOrder = null;

        if (response.results && response.results.length > 0) {
          // Use tableDataService to normalize and preserve column order
          normalizedResults = tableDataService.normalizeTableData(response.results);
          const orderData = tableDataService.preserveColumnOrder(normalizedResults);
          normalizedResults = orderData.results;
          columnOrder = orderData.columnOrder;
        }

        // Create report object outside conditional blocks so it's accessible for events
        let reportData = null;

        // Check if the response contains visualizations (from backend)
        if (response.visualizations && response.visualizations.length > 0) {
          console.log("ChatPanel: Visualizations found in response:", response.visualizations.length);

          // Create a report object with a unique ID
          reportData = {
            id: `report-${new Date().getTime()}`,
            title: response.prompt || "Data Visualization",
            query: message,
            createdAt: new Date().toISOString(),
            visualizations: response.visualizations,
            narrative: response.narrative || "Analysis of your query results",
            insights: response.insights || [],
            sections: [
              {
                title: "Data Analysis",
                content: response.narrative || "Analysis of your query results",
                visualizations: response.visualizations
              }
            ],
            results: normalizedResults
          };

          console.log("ChatPanel: Creating report from visualizations:", reportData);

          // Add the assistant's response with the report
          await addMessage('assistant', response.aiResponse || "I've visualized your data", {
            results: normalizedResults || null,
            columnOrder: columnOrder || null,
            retries: response.retries || 0,
            datasetId: datasetId,
            report: reportData  // This is the key part - adding the report object
          });

          // Dispatch report update event to notify Dashboard
          window.dispatchEvent(new CustomEvent('reportUpdate'));
        } else {
          // Create a basic report even for regular responses without visualizations
          reportData = {
            id: `report-${new Date().getTime()}`,
            title: message || "Query Results",
            query: message,
            createdAt: new Date().toISOString(),
            sections: [{
              title: "Query Results",
              content: response.aiResponse || "Here are the results of your query",
              tableData: normalizedResults
            }],
            results: normalizedResults
          };

          // Add the assistant's response
          await addMessage('assistant', responseContent, {
            results: normalizedResults || null,
            columnOrder: columnOrder || null,
            error: response.error || null,
            retries: response.retries || 0,
            datasetId: datasetId,
            report: reportData // Always include a report
          });

          // Dispatch report update event to notify Dashboard
          window.dispatchEvent(new CustomEvent('reportUpdate'));
        }

        // Update the dashboard with results
        if (normalizedResults && normalizedResults.length > 0) {
          const resultUpdateEvent = new CustomEvent('queryResultsUpdate', {
            detail: {
              results: normalizedResults,
              columnOrder: columnOrder,
              error: response.error,
              retries: response.retries || 0,
              datasetId: datasetId,
              report: reportData // Use the report we created above
            }
          });
          window.dispatchEvent(resultUpdateEvent);
        }
      }
    } catch (error) {
      console.error("Error processing message:", error);

      await addMessage('assistant', `Error: ${error.message}`, {
        error: error.message,
        datasetId: datasetId
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleNewChat = () => {
    console.log("Starting new chat from ChatPanel");

    // Clear messages in context
    clearMessages();

    // Call the parent's onNewChat if provided
    if (typeof onNewChat === 'function') {
      console.log("Calling parent onNewChat handler");
      onNewChat();
    } else {
      console.log("No parent onNewChat handler provided");
    }
  };

  return (
    <div className="flex flex-col h-full bg-gray-900/80 backdrop-blur-sm border-r border-gray-700/50">
      {/* Chat header */}
      <div className="p-4 border-b border-gray-700/50 flex justify-between items-center">
        <h2 className="text-xl font-semibold bg-gradient-to-r from-blue-400 via-purple-400 to-cyan-400 text-transparent bg-clip-text">
          AI Assistant
        </h2>
        <div className="flex items-center">
          <button
            onClick={handleNewChat}
            className="text-gray-300 hover:text-white transition-colors duration-200 p-1 rounded-full hover:bg-gray-700/50 mr-2"
            title="New Chat"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          </button>
        </div>
      </div>

      {/* Messages area */}
      <div className="flex-grow p-4 overflow-y-auto">
        {currentMessages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-gray-500">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            <p className="text-center mb-2">Ask me anything about your financial data</p>
            <p className="text-center text-sm">I'll help you analyze and understand your data</p>
          </div>
        ) : (
          <>
            {currentMessages.map((msg, index) => (
              <ChatMessage key={index} message={msg} />
            ))}
            {isLoading && !isGeneratingReport && (
              <div className="flex justify-center my-4">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
              </div>
            )}
            {isGeneratingReport && (
              <div className="my-4">
                <LoadingReport isEmbedded={true} />
              </div>
            )}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* Chat input */}
      <ChatInput onSendMessage={handleSendMessage} isLoading={isLoading || isGeneratingReport} />
    </div>
  );
}

export default ChatPanel;
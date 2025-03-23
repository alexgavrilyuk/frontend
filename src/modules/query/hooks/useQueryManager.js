// src/modules/query/hooks/useQueryManager.js
import { useState, useCallback, useEffect } from 'react';
import { useChat } from '../../chat';
import { useDatasets } from '../../datasets';
import { apiService } from '../../../core/api';
import tableDataService from '../utils/tableDataService';

/**
 * Custom hook to manage query state, API interactions, and results
 * @param {Function} setHasInteracted - Function to update the interaction state in the parent component
 * @returns {Object} Query management state and functions
 */
const useQueryManager = (setHasInteracted) => {
  const [queryResults, setQueryResults] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [retries, setRetries] = useState(null);
  const [queryDatasetId, setQueryDatasetId] = useState(null);
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);

  const {
    currentMessages,
    addMessage,
    clearMessages
  } = useChat();

  const { datasets, setActiveDataset } = useDatasets();

  // Watch for new assistant messages with results
  useEffect(() => {
    if (currentMessages && currentMessages.length > 0) {
      const lastMessage = currentMessages[currentMessages.length - 1];

      if (lastMessage.role === 'assistant') {
        if (lastMessage.results) {
          setQueryResults(lastMessage.results);
          setError(null);
        } else if (lastMessage.error) {
          setError(lastMessage.error);
          setQueryResults(null);
        }

        if (lastMessage.retries !== undefined) {
          setRetries(lastMessage.retries);
        }

        // Store dataset ID from message if available
        if (lastMessage.datasetId) {
          setQueryDatasetId(lastMessage.datasetId);
        }
      }
    }
  }, [currentMessages]);

  // Listen for clear results events
  useEffect(() => {
    const handleClearResultsEvent = () => {
      console.log("Clearing query results from event");
      setQueryResults(null);
      setError(null);
      setRetries(null);
      setQueryDatasetId(null);
    };

    window.addEventListener('clearQueryResults', handleClearResultsEvent);

    return () => {
      window.removeEventListener('clearQueryResults', handleClearResultsEvent);
    };
  }, []);

  // Diagnostic logging for query results
  useEffect(() => {
    if (queryResults && queryResults.length > 0) {
      console.log("============= QUERY RESULTS DIAGNOSTIC =============");
      console.log("Type of queryResults:", typeof queryResults);
      console.log("Is Array:", Array.isArray(queryResults));
      console.log("Length:", queryResults.length);
      console.log("First row type:", typeof queryResults[0]);
      console.log("First row keys:", Object.keys(queryResults[0]));
      console.log("First row values:", Object.values(queryResults[0]));
      console.log("First row stringified:", JSON.stringify(queryResults[0]));
      console.log("Dataset ID:", queryDatasetId);
      console.log("=====================================================");
    }
  }, [queryResults, queryDatasetId]);

  // Sync with the chat context for results
  useEffect(() => {
    if (currentMessages && currentMessages.length > 0) {
      // If we have messages but no query results, check the last message for results
      if ((!queryResults || queryResults.length === 0) && !isLoading) {
        // Use tableDataService to extract results from messages
        const resultData = tableDataService.extractResultsFromMessages(currentMessages);

        if (resultData && resultData.results && resultData.results.length > 0) {
          console.log("Syncing query results from current messages:", resultData.results.length, "results found");
          setQueryResults(resultData.results);
          setError(resultData.error || null);
          setRetries(resultData.retries || 0);

          // Get dataset ID from messages if available
          const assistantMessages = currentMessages.filter(msg => msg.role === 'assistant' && msg.datasetId);
          if (assistantMessages.length > 0) {
            const lastDatasetId = assistantMessages[assistantMessages.length - 1].datasetId;
            if (lastDatasetId) {
              setQueryDatasetId(lastDatasetId);
            }
          }

          // Ensure we're in the right view mode
          if (setHasInteracted) {
            setHasInteracted(true);
            sessionStorage.setItem('hasInteracted', 'true');
          }
        }
      }
    }
  }, [currentMessages, queryResults, isLoading, setHasInteracted]);

  // Check if a query appears to be asking for a report
  const isReportQuery = useCallback((query) => {
    const reportKeywords = [
      'generate report',
      'create report',
      'show report',
      'make report',
      'produce report',
      'build report',
      'analyze',
      'comprehensive analysis',
      'detailed analysis',
      'in-depth analysis',
      'generate analysis',
      'summarize',
      'visualize',
      'dashboard',
      'insights',
      'trends'
    ];

    const lowerQuery = query.toLowerCase();
    return reportKeywords.some(keyword => lowerQuery.includes(keyword));
  }, []);

  // Generate a report based on a query
  const generateReport = useCallback(async (query, datasetId) => {
    if (!query.trim() || !datasetId) {
      setError("Query and dataset ID are required to generate a report");
      return null;
    }

    setIsGeneratingReport(true);
    setError(null);

    try {
      // Import the report service dynamically
      const reportServiceModule = await import('../../reports/services/reportService');
      const reportService = reportServiceModule.default;

      // Get conversation history for context
      const formattedHistory = apiService.formatConversationHistory(currentMessages);

      // Generate the report
      return await reportService.generateReport(query, datasetId, formattedHistory);
    } catch (err) {
      console.error("Error generating report:", err);
      setError(`Failed to generate report: ${err.message}`);
      return null;
    } finally {
      setIsGeneratingReport(false);
    }
  }, [currentMessages]);

  // Function to handle query submission

  const handleQuerySubmit = async (queryInput, datasetId) => {
    if (!queryInput.trim()) return;

    // Validate dataset ID
    if (!datasetId) {
      setError("Please select a dataset to query");
      return;
    }

    // Remember that user has interacted
    if (setHasInteracted) {
      setHasInteracted(true);
      sessionStorage.setItem('hasInteracted', 'true');
    }

    setIsLoading(true);
    setError(null);
    setQueryResults(null);
    setRetries(null);
    setQueryDatasetId(datasetId);

    try {
      // Set the selected dataset as active
      setActiveDataset(datasetId);

      // Get dataset info
      const dataset = datasets.find(d => d.id === datasetId) || { name: 'Dataset' };

      // First clear existing messages
      clearMessages();

      // Add the user's message
      await addMessage('user', queryInput, {
        query: queryInput,
        datasetId: datasetId
      });

      // Always treat as a report query
      console.log(`Generating report for query: "${queryInput}" on dataset: ${datasetId}`);

      const report = await generateReport(queryInput, datasetId);

      if (report) {
        // Add assistant message with the report
        await addMessage('assistant', "I've generated a report based on your query:", {
          report: report,
          datasetId: datasetId,
          datasetName: dataset.name
        });
      } else {
        // If report generation fails, fall back to regular query
        console.log("Report generation failed, falling back to regular query");
        const response = await apiService.sendQuery(queryInput, [], datasetId);

        // Process response and handle visualization data as a report if present
        if (response.visualizations && response.visualizations.length > 0) {
          handleRegularQueryResponse(response, datasetId, dataset);
        } else {
          // If no visualizations are available, create a basic report format from the results
          const basicReport = {
            title: queryInput,
            query: queryInput,
            createdAt: new Date().toISOString(),
            sections: [{
              title: "Query Results",
              content: response.aiResponse || "Here are the results of your query",
              tableData: response.results || []
            }],
            results: response.results || []
          };

          await addMessage('assistant', response.aiResponse || "Request Successful", {
            results: response.results || [],
            retries: response.retries || 0,
            datasetId: datasetId,
            datasetName: dataset.name,
            report: basicReport  // Always include a report
          });
        }
      }
    } catch (err) {
      console.error("Error handling query:", err);
      setError('Network error: ' + err.message);

      // Add error message to the chat
      await addMessage('assistant', `Error: ${err.message}`, {
        error: err.message,
        datasetId: datasetId
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Helper function to handle regular query responses

  const handleRegularQueryResponse = async (response, datasetId, dataset) => {
   console.log("API response:", response);

   // Process response
   if (response.error) {
     console.error("API returned error:", response.error);
     setError(response.error);
     setRetries(response.retries || 0);
     await addMessage('assistant', `Error: ${response.error}`, {
       error: response.error,
       datasetId: datasetId
     });
   } else {
     console.log("API returned results:", response.results ? response.results.length : 0, "rows");

     // Use tableDataService to normalize the results
     const normalizedResults = tableDataService.normalizeTableData(response.results || []);
     setQueryResults(normalizedResults);
     setRetries(response.retries || 0);

     // Check if the response contains visualizations (from backend)
     if (response.visualizations && response.visualizations.length > 0) {
       console.log("Visualizations found in response:", response.visualizations.length);

       // Create a report object with a unique ID that works with our ReportViewer component
       const reportData = {
         id: `report-${new Date().getTime()}`, // Add a unique ID to ensure the report is seen as new
         title: response.prompt || "Data Visualization",
         query: response.prompt,
         createdAt: new Date().toISOString(),
         visualizations: response.visualizations,
         narrative: response.narrative || "Analysis of your query results",
         insights: response.insights || [],
         // Include a section format compatible with ReportViewer
         sections: [
           {
             title: "Data Analysis",
             content: response.narrative || "Analysis of your query results",
             visualizations: response.visualizations
           }
         ],
         results: normalizedResults
       };

       // Set this as the active report
       console.log("Setting active report:", reportData);

       // Add the assistant's response with the report
       await addMessage('assistant', response.aiResponse || "I've visualized your data", {
         results: normalizedResults,
         retries: response.retries || 0,
         datasetId: datasetId,
         datasetName: dataset.name,
         report: reportData  // This is the key part - adding the report object
       });

       // Dispatch event to notify Dashboard that a report is available
       window.dispatchEvent(new CustomEvent('reportUpdate'));
     } else {
       // Create a basic report even for regular responses without visualizations
       const basicReport = {
         id: `report-${new Date().getTime()}`, // Add a unique ID
         title: response.prompt || "Query Results",
         query: response.prompt,
         createdAt: new Date().toISOString(),
         sections: [{
           title: "Query Results",
           content: response.aiResponse || "Here are the results of your query",
           tableData: normalizedResults
         }],
         results: normalizedResults
       };

       // Regular response without visualizations
       await addMessage('assistant', response.aiResponse || "Request Successful", {
         results: normalizedResults,
         retries: response.retries || 0,
         datasetId: datasetId,
         datasetName: dataset.name,
         report: basicReport  // Always include a report, even if basic
       });

       // Dispatch event to notify Dashboard that a report is available
       window.dispatchEvent(new CustomEvent('reportUpdate'));
     }

     // Dispatch an event to update other components
     const resultUpdateEvent = new CustomEvent('queryResultsUpdate', {
       detail: {
         results: normalizedResults,
         error: null,
         retries: response.retries || 0,
         datasetId: datasetId,
         datasetName: dataset.name,
         // Include report data in the event
         report: response.visualizations && response.visualizations.length > 0 ? {
           id: `report-${new Date().getTime()}`,
           visualizations: response.visualizations,
           narrative: response.narrative,
           insights: response.insights
         } : {
           id: `report-${new Date().getTime()}`,
           title: response.prompt || "Query Results",
           sections: [{
             title: "Query Results",
             content: response.aiResponse || "Here are the results of your query",
             tableData: normalizedResults
           }]
         }
       }
     });
     window.dispatchEvent(resultUpdateEvent);
   }
 };

  // Function for clearing results AND returning to single view
  const handleClearResults = () => {
    console.log("Clearing results from useQueryManager - returning to single view");

    // Clear local state
    setQueryResults(null);
    setError(null);
    setIsLoading(false);
    setRetries(null);
    setQueryDatasetId(null);

    // Reset interaction state to show single input view
    if (setHasInteracted) {
      setHasInteracted(false);
      sessionStorage.removeItem('hasInteracted');
    }

    // Clear messages
    clearMessages();

    // Force synchronization between components
    window.dispatchEvent(new CustomEvent('clearQueryResults'));

    console.log("Results cleared, returned to single view");
  };

  // Function for starting a new chat while keeping the split view
  const handleNewChat = () => {
    console.log("Starting new chat - keeping split view");

    // Clear local state
    setQueryResults(null);
    setError(null);
    setIsLoading(false);
    setRetries(null);
    setQueryDatasetId(null);

    // Clear messages but keep the split view
    clearMessages();

    // Force synchronization between components
    window.dispatchEvent(new CustomEvent('clearQueryResults'));

    console.log("New chat started, split view maintained");
  };

  // Set up listener for query result events from other components
  useEffect(() => {
    const handleResultsUpdate = (event) => {
      console.log("Received queryResultsUpdate event with data:", event.detail);

      if (event.detail?.results) {
        // Ensure the results are an array of objects with consistent structure
        if (Array.isArray(event.detail.results) && event.detail.results.length > 0) {
          // Check if the first result is an object
          if (typeof event.detail.results[0] === 'object' && event.detail.results[0] !== null) {
            console.log("Setting query results from event - using array of objects format");

            // Use tableDataService to normalize the results if needed
            const normalizedResults = tableDataService.normalizeTableData(event.detail.results);

            // We only want to update the state if the format is correct (array of objects)
            setQueryResults(normalizedResults);
            setError(event.detail.error || null);
            setRetries(event.detail.retries || 0);

            // Track the dataset ID if provided
            if (event.detail.datasetId) {
              setQueryDatasetId(event.detail.datasetId);

              // Set this dataset as active in context
              setActiveDataset(event.detail.datasetId);
            }

            // Always ensure we're in the split view when displaying results
            if (setHasInteracted) {
              setHasInteracted(true);
              sessionStorage.setItem('hasInteracted', 'true');
            }
          } else {
            console.error("Results from event are not in expected format - first item is not an object");
            setError("Data format error - please try again");
          }
        } else {
          console.error("Results from event are not a valid array");
          setError("Invalid data format - please try again");
        }
      }
    };

    window.addEventListener('queryResultsUpdate', handleResultsUpdate);

    return () => {
      window.removeEventListener('queryResultsUpdate', handleResultsUpdate);
    };
  }, [setHasInteracted, setActiveDataset]);

  return {
    queryResults,
    isLoading,
    isGeneratingReport,
    error,
    retries,
    queryDatasetId,
    handleQuerySubmit,
    handleClearResults,
    handleNewChat,
    setQueryResults,
    setError,
    setRetries,
    generateReport
  };
};

export default useQueryManager;
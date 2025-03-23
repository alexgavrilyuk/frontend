// src/modules/query/hooks/useQueryManager.js
import { useState, useCallback, useEffect } from 'react';
import { apiService } from '../../../core/api';
import tableDataService from '../utils/tableDataService';
import { useChat } from '../../chat';
import { reportService } from '../../reports';

/**
 * Custom hook for managing query state, execution, and results
 *
 * @param {Function} setHasInteracted - Function to update interaction state
 * @returns {Object} - Query state and operations
 */
const useQueryManager = (setHasInteracted) => {
  console.log("UPDATED useQueryManager.js loaded with isComplex handling");

  // State for query results and metadata
  const [queryResults, setQueryResults] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);
  const [error, setError] = useState(null);
  const [retries, setRetries] = useState(0);
  const [activeDataset, setActiveDataset] = useState(null);
  const [activeDatasetName, setActiveDatasetName] = useState(null);
  const [activeReport, setActiveReport] = useState(null);

  // Access chat context
  const {
    addMessage,
    clearMessages,
    currentMessages
  } = useChat();

  // Clear query results on new chat
  useEffect(() => {
    const handleClearQueryResults = () => {
      console.log("Clearing query results from event");
      setQueryResults(null);
      setError(null);
      setRetries(0);
      setActiveReport(null);
    };

    window.addEventListener('clearQueryResults', handleClearQueryResults);
    return () => {
      window.removeEventListener('clearQueryResults', handleClearQueryResults);
    };
  }, []);

  // Generate a report from API response
  const generateReportFromResponse = useCallback(async (response, userQuery, datasetId) => {
    try {
      console.log("Generating report for query:", userQuery, "on dataset:", datasetId);
      const report = await reportService.generateReport(userQuery, datasetId, []);
      return report;
    } catch (error) {
      console.log("Error generating report:", error);
      return null;
    }
  }, []);

  // Handle regular query response
  const handleRegularQueryResponse = useCallback((response, userQuery, datasetId, datasetName) => {
    // Process response data
    if (response && response.results) {
      // Set the results directly - don't use formatQueryResults
      setQueryResults(response.results);
      setRetries(response.retries || 0);
      setActiveDataset(datasetId);
      setActiveDatasetName(datasetName);

      // Check if response contains visualizations/insights for a report
      if (
        (response.visualizations && response.visualizations.length > 0) ||
        (response.insights && response.insights.length > 0)
      ) {
        console.log("Complex or visualization-rich response detected");

        // Create a report-like object from the response
        const report = createReportFromResponse(response, userQuery, datasetId);
        setActiveReport(report);

        // Add assistant message with report
        addMessage('assistant', "I've visualized your data", {
          results: response.results,
          retries: response.retries || 0,
          datasetId,
          datasetName,
          report
        });
      } else {
        // Add a simple message with just results (no report)
        addMessage('assistant', response.aiResponse || 'Here are the results', {
          results: response.results,
          retries: response.retries || 0,
          datasetId,
          datasetName
        });
      }
    } else {
      // Handle error or empty response
      setError('No results returned. Please try a different query.');
      addMessage('assistant', 'No results found. Please try a different query.');
    }

    // Update UI state
    setIsLoading(false);
    setIsGeneratingReport(false);

    // Trigger event with query results
    window.dispatchEvent(new CustomEvent('queryResultsUpdate', {
      detail: {
        results: response.results,
        error: null,
        retries: response.retries || 0,
        datasetId,
        datasetName,
        report: activeReport
      }
    }));
  }, [addMessage, setQueryResults, setRetries, setActiveDataset, setActiveDatasetName, setActiveReport]);

  // Handle complex query with isComplex flag
  const handleComplexQuery = useCallback((response, userQuery, datasetId) => {
    console.log("Handling complex query with isComplex flag");

    // Generate random id for the report
    const reportId = `report-${Date.now()}`;
    const timestamp = new Date().toISOString();

    // Extract data for top clients and therapy areas
    const hasClientViz = response.visualizations && response.visualizations.some(viz =>
      viz.data && viz.data[0] && viz.data[0].Client);
    const hasTherapyViz = response.visualizations && response.visualizations.some(viz =>
      viz.data && viz.data[0] && viz.data[0].TherapyArea);

    console.log("Identified visualizations:", { clientViz: hasClientViz, therapyViz: hasTherapyViz });

    // Separate insights by data type (if applicable)
    let clientInsights = [];
    let therapyAreaInsights = [];

    if (response.insights && response.insights.length > 0) {
      // Split insights - first half for clients, second half for therapy areas
      const midpoint = Math.floor(response.insights.length / 2);
      clientInsights = response.insights.slice(0, midpoint);
      therapyAreaInsights = response.insights.slice(midpoint);

      console.log("Insights separated:", {
        clientInsights: clientInsights.length,
        therapyAreaInsights: therapyAreaInsights.length
      });
    }

    // Create report sections
    const sections = [];

    // Create visualizations for each data type
    const visualizationsArray = [];

    // Add client bar chart if client data exists
    if (hasClientViz) {
      visualizationsArray.push({
        type: "bar",
        title: "Top Clients by Sales",
        data: response.results.filter(row => row.dataType === "client"),
        config: {
          xAxis: "Client",
          yAxis: "total_amount",
          sortBy: "total_amount",
          sortDirection: "desc"
        }
      });
    }

    // Add therapy area bar chart if therapy data exists
    if (hasTherapyViz) {
      visualizationsArray.push({
        type: "bar",
        title: "Top Therapy Areas by Sales",
        data: response.results.filter(row => row.dataType === "therapyArea"),
        config: {
          xAxis: "TherapyArea",
          yAxis: "total_amount",
          sortBy: "total_amount",
          sortDirection: "desc"
        }
      });
    }

    // Add original table visualizations
    if (response.visualizations && response.visualizations.length > 0) {
      response.visualizations.forEach(viz => {
        visualizationsArray.push(viz);
      });
    }

    // If narrative exists, create a single section with all visualizations
    if (response.narrative) {
      sections.push({
        title: "Analysis Results",
        content: response.narrative,
        visualizations: visualizationsArray,
        insights: response.insights || []
      });
    } else {
      // If no narrative, create separate sections for clients and therapy areas
      if (hasClientViz) {
        sections.push({
          title: "Top Clients by Sales",
          content: "Analysis of the top clients by total sales value.",
          visualizations: [
            // Create bar chart visualization for clients
            {
              type: "bar",
              title: "Top Clients by Sales",
              data: response.results.filter(row => row.dataType === "client"),
              config: {
                xAxis: "Client",
                yAxis: "total_amount",
                sortBy: "total_amount",
                sortDirection: "desc"
              }
            },
            // Add the original table visualization
            response.visualizations.find(viz => viz.data[0] && viz.data[0].Client)
          ].filter(Boolean),
          insights: clientInsights
        });
      }

      if (hasTherapyViz) {
        sections.push({
          title: "Top Therapy Areas by Sales",
          content: "Analysis of the top therapy areas by total sales value.",
          visualizations: [
            // Create bar chart visualization for therapy areas
            {
              type: "bar",
              title: "Top Therapy Areas by Sales",
              data: response.results.filter(row => row.dataType === "therapyArea"),
              config: {
                xAxis: "TherapyArea",
                yAxis: "total_amount",
                sortBy: "total_amount",
                sortDirection: "desc"
              }
            },
            // Add the original table visualization
            response.visualizations.find(viz => viz.data[0] && viz.data[0].TherapyArea)
          ].filter(Boolean),
          insights: therapyAreaInsights
        });
      }
    }

    // Create the complete report object
    const report = {
      id: reportId,
      title: response.prompt,
      query: response.prompt,
      createdAt: timestamp,
      visualizations: response.visualizations || [],
      narrative: response.narrative || "",
      insights: response.insights || [],
      sections: sections,
      results: response.results
    };

    console.log("Setting active report:", report);
    console.log("Report sections:", sections);

    // Set the report in state
    setActiveReport(report);
    return report;
  }, []);

  // Create a report-like object from a regular query response
  const createReportFromResponse = useCallback((response, userQuery, datasetId) => {
    if (response.isComplex) {
      console.log("Complex query detected:", response.isComplex);
      console.log("Visualizations:", response.visualizations);
      console.log("Insights:", response.insights);
      console.log("Narrative:", response.narrative);

      console.log("RAW API RESPONSE STRUCTURE:", {
        isComplex: !!response.isComplex,
        hasVisualizations: !!response.visualizations && response.visualizations.length > 0,
        visualizationsCount: response.visualizations ? response.visualizations.length : 0,
        hasInsights: !!response.insights && response.insights.length > 0,
        insightsCount: response.insights ? response.insights.length : 0,
        hasNarrative: !!response.narrative,
        narrativeLength: response.narrative ? response.narrative.length : 0
      });
    }

    // Handle different types of responses
    if (response.isComplex ||
        (response.visualizations && response.visualizations.length > 0) ||
        (response.insights && response.insights.length > 0)) {
      console.log("Creating report data for complex query:", {
        isComplex: !!response.isComplex,
        visualizationsCount: response.visualizations ? response.visualizations.length : 0,
        insightsCount: response.insights ? response.insights.length : 0
      });

      return handleComplexQuery(response, userQuery, datasetId);
    }

    // For simple responses, create a basic report
    return null;
  }, [handleComplexQuery]);

  // Submit a query to the backend
  const handleQuerySubmit = useCallback(async (query, datasetId, datasetName, options = {}) => {
    console.log("Processing query submission:", query, "for dataset:", datasetId);

    // Set initial state
    setIsLoading(true);
    setError(null);

    // Clear previous messages if starting a new chat
    if (options.clearChat) {
      clearMessages();
    }

    // Dispatch event to clear results
    window.dispatchEvent(new CustomEvent('clearQueryResults'));

    // Update UI
    if (setHasInteracted && typeof setHasInteracted === 'function') {
      setHasInteracted(true);
      if (typeof sessionStorage !== 'undefined') {
        sessionStorage.setItem('hasInteracted', 'true');
      }
    }

    // Add user message to chat
    addMessage('user', query, {
      query,
      datasetId
    });

    // Check if the query is complex or requesting a report
    const shouldGenerateReport = query.toLowerCase().includes('report') ||
                                query.toLowerCase().includes('chart') ||
                                query.toLowerCase().includes('graph') ||
                                query.toLowerCase().includes('visualize') ||
                                query.toLowerCase().includes('visualization');

    // Try to generate a report first if requested
    if (shouldGenerateReport) {
      try {
        console.log("Generating report for query:", query, "on dataset:", datasetId);
        setIsGeneratingReport(true);

        const report = await generateReportFromResponse(null, query, datasetId);

        if (report) {
          // Handle successful report generation
          setActiveReport(report);
          setIsGeneratingReport(false);
          setIsLoading(false);
          return;
        } else {
          // Fall back to regular query if report generation fails
          console.log("Report generation failed, falling back to regular query");
          setIsGeneratingReport(false);
        }
      } catch (error) {
        console.log("Error generating report:", error);
        setIsGeneratingReport(false);
      }
    }

    // Process as a regular query
    try {
      // Send query to API
      const response = await apiService.sendQuery(query, [], datasetId);

      // Log response for debugging
      console.log("FULL API RESPONSE:", response);

      // Handle the response
      handleRegularQueryResponse(response, query, datasetId, datasetName);
    } catch (error) {
      // Handle errors
      console.error("Query error:", error);
      setError(error.message || "An error occurred while processing your query.");
      setIsLoading(false);

      // Add error message to chat
      addMessage('assistant', `Error: ${error.message || "An error occurred while processing your query."}`);

      // Dispatch error event
      window.dispatchEvent(new CustomEvent('queryResultsUpdate', {
        detail: {
          results: null,
          error: error.message || "An error occurred while processing your query.",
          retries: 0,
          datasetId,
          datasetName
        }
      }));
    }
  }, [
    addMessage,
    clearMessages,
    handleRegularQueryResponse,
    generateReportFromResponse,
    setHasInteracted
  ]);

  // Clear query results
  const handleClearResults = useCallback(() => {
    setQueryResults(null);
    setError(null);
    setRetries(0);
    setActiveReport(null);

    // Dispatch event
    window.dispatchEvent(new CustomEvent('clearQueryResults'));
  }, []);

  // Handle new chat
  const handleNewChat = useCallback(() => {
    handleClearResults();
    clearMessages();

    // Reset UI state
    if (setHasInteracted && typeof setHasInteracted === 'function') {
      setHasInteracted(false);
      if (typeof sessionStorage !== 'undefined') {
        sessionStorage.removeItem('hasInteracted');
      }
    }
  }, [handleClearResults, clearMessages, setHasInteracted]);

  // Update listeners for query results
  useEffect(() => {
    const handleQueryResultsUpdate = (event) => {
      console.log("Received queryResultsUpdate event with data:", event.detail);

      if (event.detail.results) {
        console.log("Setting query results from event - using array of objects format");
        // Don't use formatQueryResults, just set the results directly
        setQueryResults(event.detail.results);
        setRetries(event.detail.retries || 0);
        setActiveDataset(event.detail.datasetId);
        setActiveDatasetName(event.detail.datasetName);
        if (event.detail.report) {
          setActiveReport(event.detail.report);
        }
      } else if (event.detail.error) {
        setError(event.detail.error);
      }
    };

    window.addEventListener('queryResultsUpdate', handleQueryResultsUpdate);
    return () => {
      window.removeEventListener('queryResultsUpdate', handleQueryResultsUpdate);
    };
  }, []);

  // Debug query results
  useEffect(() => {
    if (queryResults) {
      console.log("============= QUERY RESULTS DIAGNOSTIC =============");
      console.log("Type of queryResults:", typeof queryResults);
      console.log("Is Array:", Array.isArray(queryResults));
      console.log("Length:", Array.isArray(queryResults) ? queryResults.length : 'N/A');

      if (Array.isArray(queryResults) && queryResults.length > 0) {
        console.log("First row type:", typeof queryResults[0]);
        console.log("First row keys:", Object.keys(queryResults[0]));
        console.log("First row values:", Object.values(queryResults[0]));
        console.log("First row stringified:", JSON.stringify(queryResults[0]));
      }

      console.log("Dataset ID:", activeDataset);
      console.log("=====================================================");
    }
  }, [queryResults, activeDataset]);

  return {
    queryResults,
    isLoading,
    isGeneratingReport,
    error,
    retries,
    activeDataset,
    activeDatasetName,
    activeReport,
    handleQuerySubmit,
    handleClearResults,
    handleNewChat,
    setActiveReport
  };
};

export default useQueryManager;
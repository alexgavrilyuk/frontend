// src/modules/reports/hooks/useReport.js
import { useState, useCallback, useEffect } from 'react';
import reportService from '../services/reportService';
import { useAuth } from '../../auth';

/**
 * Custom hook for managing report data and operations
 *
 * @returns {Object} - Report state and functions
 */
const useReport = () => {
  const { currentUser } = useAuth();
  const [report, setReport] = useState(null);
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Clear report data on user change
  useEffect(() => {
    // Reset state when the user changes
    if (!currentUser) {
      setReport(null);
      setReports([]);
      setError(null);
    }
  }, [currentUser]);

  /**
   * Generate a new report
   *
   * @param {string} query - Natural language query for the report
   * @param {string} datasetId - ID of the dataset to analyze
   * @param {Array} conversationHistory - Previous messages for context
   * @param {string} reportType - Optional report type (defaults to 'standard')
   * @returns {Promise<Object>} - The generated report
   */
  const generateReport = useCallback(async (query, datasetId, conversationHistory, reportType) => {
    if (!currentUser) {
      setError('You must be logged in to generate reports');
      return null;
    }

    if (!query || !datasetId) {
      setError('Query and dataset ID are required');
      return null;
    }

    setLoading(true);
    setError(null);

    try {
      const newReport = await reportService.generateReport(
        query,
        datasetId,
        conversationHistory,
        reportType
      );

      setReport(newReport);
      return newReport;
    } catch (err) {
      setError(err.message || 'Failed to generate report');
      return null;
    } finally {
      setLoading(false);
    }
  }, [currentUser]);

  /**
   * Get a report by ID
   *
   * @param {string} reportId - ID of the report to retrieve
   * @returns {Promise<Object>} - The report data
   */
  const getReport = useCallback(async (reportId) => {
    if (!currentUser) {
      setError('You must be logged in to view reports');
      return null;
    }

    if (!reportId) {
      setError('Report ID is required');
      return null;
    }

    setLoading(true);
    setError(null);

    try {
      const fetchedReport = await reportService.getReport(reportId);
      setReport(fetchedReport);
      return fetchedReport;
    } catch (err) {
      setError(err.message || 'Failed to retrieve report');
      return null;
    } finally {
      setLoading(false);
    }
  }, [currentUser]);

  /**
   * Get all reports for the current user
   *
   * @returns {Promise<Array>} - Array of report objects
   */
  const getAllReports = useCallback(async () => {
    if (!currentUser) {
      setError('You must be logged in to view reports');
      return [];
    }

    setLoading(true);
    setError(null);

    try {
      const allReports = await reportService.getAllReports();
      setReports(allReports);
      return allReports;
    } catch (err) {
      setError(err.message || 'Failed to retrieve reports');
      return [];
    } finally {
      setLoading(false);
    }
  }, [currentUser]);

  /**
   * Delete a report
   *
   * @param {string} reportId - ID of the report to delete
   * @returns {Promise<boolean>} - Success status
   */
  const deleteReport = useCallback(async (reportId) => {
    if (!currentUser) {
      setError('You must be logged in to delete reports');
      return false;
    }

    if (!reportId) {
      setError('Report ID is required');
      return false;
    }

    setLoading(true);
    setError(null);

    try {
      await reportService.deleteReport(reportId);

      // Update the reports list if we have it
      if (reports.length > 0) {
        setReports(prevReports => prevReports.filter(r => r.id !== reportId));
      }

      // Clear the current report if it matches the deleted one
      if (report && report.id === reportId) {
        setReport(null);
      }

      return true;
    } catch (err) {
      setError(err.message || 'Failed to delete report');
      return false;
    } finally {
      setLoading(false);
    }
  }, [currentUser, report, reports]);

  return {
    report,
    reports,
    loading,
    error,
    generateReport,
    getReport,
    getAllReports,
    deleteReport,
    setReport
  };
};

export default useReport;
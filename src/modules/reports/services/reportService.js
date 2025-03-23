// src/modules/reports/services/reportService.js
import { get, post, del } from '../../../core/api';

/**
 * Service for handling report API operations
 */
const reportService = {
  /**
   * Generate a new report
   *
   * @param {string} query - Natural language query for the report
   * @param {string} datasetId - ID of the dataset to analyze
   * @param {Array} conversationHistory - Previous messages for context
   * @param {string} reportType - Optional report type (defaults to 'standard')
   * @returns {Promise<Object>} - The generated report
   */
  async generateReport(query, datasetId, conversationHistory = [], reportType = 'standard') {
    const requestBody = {
      query,
      datasetId,
      reportType,
      conversationHistory
    };

    console.log("Generating report with params:", {
      query,
      datasetId,
      historyLength: conversationHistory.length,
      reportType
    });

    try {
      const response = await post('reports', requestBody);

      // Check if the response has the expected structure
      if (!response.success) {
        throw new Error(response.error || 'Failed to generate report');
      }

      console.log("Report generated successfully:", response.reportId);
      return response.report;
    } catch (error) {
      console.error("Error generating report:", error);
      throw error;
    }
  },

  /**
   * Get a report by ID
   *
   * @param {string} reportId - ID of the report to retrieve
   * @returns {Promise<Object>} - The report data
   */
  async getReport(reportId) {
    try {
      const response = await get(`reports/${reportId}`);

      // Check if the response has the expected structure
      if (!response.success) {
        throw new Error(response.error || 'Failed to retrieve report');
      }

      return response.report;
    } catch (error) {
      console.error(`Error retrieving report ${reportId}:`, error);
      throw error;
    }
  },

  /**
   * Get all reports for the current user
   *
   * @returns {Promise<Array>} - Array of report objects
   */
  async getAllReports() {
    try {
      const response = await get('reports');

      // Check if the response has the expected structure
      if (!response.success) {
        throw new Error(response.error || 'Failed to retrieve reports');
      }

      return response.reports;
    } catch (error) {
      console.error("Error retrieving reports:", error);
      throw error;
    }
  },

  /**
   * Delete a report
   *
   * @param {string} reportId - ID of the report to delete
   * @returns {Promise<Object>} - Response message
   */
  async deleteReport(reportId) {
    try {
      const response = await del(`reports/${reportId}`);

      // Check if the response has the expected structure
      if (!response.success) {
        throw new Error(response.error || 'Failed to delete report');
      }

      return { success: true, message: response.message };
    } catch (error) {
      console.error(`Error deleting report ${reportId}:`, error);
      throw error;
    }
  },

  /**
   * Export a report to PDF (placeholder for future implementation)
   *
   * @param {string} reportId - ID of the report to export
   * @returns {Promise<Object>} - Response with export status
   */
  async exportReport(reportId) {
    // This is a placeholder for Phase 4 implementation
    console.log(`Export functionality for report ${reportId} will be implemented in Phase 4`);
    return {
      success: false,
      message: 'Export functionality will be available in a future update'
    };
  }
};

export default reportService;
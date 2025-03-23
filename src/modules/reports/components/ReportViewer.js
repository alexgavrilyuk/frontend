// src/modules/reports/components/ReportViewer.js
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Card, LoadingSpinner, StatusMessage } from '../../shared/components';
import ReportHeader from './ReportHeader';
import ReportSection from './ReportSection';
import LoadingReport from './LoadingReport';
import useReport from '../hooks/useReport';

/**
 * Main container component for displaying reports
 *
 * @param {Object} props
 * @param {Object} props.reportData - Complete report data object
 * @param {boolean} props.isEmbedded - Boolean to indicate if viewer is embedded in chat
 */
const ReportViewer = ({ reportData, isEmbedded = false }) => {
  const { reportId } = useParams();
  const [activeSection, setActiveSection] = useState(0);

  // For debugging
  console.log("UPDATED ReportViewer.js loaded with insights passing");

  // Use the custom hook to fetch and manage report data
  const {
    report,
    loading,
    error,
    generateReport,
    getReport
  } = useReport();

  // If report data is provided directly, use it, otherwise fetch it
  useEffect(() => {
    if (reportData) {
      // Use the provided report data
    } else if (reportId) {
      // Fetch the report data using the ID
      getReport(reportId);
    }
  }, [reportId, reportData, getReport]);

  // Handle error state
  if (error) {
    return (
      <Card variant="glass" className={`${isEmbedded ? 'mb-4' : 'max-w-5xl mx-auto mt-8 p-6'}`}>
        <StatusMessage type="error">{error}</StatusMessage>
      </Card>
    );
  }

  // Handle loading state
  if (loading || (!report && !reportData)) {
    return <LoadingReport isEmbedded={isEmbedded} />;
  }

  // Use the provided reportData or the fetched report
  const displayReport = reportData || report;

  // Check if we have report data
  if (!displayReport) {
    return (
      <Card variant="glass" className={`${isEmbedded ? 'mb-4' : 'max-w-5xl mx-auto mt-8 p-6'}`}>
        <StatusMessage type="error">Report not found</StatusMessage>
      </Card>
    );
  }

  // Log the report data for debugging
  console.log("ReportViewer processing report data:", displayReport);
  console.log("Report sections:", displayReport.sections);

  // Extract report sections (if they exist)
  const sections = displayReport.sections || [];
  const hasSections = sections.length > 0;

  // If no sections but we have a narrative, create a default section with it
  const reportSections = hasSections ? sections : [
    {
      title: "Report Results",
      content: displayReport.narrative || 'No narrative content available',
      visualizations: displayReport.visualizations || []
    }
  ];

  return (
    <div className={`report-viewer ${isEmbedded ? '' : 'max-w-5xl mx-auto mt-8'}`}>
      <Card
        variant="glass"
        className={`${isEmbedded ? 'mb-4' : 'p-0 overflow-hidden'}`}
        noPadding={true}
      >
        {/* Report Header */}
        <ReportHeader
          title={displayReport.title || 'Report'}
          timestamp={displayReport.createdAt}
          query={displayReport.query}
        />

        {/* Navigation for multiple sections */}
        {hasSections && sections.length > 1 && (
          <div className="flex overflow-x-auto border-b border-gray-700/50 bg-gray-800/50">
            {sections.map((section, index) => (
              <button
                key={index}
                className={`px-4 py-2 text-sm font-medium whitespace-nowrap
                  ${activeSection === index
                    ? 'text-blue-400 border-b-2 border-blue-400'
                    : 'text-gray-400 hover:text-white hover:bg-gray-700/30'
                  }`}
                onClick={() => setActiveSection(index)}
              >
                {section.title}
              </button>
            ))}
          </div>
        )}

        {/* Active Report Section */}
        <div className="p-6">
          <ReportSection
            title={reportSections[activeSection].title}
            content={reportSections[activeSection].content}
            visualizations={reportSections[activeSection].visualizations}
            insights={reportSections[activeSection].insights || []} // Pass insights properly
          />
        </div>
      </Card>
    </div>
  );
};

export default ReportViewer;
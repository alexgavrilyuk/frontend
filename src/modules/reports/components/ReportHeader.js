// src/modules/reports/components/ReportHeader.js
import React from 'react';

/**
 * Displays report title, timestamp, and the query that generated it
 *
 * @param {Object} props
 * @param {string} props.title - Report title
 * @param {string} props.timestamp - When the report was generated
 * @param {string} props.query - The natural language query that generated the report
 */
const ReportHeader = ({ title, timestamp, query }) => {
  // Format the timestamp if provided
  const formattedTime = timestamp ? new Date(timestamp).toLocaleString() : 'N/A';

  return (
    <div className="px-6 py-4 border-b border-gray-700/50 bg-gray-800/80">
      <div className="flex justify-between items-center mb-2">
        <h2 className="text-xl font-semibold bg-gradient-to-r from-blue-400 via-purple-400 to-cyan-400 text-transparent bg-clip-text">
          {title}
        </h2>
        <div className="text-sm text-gray-400">
          {formattedTime}
        </div>
      </div>

      {query && (
        <div className="mt-2">
          <div className="text-xs text-gray-500 mb-1">Generated from query:</div>
          <div className="text-sm bg-gray-700/50 p-2 rounded border border-gray-600/50 text-gray-300 italic">
            "{query}"
          </div>
        </div>
      )}
    </div>
  );
};

export default ReportHeader;
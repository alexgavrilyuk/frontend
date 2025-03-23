// src/modules/reports/components/LoadingReport.js
import React from 'react';
import { Card } from '../../shared/components';

/**
 * Loading state component for report generation
 *
 * @param {Object} props
 * @param {boolean} props.isEmbedded - Whether the component is embedded in chat
 */
const LoadingReport = ({ isEmbedded = false }) => {
  return (
    <div className={`loading-report ${isEmbedded ? '' : 'max-w-5xl mx-auto mt-8'}`}>
      <Card
        variant="glass"
        className={`${isEmbedded ? 'mb-4' : 'p-0 overflow-hidden'}`}
        noPadding={true}
      >
        {/* Report Header Skeleton */}
        <div className="px-6 py-4 border-b border-gray-700/50 bg-gray-800/80">
          <div className="flex justify-between items-center mb-2">
            {/* Title skeleton */}
            <div className="h-7 w-64 bg-gray-700/50 rounded animate-pulse"></div>
            {/* Timestamp skeleton */}
            <div className="h-5 w-36 bg-gray-700/50 rounded animate-pulse"></div>
          </div>

          {/* Query skeleton */}
          <div className="mt-2">
            <div className="h-4 w-40 bg-gray-700/50 rounded mb-1 animate-pulse"></div>
            <div className="h-8 bg-gray-700/50 rounded animate-pulse"></div>
          </div>
        </div>

        {/* Content Skeleton */}
        <div className="p-6">
          {/* Section title skeleton */}
          <div className="h-6 w-48 bg-gray-700/50 rounded mb-6 animate-pulse"></div>

          {/* KPI skeletons */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mb-6">
            {[...Array(3)].map((_, i) => (
              <div key={`kpi-${i}`} className="h-24 bg-gray-800/50 rounded border border-gray-700/30 p-4 animate-pulse">
                <div className="h-5 w-24 bg-gray-700/50 rounded mb-3"></div>
                <div className="h-8 w-16 bg-gray-700/50 rounded mx-auto"></div>
              </div>
            ))}
          </div>

          {/* Chart skeleton */}
          <div className="h-64 bg-gray-800/50 rounded border border-gray-700/30 p-4 mb-6 animate-pulse">
            <div className="h-5 w-36 bg-gray-700/50 rounded mb-4"></div>
            <div className="flex justify-center items-center h-44">
              <svg className="w-12 h-12 text-gray-700/50" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 12v-2a5 5 0 0110 0v2M5 10v-2a7 7 0 1114 0v2M19 12v6M5 12v6" />
              </svg>
            </div>
          </div>

          {/* Narrative text skeleton */}
          <div className="bg-gray-800/50 rounded border border-gray-700/30 p-4 mb-6">
            <div className="space-y-2 animate-pulse">
              <div className="h-5 bg-gray-700/50 rounded w-3/4"></div>
              <div className="h-5 bg-gray-700/50 rounded"></div>
              <div className="h-5 bg-gray-700/50 rounded w-5/6"></div>
              <div className="h-5 bg-gray-700/50 rounded w-2/3"></div>
              <div className="h-5 bg-gray-700/50 rounded w-4/5"></div>
            </div>
          </div>

          {/* Table skeleton */}
          <div className="bg-gray-800/50 rounded border border-gray-700/30 p-4">
            <div className="h-5 w-32 bg-gray-700/50 rounded mb-4 animate-pulse"></div>
            <div className="space-y-3 animate-pulse">
              {/* Table header */}
              <div className="h-8 bg-gray-700/50 rounded"></div>
              {/* Table rows */}
              {[...Array(5)].map((_, i) => (
                <div key={`row-${i}`} className="h-6 bg-gray-700/50 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </Card>

      {/* Loading indicator underneath */}
      <div className="flex justify-center items-center mt-4 mb-6">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
        <span className="ml-3 text-gray-400">Generating comprehensive report...</span>
      </div>
    </div>
  );
};

export default LoadingReport;
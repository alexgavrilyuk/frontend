// src/modules/query/components/ResultsTable.js
import React, { useEffect, useRef } from 'react';
import { StatusMessage } from '../../shared/components';
import tableDataService from '../utils/tableDataService';

function ResultsTable({ queryResults, error, retries }) {
  const tableRef = useRef(null);

  useEffect(() => {
    // Only run if table exists and has results
    if (!tableRef.current || !queryResults || !queryResults.length) return;

    const table = tableRef.current;
    const headers = table.querySelectorAll('th');

    // Add resize handles to all headers
    headers.forEach(th => {
      // Add resizable class to the header
      th.classList.add('resizable-th');

      // Create a resize handle element
      const handle = document.createElement('div');
      handle.classList.add('resize-handle');
      th.appendChild(handle);

      let startX, startWidth;

      // Add event listeners for resizing
      handle.addEventListener('mousedown', (e) => {
        // Prevent text selection during resize
        e.preventDefault();

        startX = e.pageX;
        startWidth = th.offsetWidth;
        handle.classList.add('active');

        // Add drag and end events
        document.addEventListener('mousemove', onDrag);
        document.addEventListener('mouseup', onEnd);
      });

      // Handle dragging
      function onDrag(e) {
        const width = startWidth + (e.pageX - startX);
        if (width > 20) { // Very small minimum just to keep the column visible
          th.style.width = `${width}px`;
          th.style.minWidth = `${width}px`;
        }
      }

      // Handle end of drag
      function onEnd() {
        handle.classList.remove('active');
        document.removeEventListener('mousemove', onDrag);
        document.removeEventListener('mouseup', onEnd);
      }
    });

    // Clean up event listeners on unmount
    return () => {
      headers.forEach(th => {
        const handle = th.querySelector('.resize-handle');
        if (handle) {
          handle.remove();
        }
        th.classList.remove('resizable-th');
      });
    };
  }, [queryResults]);

  // If we have an error, don't render the table
  if (error) {
    return (
      <StatusMessage type="error" animate={true}>
        {error}
        {retries > 0 && (
          <p className="text-orange-400 mt-2">
            The AI needed {retries} {retries === 1 ? 'retry' : 'retries'} to generate a query.
          </p>
        )}
      </StatusMessage>
    );
  }

  // If no results, show empty state
  if (!queryResults || queryResults.length === 0) {
    return (
      <div className="text-center py-12 animate-fade-in">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto text-gray-500 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <p className="text-gray-400 text-lg">No results found for your query.</p>
        <p className="text-gray-500 mt-2">Try using different keywords or filters.</p>
      </div>
    );
  }

  return (
    <div className="table-container overflow-x-auto bg-gray-800/80 rounded-lg border border-gray-700/50 shadow-xl backdrop-blur-sm transition-all duration-500 transform animate-fade-in-up">
      <table ref={tableRef} className="min-w-full divide-y divide-gray-700/70">
        <thead>
          <tr className="bg-gray-700/50">
            {Object.keys(queryResults[0]).map((key) => (
              <th
                key={key}
                className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider"
              >
                {key}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-700/50">
          {queryResults.map((row, rowIndex) => {
            const headers = Object.keys(queryResults[0]);

            return (
              <tr
                key={rowIndex}
                className={`${rowIndex % 2 === 0 ? 'bg-gray-800/40' : 'bg-gray-800/80'} hover:bg-gray-700/50 transition-colors duration-150`}
              >
                {headers.map((header, cellIndex) => {
                  // Get the raw value from the row
                  const value = row[header];
                  // Format cell value based on header name and content
                  const displayValue = tableDataService.formatCellValue(value, header);

                  return (
                    <td key={`${rowIndex}-${cellIndex}`} className="px-6 py-4 whitespace-nowrap text-sm">
                      {displayValue}
                    </td>
                  );
                })}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

export default ResultsTable;
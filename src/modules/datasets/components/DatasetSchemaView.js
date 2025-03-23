// src/modules/datasets/components/DatasetSchemaView.js
import React, { useState, useRef, useEffect } from 'react';
import { Card, Button, LoadingSpinner, StatusMessage } from '../../shared/components';
import datasetService from '../services/datasetService';

/**
 * Component to display and edit a dataset's schema
 *
 * @param {Object} props
 * @param {Object} props.schema - The schema data object with columns and types
 * @param {string} props.datasetId - The ID of the dataset
 * @param {Function} props.onSchemaUpdate - Callback function when schema is updated
 */
function DatasetSchemaView({ schema, datasetId, onSchemaUpdate }) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedSchema, setEditedSchema] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState(null);
  const descriptionInputRefs = useRef({});

  console.log("DatasetSchemaView: Received schema data:", schema);

  // Initialize edited schema when entering edit mode
  const handleEnterEditMode = () => {
    setEditedSchema({
      ...schema,
      columns: schema.columns.map(col => ({ ...col }))
    });
    setIsEditing(true);
    setError(null);
  };

  // Cancel editing and revert changes
  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditedSchema(null);
    setError(null);
  };

  // Handle column type change
  const handleTypeChange = (columnIndex, newType) => {
    setEditedSchema(prev => {
      const updatedColumns = [...prev.columns];
      updatedColumns[columnIndex] = {
        ...updatedColumns[columnIndex],
        type: newType
      };
      return {
        ...prev,
        columns: updatedColumns
      };
    });
  };

  // Handle column description change
  const handleDescriptionChange = (columnIndex, newDescription) => {
    setEditedSchema(prev => {
      const updatedColumns = [...prev.columns];
      updatedColumns[columnIndex] = {
        ...updatedColumns[columnIndex],
        description: newDescription
      };
      return {
        ...prev,
        columns: updatedColumns
      };
    });
  };

  // Save schema changes
  const handleSaveChanges = async () => {
    if (!editedSchema || !datasetId) return;

    try {
      setIsSaving(true);
      setError(null);

      // Call the API to update the schema
      const updatedSchema = await datasetService.updateSchema(datasetId, editedSchema);

      // Exit edit mode
      setIsEditing(false);
      setEditedSchema(null);

      // Notify parent component of the update
      if (typeof onSchemaUpdate === 'function') {
        onSchemaUpdate(updatedSchema);
      }
    } catch (err) {
      console.error("Error saving schema changes:", err);
      setError(err.message || "Failed to save schema changes");
    } finally {
      setIsSaving(false);
    }
  };

  // Get column type icon
  const getTypeIcon = (type) => {
    switch (type.toLowerCase()) {
      case 'string':
      case 'text':
      case 'varchar':
      case 'char':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        );
      case 'integer':
      case 'int':
      case 'smallint':
      case 'bigint':
      case 'number':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-green-400" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
          </svg>
        );
      case 'decimal':
      case 'numeric':
      case 'float':
      case 'double':
      case 'real':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-cyan-400" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M5 2a1 1 0 011 1v1h1a1 1 0 010 2H6v1a1 1 0 01-2 0V6H3a1 1 0 010-2h1V3a1 1 0 011-1zm0 10a1 1 0 011 1v1h1a1 1 0 110 2H6v1a1 1 0 11-2 0v-1H3a1 1 0 110-2h1v-1a1 1 0 011-1zM12 2a1 1 0 01.967.744L14.146 7.2 17.5 9.134a1 1 0 010 1.732l-3.354 1.935-1.18 4.455a1 1 0 01-1.933 0L9.854 12.8 6.5 10.866a1 1 0 010-1.732l3.354-1.935 1.18-4.455A1 1 0 0112 2z" clipRule="evenodd" />
          </svg>
        );
      case 'date':
      case 'time':
      case 'timestamp':
      case 'datetime':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-purple-400" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
          </svg>
        );
      case 'boolean':
      case 'bool':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
        );
      default:
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
          </svg>
        );
    }
  };

  if (!schema || !schema.columns || schema.columns.length === 0) {
    return (
      <div className="text-center py-12">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto text-gray-600 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <p className="text-gray-400 text-lg">No schema information available.</p>
        <p className="text-gray-500 mt-2">The schema could not be loaded or has not been generated yet.</p>

        <div className="mt-6 p-4 bg-gray-800/40 rounded-lg text-left max-w-lg mx-auto">
          <h4 className="text-blue-400 font-medium mb-2">Troubleshooting</h4>
          <ul className="list-disc pl-5 text-gray-400 space-y-1 text-sm">
            <li>Backend may be still processing this dataset</li>
            <li>Schema extraction might not be supported for this file format</li>
            <li>Check browser console for detailed error messages</li>
          </ul>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center">
          <h4 className="text-lg font-medium text-white">Schema Information</h4>
          <span className="ml-2 bg-purple-900/20 text-purple-400 text-xs px-2 py-1 rounded-full">
            {schema.columns.length} columns
          </span>
        </div>

        {/* Edit/Save/Cancel buttons */}
        <div className="flex space-x-2">
          {isEditing ? (
            <>
              <Button
                variant="secondary"
                color="gray"
                size="sm"
                onClick={handleCancelEdit}
                disabled={isSaving}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                color="purple"
                size="sm"
                onClick={handleSaveChanges}
                isLoading={isSaving}
              >
                Save Changes
              </Button>
            </>
          ) : (
            <Button
              variant="secondary"
              color="blue"
              size="sm"
              onClick={handleEnterEditMode}
              leftIcon={
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                </svg>
              }
            >
              Edit Schema
            </Button>
          )}
        </div>
      </div>

      {/* Error message */}
      {error && (
        <StatusMessage type="error" className="mb-4">
          {error}
        </StatusMessage>
      )}

      {/* Schema table */}
      <Card variant="default" noPadding>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-700">
            <thead>
              <tr className="bg-gray-800/50">
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Column Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Description
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700/50">
              {(isEditing ? editedSchema.columns : schema.columns).map((column, index) => (
                <tr key={index} className={index % 2 === 0 ? 'bg-gray-800/40' : 'bg-gray-800/20'}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-white flex items-center">
                    {column.primaryKey && (
                      <span className="mr-2 text-yellow-500" title="Primary Key">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                        </svg>
                      </span>
                    )}
                    {column.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                    {isEditing && !column.primaryKey ? (
                      <select
                        value={column.type}
                        onChange={(e) => handleTypeChange(index, e.target.value)}
                        className="bg-gray-700/50 border border-gray-600 text-white rounded-lg px-2 py-1"
                      >
                        <option value="string">string</option>
                        <option value="integer">integer</option>
                        <option value="float">float</option>
                        <option value="date">date</option>
                        <option value="boolean">boolean</option>
                      </select>
                    ) : (
                      <div className="flex items-center">
                        <span className="mr-2">{getTypeIcon(column.type)}</span>
                        {column.type}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-300">
                    {isEditing ? (
                      <input
                        type="text"
                        value={column.description || ''}
                        onChange={(e) => handleDescriptionChange(index, e.target.value)}
                        placeholder="Add description..."
                        className="w-full bg-gray-700/50 border border-gray-600 text-white rounded-lg px-2 py-1"
                      />
                    ) : (
                      column.description || '-'
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

export default DatasetSchemaView;
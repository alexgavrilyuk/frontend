# Frontend to Backend Integration Guide

## Overview

This document provides a comprehensive guide on how the frontend application interacts with the backend services. It is intended for the backend development team to understand the expected behavior, API endpoints, data structures, and integration flows between the frontend and backend components.

## Table of Contents

1. [System Architecture](#system-architecture)
2. [Authentication](#authentication)
3. [API Endpoints](#api-endpoints)
   - [Query API](#query-api)
   - [Dataset Management API](#dataset-management-api)
   - [Schema Management API](#schema-management-api) <!-- New section -->
   - [Chunked Upload API](#chunked-upload-api)
4. [Data Structures](#data-structures)
5. [Integration Flows](#integration-flows)
6. [Error Handling](#error-handling)
7. [Rate Limiting](#rate-limiting)
8. [Performance Expectations](#performance-expectations)
9. [Best Practices](#best-practices)
10. [Code Examples](#code-examples)
11. [FAQ](#faq)

## System Architecture

The backend system provides the following components that the frontend interacts with:

```
Frontend <-> Backend API <-> Database (PostgreSQL)
                         <-> Google Cloud Storage
                         <-> BigQuery
                         <-> OpenAI API
```

### Key Components

- **Authentication**: Firebase Authentication for secure user access
- **File Storage**: Google Cloud Storage for raw data files
- **Database**: PostgreSQL for metadata and schema storage
- **Query Engine**: BigQuery for high-performance data queries
- **AI Integration**: OpenAI for natural language processing

### Frontend Architecture

The frontend application uses a modular architecture where API interactions are handled through dedicated service modules:

- API calls are centralized in service modules and core/api services
- Authentication is managed through Firebase in the auth module
- Dataset operations are encapsulated in the datasets module
- Error handling follows predictable patterns defined in shared utilities

This architecture doesn't affect the API contracts, but helps backend developers understand how the frontend is structured.

## Authentication

### Authentication Mechanism

The frontend uses Firebase Authentication for user management and JWT tokens for API authentication.

- **Authentication Flow**:
  1. User logs in via the frontend using email/password or Google authentication
  2. Firebase authentication returns a user object and token
  3. Frontend includes this token in the `Authorization` header for all API requests
  4. Backend validates the token before processing any request

- **Authentication Header Format**:
  ```
  Authorization: Bearer <firebase-jwt-token>
  ```
- **IMPORTANT**: Every API endpoint (including query endpoints and dataset operations) requires the Firebase authentication token. Missing this token will result in a "No authentication token found in request" error with a 401 Unauthorized response.

- **Token Retrieval Example**:
  ```javascript
  // Example of getting a Firebase token in a React application
  import { getAuth } from "firebase/auth";

  const auth = getAuth();
  const user = auth.currentUser;

  if (user) {
    const token = await user.getIdToken(true); // Force refresh to ensure latest token
    // Use this token in your API requests
  }
  ```

- **Token Refresh**:
  - Frontend automatically refreshes tokens using Firebase's built-in refresh mechanism
  - If backend receives an expired token, it should return a 401 Unauthorized response
  - Tokens typically expire after 1 hour

### User Session Management

- The frontend maintains the user's authenticated state using Firebase auth state
- Backend should not maintain session state but validate the JWT token on each request
- If a user logs out, all subsequent requests will not include the auth token

## API Endpoints

### Query API

#### Natural Language Query

This is the primary endpoint for processing natural language queries against the user's data.

- **Endpoint**: `POST /api/query`
- **Description**: Processes natural language queries against user data
- **Auth Required**: Yes
- **Rate Limit**: 100 requests per 15 minutes

- **Request Format**:
  ```json
  {
    "userQuery": "String - The natural language query from the user",
    "datasetId": "String - The ID of the dataset to query"
  }
  ```

- **Response Format**:
  ```json
  {
    "results": [
      {
        // Array of objects with query results
        // Structure varies based on the query
      }
    ],
    "prompt": "String - The original query",
    "aiResponse": "String - Response message",
    "retries": Number, // Number of attempts needed to generate SQL
    "error": "String - Error message if any",
    "columnOrder": ["col1", "col2"] // Optional column order for display
  }
  ```

- **Error Codes**:
  - `400` - Bad request (invalid parameters)
  - `401` - Unauthorized
  - `500` - Server error

- **Notes**:
  - The service automatically retries failed queries up to 3 times
  - Only SELECT statements are allowed for security
  - By default, queries the `project_sales` table

#### Dataset-Specific Query

- **Endpoint**: `POST /api/datasets/:datasetId/query`
- **Description**: Queries a specific dataset
- **Auth Required**: Yes
- **Rate Limit**: 100 requests per 15 minutes

- **Request Format**:
  ```json
  {
    "query": "String - The natural language query from the user"
  }
  ```

- **Response Format**:
  ```json
  {
    "success": true,
    "query": {
      "natural": "String - Original natural language query",
      "sql": "String - Generated SQL query",
      "fullSql": "String - Complete SQL with table references"
    },
    "results": [
      // Array of objects with query results
    ],
    "metadata": {
      "totalRows": Number,
      "datasetName": "String",
      "datasetId": "String"
    }
  }
  ```

- **Notes**:
  - The dataset must have status "available" to be queried
  - Results are paginated if large (max 1000 rows returned)

### Dataset Management API

#### Get All Datasets

- **Endpoint**: `GET /api/datasets`
- **Description**: Retrieves all datasets for the authenticated user
- **Auth Required**: Yes

- **Query Parameters**:
  - `page`: (Optional) Page number for pagination (default: 1)
  - `limit`: (Optional) Number of items per page (default: 20, max: 100)

- **Response Format**:
  ```json
  {
    "success": true,
    "datasets": [
      {
        "id": "uuid-string",
        "name": "String - Dataset name",
        "description": "String - Dataset description",
        "dataType": "csv" | "excel",
        "status": "available" | "processing" | "error",
        "rowCount": Number,
        "columnCount": Number,
        "fileSizeMB": "String - Size in MB",
        "createdAt": "ISO Date String",
        "updatedAt": "ISO Date String",
        "previewAvailable": Boolean,
        "context": "String - General dataset description",
        "purpose": "String - Dataset purpose",
        "source": "String - Data source",
        "notes": "String - Additional notes"
      }
    ]
  }
  ```

- **Notes**:
  - Datasets are sorted by `updatedAt` in descending order (newest first)

#### Get Single Dataset

- **Endpoint**: `GET /api/datasets/:datasetId`
- **Description**: Retrieves details for a specific dataset
- **Auth Required**: Yes

- **Response Format**:
  ```json
  {
    "success": true,
    "dataset": {
      "id": "uuid-string",
      "name": "Dataset Name",
      "description": "Dataset Description",
      "dataType": "csv",
      "status": "available",
      "rowCount": 5000,
      "columnCount": 10,
      "fileSizeMB": "2.50",
      "createdAt": "2025-03-13T12:00:00Z",
      "updatedAt": "2025-03-13T12:01:00Z",
      "previewAvailable": true,
      "context": "General dataset description",
      "purpose": "Dataset purpose",
      "source": "Data source",
      "notes": "Additional notes"
    }
  }
  ```

#### Upload Dataset

- **Endpoint**: `POST /api/datasets/upload`
- **Description**: Uploads a new dataset file
- **Content-Type**: `multipart/form-data`
- **Auth Required**: Yes
- **Rate Limit**: 10 requests per 15 minutes

- **Request Format**:
  - Form Fields:
    - `file`: The CSV or Excel file (required)
    - `name`: Name of the dataset (required)
    - `description`: Description of the dataset (optional)
    - `dataType`: Type of data file - "csv" or "excel" (required)

- **Response Format**:
  ```json
  {
    "success": true,
    "message": "Dataset uploaded and processed successfully",
    "datasetId": "uuid-string",
    "dataset": {
      "id": "uuid-string",
      "name": "Dataset Name",
      "description": "Dataset Description",
      "dataType": "csv",
      "status": "available",
      "rowCount": 1000,
      "columnCount": 5,
      "createdAt": "2025-03-13T12:00:00Z",
      "updatedAt": "2025-03-13T12:01:00Z"
    }
  }
  ```

- **Notes**:
  - File size limit is 100MB
  - Supported file types: CSV (.csv), Excel (.xls, .xlsx)
  - Status values: "processing", "available", "error"

#### Update Dataset

- **Endpoint**: `PATCH /api/datasets/:datasetId`
- **Description**: Updates dataset metadata
- **Auth Required**: Yes

- **Request Format**:
  ```json
  {
    "name": "Updated Dataset Name",
    "description": "Updated description"
  }
  ```

- **Response Format**:
  ```json
  {
    "success": true,
    "message": "Dataset updated successfully",
    "dataset": {
      "id": "uuid-string",
      "name": "Updated Dataset Name",
      "description": "Updated description",
      "dataType": "csv",
      "status": "available",
      "rowCount": 5000,
      "columnCount": 10,
      "fileSizeMB": "2.50",
      "createdAt": "2025-03-13T12:00:00Z",
      "updatedAt": "2025-03-13T12:30:00Z",
      "previewAvailable": true
    }
  }
  ```

- **Notes**:
  - Only the name and description can be updated
  - The file itself, dataType, and other properties cannot be changed after creation

#### Delete Dataset

- **Endpoint**: `DELETE /api/datasets/:datasetId`
- **Description**: Deletes a dataset
- **Auth Required**: Yes

- **Response Format**:
  ```json
  {
    "success": true,
    "message": "Dataset deleted successfully"
  }
  ```

- **Notes**:
  - This operation deletes:
    - The dataset metadata from the database
    - All associated files from Google Cloud Storage
    - The corresponding BigQuery table
  - This operation is permanent and cannot be undone

### Schema Management API

#### Get Dataset Schema

- **Endpoint**: `GET /api/datasets/:datasetId/schema`
- **Description**: Retrieves the schema for a specific dataset
- **Auth Required**: Yes

- **Response Format**:
  ```json
  {
    "success": true,
    "schema": {
      "columns": [
        {
          "name": "column_name",
          "type": "string" | "integer" | "float" | "date" | "boolean",
          "description": "column_description"
        }
      ]
    }
  }
  ```

- **Notes**:
  - Column types include: "string", "integer", "float", "date", "boolean"
  - This endpoint is useful for displaying metadata about the dataset structure
  - The frontend no longer uses the nullable and primaryKey fields (but they can still be included for backward compatibility)

#### Update Dataset Schema

- **Endpoint**: `PATCH /api/datasets/:datasetId/schema`
- **Description**: Updates column types and descriptions in the schema
- **Auth Required**: Yes
- **Content-Type**: `application/json`

- **Request Format**:
  ```json
  {
    "columns": [
      {
        "name": "column_name",
        "type": "string" | "integer" | "float" | "date" | "boolean",
        "description": "updated_description"
      }
    ]
  }
  ```

- **Response Format**:
  ```json
  {
    "success": true,
    "message": "Schema updated successfully",
    "schema": {
      "columns": [
        // Updated columns array
      ]
    }
  }
  ```

- **Error Response (Type Conversion Issues)**:
  ```json
  {
    "success": false,
    "error": "Failed to update BigQuery schema: Field column_name has changed type from TYPE_A to TYPE_B"
  }
  ```

- **Notes**:
  - Type conversions in BigQuery are subject to limitations (not all type conversions are supported)
  - The backend should validate requested type changes before attempting to apply them
  - Changes to column descriptions should always succeed even if type changes fail
  - This endpoint triggers updates to both PostgreSQL metadata and BigQuery schema

#### Update Dataset Context

- **Endpoint**: `PATCH /api/datasets/:datasetId/context`
- **Description**: Updates dataset context information to enhance AI understanding
- **Auth Required**: Yes
- **Content-Type**: `application/json`

- **Request Format**:
  ```json
  {
    "context": "General description of the dataset",
    "purpose": "What the dataset is used for",
    "source": "Where the data comes from",
    "notes": "Additional information"
  }
  ```

- **Response Format**:
  ```json
  {
    "success": true,
    "message": "Context updated successfully",
    "dataset": {
      "id": "uuid-string",
      "context": "General description of the dataset",
      "purpose": "What the dataset is used for",
      "source": "Where the data comes from",
      "notes": "Additional information"
      // Other dataset fields
    }
  }
  ```

- **Notes**:
  - All fields are optional - the frontend may send only the fields being updated
  - These context fields should be used to enhance natural language to SQL conversion
  - Empty strings ("") are valid values and should clear previous content

#### Get Dataset Preview

- **Endpoint**: `GET /api/datasets/:datasetId/preview`
- **Description**: Retrieves sample rows from the dataset
- **Auth Required**: Yes

- **Query Parameters**:
  - `limit`: (Optional) Maximum number of rows to return (default: 100, max: 1000)

- **Response Format**:
  ```json
  {
    "success": true,
    "preview": [
      {
        "column1": "value1",
        "column2": 123,
        "column3": true
        // Values depend on the actual dataset columns
      }
    ]
  }
  ```

- **Notes**:
  - The preview should return actual data with proper types (numbers as numbers, etc.)
  - The order of rows should be consistent across multiple calls
  - For performance reasons, limit the number of rows returned
  - The frontend will handle formatting and display

### Chunked Upload API

For files larger than 50MB, the frontend uses a chunked upload approach.

#### Step 1: Initialize Upload

- **Endpoint**: `POST /api/chunked-upload/init`
- **Description**: Initializes a chunked upload process
- **Auth Required**: Yes
- **Rate Limit**: 10 requests per 15 minutes

- **Request Format**:
  ```json
  {
    "name": "Dataset Name",
    "description": "Dataset Description",
    "dataType": "csv",
    "totalChunks": 5,
    "totalSize": 104857600
  }
  ```

- **Response Format**:
  ```json
  {
    "success": true,
    "message": "Chunked upload initialized",
    "uploadId": "uuid-string",
    "datasetId": "uuid-string"
  }
  ```

- **Notes**:
  - Maximum file size is 1GB
  - Save both the `uploadId` and `datasetId` for subsequent requests

#### Step 2: Upload Each Chunk

- **Endpoint**: `POST /api/chunked-upload/:uploadId/chunk`
- **Description**: Uploads an individual chunk of the file
- **Content-Type**: `multipart/form-data`
- **Auth Required**: Yes

- **URL Parameters**:
  - `uploadId`: The upload ID from initialization

- **Request Format**:
  - Form Fields:
    - `chunk`: The file chunk (required)
    - `chunkIndex`: Index of the chunk (required, 0-based)

- **Response Format**:
  ```json
  {
    "success": true,
    "message": "Chunk 0 uploaded successfully",
    "uploadId": "uuid-string",
    "receivedChunks": 1,
    "totalChunks": 5
  }
  ```

- **Notes**:
  - Chunks can be uploaded in any order
  - When all chunks are received, processing begins automatically

#### Step 3: Check Upload Status

- **Endpoint**: `GET /api/chunked-upload/:uploadId/status`
- **Description**: Checks the status of a chunked upload
- **Auth Required**: Yes

- **URL Parameters**:
  - `uploadId`: The upload ID from initialization

- **Response Format**:
  ```json
  {
    "success": true,
    "uploadId": "uuid-string",
    "datasetId": "uuid-string",
    "receivedChunks": 5,
    "totalChunks": 5,
    "completed": true,
    "status": "available" | "processing" | "error",
    "progress": 100
  }
  ```

## Data Structures

### Message Structure

```json
{
  "role": "user" | "assistant",
  "content": "String - The message text",
  "timestamp": "ISO Date String"
}
```

### Dataset Object

```json
{
  "id": "uuid-string",
  "name": "Dataset Name",
  "description": "Dataset Description",
  "dataType": "csv" | "excel",
  "status": "available" | "processing" | "error",
  "rowCount": 5000,
  "columnCount": 10,
  "fileSizeMB": "2.50",
  "createdAt": "ISO Date String",
  "updatedAt": "ISO Date String",
  "previewAvailable": true,
  "errorMessage": "Error message if status is error",
  "context": "General dataset description",
  "purpose": "What the dataset is used for",
  "source": "Where the data comes from",
  "notes": "Additional information"
}
```

### Column Structure

```json
{
  "name": "String", // Column name
  "type": "string" | "integer" | "float" | "date" | "boolean", // Data type
  "description": "String" // Optional description
}
```

### Query Results Structure

The structure of query results depends on the query, but generally follows this pattern:

```json
[
  {
    "column1": "value1",
    "column2": "value2",
    "column3": 123,
    "column4": true
  },
  {
    "column1": "value1a",
    "column2": "value2a",
    "column3": 456,
    "column4": false
  }
]
```

## Integration Flows

### Natural Language Query Flow

1. **User Enters Query**:
   - Frontend sends a `POST` request to `/api/query` with the user's query and dataset ID
   - Backend processes the query, converts to SQL, and executes it
   - Backend returns query results
   - Frontend displays results in a table format

### Dataset Upload Flow

1. **Standard Upload** (Files < 50MB):
   - Frontend sends file with metadata to `/api/datasets/upload`
   - Backend processes the file and returns dataset details
   - Frontend displays the new dataset in the list

2. **Chunked Upload** (Files >= 50MB):
   - Frontend initializes upload at `/api/chunked-upload/init`
   - Frontend splits file into chunks and uploads each chunk
   - Frontend polls status endpoint until upload is complete
   - Backend processes the complete file and makes it available
   - Frontend displays the new dataset in the list

### Schema Management Flow

1. **Viewing Schema**:
   - Frontend fetches schema from `/api/datasets/:datasetId/schema`
   - Backend returns column information with types and descriptions
   - Frontend displays schema information in a structured format

2. **Updating Schema**:
   - User edits column types and descriptions in the frontend
   - Frontend sends updates to `/api/datasets/:datasetId/schema`
   - Backend attempts to apply the changes to PostgreSQL and BigQuery
   - Backend returns success or error messages
   - Frontend displays the updated schema or error messages

3. **Updating Context**:
   - User edits context information in the frontend
   - Frontend sends updates to `/api/datasets/:datasetId/context`
   - Backend stores the information in PostgreSQL
   - Backend returns updated dataset information
   - Frontend displays the updated information

4. **Viewing Data Preview**:
   - Frontend fetches preview from `/api/datasets/:datasetId/preview`
   - Backend returns sample rows from the dataset
   - Frontend displays the data in a tabular format

## Error Handling

### Error Response Format

All error responses should follow this format:

```json
{
  "success": false,
  "error": "Detailed error message"
}
```

### Common HTTP Status Codes

- `200` - Success
- `201` - Resource created successfully
- `400` - Bad request (invalid parameters, validation error)
- `401` - Unauthorized (authentication required or invalid token)
- `403` - Forbidden (authenticated but not authorized)
- `404` - Resource not found
- `429` - Too many requests (rate limit exceeded)
- `500` - Server error

### Common Error Scenarios

1. **Authentication Errors**:
   - `401 Unauthorized` - Invalid or expired token
   - Frontend will prompt user to re-authenticate

2. **Schema Update Errors**:
   - `400 Bad Request` - Unsupported type conversion
   - Example error message: "Failed to update BigQuery schema: Field column_name has changed type from INTEGER to STRING"
   - Frontend will display the error message and maintain current schema

3. **Dataset Upload Errors**:
   - `400 Bad Request` - Invalid file format or metadata
   - `413 Payload Too Large` - File size exceeds limits (non-chunked upload)
   - Frontend will display appropriate error messages

4. **Query Errors**:
   - `400 Bad Request` - Invalid query parameters
   - `404 Not Found` - Dataset not found
   - `500 Server Error` - Error processing query
   - Frontend will display error message and retry options

### Retry Mechanism

- For query processing, the backend should attempt to retry failed queries
- The `retries` field in the response indicates how many attempts were made
- Frontend displays this information to the user when relevant

## Rate Limiting

The API has rate limits to prevent abuse. When rate limits are exceeded, the API returns a 429 status code with a clear message.

| Endpoint | Rate Limit |
|----------|------------|
| General API | 100 requests per 15 minutes |
| File Upload | 10 requests per 15 minutes |

### Handling Rate Limiting

When rate limits are exceeded, backends returns:

```json
{
  "success": false,
  "error": "Too many requests, please try again later"
}
```

The frontend implements exponential backoff or informs users to try again later.

## Performance Expectations

### Response Time Expectations

- **Authentication**: < 1 second
- **Dataset List**: < 2 seconds
- **Natural Language Queries**: < 5 seconds (simple), < 15 seconds (complex)
- **Dataset Upload Processing**: Depends on file size, but progress updates expected
- **Schema Updates**: < 3 seconds (except for large datasets)
- **Data Preview**: < 2 seconds

### Chunked Upload Considerations

- Chunk size: 5-10MB (configurable)
- Retry mechanism for failed chunks
- Backend should store partially uploaded files and allow resuming
- Progress tracking throughout the upload process

### Concurrent User Support

- Backend should handle multiple simultaneous users
- Rate limiting should be implemented but with reasonable limits
- Rate limit headers should be included in responses

### Backend Processing Status

For long-running operations, the backend should:
1. Accept the request and return a processing status
2. Allow the frontend to poll for completion status
3. Provide meaningful progress indicators when possible

## Best Practices

### Uploading Files

1. **Validate files client-side**: Check file size and type before uploading
2. **Use chunked uploads for large files**: Files over 50MB should use chunked upload
3. **Track upload status**: Poll the API to check processing status
4. **Handle errors gracefully**: Display clear messages to users

### Authentication

1. **Refresh tokens**: Implement token refresh logic when tokens expire
2. **Secure storage**: Store tokens securely (HTTP-only cookies or secure storage)
3. **Error handling**: Handle 401 errors by redirecting to login

### Schema Management

1. **Type Conversion Validation**: Validate type conversions before attempting to apply them
2. **Partial Updates**: Allow description updates to succeed even if type changes fail
3. **Clear Error Messages**: Provide specific error messages for schema update failures
4. **Performance Considerations**: For large datasets, consider background processing

### Querying Data

1. **Provide examples**: Show users example queries they can use
2. **Validate status**: Check dataset status before allowing queries
3. **Handle large results**: Implement pagination for displaying large result sets
4. **Cache results**: Cache query results when appropriate

## Code Examples

### Example: Dataset Schema Update Flow

```javascript
// Using the core API services
import { patch } from '../core/api';
import { getAuthToken } from '../core/api';

async function updateDatasetSchema(datasetId, columns) {
  try {
    // Get authentication token
    const token = await getAuthToken();

    // Prepare request
    const requestBody = {
      columns: columns
    };

    // Make the request
    const result = await patch(`datasets/${datasetId}/schema`, requestBody, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    return result;
  } catch (error) {
    console.error('Error updating schema:', error);
    throw error;
  }
}
```

### Example: Dataset Context Update Flow

```javascript
// Using the core API services
import { patch } from '../core/api';
import { getAuthToken } from '../core/api';

async function updateDatasetContext(datasetId, contextData) {
  try {
    // Get authentication token
    const token = await getAuthToken();

    // Make the request
    const result = await patch(`datasets/${datasetId}/context`, contextData, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    return result;
  } catch (error) {
    console.error('Error updating context:', error);
    throw error;
  }
}
```

### Example: Fetching Dataset Preview

```javascript
// Using the core API services
import { get } from '../core/api';
import { getAuthToken } from '../core/api';

async function getDatasetPreview(datasetId, limit = 100) {
  try {
    // Get authentication token
    const token = await getAuthToken();

    // Make the request
    const result = await get(`datasets/${datasetId}/preview?limit=${limit}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    return result.preview || [];
  } catch (error) {
    console.error('Error fetching dataset preview:', error);
    throw error;
  }
}
```

## FAQ

### General Questions

#### Q: What's the maximum file size for uploads?
A: Standard uploads are limited to 100MB. For larger files (up to 1GB), use the chunked upload API.

#### Q: What file types are supported?
A: CSV (.csv) and Excel (.xlsx, .xls) files are supported.

### Authentication Issues

#### Q: My authentication is failing. What should I check?
A: Verify your Firebase token is valid and not expired. Check the format of your Authorization header.

#### Q: How often do I need to refresh tokens?
A: Firebase ID tokens typically expire after 1 hour. Your frontend should refresh them before expiration.

### Schema Management

#### Q: Why are some type conversions rejected?
A: BigQuery has limitations on type conversions. Not all type changes are supported, especially those that could result in data loss.

#### Q: How should the backend handle type conversion errors?
A: Return a descriptive error message explaining which field(s) could not be converted and why. Allow description updates to succeed independently of type changes.

#### Q: What types are supported in the schema?
A: The frontend supports five types: string, integer, float, date, and boolean.

### Data Processing

#### Q: Why is my dataset status showing "error"?
A: Check the `errorMessage` field on the dataset for details. Common issues include invalid file formats, parsing errors, or service limits.

#### Q: How long does processing take?
A: Processing time depends on file size and complexity. Small files (under 10MB) typically process in seconds. Larger files may take several minutes.

### Query Issues

#### Q: Why isn't my natural language query working?
A: Natural language queries are interpreted by AI. Try rephrasing your query to be more specific. Check the response for any hints on how to improve the query.

#### Q: How does context information improve queries?
A: Context information provides the AI with additional understanding about the dataset's purpose, structure, and content, leading to more accurate SQL generation.
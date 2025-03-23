# Comprehensive Frontend Architecture Documentation

## Overview

This document provides a detailed technical breakdown of the frontend architecture for our data analysis application. The application is built with a modular architecture that organizes code by business features, enabling independent development, code isolation, better maintainability, and clear separation of responsibilities.

## Table of Contents

1. [System Architecture Overview](#system-architecture-overview)
2. [Technology Stack](#technology-stack)
3. [Module Structure](#module-structure)
4. [Core Module](#core-module)
5. [Auth Module](#auth-module)
6. [Datasets Module](#datasets-module)
7. [Query Module](#query-module)
8. [Chat Module](#chat-module)
9. [Reports Module](#reports-module)
10. [Visualizations Module](#visualizations-module)
11. [Account Module](#account-module)
12. [Shared Module](#shared-module)
13. [App Module](#app-module)
14. [Data Flow](#data-flow)
15. [State Management](#state-management)
16. [API Integration](#api-integration)
17. [Styling Approach](#styling-approach)
18. [Error Handling](#error-handling)
19. [Performance Considerations](#performance-considerations)
20. [Future Enhancement Areas](#future-enhancement-areas)

## System Architecture Overview

The application follows a modular architecture pattern, where functionality is separated into distinct modules, each responsible for specific business domains. These modules are organized in a way that minimizes dependencies between them, allowing for:

1. **Parallel Development**: Multiple developers can work simultaneously on different modules
2. **Focused Testing**: Modules can be tested in isolation
3. **Clear Boundaries**: Each module has well-defined inputs, outputs, and responsibilities
4. **Maintainability**: Smaller, focused modules are easier to maintain than a monolithic codebase

The high-level architecture consists of:

```
src/
├── app/                    # Application entry point and orchestration
├── core/                   # Core infrastructure services
├── modules/                # Feature modules
│   ├── auth/               # Authentication
│   ├── datasets/           # Dataset management
│   ├── query/              # Query functionality
│   ├── chat/               # Chat interface
│   ├── reports/            # Report generation and display
│   ├── visualizations/     # Data visualization components
│   ├── account/            # Account settings
│   └── shared/             # Shared UI components
└── index.js                # Application bootstrap
```

## Technology Stack

The application uses the following key technologies:

- **React (v19.0.0)**: UI library for building component-based interfaces
- **React Router (v6.18.0)**: Routing library for navigation
- **Firebase (v10.14.1)**: Authentication and database services
- **Tailwind CSS (v3.4.14)**: Utility-first CSS framework for styling
- **Modern JavaScript (ES6+)**: Leveraging modern JavaScript features
- **Context API**: For state management across components
- **Fetch API**: For network requests
- **Custom Hooks**: For encapsulating and reusing logic

## Module Structure

Each feature module follows a consistent structure:

```
modules/[feature-name]/
├── components/             # UI components specific to this feature
├── contexts/               # Context providers for state management
├── hooks/                  # Custom hooks for this feature
├── services/               # API services related to this feature
├── utils/                  # Utility functions
├── index.js                # Public API - exports what other modules can use
└── README.md               # Documentation about this module
```

This structure ensures:
1. Clear separation between UI components and business logic
2. Encapsulation of state management through contexts
3. Reusable logic through custom hooks
4. Unified module API through the index.js export

## Core Module

The Core module provides foundational services used throughout the application. It's the infrastructure layer that connects the frontend to external services.

### Core Structure

```
core/
├── api/                    # API connectivity layer
│   └── index.js            # Exports all API methods
├── firebase/               # Firebase configuration and services
│   └── index.js            # Exports Firebase services
└── error-handling/         # Error recovery and handling
    ├── components/         # Error UI components
    │   └── FirestoreRecovery.js
    ├── utils/              # Error utility functions
    │   └── cleanup.js
    └── index.js            # Exports error handling tools
```

### API Service (`core/api/index.js`)

The API service provides a comprehensive set of methods for interacting with the backend API:

- **Authentication**: Gets Firebase tokens and includes them in requests
- **Request Methods**: `get`, `post`, `put`, `patch`, `del` for standard HTTP methods
- **File Upload**: Special handling for file uploads with progress tracking
- **Error Handling**: Consistent error handling and formatting
- **Chat Formatting**: Methods to format conversation history for the AI

Key functions:
- `getAuthToken()`: Retrieves a valid Firebase auth token
- `apiRequest(endpoint, options)`: Base method for all API requests
- `uploadFile(endpoint, formData, progressCallback)`: For file uploads with progress tracking
- `apiService.sendQuery(userQuery, conversationHistory, datasetId)`: For sending natural language queries

### Firebase Service (`core/firebase/index.js`)

The Firebase service initializes and exports Firebase functionality:

- **Authentication**: User login, signup, and token management
- **Firestore**: Database connection and management
- **Connection Recovery**: Method to reset Firestore if corrupted

Key exports:
- `auth`: Firebase authentication instance
- `db`: Firestore database instance
- `googleProvider`: Google authentication provider
- `resetFirestore()`: Method to restore connection after errors

### Error Handling (`core/error-handling/`)

The error handling module provides tools for recovering from critical errors:

- **FirestoreRecovery Component**: UI for recovering from Firestore corruption
- **Cleanup Utilities**: Methods to clean browser storage and reset state
- **Error Detection**: Pattern matching for identifying error types

Key components:
- `FirestoreRecovery`: UI component that guides users through recovery
- `cleanup.fullStorageCleanup()`: Clears corrupted browser storage

## Auth Module

The Auth module handles all aspects of user authentication, including login, signup, and session management.

### Auth Structure

```
modules/auth/
├── components/             # Authentication UI components
│   ├── Login.js            # Login/signup form
│   └── ProtectedRoute.js   # Route guard for authenticated routes
├── contexts/               # Authentication state management
│   └── AuthContext.js      # Manages auth state throughout the app
├── index.js                # Exports auth components and context
└── README.md               # Module documentation
```

### Authentication Flow

The authentication flow uses Firebase Authentication and consists of:

1. **Login Component**: UI for email/password and Google authentication
2. **Auth Context**: Manages authentication state and provides methods for login/logout
3. **Protected Route**: Higher-order component that restricts access to authenticated users

Key components:
- `AuthProvider`: Context provider that manages authentication state
- `useAuth()`: Hook to access authentication context
- `Login`: Component for user login and signup
- `ProtectedRoute`: Component to protect routes from unauthenticated access

The auth module exports routes through the module registry:

```javascript
// Auth routes defined in index.js
export const routes = [
  {
    path: '/login',
    element: Login
  }
];
```

## Datasets Module

The Datasets module manages all dataset-related operations, including uploading, viewing, and querying datasets.

### Datasets Structure

```
modules/datasets/
├── components/             # Dataset UI components
│   ├── DatasetList.js      # List of user datasets with management options
│   ├── DatasetDetails.js   # Detailed view of a single dataset
│   ├── DatasetSelector.js  # Dropdown for selecting active dataset
│   ├── DatasetSchemaView.js # Schema visualization component
│   └── SchemaViewer.js     # Schema viewer for query interface
├── contexts/               # Dataset state management
│   └── DatasetContext.js   # Manages datasets throughout the app
├── services/               # API interaction for datasets
│   └── datasetService.js   # Methods for dataset API operations
├── index.js                # Exports dataset components and context
└── README.md               # Module documentation
```

### Dataset Management

The dataset module handles the complete lifecycle of datasets:

1. **Upload**: Both standard and chunked uploads for files of varying sizes
2. **Management**: View, update, delete operations
3. **Schema Visualization**: Components to visualize dataset structure
4. **Selection**: Interface for selecting active dataset for queries

Key components:
- `DatasetProvider`: Context provider for dataset state
- `useDatasets()`: Hook to access dataset context
- `DatasetList`: Main component for dataset management
- `DatasetDetails`: Component for viewing dataset information and schema
- `DatasetSelector`: Component for selecting datasets in query interfaces
- `SchemaViewer`: Component for visualizing dataset schema in query interfaces

### Dataset Service (`modules/datasets/services/datasetService.js`)

The dataset service handles API communication for dataset operations:

- **Authentication**: Gets Firebase tokens for authenticated requests
- **Upload**: Handles both standard and chunked file uploads
- **Management**: Methods for CRUD operations on datasets
- **Schema**: Methods for fetching dataset schema

Key methods:
- `uploadDataset(file, metadata, progressCallback)`: Uploads a new dataset with progress tracking
- `getUserDatasets()`: Fetches all datasets for the current user
- `deleteDataset(datasetId)`: Deletes a dataset
- `getDatasetSchema(datasetId)`: Fetches the schema for a dataset
- `updateDataset(datasetId, metadata)`: Updates dataset metadata

## Query Module

The Query module provides the interface and logic for querying datasets and displaying results.

### Query Structure

```
modules/query/
├── components/             # Query UI components
│   ├── SearchBox.js        # Main search interface
│   └── ResultsTable.js     # Results display component
├── hooks/                  # Query-related hooks
│   └── useQueryManager.js  # Hook for managing queries and results
├── utils/                  # Query utilities
│   └── tableDataService.js # Utilities for table data handling
├── index.js                # Exports query components and utilities
└── README.md               # Module documentation
```

### Query Flow

The query module handles:

1. **Query Input**: Interface for entering natural language queries
2. **Query Processing**: Logic for sending queries to the API
3. **Results Display**: Components for displaying query results
4. **Data Transformation**: Utilities for formatting and normalizing data

Key components:
- `SearchBox`: Component for entering and submitting queries
- `ResultsTable`: Component for displaying query results
- `useQueryManager()`: Hook that manages query state, execution, and results
- `tableDataService`: Utility for handling table data formatting and normalization

### Table Data Service (`modules/query/utils/tableDataService.js`)

The table data service provides utilities for working with tabular data:

- **Formatting**: Methods to format cell values based on data type
- **Normalization**: Ensures consistent data structure
- **Column Ordering**: Preserves column order for display
- **Extraction**: Extracts results from message objects

Key methods:
- `formatCellValue(value, columnName, schema)`: Formats cell values based on content and column type
- `preserveColumnOrder(results)`: Maintains column order for display
- `normalizeTableData(rawResults, schema)`: Ensures consistent data structure
- `extractResultsFromMessages(messages)`: Extracts results from chat messages

## Chat Module

The Chat module provides the conversational interface for interacting with the AI assistant.

### Chat Structure

```
modules/chat/
├── components/             # Chat UI components
│   ├── ChatPanel.js        # Main chat container
│   ├── ChatMessage.js      # Individual message component
│   └── ChatInput.js        # Message input component
├── contexts/               # Chat state management
│   └── ChatContext.js      # Manages chat state throughout the app
├── index.js                # Exports chat components and context
└── README.md               # Module documentation
```

### Chat Flow

The chat module manages:

1. **Message Display**: Rendering of conversation history
2. **Message Input**: Interface for entering new messages
3. **State Management**: Tracking and updating the conversation
4. **Query Integration**: Connecting chat to the query system
5. **Report Integration**: Displaying reports within the chat interface

Key components:
- `ChatProvider`: Context provider for chat state
- `useChat()`: Hook to access chat context
- `ChatPanel`: Main component for the chat interface
- `ChatMessage`: Component for individual messages
- `ChatInput`: Component for entering new messages

### Chat Context (`modules/chat/contexts/ChatContext.js`)

The chat context manages conversation state:

- **Message Storage**: Maintains the current conversation
- **Message Addition**: Methods to add new messages
- **Conversation Management**: Methods to clear or modify the conversation
- **View Management**: Controls for switching between single and split views

Key methods:
- `addMessage(role, content, data)`: Adds a message to the conversation
- `clearMessages()`: Clears the conversation
- `forceInitialView()`: Forces the single-box view

## Reports Module

The Reports module provides functionality for generating and displaying comprehensive, AI-driven reports with visualizations and insights.

### Reports Structure

```
modules/reports/
├── components/             # Report UI components
│   ├── ReportViewer.js     # Main container for displaying reports
│   ├── ReportHeader.js     # Report title, timestamp, and query info
│   ├── ReportSection.js    # Single section of a report with content
│   ├── ChartDisplay.js     # Chart visualization component
│   ├── DataTable.js        # Enhanced table component
│   ├── NarrativeText.js    # Formatted text with insights
│   └── LoadingReport.js    # Loading state during generation
├── services/               # API services
│   └── reportService.js    # API interactions for reports
├── hooks/                  # Custom hooks
│   └── useReport.js        # State management for reports
├── index.js                # Module exports and routes
└── README.md               # Module documentation
```

### Reports Flow

The reports module handles:

1. **Report Generation**: Converting natural language queries to comprehensive reports
2. **Visualization**: Rendering charts, tables, and metrics
3. **Narrative Analysis**: Displaying formatted text with insights
4. **Report Navigation**: Moving between report sections
5. **Integration**: Embedding reports in chat or displaying as standalone pages

Key components:
- `ReportViewer`: Main container component for displaying reports
- `ReportSection`: Displays a single section of a report
- `ChartDisplay`: Renders various chart types
- `DataTable`: Enhanced table with sorting and pagination
- `NarrativeText`: Displays formatted narrative text with insights
- `LoadingReport`: Animated loading state during report generation

### Report Service (`modules/reports/services/reportService.js`)

The report service handles API communication for report operations:

- **Generation**: Creates reports from natural language queries
- **Retrieval**: Fetches existing reports
- **Management**: Handles listing and deleting reports

Key methods:
- `generateReport(query, datasetId, conversationHistory, reportType)`: Creates a new report
- `getReport(reportId)`: Retrieves a specific report
- `getAllReports()`: Gets all reports for the current user
- `deleteReport(reportId)`: Deletes a report

### Report Hook (`modules/reports/hooks/useReport.js`)

The report hook manages report state:

- **State Management**: Maintains report data and loading states
- **Operations**: Provides methods for report operations
- **Error Handling**: Handles and formats error messages

Key functionality:
- `generateReport()`: Creates a new report from a query
- `getReport()`: Fetches a report by ID
- `getAllReports()`: Retrieves all user reports
- `deleteReport()`: Deletes a report
- State variables: `report`, `reports`, `loading`, `error`

### Integration with Visualizations

The Reports module leverages the Visualizations module for rendering data:

1. **ReportSection Component**: Contains multiple visualization components
2. **ChartDisplay Component**: Wrapper that uses visualizations based on type
3. **DataTable Component**: Uses the enhanced table from Visualizations module
4. **Report Generation**: Determines appropriate visualization types automatically

Each report can contain multiple visualizations organized by section, with the Visualizations module handling the rendering details while the Reports module manages the organization and narrative.

## Visualizations Module

The Visualizations module provides reusable chart components for data visualization throughout the application. It serves as a specialized rendering layer for the Reports module and other areas that need data visualization.

### Visualizations Structure

```
visualizations/
├── components/           # Chart components
│   ├── LineChart.js      # Line chart visualization
│   ├── BarChart.js       # Bar chart visualization
│   ├── PieChart.js       # Pie/donut chart visualization
│   └── DataTable.js      # Tabular data visualization
├── utils/                # Utility functions
│   └── chartUtils.js     # Shared chart utilities
├── index.js              # Public API exports
└── README.md             # Module documentation
```

### Visualization Components

The module provides these key visualization types:

1. **LineChart**: For time series or sequential data
   - Supports multiple data series
   - Time-based x-axis with appropriate formatting
   - Custom styling and configuration

2. **BarChart**: For categorical comparisons
   - Supports vertical and horizontal orientations
   - Grouped and stacked configurations
   - Sorting and formatting options

3. **PieChart**: For proportional data
   - Pie and donut chart variants
   - Percentage calculations
   - Legend and label options

4. **DataTable**: For tabular data
   - Sorting, pagination, and search functionality
   - Intelligent data formatting based on types
   - Row highlighting and interactions

### Chart Utilities

The `chartUtils.js` file provides shared functionality:

- Default color palette optimized for dark themes
- Data formatting and sorting functions
- Color manipulation and opacity management
- Axis calculation and tick generation
- Placeholder data generation for testing

### Implementation Phases

The Visualizations module follows a phased implementation approach:

- **Phase 1**: Canvas-based placeholder visualizations that demonstrate the UI
- **Phase 3**: Full implementation using Chart.js with interactivity
- **Phase 4**: Performance optimizations and export capabilities

### Integration Points

The Visualizations module integrates with:

1. **Reports Module**: Charts and tables are used within report sections
2. **Query Module**: Visualization of query results
3. **Dashboard**: Direct visualization of data on the main interface

## Account Module

The Account module manages user profile and application settings.

### Account Structure

```
modules/account/
├── components/             # Account UI components
│   ├── AccountManagement.js # Main account management container
│   ├── UserProfile.js      # User profile management
│   ├── ProfileSettings.js  # Application settings
│   ├── AISettings.js       # AI behavior settings
│   └── AccountNavigation.js # Account section navigation
├── index.js                # Exports account components
└── README.md               # Module documentation
```

### Account Management

The account module handles:

1. **Profile Management**: View and update user information
2. **Application Settings**: User preferences for the application
3. **AI Settings**: Customization of AI behavior
4. **Security Settings**: Password management and security options

Key components:
- `AccountManagement`: Main component for the account section
- `UserProfile`: Component for managing user profile information
- `ProfileSettings`: Component for application settings
- `AISettings`: Component for AI behavior settings
- `AccountNavigation`: Component for navigating the account section

The account module exports routes through the module registry:

```javascript
// Account routes defined in index.js
export const routes = [
  {
    path: '/account/*',
    element: AccountManagement,
    protected: true
  }
];
```

## Shared Module

The Shared module provides reusable UI components and utilities used across the application.

### Shared Structure

```
modules/shared/
├── components/             # Shared UI components
│   ├── AnimatedBackground.js # Background animation component
│   ├── Button.js           # Customizable button component
│   ├── Card.js             # Card container component
│   ├── FileUploader.js     # File upload component
│   ├── FileUploadProgress.js # Upload progress component
│   ├── FormElements.js     # Form components (Input, Select, etc.)
│   ├── LoadingSpinner.js   # Loading indicator component
│   ├── StatusMessage.js    # Status/error message component
│   ├── StyledRadioButtons.js # Enhanced radio buttons
│   └── index.js            # Exports all components
├── index.js                # Module exports
└── README.md               # Module documentation
```

### Component Library

The shared module provides a comprehensive set of UI components:

1. **Layout Components**: Card, containers, and structural elements
2. **Input Components**: Form elements, buttons, and interactive controls
3. **Feedback Components**: Status messages, loading indicators, and progress displays
4. **Visual Components**: Animations, backgrounds, and decorative elements

Key components:
- `Button`: Customizable button with various styles and states
- `Card`: Container component with various styles
- `FileUploader`: Component for file uploads with drag-and-drop
- `FormElements`: Form input components (Input, TextArea, Select, etc.)
- `LoadingSpinner`: Loading indicator with customizable appearance
- `StatusMessage`: Component for displaying status and error messages
- `AnimatedBackground`: Background component with animated particles

## App Module

The App module is the entry point and orchestration layer for the application.

### App Structure

```
app/
├── components/             # App-level components
│   └── Dashboard.js        # Main dashboard component
├── index.js                # Main entry point
├── App.js                  # Root component
└── moduleRegistry.js       # Central registry for modules
```

### Application Orchestration

The app module is responsible for:

1. **Bootstrapping**: Initialize the application
2. **Routing**: Set up the application routes
3. **Module Integration**: Compose modules together
4. **Global Error Handling**: Catch and handle application-level errors

Key components:
- `App`: Root component that sets up routing and global error handling
- `Dashboard`: Main application interface that integrates the chat and query interfaces
- `moduleRegistry`: Central hub that collects routes and providers from all modules

### Module Registry (`app/moduleRegistry.js`)

The module registry is a crucial part of the architecture that:

1. **Collects Routes**: Gathers routes from all modules
2. **Composes Providers**: Nests all context providers in the correct order
3. **Exports Shared Services**: Makes core services available to all modules

```javascript
// Collecting routes from all modules
export const routes = [
  ...authRoutes,
  ...datasetsRoutes,
  ...queryRoutes,
  ...chatRoutes,
  ...reportsRoutes,
  ...accountRoutes
];

// Composing providers
export const Providers = ({ children }) => {
  return (
    <AuthProvider>
      <ChatProvider>
        <DatasetProvider>
          {children}
        </DatasetProvider>
      </ChatProvider>
    </AuthProvider>
  );
};

// Exporting shared services
export const sharedServices = {
  api: apiService,
  firebase: {
    auth,
    db,
    googleProvider,
    resetFirestore
  },
  errorHandling: {
    FirestoreRecovery,
    resetFirestore
  }
};
```

## Data Flow

### Overall Data Flow

The data flow in the application follows these patterns:

1. **User Authentication**:
   - User logs in through the Auth module
   - Authentication state is propagated via the AuthContext
   - Protected routes become accessible

2. **Dataset Management**:
   - User uploads datasets through the Datasets module
   - Dataset state is managed by the DatasetContext
   - Dataset operations are performed through datasetService

3. **Query Processing**:
   - User selects a dataset and enters a query
   - Query is sent to the backend via the API service
   - Results are displayed in the ResultsTable component
   - Results are also added to the chat conversation

4. **Report Generation**:
   - User can generate comprehensive reports from queries
   - Report generation is handled by the Reports module
   - Reports can be displayed in the chat or as standalone pages
   - Reports include visualizations, narrative text, and data tables

5. **Chat Interaction**:
   - User sends messages through the ChatInput component
   - Messages are added to the conversation via the ChatContext
   - AI responses are added to the conversation when received
   - Query results and reports are associated with messages for viewing

6. **Account Management**:
   - User accesses account settings through the Account module
   - Profile updates are sent to Firebase Authentication
   - Settings are stored in Firestore via Firebase service

### Visualization Data Flow

Data visualization follows this flow:

1. **Data Preparation**:
   - Report module or other sources prepare the data structure
   - Configuration options are determined based on data characteristics

2. **Rendering**:
   - Visualization components receive data and configuration
   - Components apply formatting and processing as needed
   - Canvas-based rendering in Phase 1, Chart.js in Phase 3

3. **Interaction**:
   - User interactions (sorting, paging) are handled within visualization components
   - Complex interactions (drilling down) trigger events that parent components handle

### Key State Management Points

1. **AuthContext**: Central source of truth for user authentication
2. **DatasetContext**: Manages available datasets and the active dataset
3. **ChatContext**: Manages the current conversation
4. **QueryManager Hook**: Manages query state and results
5. **Report Hook**: Manages report generation and state

## State Management

The application uses React's Context API for state management, with a different context for each major feature area.

### Context Providers

1. **AuthProvider**: Manages authentication state and user information
2. **DatasetProvider**: Manages datasets and dataset selection
3. **ChatProvider**: Manages chat conversation and message history

### Context Nesting

The context providers are nested in a specific order to ensure proper data flow:

```jsx
<AuthProvider>         {/* Authentication state (outermost) */}
  <ChatProvider>       {/* Chat conversation state */}
    <DatasetProvider>  {/* Dataset management state */}
      {children}       {/* Application components */}
    </DatasetProvider>
  </ChatProvider>
</AuthProvider>
```

This nesting ensures that:
- Authentication state is available to all other contexts
- Chat state can access authentication but not dataset state
- Dataset state can access both authentication and chat state

### Custom Hooks

Each context provides a custom hook for components to access its state:

- `useAuth()`: Access authentication state and methods
- `useDatasets()`: Access dataset state and methods
- `useChat()`: Access chat state and methods
- `useQueryManager()`: Access query state and methods
- `useReport()`: Access report state and methods

## API Integration

The application integrates with a backend API that provides dataset management, query processing, and AI interaction.

### API Structure

The API integration is primarily handled through:

1. **Core API Service**: Provides base HTTP methods and authentication
2. **Dataset Service**: Handles dataset-specific API endpoints
3. **Report Service**: Handles report-specific API endpoints
4. **Direct API Calls**: For query and chat functionality

### Key API Endpoints

The application interacts with these main endpoint groups:

1. **Dataset Endpoints**:
   - `GET /api/datasets`: List all datasets
   - `POST /api/datasets/upload`: Upload new dataset
   - `GET /api/datasets/:datasetId`: Get single dataset
   - `GET /api/datasets/:datasetId/schema`: Get dataset schema
   - `PATCH /api/datasets/:datasetId`: Update dataset
   - `DELETE /api/datasets/:datasetId`: Delete dataset

2. **Chunked Upload Endpoints**:
   - `POST /api/chunked-upload/init`: Initialize chunked upload
   - `POST /api/chunked-upload/:uploadId/chunk`: Upload chunk
   - `GET /api/chunked-upload/:uploadId/status`: Check upload status

3. **Query Endpoints**:
   - `POST /api/datasets/:datasetId/query`: Query a specific dataset
   - `POST /api/query`: General natural language query

4. **Report Endpoints**:
   - `POST /api/reports`: Generate a new report
   - `GET /api/reports/:reportId`: Get a specific report
   - `GET /api/reports`: Get all user reports
   - `DELETE /api/reports/:reportId`: Delete a report

### Authentication Flow

All API requests include a Firebase authentication token:

1. **Token Acquisition**: Get token from Firebase (`getAuthToken()`)
2. **Header Inclusion**: Include token in Authorization header
3. **Token Refresh**: Refresh token if expired
4. **Error Handling**: Handle authentication errors

## Styling Approach

The application uses Tailwind CSS for styling, with a consistent approach across all components.

### Styling Patterns

1. **Utility Classes**: Direct use of Tailwind utility classes for most styling
2. **Component-Level Styling**: Consistent styling patterns for each component type
3. **Custom Animations**: Defined in `index.css` and used throughout the app
4. **Dark Theme**: Dark color scheme with blue/purple accents
5. **Glass Effect**: Backdrop blur and transparency for a modern look

### Key Visual Elements

1. **Cards**: Used throughout for containing content
2. **Buttons**: Consistent button styles with variants
3. **Forms**: Consistent form element styling
4. **Animations**: Subtle animations for loading, transitions, and backgrounds
5. **Status Messages**: Consistent error and success message styling

### Tailwind Configuration

The application includes a custom Tailwind configuration in `tailwind.config.js`:

```javascript
// Custom animations
animation: {
  'pulse': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
  'shake': 'shake 0.5s cubic-bezier(.36,.07,.19,.97) both',
  'float': 'float 8s ease-in-out infinite',
  'gradient': 'gradient 8s ease infinite',
  'fade-in': 'fadeIn 0.5s ease-out forwards',
  'fade-in-up': 'fadeInUp 0.6s ease-out forwards',
  'fade-in-down': 'fadeInDown 0.6s ease-out forwards',
}

// Custom keyframes
keyframes: {
  pulse: { ... },
  shake: { ... },
  float: { ... },
  gradient: { ... },
  fadeIn: { ... },
  fadeInUp: { ... },
  fadeInDown: { ... },
}
```

## Error Handling

The application implements a comprehensive error handling strategy.

### Error Handling Layers

1. **Global Error Handling**: App-level error boundaries
2. **Firebase Error Recovery**: Special handling for Firestore errors
3. **API Error Handling**: Consistent handling of API errors
4. **UI Error Feedback**: Status messages for user feedback

### Error Recovery

For critical errors, especially Firestore corruption, the application provides recovery mechanisms:

1. **Firestore Reset**: `resetFirestore()` method to reset the connection
2. **Storage Cleanup**: `fullStorageCleanup()` to clear corrupted storage
3. **UI Guidance**: `FirestoreRecovery` component to guide users through recovery

### Error Display

Errors are displayed to users through the `StatusMessage` component, which provides:

1. **Visual Differentiation**: Different styling for error, warning, success
2. **Animation**: Attention-drawing animations for important errors
3. **Dismissal**: Option to dismiss messages
4. **Action Buttons**: Optional actions to resolve errors

## Performance Considerations

The application implements several performance optimization strategies.

### Performance Optimizations

1. **Conditional Rendering**: Components render only when needed
2. **Memoization**: Use of React.memo and useMemo for expensive computations
3. **Chunked Uploads**: Large file uploads are split into manageable chunks
4. **Progressive Loading**: Results are displayed progressively as they arrive
5. **Efficient State Updates**: Only updating state when necessary

### Key Performance Areas

1. **File Upload**: Optimized for large files with progress tracking
2. **Results Display**: Efficient rendering of large result sets
3. **Chat History**: Efficient management of conversation history
4. **API Interactions**: Minimizing unnecessary API calls
5. **Report Generation**: Optimized loading states and incremental rendering

## Future Enhancement Areas

Based on the current architecture, these areas have been identified for future enhancements:

1. **Advanced Visualizations**: Expanding chart and graph capabilities in reports
2. **Multi-Dataset Queries**: Enabling queries across multiple datasets
3. **Advanced AI Customization**: More granular control over AI behavior
4. **Data Transformations**: Adding capabilities to transform and manipulate datasets
5. **Dashboard Creation**: Allowing users to create custom dashboards with saved reports

## Conclusion

The application architecture provides a solid foundation for a complex data analysis tool with AI capabilities. The modular approach enables independent development and clear separation of concerns, while the consistent patterns throughout the codebase ensure maintainability and extensibility.

The comprehensive integration between modules creates a seamless user experience, from authentication to dataset management to querying, reporting, and viewing results. The application is well-positioned for future enhancements and scaling, with well-defined boundaries and interfaces between components.
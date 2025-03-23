This README is in frontend/src/app
# App Module

## Purpose

The App module serves as the entry point and orchestration layer for the entire application. It composes all the feature modules together, sets up routing, and manages the top-level application state and layout.

## Features

- **Application Bootstrapping**: Root component and entry point
- **Module Integration**: Registry of all feature modules
- **Layout Management**: Top-level layout components
- **Main Application Flow**: Dashboard and main screens

## Structure

```
app/
├── components/           # App-wide components
│   └── Dashboard.js      # Main dashboard layout
├── index.js              # Main entry point
├── App.js                # Root component
└── moduleRegistry.js     # Central registry for modules
```

## Public API

The App module exports these key pieces:

### Module Registry

```javascript
import { routes, Providers, sharedServices } from './app/moduleRegistry';

// Examples
<Providers>{children}</Providers>
// Access all routes from all modules
const allRoutes = routes;
// Access shared services
const api = sharedServices.api;
```

### Dashboard Component

```javascript
import Dashboard from './app/components/Dashboard';

// Usage in routing
<Route path="/" element={<Dashboard />} />
```

## Integration Points

The App module integrates with other parts of the application through:

1. **Module Registry**: Collects routes and providers from all feature modules
2. **Root App Component**: Sets up the application shell and routing
3. **Dashboard**: Main layout that integrates components from multiple feature modules

## Dependencies

- **External Libraries**:
  - React Router for routing
  - React for UI

- **Module Dependencies**:
  - All feature modules (auth, datasets, query, chat, account)
  - Core services

## Development Guidelines

When developing the App module:

1. Keep the code focused on integration and orchestration
2. Avoid adding feature-specific logic here
3. Use the module registry for cross-cutting concerns
4. Ensure proper provider nesting for context propagation
5. Handle global error boundaries at this level
# Core Module

## Purpose

The Core module provides the fundamental infrastructure services that support the entire application. It contains application-wide functionality that doesn't belong to any specific feature module but is essential for the application to operate.

## Features

- **API Connectivity**: Base HTTP request functionality with authentication
- **Firebase Integration**: Authentication and database services
- **Error Handling**: Application-wide error recovery tools

## Structure

```
core/
├── api/                  # API connectivity layer
│   └── index.js          # Exports authenticated API methods
├── firebase/             # Firebase configuration
│   └── index.js          # Exports Firebase services
└── error-handling/       # Error handling utilities
    ├── components/       # Error UI components
    │   └── FirestoreRecovery.js
    ├── utils/            # Error utility functions
    │   └── cleanup.js
    └── index.js          # Exports error handling tools
```

## Public API

The Core module exports these services:

### API Service

```javascript
import { get, post, put, patch, del, uploadFile, apiService } from '../core/api';

// Examples
const data = await get('endpoint');
const response = await post('endpoint', requestBody);
const uploadResponse = await uploadFile('upload', formData, progressCallback);
```

### Firebase Services

```javascript
import { auth, db, googleProvider, resetFirestore } from '../core/firebase';

// Examples
const user = auth.currentUser;
const docRef = doc(db, 'collection', 'docId');
```

### Error Handling

```javascript
import { FirestoreRecovery, cleanup } from '../core/error-handling';

// Examples
<FirestoreRecovery onRecoveryComplete={handleRecovery} />
await cleanup.fullStorageCleanup();
```

## Integration Points

The Core module integrates with other parts of the application through:

1. **Module Registry**: The core services are registered in `src/app/moduleRegistry.js` as shared services
2. **Direct Imports**: Feature modules import core services directly when needed
3. **App Component**: Error recovery is integrated at the application root level

## Dependencies

- **External Libraries**:
  - Firebase Authentication and Firestore
  - Fetch API for network requests

- **Module Dependencies**:
  - No dependencies on feature modules (to avoid circular dependencies)

## Development Guidelines

When developing the Core module:

1. Keep the Core module focused on application-wide infrastructure
2. Avoid adding feature-specific logic here
3. Maintain backward compatibility for existing APIs
4. Document any changes to public interfaces
5. Test thoroughly as changes here affect the entire application
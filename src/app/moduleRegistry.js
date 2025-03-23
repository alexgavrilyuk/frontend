// src/app/moduleRegistry.js
import React from 'react';

// Import auth module
import { routes as authRoutes, AuthProvider } from '../modules/auth';
// Import datasets module
import { routes as datasetsRoutes, DatasetProvider } from '../modules/datasets';
// Import query module
import { routes as queryRoutes } from '../modules/query';
// Import chat module
import { routes as chatRoutes, ChatProvider } from '../modules/chat';
// Import account module
import { routes as accountRoutes } from '../modules/account';
// Import reports module
import { routes as reportsRoutes } from '../modules/reports';
// Import core services
import { FirestoreRecovery } from '../core/error-handling';
import * as apiService from '../core/api';
import { auth, db, googleProvider, resetFirestore } from '../core/firebase';

// Collect all module routes
export const routes = [
  ...authRoutes,
  ...datasetsRoutes,
  ...queryRoutes,
  ...chatRoutes,
  ...reportsRoutes,
  ...accountRoutes,
];

// Collect all providers
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

// Export shared services or cross-module interfaces
export const sharedServices = {
  // Core services
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
// src/App.js - Updated to use moduleRegistry
import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { routes, Providers } from './app/moduleRegistry';
import Dashboard from './app/components/Dashboard';
import { FirestoreRecovery } from './core/error-handling';
import { Login, ProtectedRoute } from './modules/auth';
import TestBuild from './TestBuild';


console.log("App.js loaded TestBuild:", TestBuild);

function App() {
  const [hasFirestoreError, setHasFirestoreError] = useState(false);

  // Set up global error listener for Firestore errors
  useEffect(() => {
    // Listen for Firestore errors
    const firestoreErrorListener = (event) => {
      if (
        event &&
        event.message &&
        (
          event.message.includes('FIRESTORE') ||
          event.message.includes('internal assertion failed') ||
          event.message.includes('Unexpected state')
        )
      ) {
        console.error("Detected Firestore error:", event.message);
        setHasFirestoreError(true);
      }
    };

    // Add global error handler
    window.addEventListener('error', firestoreErrorListener);

    // Cleanup
    return () => {
      window.removeEventListener('error', firestoreErrorListener);
    };
  }, []);

  const handleRecoveryComplete = () => {
    setHasFirestoreError(false);
    window.location.reload();
  };

  // Generate Routes from module registry
  const generateRoutes = () => {
    // Add explicit routes first
    const explicitRoutes = [
      <Route key="login" path="/login" element={<Login />} />,
      <Route
        key="dashboard"
        path="/"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />,
      // Fallback route
      <Route key="fallback" path="*" element={<Navigate to="/" />} />
    ];

    // Merge with routes from registry
    const moduleRoutes = routes.map((route, index) => {
      // Check if route is already protected
      if (route.protected) {
        return (
          <Route
            key={`module-route-${index}`}
            path={route.path}
            element={
              <ProtectedRoute>
                {React.createElement(route.element)}
              </ProtectedRoute>
            }
          />
        );
      }

      // Regular route
      return (
        <Route
          key={`module-route-${index}`}
          path={route.path}
          element={React.createElement(route.element)}
        />
      );
    });

    return [...moduleRoutes, ...explicitRoutes];
  };

  return (
    <>
      {hasFirestoreError ? (
        <FirestoreRecovery onRecoveryComplete={handleRecoveryComplete} />
      ) : (
        <Router>
          <Providers>
            <div className="app-container">
              <Routes>
                {generateRoutes()}
              </Routes>
            </div>
          </Providers>
        </Router>
      )}
    </>
  );
}

export default App;
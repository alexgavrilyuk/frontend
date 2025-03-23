// src/components/FirestoreRecovery.js
import React, { useState } from 'react';
import { resetFirestore } from '../../firebase';
import { fullStorageCleanup } from '../utils/cleanup';

/**
 * Component to handle recovery from Firestore errors
 * Displays when critical Firestore errors are detected
 */
function FirestoreRecovery({ onRecoveryComplete }) {
  const [isRecovering, setIsRecovering] = useState(false);
  const [recoveryStep, setRecoveryStep] = useState('');
  const [recoveryError, setRecoveryError] = useState(null);

  const handleRecovery = async () => {
    setIsRecovering(true);
    setRecoveryStep('Starting recovery...');
    setRecoveryError(null);

    try {
      // Step 1: Clear all browser storage
      setRecoveryStep('Clearing browser storage...');
      await fullStorageCleanup();

      // Step 2: Reset Firestore connection
      setRecoveryStep('Resetting Firestore connection...');
      await resetFirestore();

      // Step 3: Recovery complete
      setRecoveryStep('Recovery complete!');

      // Delay before reloading
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Complete recovery
      if (typeof onRecoveryComplete === 'function') {
        onRecoveryComplete();
      } else {
        // Default behavior - reload the page
        window.location.reload();
      }
    } catch (error) {
      console.error('Recovery failed:', error);
      setRecoveryError(error.message || 'Unknown error occurred');
      setRecoveryStep('Recovery failed');
    } finally {
      setIsRecovering(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-900 bg-opacity-95 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 rounded-lg p-6 max-w-md w-full border border-gray-700 shadow-xl">
        <div className="text-center mb-6">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-16 w-16 mx-auto text-red-500 mb-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>

          <h2 className="text-xl font-bold text-white mb-2">Database Error Detected</h2>
          <p className="text-gray-300 mb-4">
            The application has encountered a database error. We need to repair it to continue.
          </p>
        </div>

        {recoveryError && (
          <div className="bg-red-900/30 border border-red-700 rounded-lg p-4 mb-6">
            <p className="text-red-400">{recoveryError}</p>
          </div>
        )}

        {isRecovering ? (
          <div className="text-center mb-6">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p className="text-blue-400">{recoveryStep}</p>
          </div>
        ) : (
          <button
            onClick={handleRecovery}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transition-colors duration-200"
          >
            Repair Database
          </button>
        )}
      </div>
    </div>
  );
}

export default FirestoreRecovery;
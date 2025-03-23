// src/core/firebase/index.js
import { initializeApp } from "firebase/app";
import {
  getAuth,
  GoogleAuthProvider,
  setPersistence,
  browserLocalPersistence
} from "firebase/auth";
import {
  getFirestore,
  connectFirestoreEmulator,
  disableNetwork,
  enableNetwork,
  initializeFirestore,
  CACHE_SIZE_UNLIMITED
} from "firebase/firestore";

// Replace with your Firebase configuration
const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_FIREBASE_APP_ID
};

// Initialize Firebase app
const app = initializeApp(firebaseConfig);

// Initialize Auth with persistence
const auth = getAuth(app);

// Set auth persistence to LOCAL
setPersistence(auth, browserLocalPersistence)
  .catch((error) => {
    console.error("Auth persistence error:", error);
  });

// Initialize Firestore with explicit settings to avoid corruption
const db = initializeFirestore(app, {
  cacheSizeBytes: CACHE_SIZE_UNLIMITED,
  ignoreUndefinedProperties: true,
  experimentalForceLongPolling: true, // Use long polling instead of WebSockets
  experimentalAutoDetectLongPolling: false
});

// Function to reset Firestore connection
async function resetFirestore() {
  try {
    // Disable network first
    await disableNetwork(db);
    console.log("Firestore network disabled");

    // Small delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Re-enable network
    await enableNetwork(db);
    console.log("Firestore network re-enabled");

    return true;
  } catch (error) {
    console.error("Error resetting Firestore:", error);
    return false;
  }
}

// Setup Google provider for authentication
const googleProvider = new GoogleAuthProvider();

// Export everything needed, making sure resetFirestore is only exported once
export { auth, db, googleProvider, resetFirestore };
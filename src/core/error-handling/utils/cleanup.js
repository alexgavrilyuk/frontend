// src/utils/cleanup.js

/**
 * Utility to clean up corrupted browser storage
 * Used to recover from Firestore assertion failures
 */

// Clear IndexedDB databases
export async function clearIndexedDB() {
  return new Promise((resolve) => {
    // Get all database names
    const databases = indexedDB.databases ? indexedDB.databases() : [];

    if (databases && databases.then) {
      databases.then((dbs) => {
        // For each database, attempt to delete it
        const promises = dbs.map((db) =>
          new Promise((resolve) => {
            try {
              const req = indexedDB.deleteDatabase(db.name);
              req.onsuccess = () => {
                console.log(`Successfully deleted IndexedDB: ${db.name}`);
                resolve(true);
              };
              req.onerror = () => {
                console.error(`Failed to delete IndexedDB: ${db.name}`);
                resolve(false);
              };
            } catch (error) {
              console.error(`Error deleting IndexedDB ${db.name}:`, error);
              resolve(false);
            }
          })
        );

        Promise.all(promises).then(() => {
          console.log("IndexedDB cleanup complete");
          resolve(true);
        });
      }).catch((error) => {
        console.error("Failed to get IndexedDB databases:", error);
        resolve(false);
      });
    } else {
      // Fallback for older browsers without databases() method
      console.log("No IndexedDB databases() method available");

      // Try to delete known Firestore databases
      try {
        const knownDBs = [
          'firestore',
          'firebaseLocalStorage',
          'firebase-installations-database',
          'firebase-heartbeat-database'
        ];

        const promises = knownDBs.map(dbName => {
          return new Promise(resolve => {
            try {
              const req = indexedDB.deleteDatabase(dbName);
              req.onsuccess = () => {
                console.log(`Deleted known DB: ${dbName}`);
                resolve(true);
              };
              req.onerror = () => {
                console.error(`Failed to delete known DB: ${dbName}`);
                resolve(false);
              };
            } catch (e) {
              console.error(`Error deleting known DB ${dbName}:`, e);
              resolve(false);
            }
          });
        });

        Promise.all(promises).then(() => {
          console.log("Known databases cleanup complete");
          resolve(true);
        });
      } catch (e) {
        console.error("Error in fallback IndexedDB cleanup:", e);
        resolve(false);
      }
    }
  });
}

// Clear localStorage
export function clearLocalStorage() {
  try {
    // Only remove app-related items, preserve authentication
    const keysToPreserve = ['firebase:authUser', 'hasLoggedIn'];

    // Store preserved values
    const preserved = {};
    keysToPreserve.forEach(key => {
      const value = localStorage.getItem(key);
      if (value) {
        preserved[key] = value;
      }
    });

    // Clear all localStorage
    localStorage.clear();

    // Restore preserved values
    Object.entries(preserved).forEach(([key, value]) => {
      localStorage.setItem(key, value);
    });

    console.log("localStorage cleared (preserved auth data)");
    return true;
  } catch (error) {
    console.error("Failed to clear localStorage:", error);
    return false;
  }
}

// Clear sessionStorage
export function clearSessionStorage() {
  try {
    // Only remove app-related items, preserve login state
    const keysToPreserve = ['hasLoggedIn'];

    // Store preserved values
    const preserved = {};
    keysToPreserve.forEach(key => {
      const value = sessionStorage.getItem(key);
      if (value) {
        preserved[key] = value;
      }
    });

    // Clear sessionStorage
    sessionStorage.clear();

    // Restore preserved values
    Object.entries(preserved).forEach(([key, value]) => {
      sessionStorage.setItem(key, value);
    });

    console.log("sessionStorage cleared (preserved login state)");
    return true;
  } catch (error) {
    console.error("Failed to clear sessionStorage:", error);
    return false;
  }
}

// Full browser storage cleanup
export async function fullStorageCleanup() {
  console.log("Starting full storage cleanup");

  // Clear all types of storage
  const indexedDBResult = await clearIndexedDB();
  const localStorageResult = clearLocalStorage();
  const sessionStorageResult = clearSessionStorage();

  // Log results
  console.log(`Cleanup results - IndexedDB: ${indexedDBResult}, localStorage: ${localStorageResult}, sessionStorage: ${sessionStorageResult}`);

  return indexedDBResult && localStorageResult && sessionStorageResult;
}

export default {
  clearIndexedDB,
  clearLocalStorage,
  clearSessionStorage,
  fullStorageCleanup
};
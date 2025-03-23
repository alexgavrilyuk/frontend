// src/modules/auth/contexts/AuthContext.js
import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signInWithPopup,
  createUserWithEmailAndPassword,
  signOut,
  getAuth
} from 'firebase/auth';
import { auth, googleProvider } from '../../../core/firebase';

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState(null);

  // Email/password sign in
  function login(email, password) {
    console.log("Attempting login for:", email);
    setAuthError(null);
    return signInWithEmailAndPassword(auth, email, password)
      .then(result => {
        console.log("Login successful for:", result.user.email);
        return result;
      })
      .catch(error => {
        console.error("Login error:", error);
        setAuthError(error.message);
        throw error;
      });
  }

  // Google sign in
  function loginWithGoogle() {
    console.log("Attempting Google login");
    setAuthError(null);
    return signInWithPopup(auth, googleProvider)
      .then(result => {
        console.log("Google login successful for:", result.user.email);
        return result;
      })
      .catch(error => {
        console.error("Google login error:", error);
        setAuthError(error.message);
        throw error;
      });
  }

  // Sign up with email/password
  function signup(email, password) {
    console.log("Attempting signup for:", email);
    setAuthError(null);
    return createUserWithEmailAndPassword(auth, email, password)
      .then(result => {
        console.log("Signup successful for:", result.user.email);
        return result;
      })
      .catch(error => {
        console.error("Signup error:", error);
        setAuthError(error.message);
        throw error;
      });
  }

  // Logout
  function logout() {
    console.log("Logging out current user");
    return signOut(auth)
      .then(() => {
        console.log("Logout successful");
        // Force clear current user to avoid any state issues
        setCurrentUser(null);
      })
      .catch(error => {
        console.error("Logout error:", error);
        throw error;
      });
  }

  // Set up auth state listener
  useEffect(() => {
    console.log("Setting up auth state listener");

    // Attempt to get current auth state directly
    const auth = getAuth();
    if (auth.currentUser) {
      console.log("Already authenticated as:", auth.currentUser.email);
      setCurrentUser(auth.currentUser);
      setLoading(false);
    }

    // Set up listener for auth state changes
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      console.log("Auth state changed:", user ? user.email : "No user");
      setCurrentUser(user);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const value = {
    currentUser,
    authError,
    login,
    loginWithGoogle,
    signup,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}
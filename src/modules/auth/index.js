// src/modules/auth/index.js
import Login from './components/Login';
import ProtectedRoute from './components/ProtectedRoute';
import { AuthProvider, useAuth } from './contexts/AuthContext';

export const routes = [
  {
    path: '/login',
    element: Login
  }
];

export {
  Login,
  ProtectedRoute,
  AuthProvider,
  useAuth
};
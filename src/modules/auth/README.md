This README is in frontend/src/modules/auth
# Auth Module

## Purpose

The Auth module handles user authentication, login, registration, and authorization throughout the application. It provides components for login screens, context for authentication state, and utilities for securing routes.

## Features

- User login and registration
- Authentication state management
- Protected route handling
- Firebase authentication integration

## Public API

This module exports:

- `Login`: Component for user login and registration
- `ProtectedRoute`: Component to secure routes requiring authentication
- `AuthProvider`: Context provider for authentication state
- `useAuth`: Hook for accessing authentication state and functions
- `routes`: Auth-related routes defined by this module

## Dependencies

This module depends on:

- Core:
  - Firebase (Authentication)

- Other Modules:
  - shared (UI components)

- External Libraries:
  - React Router DOM (for routing)
  - Firebase Authentication

## Configuration

The Auth module requires the following Firebase configuration:

- Firebase authentication set up with email/password and Google auth methods

## Usage Examples

### Accessing Auth State

```jsx
import { useAuth } from '../modules/auth';

function MyComponent() {
  const { currentUser, login, logout } = useAuth();

  return (
    <div>
      {currentUser ? (
        <button onClick={logout}>Logout</button>
      ) : (
        <button onClick={() => login(email, password)}>Login</button>
      )}
    </div>
  );
}
```

### Protecting Routes

```jsx
import { ProtectedRoute } from '../modules/auth';

function AppRoutes() {
  return (
    <Routes>
      <Route path="/dashboard" element={
        <ProtectedRoute>
          <Dashboard />
        </ProtectedRoute>
      } />
    </Routes>
  );
}
```

### User Login

```jsx
import { Login } from '../modules/auth';

function AuthPage() {
  return (
    <div className="auth-page">
      <Login />
    </div>
  );
}
```

## Error Handling

The Auth module provides error handling for common authentication scenarios:

- Invalid credentials
- Network errors
- Account creation failures
- Password reset issues

These errors are available through the `authError` state in the `useAuth` hook.

## Security Considerations

- Tokens are stored securely and refreshed automatically when needed
- Sessions can be configured for persistence or to expire when the browser is closed
- Protected routes prevent unauthorized access to sensitive areas of the application

## Future Enhancements

Planned enhancements for this module:

1. Additional authentication providers (Apple, Microsoft, etc.)
2. Multi-factor authentication support
3. Role-based access control
4. Enhanced security logging
This README is in frontend/src/modules/account
# Account Module

## Purpose

The Account module manages all user account-related functionality, including profile management, settings configuration, and user preferences. It provides interfaces for users to view and update their personal information, manage application settings, and configure AI behavior.

## Features

- User profile management (view and edit profile information)
- Account settings configuration
- AI behavior settings and preferences
- Application preferences (theme, display options, etc.)
- Security settings (password management)

## Public API

This module exports:

- `AccountManagement`: Main component for account management pages
- `UserProfile`: Component for viewing and editing user profile
- `ProfileSettings`: Component for managing account settings
- `AISettings`: Component for configuring AI behavior
- `AccountNavigation`: Navigation component for account section
- `routes`: Routes defined by this module

## Dependencies

This module depends on:

- Core:
  - firebase (Authentication & Firestore)
  - api (For API requests)

- Other Modules:
  - shared (UI components and utilities)

- External Libraries:
  - React Router DOM (for routing)
  - Firebase Authentication
  - Firestore

## Configuration

The Account module requires the following Firebase configuration:

- Firebase authentication set up with email/password and Google auth methods
- Firestore collections:
  - `userProfiles`: Stores user profile information
  - `userSettings`: Stores user application settings
  - `aiSettings`: Stores AI configuration preferences

## Usage Examples

### Navigating to Account Management

```jsx
import { useNavigate } from 'react-router-dom';

function SomeComponent() {
  const navigate = useNavigate();

  const goToAccountSettings = () => {
    navigate('/account/settings');
  };

  return (
    <button onClick={goToAccountSettings}>
      Account Settings
    </button>
  );
}
```

### Using Account Components Directly

```jsx
import { UserProfile } from '../modules/account';

function ProfilePage() {
  return (
    <div className="container">
      <h1>Your Profile</h1>
      <UserProfile />
    </div>
  );
}
```
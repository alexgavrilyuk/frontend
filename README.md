Frontend Root level README
# Financial Dashboard Application

## Overview

This is a modern financial dashboard application built with React and Firebase. The application follows a modular architecture that separates functionality into distinct business domains, allowing for better organization, maintainability, and scalability.

## Project Structure

The application is organized into the following main directories:

```
src/
├── app/                    # Application entry point and orchestration
├── core/                   # Core infrastructure services
├── modules/                # Feature modules
│   ├── auth/               # Authentication
│   ├── datasets/           # Dataset management
│   ├── query/              # Query functionality
│   ├── chat/               # Chat interface
│   ├── account/            # Account settings
│   └── shared/             # Shared UI components
└── [Root Level Files]      # Application bootstrap and configuration
```

## Root Level Files

### Application Bootstrap

- **index.js**: Entry point for the React application that renders the root App component
- **index.css**: Global styles including Tailwind CSS imports and custom animations
- **App.js**: Root component that sets up routing and error handling
- **App.css**: Styles specific to the App component

### Configuration

- **tailwind.config.js**: Configuration for Tailwind CSS with custom animations and styles
- **package.json**: Project dependencies, scripts, and configuration

### Testing

- **App.test.js**: Basic tests for the App component
- **setupTests.js**: Configuration for the testing environment
- **reportWebVitals.js**: Performance measurement functionality

## Technology Stack

- **React**: UI library for building component-based interfaces
- **React Router**: Navigation and routing
- **Firebase**: Authentication and database services
- **Tailwind CSS**: Utility-first styling framework
- **Context API**: State management

## Development Guidelines

### Getting Started

1. Clone the repository
2. Install dependencies:
   ```
   npm install
   ```
3. Start the development server:
   ```
   npm start
   ```

### Running Tests

```
npm test
```

### Building for Production

```
npm run build
```

## Module Documentation

Each module has its own README.md file with detailed documentation:

- [Core Services](./src/core/README.md)
- [App Module](./src/app/README.md)
- [Auth Module](./src/modules/auth/README.md)
- [Datasets Module](./src/modules/datasets/README.md)
- [Query Module](./src/modules/query/README.md)
- [Chat Module](./src/modules/chat/README.md)
- [Account Module](./src/modules/account/README.md)
- [Shared Module](./src/modules/shared/README.md)

## Architecture Documentation

For a more detailed understanding of the application architecture, refer to:

- [Comprehensive Frontend Architecture](./FRONTENDARCHITECTURE.md)
- [Frontend to Backend Integration](./FRONTENDTOBACKEND.md)
- [Backend to Frontend Integration](./BACKENDTOFRONTEND.md)
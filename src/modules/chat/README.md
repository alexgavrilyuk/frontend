This README is in frontend/src/modules/chat
# Chat Module

## Purpose

The Chat module handles the chat interface and conversation management. It provides components for displaying and managing chat messages, as well as the context for storing and managing the chat state.

## Features

- Chat interface components (panel, messages, input)
- Chat state management
- Message formatting and display

## Public API

This module exports:

### Components
- `ChatPanel`: Main chat interface component
- `ChatMessage`: Individual chat message component
- `ChatInput`: Message input component

### Contexts
- `ChatProvider`: Provider for chat state
- `useChat`: Hook for accessing chat state and functions

## Dependencies

This module depends on:

- Core:
  - API services

- Other Modules:
  - Auth (for user authentication)
  - Datasets (for dataset selection)
  - Query (for tableDataService)
  - Shared (for UI components)

## Integration Points

This module integrates with:
- Dashboard for displaying the chat interface
- Query module for handling data display
- API services for sending/receiving messages
// src/modules/chat/index.js
/**
 * Chat Module
 *
 * This module handles the chat interface and message management.
 */
// Import components
import ChatPanel from './components/ChatPanel';
import ChatMessage from './components/ChatMessage';
import ChatInput from './components/ChatInput';
// Import contexts
import { ChatProvider, useChat } from './contexts/ChatContext';
// Define module routes
export const routes = [
  // Chat routes will be added here when needed
];
// Export public API
export {
  ChatPanel,
  ChatMessage,
  ChatInput,
  ChatProvider,
  useChat
};
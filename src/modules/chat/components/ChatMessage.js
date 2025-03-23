// src/modules/chat/components/ChatMessage.js
import React from 'react';
import { ReportViewer } from '../../reports';

function ChatMessage({ message }) {
  const isUser = message.role === 'user';
  const timestamp = message.timestamp ? new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '';

  // Check if message contains a report
  const hasReport = message.report && typeof message.report === 'object';

  return (
    <div className={`flex w-full mb-4 ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div className={`flex flex-col max-w-[75%] ${isUser ? 'items-end' : 'items-start'}`}>
        {/* Message bubble with glow effect */}
        <div
          className={`relative px-4 py-3 rounded-2xl shadow-md ${
            isUser
              ? 'bg-blue-500/85 text-white backdrop-blur-sm ring-1 ring-blue-400/50 shadow-blue-500/30'
              : 'bg-gray-700/85 text-gray-100 backdrop-blur-sm ring-1 ring-gray-600/50 shadow-gray-800/30'
          }`}
          style={{
            boxShadow: isUser
              ? '0 0 15px rgba(59, 130, 246, 0.3)'
              : '0 0 15px rgba(55, 65, 81, 0.3)'
          }}
        >
          {/* Message content */}
          {hasReport ? (
            // Render the embedded report
            <div className="report-container w-full">
              <ReportViewer reportData={message.report} isEmbedded={true} />
            </div>
          ) : (
            // Regular message content
            <p className="text-sm whitespace-pre-wrap break-words">{message.content}</p>
          )}
        </div>

        {/* Timestamp */}
        <div className="text-xs text-gray-500 mt-1 px-1">{timestamp}</div>
      </div>
    </div>
  );
}

export default ChatMessage;
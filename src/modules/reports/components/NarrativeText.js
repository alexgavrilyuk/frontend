// src/modules/reports/components/NarrativeText.js
import React from 'react';
import { Card } from '../../shared/components';

/**
 * Displays formatted narrative text with highlighting
 *
 * @param {Object} props
 * @param {string} props.content - Markdown-formatted narrative text
 * @param {boolean} props.withCard - Whether to wrap the content in a Card
 */
const NarrativeText = ({ content, withCard = true }) => {
  // Simple markdown-to-HTML conversion for basic formatting
  const formatMarkdown = (text) => {
    if (!text) return '';

    // Replace heading patterns
    let formatted = text
      .replace(/^### (.*$)/gim, '<h3 class="text-lg font-medium text-white mt-4 mb-2">$1</h3>')
      .replace(/^## (.*$)/gim, '<h2 class="text-xl font-semibold text-white mt-5 mb-3">$1</h2>')
      .replace(/^# (.*$)/gim, '<h1 class="text-2xl font-bold text-white mt-6 mb-4">$1</h1>');

    // Replace bold and italic patterns
    formatted = formatted
      .replace(/\*\*(.*?)\*\*/gim, '<span class="font-bold">$1</span>')
      .replace(/\*(.*?)\*/gim, '<span class="italic">$1</span>');

    // Replace list items
    formatted = formatted
      .replace(/^\s*\- (.*$)/gim, '<li class="ml-4 list-disc text-gray-300 mb-1">$1</li>')
      .replace(/^\s*\d+\. (.*$)/gim, '<li class="ml-4 list-decimal text-gray-300 mb-1">$1</li>');

    // Replace paragraphs (any line that doesn't start with <)
    formatted = formatted
      .replace(/^(?!<)(.+)$/gim, '<p class="text-gray-300 mb-3">$1</p>');

    // Replace line breaks
    formatted = formatted
      .replace(/\n/gim, '');

    // Highlight key insights
    formatted = formatted
      .replace(/\[insight\](.*?)\[\/insight\]/gim, '<span class="text-blue-400 font-medium">$1</span>');

    // Highlight metrics
    formatted = formatted
      .replace(/\[metric\](.*?)\[\/metric\]/gim, '<span class="text-green-400 font-semibold">$1</span>');

    // Highlight warnings
    formatted = formatted
      .replace(/\[warning\](.*?)\[\/warning\]/gim, '<span class="text-yellow-400 font-medium">$1</span>');

    return formatted;
  };

  // Render the content
  const renderContent = () => {
    return (
      <div
        className="markdown-content text-sm"
        dangerouslySetInnerHTML={{ __html: formatMarkdown(content) }}
      />
    );
  };

  // Wrap in card if specified
  if (withCard) {
    return (
      <Card variant="glass" className="p-4">
        {renderContent()}
      </Card>
    );
  }

  // Return just the content without card
  return renderContent();
};

export default NarrativeText;
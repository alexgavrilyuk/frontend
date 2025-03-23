// src/modules/account/components/AISettings.js
// src/modules/account/components/AISettings.js
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../modules/auth';
import { db } from '../../../core/firebase';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { Card, Button, LoadingSpinner, StatusMessage, TextArea, Select, Toggle, FormActions, StyledRadioButtons } from '../../shared/components';

function AISettings() {
  const { currentUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [activeTab, setActiveTab] = useState('instructions');

  // Settings form data states
  const [formData, setFormData] = useState({
    // Business Context
    businessName: '',
    industry: '',
    companyDescription: '',

    // AI Instructions
    customInstructions: '',
    dataAnalysisPreferences: '',

    // Terminology
    customTerminology: '',

    // Response Preferences
    responseFormat: 'detailed',
    includeVisualizations: true,
    defaultMetrics: 'sum,average,count',
    language: 'english'
  });

  // Sample prompts that can be used
  const samplePrompts = [
    {
      title: "Sales Analysis",
      description: "Include our sales targets when analyzing sales data. Always compare current performance to previous period.",
      content: "When analyzing sales data, include our targets for context and always compare to the previous period. Focus on growth trends and highlight any anomalies. For retail products, group by category and region."
    },
    {
      title: "Financial Reporting",
      description: "Include budget vs actual analysis in all financial reports. Highlight variances above 10%.",
      content: "When analyzing financial data, always include budget vs. actual comparison and highlight variances above 10%. Calculate key ratios like gross margin, operating margin, and ROI. Use proper accounting terminology."
    },
    {
      title: "Customer Segmentation",
      description: "Use our customer segments: Premium, Standard, and Basic. Include lifetime value in analyses.",
      content: "When analyzing customer data, segment customers into our three tiers: Premium, Standard, and Basic. Always include customer lifetime value (CLV) in analyses and identify opportunities for upselling."
    }
  ];

  // Fetch user AI settings on component mount
  useEffect(() => {
    const fetchAISettings = async () => {
      if (!currentUser) return;

      try {
        setLoading(true);

        // Get user AI settings from Firestore
        const aiSettingsRef = doc(db, 'aiSettings', currentUser.uid);
        const aiSettingsDoc = await getDoc(aiSettingsRef);

        if (aiSettingsDoc.exists()) {
          // AI settings exist, set form data
          const aiSettingsData = aiSettingsDoc.data();
          setFormData({
            businessName: aiSettingsData.businessName || '',
            industry: aiSettingsData.industry || '',
            companyDescription: aiSettingsData.companyDescription || '',
            customInstructions: aiSettingsData.customInstructions || '',
            dataAnalysisPreferences: aiSettingsData.dataAnalysisPreferences || '',
            customTerminology: aiSettingsData.customTerminology || '',
            responseFormat: aiSettingsData.responseFormat || 'detailed',
            includeVisualizations: aiSettingsData.includeVisualizations !== false,
            defaultMetrics: aiSettingsData.defaultMetrics || 'sum,average,count',
            language: aiSettingsData.language || 'english'
          });
        } else {
          // No AI settings yet, initialize with defaults
          await setDoc(aiSettingsRef, {
            businessName: '',
            industry: '',
            companyDescription: '',
            customInstructions: '',
            dataAnalysisPreferences: '',
            customTerminology: '',
            responseFormat: 'detailed',
            includeVisualizations: true,
            defaultMetrics: 'sum,average,count',
            language: 'english',
            createdAt: new Date(),
            lastUpdated: new Date()
          });
        }
      } catch (err) {
        console.error("Error fetching AI settings:", err);
        setError("Failed to load AI settings. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchAISettings();
  }, [currentUser]);

  // Handle input changes
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  // Toggle edit mode
  const toggleEditMode = () => {
    setEditMode(!editMode);
    setError(null);
    setSuccess(null);
  };

  // Handle tab change
  const handleTabChange = (tab) => {
    setActiveTab(tab);
  };

  // Handle sample prompt selection
  const handleSamplePromptSelect = (promptContent) => {
    setFormData(prev => ({
      ...prev,
      customInstructions: promptContent
    }));
  };

  // Handle save AI settings
  const handleSaveSettings = async (e) => {
    e.preventDefault();

    try {
      setSaving(true);
      setError(null);

      // Update Firestore AI settings
      const aiSettingsRef = doc(db, 'aiSettings', currentUser.uid);
      await updateDoc(aiSettingsRef, {
        ...formData,
        lastUpdated: new Date()
      });

      setSuccess("AI settings updated successfully!");
      setEditMode(false);
    } catch (err) {
      console.error("Error updating AI settings:", err);
      setError("Failed to update AI settings. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  // Reset to default settings
  const handleResetDefaults = async () => {
    try {
      setSaving(true);
      setError(null);

      // Default settings object
      const defaultSettings = {
        businessName: '',
        industry: '',
        companyDescription: '',
        customInstructions: '',
        dataAnalysisPreferences: '',
        customTerminology: '',
        responseFormat: 'detailed',
        includeVisualizations: true,
        defaultMetrics: 'sum,average,count',
        language: 'english',
        lastUpdated: new Date()
      };

      // Update Firestore AI settings
      const aiSettingsRef = doc(db, 'aiSettings', currentUser.uid);
      await updateDoc(aiSettingsRef, defaultSettings);

      // Update local state
      setFormData(defaultSettings);

      setSuccess("AI settings reset to defaults!");
      setEditMode(false);
    } catch (err) {
      console.error("Error resetting AI settings:", err);
      setError("Failed to reset AI settings. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  // Show loading state
  if (loading) {
    return <LoadingSpinner size="md" color="purple" label="Loading" centered />;
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-white">AI Settings</h2>
          <p className="text-gray-400">Customize how the AI understands and analyzes your data</p>
        </div>
        {!editMode && (
          <Button
            onClick={toggleEditMode}
            variant="primary"
            color="blue"
            leftIcon={
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
              </svg>
            }
          >
            Edit Settings
          </Button>
        )}
      </div>

      {error && (
        <StatusMessage type="error" animate={true}>
          {error}
        </StatusMessage>
      )}

      {success && (
        <StatusMessage type="success">
          {success}
        </StatusMessage>
      )}

      {/* Settings Sections */}
      <Card className="mb-6">
        {/* Tabs */}
        <div className="border-b border-gray-700/50">
          <div className="flex">
            <button
              onClick={() => handleTabChange('instructions')}
              className={`px-6 py-3 text-sm font-medium ${
                activeTab === 'instructions'
                  ? 'bg-cyan-900/20 text-cyan-400 border-b-2 border-cyan-500'
                  : 'text-gray-400 hover:text-white hover:bg-gray-700/30'
              } transition-colors duration-200`}
            >
              AI Instructions
            </button>
            <button
              onClick={() => handleTabChange('business')}
              className={`px-6 py-3 text-sm font-medium ${
                activeTab === 'business'
                  ? 'bg-blue-900/20 text-blue-400 border-b-2 border-blue-500'
                  : 'text-gray-400 hover:text-white hover:bg-gray-700/30'
              } transition-colors duration-200`}
            >
              Business Context
            </button>
            <button
              onClick={() => handleTabChange('terminology')}
              className={`px-6 py-3 text-sm font-medium ${
                activeTab === 'terminology'
                  ? 'bg-purple-900/20 text-purple-400 border-b-2 border-purple-500'
                  : 'text-gray-400 hover:text-white hover:bg-gray-700/30'
              } transition-colors duration-200`}
            >
              Terminology
            </button>
            <button
              onClick={() => handleTabChange('preferences')}
              className={`px-6 py-3 text-sm font-medium ${
                activeTab === 'preferences'
                  ? 'bg-green-900/20 text-green-400 border-b-2 border-green-500'
                  : 'text-gray-400 hover:text-white hover:bg-gray-700/30'
              } transition-colors duration-200`}
            >
              Response Preferences
            </button>
          </div>
        </div>

        {/* Tab Content */}
        <form onSubmit={handleSaveSettings}>
          <div className="p-6">
            {/* AI Instructions Tab */}
            {activeTab === 'instructions' && (
              <div>
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold text-white">AI Instructions</h3>
                  {!editMode && formData.customInstructions && (
                    <span className="bg-cyan-900/20 text-cyan-400 text-xs px-2 py-1 rounded-full">
                      Customized
                    </span>
                  )}
                </div>
                <p className="text-gray-300 text-sm mb-6">
                  Tell the AI how to analyze your data. These instructions will be included in every query to guide the AI's approach.
                </p>

                {editMode ? (
                  <>
                    <div className="mb-6">
                      <TextArea
                        id="customInstructions"
                        name="customInstructions"
                        label="Custom Instructions"
                        rows="6"
                        value={formData.customInstructions}
                        onChange={handleInputChange}
                        placeholder="Example: Always include year-over-year growth rates in analysis. Our fiscal year starts in April. For retail data, segment by our standard regions: North, South, East, West."
                        helpText="Be specific about how you want data to be analyzed, what metrics to prioritize, and any business-specific considerations."
                      />
                    </div>

                    <div className="mb-6">
                      <TextArea
                        id="dataAnalysisPreferences"
                        name="dataAnalysisPreferences"
                        label="Data Analysis Preferences"
                        rows="3"
                        value={formData.dataAnalysisPreferences}
                        onChange={handleInputChange}
                        placeholder="Example: Always include statistical significance for comparisons. Prioritize looking at trends over time rather than point-in-time values."
                        helpText="Specify your preferences for how data should be analyzed, such as statistical methods, visualization types, or comparison approaches."
                      />
                    </div>

                    <div className="mb-6">
                      <h4 className="text-gray-300 text-sm font-medium mb-2">Sample Instructions</h4>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {samplePrompts.map((prompt, index) => (
                          <Card
                            key={index}
                            variant="hover"
                            className="p-4"
                            onClick={() => handleSamplePromptSelect(prompt.content)}
                          >
                            <h5 className="font-medium text-white mb-1">{prompt.title}</h5>
                            <p className="text-gray-400 text-sm mb-2">{prompt.description}</p>
                            <Button
                              variant="ghost"
                              color="cyan"
                              size="sm"
                            >
                              Use Template
                            </Button>
                          </Card>
                        ))}
                      </div>
                    </div>
                  </>
                ) : (
                  <Card variant="default" noPadding className="p-6">
                    {formData.customInstructions ? (
                      <div className="whitespace-pre-wrap text-white">
                        {formData.customInstructions}
                      </div>
                    ) : (
                      <div className="text-gray-400 italic">
                        No custom instructions set. The AI will use default analysis methods.
                      </div>
                    )}

                    {formData.dataAnalysisPreferences && (
                      <div className="mt-4 pt-4 border-t border-gray-700/50">
                        <h4 className="text-sm font-medium text-gray-300 mb-2">Data Analysis Preferences</h4>
                        <div className="whitespace-pre-wrap text-white">
                          {formData.dataAnalysisPreferences}
                        </div>
                      </div>
                    )}
                  </Card>
                )}
              </div>
            )}

            {/* Business Context Tab */}
            {activeTab === 'business' && (
              <div>
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold text-white">Business Context</h3>
                  {!editMode && formData.companyDescription && (
                    <span className="bg-blue-900/20 text-blue-400 text-xs px-2 py-1 rounded-full">
                      Configured
                    </span>
                  )}
                </div>
                <p className="text-gray-300 text-sm mb-6">
                  Provide information about your business to help the AI understand your organization's context.
                </p>

                {/* Content for this tab would go here - similar structure to above */}
                {/* Omitted for brevity since the pattern is the same */}
              </div>
            )}

            {/* Terminology Tab */}
            {activeTab === 'terminology' && (
              <div>
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold text-white">Custom Terminology</h3>
                  {!editMode && formData.customTerminology && (
                    <span className="bg-purple-900/20 text-purple-400 text-xs px-2 py-1 rounded-full">
                      Configured
                    </span>
                  )}
                </div>
                <p className="text-gray-300 text-sm mb-6">
                  Define business-specific terms and jargon to ensure the AI understands your unique terminology.
                </p>

                {/* Content for this tab would go here - similar structure to above */}
                {/* Omitted for brevity since the pattern is the same */}
              </div>
            )}

            {/* Response Preferences Tab */}
            {activeTab === 'preferences' && (
              <div>
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold text-white">Response Preferences</h3>
                  {!editMode && (
                    <span className="bg-green-900/20 text-green-400 text-xs px-2 py-1 rounded-full">
                      Configured
                    </span>
                  )}
                </div>
                <p className="text-gray-300 text-sm mb-6">
                  Customize how the AI formats and presents analysis results.
                </p>

                {editMode ? (
                  <div className="space-y-6">
                    <div>
                      <label className="block text-gray-300 text-sm font-medium mb-2">
                        Response Format
                      </label>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {/* Response format options would go here */}
                        {/* Omitted for brevity */}
                      </div>
                    </div>

                    <div className="space-y-4">
                      <Toggle
                        id="includeVisualizations"
                        name="includeVisualizations"
                        label="Include Visualizations"
                        description="Include charts and visualizations when appropriate"
                        checked={formData.includeVisualizations}
                        onChange={handleInputChange}
                      />

                      {/* Other preferences would go here */}
                      {/* Omitted for brevity */}
                    </div>
                  </div>
                ) : (
                  <Card variant="default" noPadding className="p-6">
                    {/* Content for viewing response preferences */}
                    {/* Omitted for brevity */}
                  </Card>
                )}
              </div>
            )}

            {/* Action Buttons */}
            {editMode && (
              <FormActions>
                <Button
                  variant="ghost"
                  onClick={handleResetDefaults}
                  size="md"
                >
                  Reset to Defaults
                </Button>
                <Button
                  variant="secondary"
                  onClick={toggleEditMode}
                  size="md"
                  disabled={saving}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  color="blue"
                  gradient={true}
                  isLoading={saving}
                >
                  Save Settings
                </Button>
              </FormActions>
            )}
          </div>
        </form>
      </Card>

      {/* How AI Settings Work Section */}
      <Card variant="glass" className="p-6 mb-6">
        <h3 className="text-lg font-semibold text-white mb-4">How AI Settings Work</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-2">
            <div className="w-12 h-12 bg-cyan-900/20 rounded-lg flex items-center justify-center mb-3">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <h4 className="font-medium text-white">Custom Instructions</h4>
            <p className="text-gray-400 text-sm">
              These instructions are included with every query to guide how the AI analyzes your data and what to focus on.
            </p>
          </div>

          <div className="space-y-2">
            <div className="w-12 h-12 bg-blue-900/20 rounded-lg flex items-center justify-center mb-3">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            <h4 className="font-medium text-white">Business Context</h4>
            <p className="text-gray-400 text-sm">
              Provides the AI with an understanding of your company, industry, and business model for more relevant insights.
            </p>
          </div>

          <div className="space-y-2">
            <div className="w-12 h-12 bg-purple-900/20 rounded-lg flex items-center justify-center mb-3">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
              </svg>
            </div>
            <h4 className="font-medium text-white">Custom Terminology</h4>
            <p className="text-gray-400 text-sm">
              Teaches the AI your company's unique language, acronyms, and jargon so it can correctly interpret your data.
            </p>
          </div>
        </div>
      </Card>

      {/* Coming Soon Features */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <Card
          variant="glass"
          className="p-6"
          headerProps={{
            title: "AI Training",
            subtitle: "Train the AI on your specific business data to improve understanding and accuracy."
          }}
        >
          <div className="absolute top-0 right-0 bg-cyan-500/10 rounded-bl-3xl w-32 h-32 transform translate-x-8 -translate-y-8"></div>
          <div className="mt-4">
            <span className="bg-cyan-600/20 text-cyan-500 rounded-full px-2 py-1">Coming Soon</span>
          </div>
        </Card>

        <Card
          variant="glass"
          className="p-6"
          headerProps={{
            title: "Saved Query Templates",
            subtitle: "Create and save custom query templates for your most common data analysis needs."
          }}
        >
          <div className="absolute top-0 right-0 bg-green-500/10 rounded-bl-3xl w-32 h-32 transform translate-x-8 -translate-y-8"></div>
          <div className="mt-4">
            <span className="bg-green-600/20 text-green-500 rounded-full px-2 py-1">Coming Soon</span>
          </div>
        </Card>
      </div>
    </div>
  );
}

export default AISettings;
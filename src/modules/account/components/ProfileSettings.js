// src/modules/account/components/ProfileSettings.js
import React, { useState, useEffect } from 'react';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { useAuth } from '../../../modules/auth';
import { db } from '../../../core/firebase';
import { LoadingSpinner, StatusMessage, Card, Button, Select, Toggle, FormSection, FormActions } from '../../shared/components';

function ProfileSettings() {
  const { currentUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  // Settings form data
  const [settings, setSettings] = useState({
    // Notification preferences
    emailNotifications: true,
    weeklyReports: false,
    dataAlerts: true,

    // Application preferences
    defaultDashboardView: 'split',
    theme: 'dark', // In the future, you might support light/dark/system
    dataVisualizationPreference: 'auto',

    // Privacy settings
    shareUsageData: false,
    storeQueryHistory: true,

    // Regional settings
    timeZone: 'UTC',
    dateFormat: 'MM/DD/YYYY',
    numberFormat: 'en-US'
  });

  // Fetch user profile settings on component mount
  useEffect(() => {
    const fetchProfileSettings = async () => {
      if (!currentUser) return;

      try {
        setLoading(true);

        // Get user profile settings from Firestore
        const settingsRef = doc(db, 'userSettings', currentUser.uid);
        const settingsDoc = await getDoc(settingsRef);

        if (settingsDoc.exists()) {
          // Settings exist, set form data
          const userData = settingsDoc.data();
          setSettings({
            emailNotifications: userData.emailNotifications !== false,
            weeklyReports: userData.weeklyReports === true,
            dataAlerts: userData.dataAlerts !== false,
            defaultDashboardView: userData.defaultDashboardView || 'split',
            theme: userData.theme || 'dark',
            dataVisualizationPreference: userData.dataVisualizationPreference || 'auto',
            shareUsageData: userData.shareUsageData === true,
            storeQueryHistory: userData.storeQueryHistory !== false,
            timeZone: userData.timeZone || 'UTC',
            dateFormat: userData.dateFormat || 'MM/DD/YYYY',
            numberFormat: userData.numberFormat || 'en-US'
          });
        } else {
          // No settings yet, initialize with defaults in Firestore
          await setDoc(settingsRef, {
            ...settings,
            createdAt: new Date(),
            lastUpdated: new Date()
          });
        }
      } catch (err) {
        console.error("Error fetching profile settings:", err);
        setError("Failed to load settings. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchProfileSettings();
  }, [currentUser]);

  // Handle checkbox changes
  const handleCheckboxChange = (e) => {
    const { name, checked } = e.target;
    setSettings(prev => ({
      ...prev,
      [name]: checked
    }));
  };

  // Handle select/input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setSettings(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Save settings to Firestore
  const handleSaveSettings = async () => {
    if (!currentUser) return;

    try {
      setSaving(true);
      setError(null);
      setSuccess(null);

      // Update Firestore settings
      const settingsRef = doc(db, 'userSettings', currentUser.uid);
      await updateDoc(settingsRef, {
        ...settings,
        lastUpdated: new Date()
      });

      setSuccess("Settings saved successfully!");

      // Store some settings in session storage for immediate application
      sessionStorage.setItem('defaultDashboardView', settings.defaultDashboardView);
      sessionStorage.setItem('theme', settings.theme);

    } catch (err) {
      console.error("Error saving settings:", err);
      setError("Failed to save settings. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  // Show loading state
  if (loading) {
    return <LoadingSpinner size="md" color="blue" label="Loading" centered />;
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-white">Account Settings</h2>
        <p className="text-gray-400">Manage your preferences and account settings</p>
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
      <div className="space-y-6">
        {/* Notification Preferences */}
        <Card
          variant="default"
          headerProps={{
            title: "Notification Preferences",
            icon: (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                <path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z" />
              </svg>
            )
          }}
        >
          <div className="space-y-4">
            <Toggle
              label="Email Notifications"
              id="emailNotifications"
              description="Receive notifications about account activity and updates"
              checked={settings.emailNotifications}
              onChange={handleCheckboxChange}
            />

            <Toggle
              label="Weekly Reports"
              id="weeklyReports"
              description="Get a weekly summary of your data analysis activity"
              checked={settings.weeklyReports}
              onChange={handleCheckboxChange}
            />

            <Toggle
              label="Data Alerts"
              id="dataAlerts"
              description="Receive alerts about important changes in your data"
              checked={settings.dataAlerts}
              onChange={handleCheckboxChange}
            />
          </div>
        </Card>

        {/* Application Preferences */}
        <Card
          variant="default"
          headerProps={{
            title: "Application Preferences",
            icon: (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-purple-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
              </svg>
            )
          }}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Select
              id="defaultDashboardView"
              name="defaultDashboardView"
              label="Default Dashboard View"
              value={settings.defaultDashboardView}
              onChange={handleInputChange}
              options={[
                { value: 'single', label: 'Single Search Box' },
                { value: 'split', label: 'Split View (Chat & Results)' }
              ]}
              helpText="Choose how the dashboard appears when you first log in"
            />

            <Select
              id="theme"
              name="theme"
              label="Theme"
              value={settings.theme}
              onChange={handleInputChange}
              options={[
                { value: 'dark', label: 'Dark' },
                { value: 'light', label: 'Light (Coming Soon)', disabled: true },
                { value: 'system', label: 'System Default (Coming Soon)', disabled: true }
              ]}
              helpText="Choose your preferred application theme"
            />

            <Select
              id="dataVisualizationPreference"
              name="dataVisualizationPreference"
              label="Data Visualization"
              value={settings.dataVisualizationPreference}
              onChange={handleInputChange}
              options={[
                { value: 'auto', label: 'Automatic (Let AI Decide)' },
                { value: 'tables', label: 'Prefer Tables' },
                { value: 'charts', label: 'Prefer Charts' }
              ]}
              helpText="Choose how you prefer data to be visualized"
            />
          </div>
        </Card>

        {/* Privacy & Storage */}
        <Card
          variant="default"
          headerProps={{
            title: "Privacy & Storage",
            icon: (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            )
          }}
        >
          <div className="space-y-4">
            <Toggle
              label="Share Usage Data"
              id="shareUsageData"
              description="Share anonymous usage data to help improve the platform"
              checked={settings.shareUsageData}
              onChange={handleCheckboxChange}
            />

            <Toggle
              label="Store Query History"
              id="storeQueryHistory"
              description="Save your previous queries for easy reference"
              checked={settings.storeQueryHistory}
              onChange={handleCheckboxChange}
            />
          </div>
        </Card>

        {/* Regional Settings */}
        <Card
          variant="default"
          headerProps={{
            title: "Regional Settings",
            icon: (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-cyan-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM4.332 8.027a6.012 6.012 0 011.912-2.706C6.512 5.73 6.974 6 7.5 6A1.5 1.5 0 019 7.5V8a2 2 0 004 0 2 2 0 011.523-1.943A5.977 5.977 0 0116 10c0 .34-.028.675-.083 1H15a2 2 0 00-2 2v2.197A5.973 5.973 0 0110 16v-2a2 2 0 00-2-2 2 2 0 01-2-2 2 2 0 00-1.668-1.973z" clipRule="evenodd" />
              </svg>
            )
          }}
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Select
              id="timeZone"
              name="timeZone"
              label="Time Zone"
              value={settings.timeZone}
              onChange={handleInputChange}
              options={[
                { value: 'UTC', label: 'UTC' },
                { value: 'America/New_York', label: 'Eastern Time (ET)' },
                { value: 'America/Chicago', label: 'Central Time (CT)' },
                { value: 'America/Denver', label: 'Mountain Time (MT)' },
                { value: 'America/Los_Angeles', label: 'Pacific Time (PT)' },
                { value: 'Europe/London', label: 'London (GMT)' },
                { value: 'Europe/Paris', label: 'Paris (CET)' },
                { value: 'Asia/Tokyo', label: 'Tokyo (JST)' }
              ]}
            />

            <Select
              id="dateFormat"
              name="dateFormat"
              label="Date Format"
              value={settings.dateFormat}
              onChange={handleInputChange}
              options={[
                { value: 'MM/DD/YYYY', label: 'MM/DD/YYYY' },
                { value: 'DD/MM/YYYY', label: 'DD/MM/YYYY' },
                { value: 'YYYY-MM-DD', label: 'YYYY-MM-DD' }
              ]}
            />

            <Select
              id="numberFormat"
              name="numberFormat"
              label="Number Format"
              value={settings.numberFormat}
              onChange={handleInputChange}
              options={[
                { value: 'en-US', label: '1,234.56 (US)' },
                { value: 'en-GB', label: '1,234.56 (UK)' },
                { value: 'de-DE', label: '1.234,56 (German)' },
                { value: 'fr-FR', label: '1 234,56 (French)' }
              ]}
            />
          </div>
        </Card>

        {/* Save Button */}
        <div className="flex justify-end">
          <Button
            onClick={handleSaveSettings}
            variant="primary"
            gradient={true}
            isLoading={saving}
          >
            Save Settings
          </Button>
        </div>
      </div>
    </div>
  );
}

export default ProfileSettings;
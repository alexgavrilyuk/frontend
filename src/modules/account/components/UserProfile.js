// src/modules/account/components/UserProfile.js
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../modules/auth';
import { db } from '../../../core/firebase';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { updatePassword, reauthenticateWithCredential, EmailAuthProvider, updateProfile } from 'firebase/auth';
import { LoadingSpinner, StatusMessage, Card, Button, Input, TextArea, FormActions } from '../../shared/components';
function UserProfile() {
  const { currentUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [passwordEditMode, setPasswordEditMode] = useState(false);
  const [reAuthRequired, setReAuthRequired] = useState(false);

  // Form data states
  const [formData, setFormData] = useState({
    displayName: '',
    jobTitle: '',
    company: '',
    phone: '',
    bio: ''
  });

  // Original form data for reset on cancel
  const [originalFormData, setOriginalFormData] = useState({});

  // Password change states
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  // Re-authentication state
  const [reAuthData, setReAuthData] = useState({
    email: currentUser?.email || '',
    password: ''
  });

  // Helper to reset feedback states
  const resetFeedbackStates = () => {
    setError(null);
    setSuccess(null);
  };

  // Fetch user profile data on component mount
  useEffect(() => {
    const fetchUserProfile = async () => {
      if (!currentUser) return;

      try {
        setLoading(true);
        resetFeedbackStates();

        // Get user profile from Firestore
        const userDocRef = doc(db, 'userProfiles', currentUser.uid);
        const userDoc = await getDoc(userDocRef);

        if (userDoc.exists()) {
          // User profile exists, set form data
          const userData = userDoc.data();
          const newFormData = {
            displayName: userData.displayName || currentUser.displayName || '',
            jobTitle: userData.jobTitle || '',
            company: userData.company || '',
            phone: userData.phone || '',
            bio: userData.bio || ''
          };

          setFormData(newFormData);
          setOriginalFormData(newFormData); // Store original data for cancel operation
        } else {
          // No user profile yet, initialize with defaults
          const defaultData = {
            displayName: currentUser.displayName || '',
            jobTitle: '',
            company: '',
            phone: '',
            bio: ''
          };

          setFormData(defaultData);
          setOriginalFormData(defaultData);

          // Create default profile in Firestore
          await setDoc(userDocRef, {
            displayName: currentUser.displayName || '',
            email: currentUser.email,
            createdAt: new Date(),
            lastUpdated: new Date()
          });
        }
      } catch (err) {
        console.error("Error fetching user profile:", err);
        setError("Failed to load profile data. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, [currentUser]);

  // Handle input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle password input changes
  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle re-authentication input changes
  const handleReAuthChange = (e) => {
    const { name, value } = e.target;
    setReAuthData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Toggle edit mode
  const toggleEditMode = () => {
    if (editMode) {
      // If canceling, reset form data to original values
      setFormData(originalFormData);
    }
    setEditMode(!editMode);
    resetFeedbackStates();
  };

  // Toggle password edit mode
  const togglePasswordEditMode = () => {
    setPasswordEditMode(!passwordEditMode);
    setPasswordData({
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    });
    resetFeedbackStates();
  };

  // Handle profile update
  const handleProfileUpdate = async (e) => {
    e.preventDefault();

    try {
      setUpdating(true);
      resetFeedbackStates();

      // Update Firestore user profile
      const userDocRef = doc(db, 'userProfiles', currentUser.uid);
      await updateDoc(userDocRef, {
        ...formData,
        lastUpdated: new Date()
      });

      // Update Firebase Auth profile for display name
      if (formData.displayName !== currentUser.displayName) {
        await updateProfile(currentUser, {
          displayName: formData.displayName
        });
      }

      // Update the original form data to reflect new values
      setOriginalFormData(formData);

      setSuccess("Profile updated successfully!");
      setEditMode(false);
    } catch (err) {
      console.error("Error updating profile:", err);
      setError("Failed to update profile: " + (err.message || "Unknown error"));
    } finally {
      setUpdating(false);
    }
  };

  // Handle password update
  const handlePasswordUpdate = async (e) => {
    e.preventDefault();

    // Validate passwords
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setError("New passwords do not match.");
      return;
    }

    if (passwordData.newPassword.length < 6) {
      setError("Password should be at least 6 characters long.");
      return;
    }

    try {
      setUpdating(true);
      resetFeedbackStates();

      // Create credential for re-authentication
      const credential = EmailAuthProvider.credential(
        currentUser.email,
        passwordData.currentPassword
      );

      // Re-authenticate user
      await reauthenticateWithCredential(currentUser, credential);

      // Update password
      await updatePassword(currentUser, passwordData.newPassword);

      setSuccess("Password updated successfully!");
      setPasswordEditMode(false);
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
    } catch (err) {
      console.error("Error updating password:", err);

      // Specific error handling for common authentication issues
      if (err.code === 'auth/wrong-password') {
        setError("Current password is incorrect.");
      } else if (err.code === 'auth/requires-recent-login') {
        setReAuthRequired(true);
      } else if (err.code === 'auth/weak-password') {
        setError("Password is too weak. Please choose a stronger password.");
      } else {
        setError("Failed to update password: " + (err.message || "Unknown error"));
      }
    } finally {
      setUpdating(false);
    }
  };

  // Handle re-authentication
  const handleReAuthenticate = async (e) => {
    e.preventDefault();

    try {
      setUpdating(true);
      resetFeedbackStates();

      // Create credential
      const credential = EmailAuthProvider.credential(
        reAuthData.email,
        reAuthData.password
      );

      // Re-authenticate user
      await reauthenticateWithCredential(currentUser, credential);

      setReAuthRequired(false);
      setSuccess("Re-authentication successful!");
    } catch (err) {
      console.error("Error re-authenticating:", err);

      // Specific error handling for common authentication issues
      if (err.code === 'auth/wrong-password') {
        setError("Password is incorrect.");
      } else if (err.code === 'auth/too-many-requests') {
        setError("Too many failed attempts. Please try again later.");
      } else if (err.code === 'auth/user-not-found') {
        setError("User account not found.");
      } else {
        setError("Re-authentication failed: " + (err.message || "Unknown error"));
      }
    } finally {
      setUpdating(false);
    }
  };

  // Show loading state
  if (loading) {
    return <LoadingSpinner size="md" color="blue" label="Loading" centered />;
  }

  // Show re-authentication form if required
  if (reAuthRequired) {
    return (
      <Card variant="default" className="max-w-2xl mx-auto animate-fade-in-up">
        <h2 className="text-xl font-bold text-white mb-4">Re-authentication Required</h2>
        <p className="text-gray-300 mb-6">
          For your security, please verify your password before making changes to your account.
        </p>

        {error && <StatusMessage type="error" animate={true}>{error}</StatusMessage>}
        {success && <StatusMessage type="success">{success}</StatusMessage>}

        <form onSubmit={handleReAuthenticate}>
          <Input
            type="email"
            id="email"
            name="email"
            label="Email"
            value={reAuthData.email}
            onChange={handleReAuthChange}
            readOnly
          />

          <Input
            type="password"
            id="password"
            name="password"
            label="Password"
            value={reAuthData.password}
            onChange={handleReAuthChange}
            placeholder="Enter your password"
            required
          />

          <FormActions>
            <Button
              type="button"
              variant="secondary"
              onClick={() => setReAuthRequired(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              isLoading={updating}
            >
              Verify
            </Button>
          </FormActions>
        </form>
      </Card>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Profile Header Section */}
      <Card className="mb-6">
        <div className="md:flex">
          {/* Profile Icon - Simple version without upload functionality */}
          <div className="p-6 md:w-1/3 flex flex-col items-center justify-center border-b md:border-b-0 md:border-r border-gray-700/50">
            <div className="w-32 h-32 rounded-full overflow-hidden bg-gray-700 border-4 border-gray-600 mb-3">
              <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-500 to-purple-600">
                <span className="text-4xl font-bold text-white">
                  {formData.displayName ? formData.displayName.charAt(0).toUpperCase() :
                   currentUser.email ? currentUser.email.charAt(0).toUpperCase() : 'U'}
                </span>
              </div>
            </div>
            <h2 className="text-xl font-bold text-white mt-2">{formData.displayName || currentUser.email}</h2>
            {formData.jobTitle && formData.company && (
              <p className="text-gray-400 text-sm">{formData.jobTitle} at {formData.company}</p>
            )}
          </div>

          {/* Account Info */}
          <div className="p-6 md:w-2/3">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-white">Account Information</h3>
              <div className="flex space-x-2">
                {!editMode && (
                  <Button
                    variant="ghost"
                    color="blue"
                    onClick={toggleEditMode}
                    leftIcon={
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                      </svg>
                    }
                  >
                    Edit Profile
                  </Button>
                )}
              </div>
            </div>

            {error && <StatusMessage type="error" animate={true}>{error}</StatusMessage>}
            {success && <StatusMessage type="success">{success}</StatusMessage>}

            {editMode ? (
              <form onSubmit={handleProfileUpdate}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  <Input
                    type="text"
                    id="displayName"
                    name="displayName"
                    label="Display Name"
                    value={formData.displayName}
                    onChange={handleInputChange}
                    placeholder="Your name"
                  />

                  <Input
                    type="email"
                    id="email"
                    value={currentUser.email}
                    label="Email"
                    disabled
                  />

                  <Input
                    type="text"
                    id="jobTitle"
                    name="jobTitle"
                    label="Job Title"
                    value={formData.jobTitle}
                    onChange={handleInputChange}
                    placeholder="Your job title"
                  />

                  <Input
                    type="text"
                    id="company"
                    name="company"
                    label="Company"
                    value={formData.company}
                    onChange={handleInputChange}
                    placeholder="Your company"
                  />

                  <Input
                    type="tel"
                    id="phone"
                    name="phone"
                    label="Phone Number"
                    value={formData.phone}
                    onChange={handleInputChange}
                    placeholder="Your phone number"
                  />
                </div>

                <TextArea
                  id="bio"
                  name="bio"
                  label="Bio"
                  rows="3"
                  value={formData.bio}
                  onChange={handleInputChange}
                  placeholder="A short bio about yourself"
                />

                <FormActions>
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={toggleEditMode}
                    disabled={updating}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    variant="primary"
                    isLoading={updating}
                  >
                    Save Changes
                  </Button>
                </FormActions>
              </form>
            ) : (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="text-sm font-medium text-gray-400">Name</h4>
                    <p className="text-white">{formData.displayName || 'Not set'}</p>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-400">Email</h4>
                    <p className="text-white">{currentUser.email}</p>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-400">Job Title</h4>
                    <p className="text-white">{formData.jobTitle || 'Not set'}</p>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-400">Company</h4>
                    <p className="text-white">{formData.company || 'Not set'}</p>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-400">Phone</h4>
                    <p className="text-white">{formData.phone || 'Not set'}</p>
                  </div>
                </div>

                {formData.bio && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-400">Bio</h4>
                    <p className="text-white">{formData.bio}</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </Card>

      {/* Security Settings */}
      <Card
        className="mb-6"
        headerProps={{
          title: "Security",
          icon: (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
          )
        }}
      >
        {passwordEditMode ? (
          <form onSubmit={handlePasswordUpdate}>
            <div className="space-y-4 mb-6">
              <Input
                type="password"
                id="currentPassword"
                name="currentPassword"
                label="Current Password"
                value={passwordData.currentPassword}
                onChange={handlePasswordChange}
                placeholder="Enter your current password"
                required
              />

              <Input
                type="password"
                id="newPassword"
                name="newPassword"
                label="New Password"
                value={passwordData.newPassword}
                onChange={handlePasswordChange}
                placeholder="Enter new password"
                required
                minLength="6"
              />

              <Input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                label="Confirm New Password"
                value={passwordData.confirmPassword}
                onChange={handlePasswordChange}
                placeholder="Confirm new password"
                required
                minLength="6"
              />
            </div>

            <FormActions>
              <Button
                type="button"
                variant="secondary"
                onClick={togglePasswordEditMode}
                disabled={updating}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                isLoading={updating}
              >
                Update Password
              </Button>
            </FormActions>
          </form>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center">
              <div className="flex-shrink-0 h-10 w-10 bg-gray-700 rounded-full flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-4">
                <h4 className="text-sm font-medium text-white">Password</h4>
                <p className="text-sm text-gray-400">Last updated: Unknown</p>
              </div>
              <div className="ml-auto">
                <Button
                  variant="ghost"
                  color="blue"
                  onClick={togglePasswordEditMode}
                  leftIcon={
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M18 8a6 6 0 01-7.743 5.743L10 14l-1 1-1 1H6v-1l1-1 1-1-.243-.243A6 6 0 1118 8zm-6-4a1 1 0 10-2 0v1H8a1 1 0 00-1 1v3a1 1 0 001 1h4a1 1 0 001-1V6a1 1 0 00-1-1h-2V4z" clipRule="evenodd" />
                    </svg>
                  }
                >
                  Change Password
                </Button>
              </div>
            </div>

            <div className="flex items-center">
              <div className="flex-shrink-0 h-10 w-10 bg-gray-700 rounded-full flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 2a1 1 0 00-1 1v1a1 1 0 002 0V3a1 1 0 00-1-1zM4 4h3a3 3 0 006 0h3a2 2 0 012 2v9a2 2 0 01-2 2H4a2 2 0 01-2-2V6a2 2 0 012-2zm2.5 7a1.5 1.5 0 100-3 1.5 1.5 0 000 3zm2.45 4a2.5 2.5 0 10-4.9 0h4.9zM12 9a1 1 0 100 2h3a1 1 0 100-2h-3zm-1 4a1 1 0 011-1h2a1 1 0 110 2h-2a1 1 0 01-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-4">
                <h4 className="text-sm font-medium text-white">Account Type</h4>
                <p className="text-sm text-gray-400">Standard User</p>
              </div>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}

export default UserProfile;
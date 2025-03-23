// src/modules/auth/components/Login.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

// Import UI components
import { AnimatedBackground, Button, Card, Input, StatusMessage } from '../../shared/components';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [fadeIn, setFadeIn] = useState(false);
  const { login, loginWithGoogle, signup } = useAuth();
  const navigate = useNavigate();

  // Add fade-in animation when component mounts
  useEffect(() => {
    setFadeIn(true);
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      if (isSignUp) {
        await signup(email, password);
      } else {
        await login(email, password);
      }
      navigate('/');
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }

  async function handleGoogleSignIn() {
    setError('');
    setIsLoading(true);

    try {
      await loginWithGoogle();
      navigate('/');
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }

  const toggleSignUp = () => {
    // Reset the form when toggling between sign in and sign up
    setError('');
    setFadeIn(false);

    // Short delay to allow fade out animation
    setTimeout(() => {
      setIsSignUp(!isSignUp);
      setFadeIn(true);
    }, 300);
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col justify-center items-center px-4 relative overflow-hidden">
      {/* Use our AnimatedBackground component */}
      <AnimatedBackground particleCount={20} />

      {/* Login card with fade-in animation */}
      <Card
        variant="default"
        className={`w-full max-w-md transition-all duration-500 transform ${fadeIn ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
      >
        <div className="p-8">
          {/* Header with animated gradient text */}
          <h1 className="text-4xl font-bold text-center mb-2 bg-gradient-to-r from-blue-400 via-purple-400 to-cyan-400 text-transparent bg-clip-text">
            Financial Dashboard
          </h1>
          <h2 className="text-xl font-medium text-center mb-6 text-gray-300">
            {isSignUp ? 'Create Account' : 'Welcome Back'}
          </h2>

          {/* Use our StatusMessage component for error messages */}
          {error && <StatusMessage type="error" animate={true}>{error}</StatusMessage>}

          <form onSubmit={handleSubmit} className="space-y-6">
            <Input
              type="email"
              id="email"
              label="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your-email@example.com"
              required
              icon={
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                  <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                </svg>
              }
            />

            <Input
              type="password"
              id="password"
              label="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              icon={
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                </svg>
              }
            />

            <Button
              type="submit"
              variant="primary"
              gradient={true}
              fullWidth={true}
              isLoading={isLoading}
              className="transform hover:-translate-y-1 shadow-lg hover:shadow-xl"
            >
              {isSignUp ? 'Create Account' : 'Sign In'}
            </Button>
          </form>

          <div className="flex items-center my-6">
            <div className="flex-grow border-t border-gray-600"></div>
            <span className="mx-4 text-gray-400">or</span>
            <div className="flex-grow border-t border-gray-600"></div>
          </div>

          <Button
            onClick={handleGoogleSignIn}
            variant="outline"
            fullWidth={true}
            isLoading={isLoading}
            className="bg-white hover:bg-gray-100 text-gray-900 transform hover:-translate-y-1"
            leftIcon={
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" className="h-5 w-5 mr-2">
                <path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z" />
                <path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z" />
                <path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z" />
                <path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571c0.001-0.001,0.002-0.001,0.003-0.002l6.19,5.238C36.971,39.205,44,34,44,24C44,22.659,43.862,21.35,43.611,20.083z" />
              </svg>
            }
          >
            Continue with Google
          </Button>

          <div className="mt-6 text-center">
            <Button
              variant="ghost"
              color="blue"
              onClick={toggleSignUp}
            >
              {isSignUp ? 'Already have an account? Sign In' : 'Need an account? Sign Up'}
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
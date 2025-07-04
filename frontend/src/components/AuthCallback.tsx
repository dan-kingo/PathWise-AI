import React, { useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import LoadingSpinner from './LoadingSpinner';

const AuthCallback: React.FC = () => {
  const { user } = useAuth();

  useEffect(() => {
    const handleAuthCallback = async () => {
      const urlParams = new URLSearchParams(window.location.search);
      const token = urlParams.get('token');
      const error = urlParams.get('error');

      if (error) {
        console.error('Authentication error:', error);
        // Redirect to login with error message
        window.location.href = '/?error=' + encodeURIComponent(error);
        return;
      }

      if (token) {
        // Store the token
        localStorage.setItem('auth_token', token);
        
        // Redirect to dashboard
        window.location.href = '/dashboard';
      } else {
        // No token found, redirect to login
        window.location.href = '/';
      }
    };

    handleAuthCallback();
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <LoadingSpinner size="lg" />
        <p className="mt-4 text-gray-600">Processing authentication...</p>
      </div>
    </div>
  );
};

export default AuthCallback;
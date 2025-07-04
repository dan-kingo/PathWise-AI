import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { api } from '../services/api';
import LoadingSpinner from './LoadingSpinner';

const VerifyEmail: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');
  const [canResend, setCanResend] = useState(false);
  const [resending, setResending] = useState(false);

  useEffect(() => {
    const token = searchParams.get('token');
    if (!token) {
      setStatus('error');
      setMessage('Invalid verification link');
      return;
    }

    verifyEmail(token);
  }, [searchParams]);

  const verifyEmail = async (token: string) => {
    try {
      const response = await api.verifyEmail(token);
      if (response.success) {
        setStatus('success');
        setMessage('Email verified successfully! You can now sign in.');
        setTimeout(() => navigate('/login'), 3000);
      } else {
        setStatus('error');
        setMessage(response.message || 'Verification failed');
        setCanResend(true);
      }
    } catch (error: any) {
      setStatus('error');
      setMessage(error.message || 'Verification failed');
      setCanResend(true);
    }
  };

  const handleResendVerification = async () => {
    const email = prompt('Please enter your email address to resend verification:');
    if (!email) return;

    setResending(true);
    try {
      const response = await api.resendVerification(email);
      if (response.success) {
        setMessage('Verification email sent! Please check your inbox.');
        setCanResend(false);
      } else {
        setMessage(response.message || 'Failed to resend verification email');
      }
    } catch (error: any) {
      setMessage(error.message || 'Failed to resend verification email');
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 px-4">
      <div className="max-w-md w-full">
        <div className="card text-center">
          {status === 'loading' && (
            <>
              <LoadingSpinner size="lg" className="mb-4" />
              <h2 className="text-xl font-semibold text-gray-900 mb-2">Verifying your email...</h2>
              <p className="text-gray-600">Please wait while we verify your email address.</p>
            </>
          )}

          {status === 'success' && (
            <>
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">Email Verified!</h2>
              <p className="text-gray-600 mb-6">{message}</p>
              <p className="text-sm text-gray-500">Redirecting to login page...</p>
            </>
          )}

          {status === 'error' && (
            <>
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">Verification Failed</h2>
              <p className="text-gray-600 mb-6">{message}</p>
              
              <div className="space-y-3">
                {canResend && (
                  <button
                    onClick={handleResendVerification}
                    disabled={resending}
                    className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {resending ? (
                      <>
                        <LoadingSpinner size="sm" className="mr-2" />
                        Sending...
                      </>
                    ) : (
                      'Resend Verification Email'
                    )}
                  </button>
                )}
                
                <button
                  onClick={() => navigate('/login')}
                  className="w-full btn-secondary"
                >
                  Back to Login
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default VerifyEmail;
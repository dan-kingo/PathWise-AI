import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { authSchema, AuthFormData } from '../schemas/profileSchema';
import { useAuthStore } from '../stores/authStore';
import Input from './ui/Input';
import Button from './ui/Button';
import LoadingSpinner from './LoadingSpinner';
import { Mail, Lock, User, Eye, EyeOff } from 'lucide-react';
import toast from 'react-hot-toast';

const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { login, loading: globalLoading } = useAuthStore();
  const [isSignUp, setIsSignUp] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Check for error in URL params
  React.useEffect(() => {
    const error = searchParams.get('error');
    if (error) {
      toast.error(decodeURIComponent(error));
    }
  }, [searchParams]);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch
  } = useForm<AuthFormData>({
    resolver: zodResolver(authSchema),
    defaultValues: {
      email: '',
      password: '',
      name: '',
      confirmPassword: '',
    },
  });

  const password = watch('password');

  const onSubmit = async (data: AuthFormData) => {
    setIsSubmitting(true);
    try {
      if (isSignUp) {
        await login('email-signup', {
          email: data.email,
          password: data.password,
          name: data.name
        });
        toast.success('Account created successfully! Please check your email to verify your account.');
        // Switch to login mode after successful signup
        setIsSignUp(false);
        reset({ email: data.email, password: '', name: '', confirmPassword: '' });
      } else {
        await login('email-login', {
          email: data.email,
          password: data.password
        });
        toast.success('Welcome back!');
        navigate('/dashboard');
      }
    } catch (error: any) {
      console.error('Login error:', error);
      if (error.needsVerification) {
        toast.error('Please verify your email before logging in. Check your inbox for the verification link.');
      } else {
        toast.error(error.message || 'An error occurred during authentication');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleMode = () => {
    setIsSignUp(!isSignUp);
    reset();
  };

  const handleGoogleLogin = () => {
    login('google');
  };

  const handleForgotPassword = () => {
    navigate('/forgot-password');
  };

  // Show global loading spinner only during initial auth check
  if (globalLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 px-4">
      <div className="max-w-md w-full">
        <div className="card animate-slide-up">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {isSignUp ? 'Create Account' : 'Welcome Back'}
            </h1>
            <p className="text-gray-600">
              {isSignUp ? 'Sign up to get started' : 'Sign in to your account to continue'}
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {isSignUp && (
              <Input
                {...register('name')}
                label="Full Name"
                placeholder="Enter your full name"
                error={errors.name?.message}
                icon={<User className="w-5 h-5 text-gray-400" />}
                disabled={isSubmitting}
              />
            )}

            <Input
              {...register('email')}
              type="email"
              label="Email Address"
              placeholder="Enter your email"
              error={errors.email?.message}
              icon={<Mail className="w-5 h-5 text-gray-400" />}
              disabled={isSubmitting}
            />

            <div className="relative">
              <Input
                {...register('password')}
                type={showPassword ? 'text' : 'password'}
                label="Password"
                placeholder="Enter your password"
                error={errors.password?.message}
                icon={<Lock className="w-5 h-5 text-gray-400" />}
                disabled={isSubmitting}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-9 text-gray-400 hover:text-gray-600 disabled:opacity-50"
                disabled={isSubmitting}
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>

            {isSignUp && (
              <div className="relative">
                <Input
                  {...register('confirmPassword')}
                  type={showConfirmPassword ? 'text' : 'password'}
                  label="Confirm Password"
                  placeholder="Confirm your password"
                  error={errors.confirmPassword?.message}
                  icon={<Lock className="w-5 h-5 text-gray-400" />}
                  disabled={isSubmitting}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-9 text-gray-400 hover:text-gray-600 disabled:opacity-50"
                  disabled={isSubmitting}
                >
                  {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            )}

            <Button
              type="submit"
              className="w-full"
              loading={isSubmitting}
              disabled={isSubmitting}
            >
              {isSignUp ? 'Create Account' : 'Sign In'}
            </Button>
          </form>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">Or continue with</span>
              </div>
            </div>

            <Button
              type="button"
              variant="secondary"
              className="w-full mt-4"
              onClick={handleGoogleLogin}
              disabled={isSubmitting}
            >
              <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Continue with Google
            </Button>
          </div>

          <div className="mt-6 text-center">
            <button
              type="button"
              onClick={toggleMode}
              className="text-blue-600 hover:text-blue-700 font-medium transition-colors disabled:opacity-50"
              disabled={isSubmitting}
            >
              {isSignUp ? 'Already have an account? Sign in' : "Don't have an account? Sign up"}
            </button>
          </div>

          {!isSignUp && (
            <div className="mt-4 text-center">
              <button
                type="button"
                onClick={handleForgotPassword}
                className="text-sm text-gray-600 hover:text-gray-900 transition-colors disabled:opacity-50"
                disabled={isSubmitting}
              >
                Forgot your password?
              </button>
            </div>
          )}

          <div className="mt-8 text-center">
            <p className="text-sm text-gray-500">
              By {isSignUp ? 'signing up' : 'signing in'}, you agree to our{' '}
              <a href="#" className="text-blue-600 hover:text-blue-700 font-medium">
                Terms of Service
              </a>{' '}
              and{' '}
              <a href="#" className="text-blue-600 hover:text-blue-700 font-medium">
                Privacy Policy
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
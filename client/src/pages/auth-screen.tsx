import React from 'react';
import { useState } from 'react';
import { Mail, Lock, ArrowRight, UserPlus, LogIn } from 'lucide-react';

type AuthScreen = 'login' | 'register';
interface Props {
  onClick: () => void;
}

export function AuthScreen({ onClick }: Props) {
  const [screen, setScreen] = useState<AuthScreen>('login');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onClick();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Card with subtle floating effect */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden transform hover:scale-[1.01] transition-transform duration-300">
          {/* Header */}
          <div className="p-6 bg-gradient-to-r from-indigo-500 to-blue-600 text-white text-center">
            <h1 className="text-3xl font-bold mb-2">
              {screen === 'login' ? 'Welcome Back' : 'Join Us'}
            </h1>
            <p className="text-indigo-100">
              {screen === 'login'
                ? 'Sign in to your student account'
                : 'Create your student account'}
            </p>
          </div>

          {/* Form */}
          <div className="p-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Email Field */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 block">
                  University Email
                </label>
                <div className="relative">
                  <Mail className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                  <input
                    type="email"
                    placeholder="your.name@university.edu"
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                    required
                    pattern=".*\.edu$"
                    title="Please use a valid .edu email address"
                  />
                </div>
              </div>

              {/* Password Field */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 block">
                  Password
                </label>
                <div className="relative">
                  <Lock className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                  <input
                    type="password"
                    placeholder="••••••••"
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                    required
                    minLength={8}
                  />
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                className="w-full bg-indigo-600 text-white py-2 px-4 rounded-lg hover:bg-indigo-700 focus:ring-4 focus:ring-indigo-200 transition-colors duration-300 flex items-center justify-center gap-2 group"
              >
                {screen === 'login' ? (
                  <>
                    Sign In
                    <LogIn className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </>
                ) : (
                  <>
                    Create Account
                    <UserPlus className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </button>

              {/* Switch between login/register */}
              <div className="text-center mt-4">
                <button
                  type="button"
                  onClick={() => setScreen(screen === 'login' ? 'register' : 'login')}
                  className="text-indigo-600 hover:text-indigo-800 text-sm font-medium inline-flex items-center gap-1 group"
                >
                  {screen === 'login' ? (
                    <>
                      New student? Create an account
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </>
                  ) : (
                    <>
                      Already have an account? Sign in
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Additional Info */}
        <div className="text-center mt-6 text-gray-600">
          <p className="text-sm">
            Protected by industry standard encryption
          </p>
        </div>
      </div>
    </div>
  );
}

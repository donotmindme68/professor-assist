import React from 'react';
import {useState} from 'react';
import {Mail, Lock, ArrowRight, UserPlus, LogIn, Users, Loader2} from 'lucide-react';
import {useNavigate} from "react-router-dom";
import {AuthAPI, ContentCreatorAPI, SubscriberAPI} from "@/api";

type AuthScreen = 'login' | 'register';
type UserType = 'content-creator' | 'subscriber' | null;

interface Props {
  goToHome: () => void;
}

function AuthScreen({goToHome}: Props) {
  const [screen, setScreen] = useState<AuthScreen>('login');
  const [userType, setUserType] = useState<UserType>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    const formData = new FormData(e.currentTarget);
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;

    try {
      if (screen === 'login') {
        await AuthAPI.login(email, password)
        goToHome();
      } else {
        if (!userType) {
          setError('Please select a user type');
          setIsLoading(false);
          return;
        }
        // Call register API here
        if (userType == 'content-creator') await ContentCreatorAPI.create(email, password)
        else await SubscriberAPI.create(email, password)
        setScreen('login');
      }
    } catch (error) {
      console.error('Auth error:', error);
      setError(error instanceof Error ? error.message : screen === 'login'
        ? 'Invalid email or password. Please try again.'
        : 'Registration failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center p-4 w-full h-full">
      <div className="w-full max-w-md">
        <div
          className="bg-background rounded-2xl shadow-xl overflow-hidden transform hover:scale-[1.01] transition-transform duration-300">
          {/* Header */}
          <div className="p-6 bg-gradient-to-r from-indigo-500 to-blue-600 text-white text-center">
            <h1 className="text-3xl font-bold mb-2">
              {screen === 'login' ? 'Welcome Back' : 'Join Us'}
            </h1>
            <p className="text-indigo-100">
              {screen === 'login'
                ? 'Sign in to your account'
                : 'Create your account'}
            </p>
          </div>

          {/* Form */}
          <div className="p-6">
            {error && (
              <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* User Type Selection (Only for Register) */}
              {screen === 'register' && (
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700 block">
                    I want to join as
                  </label>
                  <div className="grid grid-cols-2 gap-4">
                    <button
                      type="button"
                      disabled={isLoading}
                      onClick={() => {
                        setUserType('content-creator');
                        setError(null);
                      }}
                      className={`p-3 rounded-lg border flex items-center justify-center gap-2 transition-colors ${
                        userType === 'content-creator'
                          ? 'bg-indigo-600 text-white border-indigo-600'
                          : 'border-gray-300 text-gray-700 hover:border-indigo-500'
                      } ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                      <UserPlus className="w-5 h-5"/>
                      Content Creator
                    </button>
                    <button
                      type="button"
                      disabled={isLoading}
                      onClick={() => {
                        setUserType('subscriber');
                        setError(null);
                      }}
                      className={`p-3 rounded-lg border flex items-center justify-center gap-2 transition-colors ${
                        userType === 'subscriber'
                          ? 'bg-indigo-600 text-white border-indigo-600'
                          : 'border-gray-300 text-gray-700 hover:border-indigo-500'
                      } ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                      <Users className="w-5 h-5"/>
                      Subscriber
                    </button>
                  </div>
                </div>
              )}

              {/* Email Field */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 block">
                  University Email
                </label>
                <div className="relative">
                  <Mail className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2"/>
                  <input
                    name="email"
                    type="email"
                    placeholder="your_id@uaeu.ac.ae"
                    disabled={isLoading}
                    className={`w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors text-black ${
                      isLoading ? 'bg-gray-50 cursor-not-allowed' : 'bg-background'
                    }`}
                    required
                    pattern=".*@uaeu\.ac\.ae$"
                    title="Please use a valid @uaeu.ac.ae email address"
                    onChange={() => error && setError(null)}
                  />
                </div>
              </div>

              {/* Password Field */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 block">
                  Password
                </label>
                <div className="relative">
                  <Lock className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2"/>
                  <input
                    name="password"
                    type="password"
                    placeholder="••••••••"
                    disabled={isLoading}
                    className={`w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 text-black focus:ring-indigo-500 focus:border-indigo-500 transition-colors ${
                      isLoading ? 'bg-gray-50 cursor-not-allowed' : 'bg-background'
                    }`}
                    required
                    minLength={8}
                    onChange={() => error && setError(null)}
                  />
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className={`w-full bg-indigo-600 text-white py-2 px-4 rounded-lg hover:bg-indigo-700 focus:ring-4 focus:ring-indigo-200 transition-colors duration-300 flex items-center justify-center gap-2 group ${
                  isLoading ? 'cursor-not-allowed opacity-80' : ''
                }`}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin"/>
                    {screen === 'login' ? 'Signing in...' : 'Creating account...'}
                  </>
                ) : screen === 'login' ? (
                  <>
                    Sign In
                    <LogIn className="w-5 h-5 group-hover:translate-x-1 transition-transform"/>
                  </>
                ) : (
                  <>
                    Create Account
                    <UserPlus className="w-5 h-5 group-hover:translate-x-1 transition-transform"/>
                  </>
                )}
              </button>

              {/* Switch between login/register */}
              <div className="text-center mt-4">
                <button
                  type="button"
                  disabled={isLoading}
                  onClick={() => {
                    setScreen(screen === 'login' ? 'register' : 'login');
                    setUserType(null);
                    setError(null);
                  }}
                  className={`text-indigo-600 hover:text-indigo-800 text-sm font-medium inline-flex items-center gap-1 group ${
                    isLoading ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                >
                  {screen === 'login' ? (
                    <>
                      New here? Create an account
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform"/>
                    </>
                  ) : (
                    <>
                      Already have an account? Sign in
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform"/>
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

export default function AuthWrapper() {
  const navigate = useNavigate();
  return <AuthScreen goToHome={() => navigate("/home")}/>;
}
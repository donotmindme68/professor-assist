import React, {useState, useEffect} from 'react';
import {motion, useScroll, useTransform} from 'framer-motion';
import {BookOpen, User, LogOut, Settings, ChevronDown, Menu} from 'lucide-react';
import {Sun, Moon} from 'lucide-react';
import {AuthAPI} from "@/api";
import {useNavigate} from "react-router-dom";
import {getUser} from "@/utils";

export const NavBar: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const {scrollY} = useScroll();
  const navigateTo = useNavigate()
  const user = getUser()!


  const [isDark, setIsDark] = useState(() => {
    if (typeof window !== 'undefined') {
      const savedTheme = localStorage.getItem('theme');
      if (savedTheme) {
        return savedTheme === 'dark';
      }
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return false;
  });

  useEffect(() => {
    if (typeof window !== 'undefined') {
      if (isDark) {
        document.documentElement.classList.add('dark');
        localStorage.setItem('theme', 'dark');
      } else {
        document.documentElement.classList.remove('dark');
        localStorage.setItem('theme', 'light');
      }
    }
  }, [isDark]);

  const backgroundColor = useTransform(
    scrollY,
    [0, 100],
    ['rgba(255, 255, 255, 0.8)', 'rgba(255, 255, 255, 0.95)']
  );

  const darkBackgroundColor = useTransform(
    scrollY,
    [0, 100],
    ['rgba(17, 24, 39, 0.8)', 'rgba(17, 24, 39, 0.95)']
  );

  const handleSignOut = async () => {
    // Add sign out logic here
    try {
      await AuthAPI.logout()
      navigateTo('/auth')
    } catch (e) {
    }
  };

  return (
    <motion.nav
      style={{backgroundColor: isDark ? darkBackgroundColor : backgroundColor}}
      className="fixed top-0 left-0 right-0 z-50 backdrop-blur-sm border-b border-gray-200 dark:border-gray-700"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <BookOpen className="h-8 w-8 text-indigo-600 dark:text-indigo-400"/>
            </div>
            <div className="hidden md:block ml-4">
              <div className="flex items-baseline space-x-4">
                <span className="text-xl font-bold text-gray-900 dark:text-white">EduContent</span>
              </div>
            </div>
          </div>

          <div className="hidden md:block">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setIsDark(!isDark)}
                className="p-2 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                aria-label="Toggle theme"
              >
                {isDark ? (
                  <Sun className="w-5 h-5"/>
                ) : (
                  <Moon className="w-5 h-5"/>
                )}
              </button>

              <div className="relative">
                <button
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="flex items-center gap-2 p-2 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  <User className="w-5 h-5"/>
                  <span>{user.name? `${user.name} (${user.email})`: user.email}</span>
                  <ChevronDown className="w-4 h-4"/>
                </button>

                {isUserMenuOpen && (
                  <div
                    className="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white dark:bg-gray-800 ring-1 ring-black ring-opacity-5">
                    <div className="py-1">
                      <button
                        className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 w-full text-left"
                        onClick={() => {
                        }}
                      >
                        <Settings className="w-4 h-4"/>
                        Preferences
                      </button>
                      <button
                        className="flex items-center gap-2 px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700 w-full text-left"
                        onClick={handleSignOut}
                      >
                        <LogOut className="w-4 h-4"/>
                        Logout
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-2 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              <Menu className="w-6 h-6"/>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-white dark:bg-gray-800 shadow-lg">
          <div className="px-2 pt-2 pb-3 space-y-1">
            <button
              onClick={() => setIsDark(!isDark)}
              className="flex items-center gap-2 px-3 py-2 rounded-md text-base font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 w-full"
            >
              {isDark ? (
                <>
                  <Sun className="w-5 h-5"/>
                  Light Mode
                </>
              ) : (
                <>
                  <Moon className="w-5 h-5"/>
                  Dark Mode
                </>
              )}
            </button>
            <button
              className="flex items-center gap-2 px-3 py-2 rounded-md text-base font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 w-full"
              onClick={() => {
              }}
            >
              <Settings className="w-5 h-5"/>
              Preferences
            </button>
            <button
              className="flex items-center gap-2 px-3 py-2 rounded-md text-base font-medium text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700 w-full"
              onClick={handleSignOut}
            >
              <LogOut className="w-5 h-5"/>
              Logout
            </button>
          </div>
        </div>
      )}
    </motion.nav>
  );
};
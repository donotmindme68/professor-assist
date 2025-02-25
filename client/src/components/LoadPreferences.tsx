import {useEffect, useState} from "react";

export function LoadPreferences() {

  useEffect(() => {
    const isDark = (() => {
      if (typeof window !== 'undefined') {
        const savedTheme = localStorage.getItem('theme');
        if (savedTheme) {
          return savedTheme === 'dark';
        }
        return window.matchMedia('(prefers-color-scheme: dark)').matches;
      }
      return false; // Default to light if window is undefined (e.g., during SSR)
    })()

    if (typeof window !== 'undefined') {
      // Sync with .dark class on documentElement
      if (isDark) {
        document.documentElement.classList.add('dark');
        localStorage.setItem('theme', 'dark');
      } else {
        document.documentElement.classList.remove('dark');
        localStorage.setItem('theme', 'light');
      }
    }
  }, []);

  return <></>
}
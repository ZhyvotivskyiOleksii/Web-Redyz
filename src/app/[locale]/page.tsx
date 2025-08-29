
"use client";

import { useState, useEffect } from 'react';
import { WebImpulsHeader } from '@/components/layout/web-impuls-header';
import { HeroSection } from '@/components/sections/hero-section';
import { ChatWidget } from '@/components/chat-widget';

type Theme = 'dark' | 'light' | 'system';

const getInitialTheme = (): Theme => {
  if (typeof window !== 'undefined' && window.localStorage) {
    const storedTheme = localStorage.getItem('theme') as Theme;
    if (storedTheme) {
      return storedTheme;
    }
  }
  return 'dark'; // Set dark theme as default
};

export default function Home() {
  const [theme, setTheme] = useState<Theme>(getInitialTheme);

  const toggleTheme = (newTheme: Theme) => {
    setTheme(newTheme);
    if (typeof window !== 'undefined') {
      localStorage.setItem('theme', newTheme);
      
      const root = window.document.documentElement;
      root.classList.remove('light', 'dark');

      let effectiveTheme: 'dark' | 'light';
      if (newTheme === 'system') {
        effectiveTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
      } else {
        effectiveTheme = newTheme;
      }
      root.classList.add(effectiveTheme);
      root.dataset.theme = effectiveTheme;
    }
  };

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    const handleSystemThemeChange = (e: MediaQueryListEvent) => {
      if (localStorage.getItem('theme') === 'system') {
        const newColorScheme = e.matches ? 'dark' : 'light';
        document.documentElement.classList.remove('light', 'dark');
        document.documentElement.classList.add(newColorScheme);
        document.documentElement.dataset.theme = newColorScheme;
      }
    };
    
    mediaQuery.addEventListener('change', handleSystemThemeChange);

    toggleTheme(theme);

    return () => {
      mediaQuery.removeEventListener('change', handleSystemThemeChange);
    };
  }, []);


  return (
    <div className="flex min-h-screen w-full flex-col bg-background">
      <WebImpulsHeader theme={theme} toggleTheme={toggleTheme} />
      <main className="flex-1">
        <HeroSection />
      </main>
      <ChatWidget />
    </div>
  );
}

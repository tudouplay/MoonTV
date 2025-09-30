'use client';

import { createContext, useContext, useEffect, useState } from 'react';

type Theme = 'default' | 'dark' | 'vibrant' | 'minimal';

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>('default');

  // 从localStorage加载保存的主题
  useEffect(() => {
    const savedTheme = localStorage.getItem('moontv-theme') as Theme | null;
    if (savedTheme) {
      setTheme(savedTheme);
    }
  }, []);

  // 应用主题到文档
  useEffect(() => {
    document.documentElement.classList.remove('theme-default', 'theme-dark', 'theme-vibrant', 'theme-minimal');
    document.documentElement.classList.add(`theme-${theme}`);
    localStorage.setItem('moontv-theme', theme);
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}

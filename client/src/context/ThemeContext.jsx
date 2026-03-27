import React, { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

const themes = {
  blue: { primary: '#6366f1', hover: '#4f46e5', accent: '#22d3ee' },
  purple: { primary: '#a855f7', hover: '#9333ea', accent: '#f0abfc' },
  emerald: { primary: '#10b981', hover: '#059669', accent: '#6ee7b7' },
  sunset: { primary: '#f43f5e', hover: '#e11d48', accent: '#fda4af' },
};

export const ThemeProvider = ({ children }) => {
  const [currentTheme, setCurrentTheme] = useState(() => {
    return localStorage.getItem('app-theme') || 'blue';
  });

  useEffect(() => {
    const theme = themes[currentTheme] || themes.blue;
    document.documentElement.style.setProperty('--primary', theme.primary);
    document.documentElement.style.setProperty('--primary-hover', theme.hover);
    document.documentElement.style.setProperty('--accent-cyan', theme.accent);
    localStorage.setItem('app-theme', currentTheme);
  }, [currentTheme]);

  return (
    <ThemeContext.Provider value={{ currentTheme, setCurrentTheme, themes }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);

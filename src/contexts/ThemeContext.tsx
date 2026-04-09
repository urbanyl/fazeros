import React, { createContext, useContext, useState, useEffect } from 'react';

export type AccentColor = 'blue' | 'green' | 'purple' | 'red' | 'orange';

export const wallpapers = {
  default: 'bg-gradient-to-br from-[#0f1115] to-[#1a1d24]',
  cyber: 'bg-gradient-to-br from-[#0a192f] to-[#020617]',
  matrix: 'bg-[url("https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?q=80&w=2070&auto=format&fit=crop")] bg-cover bg-center',
  abstract: 'bg-gradient-to-tr from-indigo-900 via-slate-900 to-purple-900',
  hacker: 'bg-[url("https://images.unsplash.com/photo-1515630278258-407f66498911?q=80&w=2098&auto=format&fit=crop")] bg-cover bg-center'
};

export const accentColors = {
  blue: 'bg-blue-500',
  green: 'bg-green-500',
  purple: 'bg-purple-500',
  red: 'bg-red-500',
  orange: 'bg-orange-500'
};

export const textColors = {
  blue: 'text-blue-400',
  green: 'text-green-400',
  purple: 'text-purple-400',
  red: 'text-red-400',
  orange: 'text-orange-400'
};

interface ThemeContextType {
  wallpaper: keyof typeof wallpapers;
  accent: AccentColor;
  setWallpaper: (w: keyof typeof wallpapers) => void;
  setAccent: (a: AccentColor) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [wallpaper, setWallpaper] = useState<keyof typeof wallpapers>('default');
  const [accent, setAccent] = useState<AccentColor>('blue');

  // Load from localStorage if exists
  useEffect(() => {
    const savedTheme = localStorage.getItem('fazeros_theme');
    if (savedTheme) {
      try {
        const parsed = JSON.parse(savedTheme);
        if (parsed.wallpaper) setWallpaper(parsed.wallpaper);
        if (parsed.accent) setAccent(parsed.accent);
      } catch (e) {}
    }
  }, []);

  // Save to localStorage when changed
  useEffect(() => {
    localStorage.setItem('fazeros_theme', JSON.stringify({ wallpaper, accent }));
  }, [wallpaper, accent]);

  return (
    <ThemeContext.Provider value={{ wallpaper, setAccent, accent, setWallpaper }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}

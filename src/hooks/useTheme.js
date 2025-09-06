import { useEffect, useReducer } from 'react';

/**
 * Custom hook for managing application themes
 * Supports light, dark, and high-contrast themes with localStorage persistence
 */
// Theme reducer for more reliable state management
const themeReducer = (state, action) => {
  switch (action.type) {
    case 'SET_THEME':
      console.log('🎨 Reducer: Setting theme to:', action.payload);
      return action.payload;
    case 'INITIALIZE':
      console.log('🚀 Reducer: Initializing theme to:', action.payload);
      return action.payload;
    default:
      return state;
  }
};

export const useTheme = () => {
  // Get initial theme from localStorage or default to 'light'
  const getInitialTheme = () => {
    if (typeof window !== 'undefined') {
      const savedTheme = localStorage.getItem('app-theme');
      if (savedTheme && ['light', 'dark', 'high-contrast'].includes(savedTheme)) {
        return savedTheme;
      }

      // Check system preference for dark mode
      if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        return 'dark';
      }
    }
    return 'light';
  };

  // Use reducer for more predictable state updates
  const [theme, dispatch] = useReducer(themeReducer, getInitialTheme());

  // Wrapper function for setting theme
  const setTheme = newTheme => {
    dispatch({ type: 'SET_THEME', payload: newTheme });
  };

  // Apply theme to document
  useEffect(() => {
    const root = document.documentElement;

    // Add theme switching class to prevent transition flashing
    root.classList.add('theme-switching');

    // Remove any existing theme attributes
    root.removeAttribute('data-theme');

    // Apply new theme (light theme uses no attribute, others use data-theme)
    if (theme !== 'light') {
      root.setAttribute('data-theme', theme);
    }

    // Save to localStorage
    localStorage.setItem('app-theme', theme);

    // Remove theme switching class after a brief delay
    setTimeout(() => {
      root.classList.remove('theme-switching');
    }, 100);
  }, [theme]);

  // Listen for system theme changes
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

      const handleChange = e => {
        // Only auto-switch if user hasn't manually set a theme
        const savedTheme = localStorage.getItem('app-theme');
        if (!savedTheme) {
          setTheme(e.matches ? 'dark' : 'light');
        }
      };

      mediaQuery.addEventListener('change', handleChange);
      return () => mediaQuery.removeEventListener('change', handleChange);
    }
  }, []);

  // Theme switching functions
  const switchToLight = () => {
    console.log('🌞 switchToLight called');
  };
  const switchToDark = () => {
    console.log('🌙 switchToDark called');
  };
  const switchToHighContrast = () => setTheme('high-contrast');

  const toggleTheme = () => {
    setTheme(current => {
      switch (current) {
        case 'light':
          return 'dark';
        case 'dark':
          return 'high-contrast';
        case 'high-contrast':
          return 'light';
        default:
          return 'light';
      }
    });
  };

  const cycleTheme = () => toggleTheme(); // Alias for backwards compatibility

  const themeInfo = {
    current: theme,
    displayName: {
      light: 'Light',
      dark: 'Dark',
      'high-contrast': 'High Contrast'
    }[theme]
  };

  return {
    theme,
    themeInfo,
    toggleTheme,
    cycleTheme,
    setTheme
  };
};

export default useTheme;

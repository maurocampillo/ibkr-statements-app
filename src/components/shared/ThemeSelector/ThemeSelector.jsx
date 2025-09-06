import React from 'react';
import PropTypes from 'prop-types';
import { useTheme } from '../../../hooks/useTheme';
import './ThemeSelector.css';

/**
 * Theme Selector Component
 * Provides UI for switching between different application themes
 */
const ThemeSelector = ({ 
  className = '',
  showLabels = true,
  variant = 'dropdown' // 'dropdown', 'buttons', 'toggle'
}) => {
  const { 
    theme, 
    themeInfo, 
    switchToLight, 
    switchToDark, 
    switchToHighContrast,
    toggleTheme 
  } = useTheme();

  const themes = [
    { 
      value: 'light', 
      label: 'Light', 
      icon: '☀️', 
      description: 'Light theme for normal use',
      action: switchToLight 
    },
    { 
      value: 'dark', 
      label: 'Dark', 
      icon: '🌙', 
      description: 'Dark theme for low-light environments',
      action: switchToDark 
    },
    { 
      value: 'high-contrast', 
      label: 'High Contrast', 
      icon: '⚫', 
      description: 'High contrast theme for accessibility',
      action: switchToHighContrast 
    }
  ];

  const currentTheme = themes.find(t => t.value === theme);

  if (variant === 'toggle') {
    return (
      <div className={`theme-selector theme-selector--toggle ${className}`}>
        <button
          onClick={toggleTheme}
          className="theme-toggle-button"
          title={`Switch to ${themes.find(t => t.value !== theme)?.label || 'next'} theme`}
          aria-label={`Current theme: ${themeInfo.displayName}. Click to cycle themes.`}
        >
          <span className="theme-icon">{currentTheme?.icon}</span>
          {showLabels && (
            <span className="theme-label">{currentTheme?.label}</span>
          )}
        </button>
      </div>
    );
  }

  if (variant === 'buttons') {
    return (
      <div className={`theme-selector theme-selector--buttons ${className}`}>
        <div className="theme-buttons-group">
          {themes.map((themeOption) => (
            <button
              key={themeOption.value}
              onClick={themeOption.action}
              className={`theme-button ${theme === themeOption.value ? 'active' : ''}`}
              title={themeOption.description}
              aria-label={`Switch to ${themeOption.label} theme`}
            >
              <span className="theme-icon">{themeOption.icon}</span>
              {showLabels && (
                <span className="theme-label">{themeOption.label}</span>
              )}
            </button>
          ))}
        </div>
      </div>
    );
  }

  // Default: dropdown variant
  return (
    <div className={`theme-selector theme-selector--dropdown ${className}`}>
      <label htmlFor="theme-select" className="theme-selector-label">
        {showLabels && 'Theme:'}
      </label>
      <div className="theme-dropdown-container">
        <select
          id="theme-select"
          value={theme}
          onChange={(e) => {
            const selectedTheme = themes.find(t => t.value === e.target.value);
            if (selectedTheme) {
              selectedTheme.action();
            }
          }}
          className="theme-dropdown"
          aria-label="Select application theme"
        >
          {themes.map((themeOption) => (
            <option key={themeOption.value} value={themeOption.value}>
              {themeOption.icon} {themeOption.label}
            </option>
          ))}
        </select>
        <div className="theme-dropdown-icon">▼</div>
      </div>
    </div>
  );
};

ThemeSelector.propTypes = {
  className: PropTypes.string,
  showLabels: PropTypes.bool,
  variant: PropTypes.oneOf(['dropdown', 'buttons', 'toggle'])
};

export default ThemeSelector;
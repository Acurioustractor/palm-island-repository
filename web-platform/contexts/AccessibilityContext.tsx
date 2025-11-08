'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface AccessibilitySettings {
  dyslexiaMode: boolean;
  highContrast: boolean;
  reducedMotion: boolean;
  largerText: boolean;
  keyboardNavVisible: boolean;
}

interface AccessibilityContextType {
  settings: AccessibilitySettings;
  toggleDyslexiaMode: () => void;
  toggleHighContrast: () => void;
  toggleReducedMotion: () => void;
  toggleLargerText: () => void;
  setKeyboardNavVisible: (visible: boolean) => void;
}

const defaultSettings: AccessibilitySettings = {
  dyslexiaMode: false,
  highContrast: false,
  reducedMotion: false,
  largerText: false,
  keyboardNavVisible: false,
};

const AccessibilityContext = createContext<AccessibilityContextType | undefined>(undefined);

export function AccessibilityProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<AccessibilitySettings>(defaultSettings);

  // Load settings from localStorage on mount
  useEffect(() => {
    const savedSettings = localStorage.getItem('accessibility-settings');
    if (savedSettings) {
      try {
        setSettings(JSON.parse(savedSettings));
      } catch (e) {
        console.error('Failed to parse accessibility settings:', e);
      }
    }

    // Check system preferences for reduced motion
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) {
      setSettings(prev => ({ ...prev, reducedMotion: true }));
    }
  }, []);

  // Save settings to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('accessibility-settings', JSON.stringify(settings));

    // Apply settings to document
    if (settings.dyslexiaMode) {
      document.documentElement.classList.add('dyslexia-mode');
    } else {
      document.documentElement.classList.remove('dyslexia-mode');
    }

    if (settings.highContrast) {
      document.documentElement.classList.add('high-contrast');
    } else {
      document.documentElement.classList.remove('high-contrast');
    }

    if (settings.reducedMotion) {
      document.documentElement.classList.add('reduce-motion');
    } else {
      document.documentElement.classList.remove('reduce-motion');
    }

    if (settings.largerText) {
      document.documentElement.classList.add('larger-text');
    } else {
      document.documentElement.classList.remove('larger-text');
    }
  }, [settings]);

  // Detect keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Tab') {
        setSettings(prev => ({ ...prev, keyboardNavVisible: true }));
      }
    };

    const handleMouseDown = () => {
      setSettings(prev => ({ ...prev, keyboardNavVisible: false }));
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('mousedown', handleMouseDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('mousedown', handleMouseDown);
    };
  }, []);

  const toggleDyslexiaMode = () => {
    setSettings(prev => ({ ...prev, dyslexiaMode: !prev.dyslexiaMode }));
  };

  const toggleHighContrast = () => {
    setSettings(prev => ({ ...prev, highContrast: !prev.highContrast }));
  };

  const toggleReducedMotion = () => {
    setSettings(prev => ({ ...prev, reducedMotion: !prev.reducedMotion }));
  };

  const toggleLargerText = () => {
    setSettings(prev => ({ ...prev, largerText: !prev.largerText }));
  };

  const setKeyboardNavVisible = (visible: boolean) => {
    setSettings(prev => ({ ...prev, keyboardNavVisible: visible }));
  };

  return (
    <AccessibilityContext.Provider
      value={{
        settings,
        toggleDyslexiaMode,
        toggleHighContrast,
        toggleReducedMotion,
        toggleLargerText,
        setKeyboardNavVisible,
      }}
    >
      {children}
    </AccessibilityContext.Provider>
  );
}

export function useAccessibility() {
  const context = useContext(AccessibilityContext);
  if (context === undefined) {
    throw new Error('useAccessibility must be used within an AccessibilityProvider');
  }
  return context;
}

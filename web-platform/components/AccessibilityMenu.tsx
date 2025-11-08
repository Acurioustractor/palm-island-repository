'use client';

import { useState } from 'react';
import { Settings, X, Eye, Type, Zap, Contrast } from 'lucide-react';
import { useAccessibility } from '@/contexts/AccessibilityContext';

export default function AccessibilityMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const { settings, toggleDyslexiaMode, toggleHighContrast, toggleReducedMotion, toggleLargerText } = useAccessibility();

  return (
    <>
      {/* Accessibility Menu Button - Fixed position */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-20 right-4 md:bottom-4 z-40 bg-palm-600 hover:bg-palm-700 text-white p-4 rounded-full shadow-2xl transition-all duration-300 transform hover:scale-110 focus:ring-4 focus:ring-palm-400 focus:outline-none"
        aria-label="Open accessibility settings"
        aria-expanded={isOpen}
        title="Accessibility Settings"
      >
        <Settings className="w-6 h-6" aria-hidden="true" />
      </button>

      {/* Accessibility Panel */}
      {isOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
          onClick={() => setIsOpen(false)}
          role="dialog"
          aria-modal="true"
          aria-labelledby="accessibility-title"
        >
          <div
            className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 animate-scale-in"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <h2 id="accessibility-title" className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                <Eye className="w-6 h-6 text-palm-600" aria-hidden="true" />
                Accessibility
              </h2>
              <button
                onClick={() => setIsOpen(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors focus:ring-2 focus:ring-palm-400"
                aria-label="Close accessibility settings"
              >
                <X className="w-5 h-5" aria-hidden="true" />
              </button>
            </div>

            {/* Settings */}
            <div className="space-y-4">
              {/* Dyslexia-Friendly Mode */}
              <div className="flex items-start justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                <div className="flex-1 mr-4">
                  <div className="flex items-center gap-2 mb-1">
                    <Type className="w-5 h-5 text-palm-600" aria-hidden="true" />
                    <h3 className="font-bold text-gray-900">Dyslexia-Friendly Font</h3>
                  </div>
                  <p className="text-sm text-gray-600">
                    OpenDyslexic font with increased spacing for easier reading
                  </p>
                </div>
                <button
                  onClick={toggleDyslexiaMode}
                  className={`relative inline-flex h-6 w-11 flex-shrink-0 rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-palm-400 focus:ring-offset-2 ${
                    settings.dyslexiaMode ? 'bg-palm-600' : 'bg-gray-300'
                  }`}
                  role="switch"
                  aria-checked={settings.dyslexiaMode}
                  aria-label="Toggle dyslexia-friendly mode"
                >
                  <span
                    className={`inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                      settings.dyslexiaMode ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              {/* High Contrast Mode */}
              <div className="flex items-start justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                <div className="flex-1 mr-4">
                  <div className="flex items-center gap-2 mb-1">
                    <Contrast className="w-5 h-5 text-palm-600" aria-hidden="true" />
                    <h3 className="font-bold text-gray-900">High Contrast</h3>
                  </div>
                  <p className="text-sm text-gray-600">
                    Enhanced contrast for better visibility
                  </p>
                </div>
                <button
                  onClick={toggleHighContrast}
                  className={`relative inline-flex h-6 w-11 flex-shrink-0 rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-palm-400 focus:ring-offset-2 ${
                    settings.highContrast ? 'bg-palm-600' : 'bg-gray-300'
                  }`}
                  role="switch"
                  aria-checked={settings.highContrast}
                  aria-label="Toggle high contrast mode"
                >
                  <span
                    className={`inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                      settings.highContrast ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              {/* Reduced Motion */}
              <div className="flex items-start justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                <div className="flex-1 mr-4">
                  <div className="flex items-center gap-2 mb-1">
                    <Zap className="w-5 h-5 text-palm-600" aria-hidden="true" />
                    <h3 className="font-bold text-gray-900">Reduce Motion</h3>
                  </div>
                  <p className="text-sm text-gray-600">
                    Minimize animations and transitions
                  </p>
                </div>
                <button
                  onClick={toggleReducedMotion}
                  className={`relative inline-flex h-6 w-11 flex-shrink-0 rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-palm-400 focus:ring-offset-2 ${
                    settings.reducedMotion ? 'bg-palm-600' : 'bg-gray-300'
                  }`}
                  role="switch"
                  aria-checked={settings.reducedMotion}
                  aria-label="Toggle reduced motion"
                >
                  <span
                    className={`inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                      settings.reducedMotion ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              {/* Larger Text */}
              <div className="flex items-start justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                <div className="flex-1 mr-4">
                  <div className="flex items-center gap-2 mb-1">
                    <Type className="w-5 h-5 text-palm-600" aria-hidden="true" />
                    <h3 className="font-bold text-gray-900">Larger Text</h3>
                  </div>
                  <p className="text-sm text-gray-600">
                    Increase text size by 20%
                  </p>
                </div>
                <button
                  onClick={toggleLargerText}
                  className={`relative inline-flex h-6 w-11 flex-shrink-0 rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-palm-400 focus:ring-offset-2 ${
                    settings.largerText ? 'bg-palm-600' : 'bg-gray-300'
                  }`}
                  role="switch"
                  aria-checked={settings.largerText}
                  aria-label="Toggle larger text"
                >
                  <span
                    className={`inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                      settings.largerText ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>
            </div>

            {/* Keyboard Shortcuts Info */}
            <div className="mt-6 p-4 bg-palm-50 rounded-lg border-2 border-palm-200">
              <h3 className="font-bold text-palm-900 mb-2 text-sm">Keyboard Shortcuts</h3>
              <ul className="text-xs text-palm-800 space-y-1">
                <li><kbd className="px-2 py-1 bg-white rounded border border-palm-300">Tab</kbd> Navigate forward</li>
                <li><kbd className="px-2 py-1 bg-white rounded border border-palm-300">Shift+Tab</kbd> Navigate backward</li>
                <li><kbd className="px-2 py-1 bg-white rounded border border-palm-300">Enter</kbd> or <kbd className="px-2 py-1 bg-white rounded border border-palm-300">Space</kbd> Activate</li>
                <li><kbd className="px-2 py-1 bg-white rounded border border-palm-300">/</kbd> Focus search (on stories page)</li>
              </ul>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

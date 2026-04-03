"use client";

import { createContext, useContext, useState, useEffect, useCallback } from "react";

const AccessibilityContext = createContext();

export function AccessibilityProvider({ children }) {
  const [settings, setSettings] = useState({
    theme: "light",
    fontSize: "normal",
    highContrast: false,
    reducedMotion: false,
    voiceAssistance: false,
  });

  useEffect(() => {
    const saved = localStorage.getItem("signa-accessibility");
    if (saved) {
      try {
        setSettings(JSON.parse(saved));
      } catch (e) {
        // ignore
      }
    }

    // Detect system preferences
    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    if (prefersReduced || prefersDark) {
      setSettings((prev) => ({
        ...prev,
        reducedMotion: prefersReduced || prev.reducedMotion,
        theme: prefersDark && !saved ? "dark" : prev.theme,
      }));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("signa-accessibility", JSON.stringify(settings));

    // Apply to document
    const root = document.documentElement;
    root.setAttribute("data-theme", settings.theme);
    root.setAttribute("data-font-size", settings.fontSize);
    root.setAttribute("data-contrast", settings.highContrast ? "high" : "normal");

    if (settings.reducedMotion) {
      root.style.setProperty("--transition-fast", "0ms");
      root.style.setProperty("--transition-base", "0ms");
      root.style.setProperty("--transition-slow", "0ms");
    } else {
      root.style.removeProperty("--transition-fast");
      root.style.removeProperty("--transition-base");
      root.style.removeProperty("--transition-slow");
    }
  }, [settings]);

  const updateSetting = useCallback((key, value) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  }, []);

  const toggleTheme = useCallback(() => {
    setSettings((prev) => ({
      ...prev,
      theme: prev.theme === "light" ? "dark" : "light",
    }));
  }, []);

  const speak = useCallback((text) => {
    if (settings.voiceAssistance && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.9;
      utterance.pitch = 1;
      window.speechSynthesis.speak(utterance);
    }
  }, [settings.voiceAssistance]);

  return (
    <AccessibilityContext.Provider
      value={{ settings, updateSetting, toggleTheme, speak }}
    >
      {children}
    </AccessibilityContext.Provider>
  );
}

export function useAccessibility() {
  const context = useContext(AccessibilityContext);
  if (!context) {
    throw new Error("useAccessibility must be used within AccessibilityProvider");
  }
  return context;
}

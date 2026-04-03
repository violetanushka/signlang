"use client";

import { useState } from "react";
import { useAccessibility } from "@/contexts/AccessibilityContext";
import { motion, AnimatePresence } from "framer-motion";
import {
  HiOutlineSun,
  HiOutlineMoon,
  HiOutlineEye,
  HiOutlineSpeakerWave,
} from "react-icons/hi2";
import { IoAccessibility, IoTextOutline, IoClose } from "react-icons/io5";

export default function AccessibilityToolbar() {
  const { settings, updateSetting, toggleTheme } = useAccessibility();
  const [isOpen, setIsOpen] = useState(false);

  const fontSizes = [
    { label: "A", value: "normal", size: "text-sm" },
    { label: "A", value: "large", size: "text-base" },
    { label: "A", value: "xlarge", size: "text-lg" },
  ];

  return (
    <>
      {/* Floating Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full flex items-center justify-center shadow-lg transition-all duration-300 hover:scale-110 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/50"
        style={{
          background: "linear-gradient(135deg, var(--primary) 0%, var(--accent) 100%)",
          color: "white",
        }}
        aria-label="Accessibility settings"
        title="Accessibility settings"
      >
        {isOpen ? (
          <IoClose className="w-6 h-6" />
        ) : (
          <IoAccessibility className="w-6 h-6" />
        )}
      </button>

      {/* Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="fixed bottom-24 right-6 z-50 w-72 glass-card p-5"
            role="dialog"
            aria-label="Accessibility Settings"
          >
            <h3 className="text-base font-bold mb-4" style={{ color: "var(--text-primary)" }}>
              Accessibility
            </h3>

            <div className="space-y-4">
              {/* Theme Toggle */}
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium" style={{ color: "var(--text-secondary)" }}>
                  Theme
                </span>
                <button
                  onClick={toggleTheme}
                  className="w-10 h-10 rounded-lg flex items-center justify-center transition-colors"
                  style={{
                    background: "var(--bg-secondary)",
                    color: "var(--text-primary)",
                  }}
                  aria-label={`Switch to ${settings.theme === "light" ? "dark" : "light"} mode`}
                >
                  {settings.theme === "light" ? (
                    <HiOutlineMoon className="w-5 h-5" />
                  ) : (
                    <HiOutlineSun className="w-5 h-5" />
                  )}
                </button>
              </div>

              {/* Font Size */}
              <div>
                <span className="text-sm font-medium block mb-2" style={{ color: "var(--text-secondary)" }}>
                  <IoTextOutline className="inline w-4 h-4 mr-1" />
                  Font Size
                </span>
                <div className="flex gap-2">
                  {fontSizes.map((fs) => (
                    <button
                      key={fs.value}
                      onClick={() => updateSetting("fontSize", fs.value)}
                      className={`flex-1 py-2 rounded-lg font-semibold transition-all ${fs.size}`}
                      style={{
                        background:
                          settings.fontSize === fs.value
                            ? "var(--primary)"
                            : "var(--bg-secondary)",
                        color:
                          settings.fontSize === fs.value
                            ? "white"
                            : "var(--text-primary)",
                      }}
                      aria-label={`Font size: ${fs.value}`}
                      aria-pressed={settings.fontSize === fs.value}
                    >
                      {fs.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* High Contrast */}
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium flex items-center gap-1.5" style={{ color: "var(--text-secondary)" }}>
                  <HiOutlineEye className="w-4 h-4" />
                  High Contrast
                </span>
                <button
                  onClick={() => updateSetting("highContrast", !settings.highContrast)}
                  className="w-12 h-7 rounded-full p-0.5 transition-colors"
                  style={{
                    background: settings.highContrast ? "var(--primary)" : "var(--bg-secondary)",
                  }}
                  role="switch"
                  aria-checked={settings.highContrast}
                  aria-label="Toggle high contrast mode"
                >
                  <div
                    className="w-6 h-6 rounded-full bg-white shadow transition-transform"
                    style={{
                      transform: settings.highContrast ? "translateX(20px)" : "translateX(0)",
                    }}
                  />
                </button>
              </div>

              {/* Voice Assistance */}
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium flex items-center gap-1.5" style={{ color: "var(--text-secondary)" }}>
                  <HiOutlineSpeakerWave className="w-4 h-4" />
                  Voice Assist
                </span>
                <button
                  onClick={() => updateSetting("voiceAssistance", !settings.voiceAssistance)}
                  className="w-12 h-7 rounded-full p-0.5 transition-colors"
                  style={{
                    background: settings.voiceAssistance ? "var(--primary)" : "var(--bg-secondary)",
                  }}
                  role="switch"
                  aria-checked={settings.voiceAssistance}
                  aria-label="Toggle voice assistance"
                >
                  <div
                    className="w-6 h-6 rounded-full bg-white shadow transition-transform"
                    style={{
                      transform: settings.voiceAssistance ? "translateX(20px)" : "translateX(0)",
                    }}
                  />
                </button>
              </div>

              {/* Reduced Motion */}
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium" style={{ color: "var(--text-secondary)" }}>
                  Reduced Motion
                </span>
                <button
                  onClick={() => updateSetting("reducedMotion", !settings.reducedMotion)}
                  className="w-12 h-7 rounded-full p-0.5 transition-colors"
                  style={{
                    background: settings.reducedMotion ? "var(--primary)" : "var(--bg-secondary)",
                  }}
                  role="switch"
                  aria-checked={settings.reducedMotion}
                  aria-label="Toggle reduced motion"
                >
                  <div
                    className="w-6 h-6 rounded-full bg-white shadow transition-transform"
                    style={{
                      transform: settings.reducedMotion ? "translateX(20px)" : "translateX(0)",
                    }}
                  />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

"use client";

import { useState, useEffect } from "react";
import { HiOutlineMicrophone } from "react-icons/hi2";
import { useAccessibility } from "@/contexts/AccessibilityContext";

export default function SubtitleOverlay({ text, show = true, autoSpeak = false }) {
  const { speak } = useAccessibility();
  const [typedText, setTypedText] = useState("");

  // Typewriter effect
  useEffect(() => {
    if (!show || !text) {
      setTypedText("");
      return;
    }

    let i = 0;
    setTypedText("");
    
    // Check voice support
    if (autoSpeak) {
      speak(text);
    }

    const timer = setInterval(() => {
      if (i < text.length) {
        setTypedText(prev => prev + text.charAt(i));
        i++;
      } else {
        clearInterval(timer);
      }
    }, 30); // 30ms per char

    return () => clearInterval(timer);
  }, [text, show, autoSpeak, speak]);

  if (!show || !text) return null;

  return (
    <div className="absolute bottom-6 left-1/2 -translate-x-1/2 w-[90%] max-w-2xl px-6 py-3 rounded-2xl glass-card backdrop-blur-xl border border-[var(--glass-border)] shadow-2xl flex items-center gap-4 z-20 mx-auto">
      <div 
        className="w-10 h-10 rounded-full flex items-center justify-center opacity-80 flex-shrink-0"
        style={{ background: "var(--primary)" }}
      >
        <HiOutlineMicrophone className="w-5 h-5 text-white" />
      </div>
      <p 
        className="text-lg font-medium leading-snug" 
        style={{ color: "var(--text-primary)" }}
      >
        {typedText}
        <span className="inline-block w-1.5 h-5 ml-1 bg-current animate-pulse opacity-50" />
      </p>
    </div>
  );
}

"use client";

import { useEffect, useRef } from "react";
import { motion } from "framer-motion";

/**
 * Procedural 2D hand animation component
 * For the prototype, this renders a static ASL reference based on the letter.
 * In a full production app, this would use animated SVG paths or Lottie based on gestureData.
 */
export default function GestureAnimation({
  letter,
  word,
  isPlaying,
  className = "",
  color = "#2563EB"
}) {
  const charToDisplay = word ? word : (letter || "A");
  
  // We'll use a subtle floating animation pattern
  const animationVariants = {
    idle: {
      y: [0, -5, 0],
      transition: { duration: 3, repeat: Infinity, ease: "easeInOut" }
    },
    playing: {
      scale: [1, 1.05, 1],
      rotate: [0, -2, 2, 0],
      transition: { duration: 1.5, repeat: Infinity, ease: "easeInOut" }
    }
  };

  return (
    <div className={`relative flex items-center justify-center rounded-2xl overflow-hidden bg-[var(--bg-secondary)] border border-[var(--glass-border)] ${className}`}>
      
      {/* Dynamic Background Pattern */}
      <div className="absolute inset-0 opacity-10" style={{
        backgroundImage: `radial-gradient(circle at 2px 2px, ${color} 1px, transparent 0)`,
        backgroundSize: "24px 24px"
      }} />

      {/* Placeholder Avatar / SVG Container */}
      <motion.div
        variants={animationVariants}
        animate={isPlaying ? "playing" : "idle"}
        className="relative z-10 flex flex-col items-center"
      >
        {/* Abstract Hand Representation */}
        <div 
          className="w-48 h-48 rounded-3xl flex items-center justify-center shadow-xl backdrop-blur-sm"
          style={{ background: `linear-gradient(135deg, ${color}20, ${color}40)`, border: `1px solid ${color}40` }}
        >
          <span 
            className="text-8xl font-black opacity-80"
            style={{ color: color, textShadow: `0 4px 12px ${color}40` }}
          >
            {charToDisplay.charAt(0).toUpperCase()}
          </span>
        </div>
        
        {word && (
          <div className="mt-6 px-6 py-2 rounded-full glass-sm font-bold tracking-widest uppercase text-xl" style={{ color: "var(--text-primary)" }}>
            "{word}"
          </div>
        )}
      </motion.div>

      {/* Animation Status UI */}
      {!isPlaying && (
        <div className="absolute top-4 right-4 badge badge-primary animate-pulse">
          Paused
        </div>
      )}
      {isPlaying && (
        <div className="absolute top-4 right-4 badge badge-success flex items-center gap-1.5">
          <div className="w-2 h-2 rounded-full bg-current animate-ping" />
          Playing
        </div>
      )}
    </div>
  );
}

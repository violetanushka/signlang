"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  GESTURE_IMAGES,
  LETTER_INSTRUCTIONS,
  getLessonGestureInfo,
} from "@/lib/gestures";
import {
  HiOutlineArrowLeft,
  HiOutlineArrowRight,
  HiOutlinePlay,
  HiOutlinePause,
} from "react-icons/hi2";

/** Single letter card with real ASL reference image */
function LetterCard({ letter, active = true, size = "lg" }) {
  const animUrl = `/animations/${letter?.toUpperCase()}.gif`;
  const sizeClasses =
    size === "lg"
      ? "w-48 h-48 text-8xl"
      : "w-24 h-24 text-4xl";

  return (
    <div
      className={`${sizeClasses} rounded-3xl flex items-center justify-center shadow-2xl border-2 overflow-hidden relative
        ${active ? "border-[var(--primary)]" : "border-[var(--glass-border)]"}
        bg-white group`}
    >
      {/* Animated GIF of the sign */}
      <img
        src={animUrl}
        alt={`Sign for ${letter}`}
        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
        onError={(e) => {
          // If GIF missing, try the static SVG fallback or text
          e.target.src = GESTURE_IMAGES[letter?.toUpperCase()];
          e.target.onerror = (ev) => {
            ev.target.style.display = "none";
            ev.target.nextSibling.style.display = "flex";
          };
        }}
      />
      
      {/* Fallback when image fails or missing */}
      <span
        className="font-black text-[var(--primary)] absolute inset-0 flex items-center justify-center bg-white"
        style={{ display: "none" }}
      >
        {letter}
      </span>
    </div>
  );
}

export default function GestureLearnPanel({ target, instructions, color }) {
  const { type, letters, displayValue } = getLessonGestureInfo(target);

  // For word mode: stepper state
  const [step, setStep] = useState(0);
  const [autoPlay, setAutoPlay] = useState(false);

  // Reset stepper when lesson changes
  useEffect(() => {
    setStep(0);
    setAutoPlay(false);
  }, [target]);

  // Auto-play through letters
  useEffect(() => {
    if (!autoPlay || type !== "word") return;
    if (step >= letters.length - 1) {
      setAutoPlay(false);
      return;
    }
    const t = setTimeout(() => setStep((s) => s + 1), 1400);
    return () => clearTimeout(t);
  }, [autoPlay, step, letters.length, type]);

  const currentLetter = letters[step] ?? letters[0];
  const instruction =
    instructions || LETTER_INSTRUCTIONS[currentLetter] || "Follow the hand shape shown.";

  /* ─── LETTER LESSON ─── */
  if (type === "letter") {
    return (
      <div className="flex flex-col items-center justify-center h-full p-6 text-center">
        <span className="text-sm font-bold uppercase tracking-widest text-[var(--text-muted)] mb-2">
          Learn the sign for
        </span>
        <h2 className="text-5xl font-extrabold text-[var(--text-primary)] mb-8">
          {displayValue}
        </h2>

        <motion.div
          key={currentLetter}
          initial={{ opacity: 0, scale: 0.85 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: "spring", stiffness: 280, damping: 22 }}
          className="mb-8"
        >
          <LetterCard letter={currentLetter} size="lg" />
        </motion.div>

        <div className="max-w-md px-6 py-4 glass-card rounded-2xl relative">
          <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-white px-3 py-1 rounded-full text-xs font-bold text-[var(--primary)] border border-blue-100 shadow-sm">
            Instructions
          </div>
          <p className="text-base text-[var(--text-secondary)] leading-relaxed pt-2 font-medium">
            {instruction}
          </p>
        </div>
      </div>
    );
  }

  /* ─── WORD LESSON ─── */
  return (
    <div className="flex flex-col items-center justify-center h-full p-6 text-center">
      <span className="text-sm font-bold uppercase tracking-widest text-[var(--text-muted)] mb-1">
        Fingerspell the word
      </span>
      <h2 className="text-4xl font-extrabold text-[var(--text-primary)] mb-6">
        {displayValue}
      </h2>

      {/* Step counter */}
      <div className="flex items-center gap-2 mb-4">
        {letters.map((l, i) => (
          <button
            key={i}
            onClick={() => { setStep(i); setAutoPlay(false); }}
            className={`w-9 h-9 rounded-full text-sm font-bold transition-all border-2
              ${i === step
                ? "bg-[var(--primary)] text-white border-[var(--primary)] scale-110 shadow-lg"
                : i < step
                ? "bg-[var(--primary)]/20 text-[var(--primary)] border-[var(--primary)]/30"
                : "bg-white text-[var(--text-muted)] border-[var(--glass-border)]"
              }`}
          >
            {l}
          </button>
        ))}
      </div>

      {/* Main gesture card */}
      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          initial={{ opacity: 0, x: 40 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -40 }}
          transition={{ duration: 0.25 }}
          className="mb-6"
        >
          <LetterCard letter={currentLetter} size="lg" />
          <p className="mt-3 text-lg font-bold text-[var(--text-primary)]">
            Step {step + 1} of {letters.length} —{" "}
            <span className="text-[var(--primary)]">{currentLetter}</span>
          </p>
        </motion.div>
      </AnimatePresence>

      {/* Playback controls */}
      <div className="flex items-center gap-3 mb-5">
        <button
          onClick={() => { setStep((s) => Math.max(0, s - 1)); setAutoPlay(false); }}
          disabled={step === 0}
          className="p-2 rounded-full border border-[var(--glass-border)] text-[var(--text-secondary)] hover:bg-[var(--bg-secondary)] disabled:opacity-30 transition"
        >
          <HiOutlineArrowLeft className="w-5 h-5" />
        </button>

        <button
          onClick={() => setAutoPlay((a) => !a)}
          className="px-5 py-2 rounded-full bg-[var(--primary)] text-white font-semibold flex items-center gap-2 shadow-md hover:opacity-90 transition"
        >
          {autoPlay ? (
            <><HiOutlinePause className="w-4 h-4" /> Pause</>
          ) : (
            <><HiOutlinePlay className="w-4 h-4" /> Auto-play</>
          )}
        </button>

        <button
          onClick={() => { setStep((s) => Math.min(letters.length - 1, s + 1)); setAutoPlay(false); }}
          disabled={step === letters.length - 1}
          className="p-2 rounded-full border border-[var(--glass-border)] text-[var(--text-secondary)] hover:bg-[var(--bg-secondary)] disabled:opacity-30 transition"
        >
          <HiOutlineArrowRight className="w-5 h-5" />
        </button>
      </div>

      {/* Instruction for current letter */}
      <div className="max-w-md px-6 py-4 glass-card rounded-2xl relative">
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-white px-3 py-1 rounded-full text-xs font-bold text-[var(--primary)] border border-blue-100 shadow-sm">
          Instructions for "{currentLetter}"
        </div>
        <p className="text-base text-[var(--text-secondary)] leading-relaxed pt-2 font-medium">
          {LETTER_INSTRUCTIONS[currentLetter] || "Follow the hand shape shown."}
        </p>
      </div>
    </div>
  );
}

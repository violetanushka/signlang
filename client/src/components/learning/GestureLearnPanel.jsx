"use client";

import { motion } from "framer-motion";

/**
 * Animated emoji-based step-by-step hand gestures
 */
const HAND_STEPS = {
  // Just mapping a few letters for the prototype, using basic emoji combos
  A: ["✋", "✊"],
  B: ["✋", "🖐️"],
  C: ["✋", "🫳"],
  D: ["✊", "☝️"],
  E: ["✋", "🤛"],
};

export default function GestureLearnPanel({
  letter,
  word,
  instructions,
  color = "#2563EB",
}) {
  const target = word || letter || "A";
  const steps = HAND_STEPS[target] || ["✋", "👌"]; // default if not mapped

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.5 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, x: -20 },
    show: { opacity: 1, x: 0 },
  };

  return (
    <div className="flex flex-col items-center justify-center h-full p-6 text-center">
      <div className="mb-10 text-center">
        <span
          className="text-sm font-bold uppercase tracking-widest"
          style={{ color: "var(--text-muted)" }}
        >
          Learn the sign for
        </span>
        <h2
          className="text-5xl font-extrabold mt-2"
          style={{ color: "var(--text-primary)" }}
        >
          {target}
        </h2>
      </div>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="flex items-center justify-center gap-6 mb-12"
      >
        {steps.map((emoji, idx) => (
          <div key={idx} className="flex items-center gap-6">
            <motion.div
              variants={itemVariants}
              className="flex flex-col items-center"
            >
              <div className="w-32 h-32 rounded-3xl flex items-center justify-center shadow-lg border border-[var(--glass-border)] bg-[var(--bg-secondary)] relative overflow-hidden group">
                {/* Glow bit */}
                <div
                  className="absolute inset-0 opacity-20 group-hover:opacity-40 transition-opacity"
                  style={{
                    background: `radial-gradient(circle at center, ${color}, transparent)`,
                  }}
                />

                <span className="text-7xl relative z-10 drop-shadow-md transform group-hover:scale-110 transition-transform">
                  {emoji}
                </span>

                <div className="absolute top-2 left-2 w-6 h-6 rounded-full bg-white text-xs font-bold flex items-center justify-center shadow-sm text-gray-800">
                  {idx + 1}
                </div>
              </div>
            </motion.div>

            {/* Arrow between steps */}
            {idx < steps.length - 1 && (
              <motion.div
                variants={itemVariants}
                className="text-3xl text-[var(--text-muted)] animate-pulse"
              >
                ➡️
              </motion.div>
            )}
          </div>
        ))}
      </motion.div>

      <div className="max-w-md p-6 glass-card rounded-2xl relative">
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-white px-3 py-1 rounded-full text-xs font-bold text-[var(--primary)] border border-blue-100 shadow-sm">
          Instructions
        </div>
        <p className="text-lg text-[var(--text-secondary)] leading-relaxed pt-2 font-medium">
          {instructions || "Follow the hand shapes shown above."}
        </p>
      </div>
    </div>
  );
}

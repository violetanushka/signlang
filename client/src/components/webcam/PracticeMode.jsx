"use client";

import { useState, useEffect, useRef } from "react";
import WebcamCapture from "./WebcamCapture";
import useGesturePredictor from "@/hooks/useGesturePredictor";
import { HiOutlineCheckCircle, HiOutlineExclamationCircle } from "react-icons/hi2";
import { motion, AnimatePresence } from "framer-motion";

export default function PracticeMode({ targetGesture, onComplete }) {
  const [isActive, setIsActive] = useState(true);
  const [currentScore, setCurrentScore] = useState(0);
  const [bestScore, setBestScore] = useState(0);
  const [feedback, setFeedback] = useState("Show your hand to the camera");
  const [passed, setPassed] = useState(false);
  
  const { evaluateGesture, error: predictError } = useGesturePredictor();
  const evaluationCompleteRef = useRef(false);

  const handleLandmarks = async (landmarks) => {
    if (!isActive || !targetGesture || passed || evaluationCompleteRef.current) return;

    if (!landmarks) {
      setFeedback("Hand not clearly visible");
      setCurrentScore(0);
      return;
    }

    try {
      const result = await evaluateGesture(landmarks, targetGesture);
      
      if (result) {
        const score = result.score;
        setCurrentScore(score);
        
        if (score > bestScore) {
          setBestScore(score);
        }
        
        if (result.passed) {
          setFeedback(result.message || "Great job!");
          setPassed(true);
          setIsActive(false); // Stop tracking on pass
          evaluationCompleteRef.current = true;
          
          // Wait 2 seconds before firing completion callback so user sees success state
          setTimeout(() => {
            if (onComplete) onComplete(score, result);
          }, 2000);
        } else {
          setFeedback(result.message || "Keep trying...");
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="flex flex-col h-full space-y-4">
      
      {/* Target UI Header */}
      <div className="flex justify-between items-center glass-sm p-4 rounded-2xl">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">
            Target Gesture
          </span>
          <div className="text-2xl font-extrabold text-[var(--text-primary)]">
            {targetGesture}
          </div>
        </div>
        
        <div className="text-right">
          <span className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">
            Accuracy
          </span>
          <div className={`text-2xl font-extrabold transition-colors ${currentScore >= 70 ? "text-[var(--success)]" : "text-[var(--primary)]"}`}>
            {currentScore}%
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="progress-bar w-full h-2">
        <div 
          className="progress-bar-fill transition-all duration-300"
          style={{ 
            width: `${currentScore}%`,
            background: currentScore >= 70 ? "var(--success)" : "var(--primary)" 
          }} 
        />
      </div>

      {/* Main Webcam Area */}
      <div className="relative flex-1 rounded-3xl overflow-hidden border-2 border-[var(--glass-border)] transition-colors duration-500"
           style={{ borderColor: passed ? "var(--success)" : currentScore >= 50 ? "var(--primary)" : "var(--glass-border)" }}>
        
        <WebcamCapture 
          isActive={isActive} 
          onLandmarks={handleLandmarks} 
          showOverlay={true}
        />

        {/* Success Overlay Animation */}
        <AnimatePresence>
          {passed && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="absolute inset-0 bg-white/80 backdrop-blur-md flex flex-col items-center justify-center z-30"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: [0, 1.2, 1] }}
                transition={{ delay: 0.2, type: "spring" }}
                className="w-24 h-24 rounded-full bg-[var(--success)] flex items-center justify-center text-white shadow-xl mb-4"
              >
                <HiOutlineCheckCircle className="w-12 h-12" />
              </motion.div>
              <h3 className="text-2xl font-bold text-[var(--text-primary)] mb-2">Perfect match!</h3>
              <p className="text-[var(--text-secondary)] font-medium">Final Score: {bestScore}%</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Feedback Banner */}
      <div className={`p-4 rounded-xl flex items-center gap-3 transition-colors ${passed ? "bg-[rgba(16,185,129,0.1)] text-[var(--success)] border border-[rgba(16,185,129,0.2)]" : "bg-[var(--bg-secondary)] text-[var(--text-secondary)] border border-[var(--glass-border)]"}`}>
        {passed ? (
          <HiOutlineCheckCircle className="w-6 h-6 flex-shrink-0" />
        ) : (
          <HiOutlineExclamationCircle className="w-6 h-6 flex-shrink-0" />
        )}
        <div className="flex-1">
          <p className="text-sm font-semibold">{predictError ? "Connection Error to AI Service" : feedback}</p>
        </div>
      </div>
      
    </div>
  );
}

"use client";

import { useState, useEffect, useRef } from "react";
import WebcamCapture from "./WebcamCapture";
import useGesturePredictor from "@/hooks/useGesturePredictor";
import { HiOutlineCheckCircle, HiOutlineExclamationCircle } from "react-icons/hi2";
import { motion, AnimatePresence } from "framer-motion";
const { SIGN_MAP } = require("@/lib/signDetection");

export default function PracticeMode({ targetGesture, onComplete }) {
  const [isActive, setIsActive] = useState(true);
  const [passed, setPassed] = useState(false);
  const [detectedText, setDetectedText] = useState("");
  const [previousSign, setPreviousSign] = useState(null);
  const [score, setScore] = useState(0);
  const [currentScore, setCurrentScore] = useState(0);
  const [bestScore, setBestScore] = useState(0);
  const [feedback, setFeedback] = useState("Show your hand to the camera");
  const [totalAttempts, setTotalAttempts] = useState(0);
  const [correctAttempts, setCorrectAttempts] = useState(0);
  const [isWrong, setIsWrong] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [stability, setStability] = useState(0);
  const [landmarkCount, setLandmarkCount] = useState(0);
  const [cameraReady, setCameraReady] = useState(false);
  const [cameraError, setCameraError] = useState(null);
  
  const { prediction, evaluateGesture, error: predictError } = useGesturePredictor();
  const evaluationCompleteRef = useRef(false);

  // Stability progress logic (UI only)
  useEffect(() => {
    if (prediction && prediction.predicted_class) {
      const target = (targetGesture || "").toUpperCase();
      const current = (prediction.predicted_class || "").toUpperCase();
      
      if (current === target && prediction.confidence > 0.6) {
        setStability(prev => Math.min(100, prev + 20));
      } else {
        setStability(prev => Math.max(0, prev - 15));
      }
    }
  }, [prediction, targetGesture]);

  // Step 7: Local throttling (backup for UI responsiveness)
  const lastCallRef = useRef(0);
  const THROTTLE_MS = 300;

  const handleLandmarks = async (landmarks) => {
    if (!isActive || !targetGesture || passed || evaluationCompleteRef.current) return;

    if (!cameraReady) {
      setDetectedText("Camera Off");
      setFeedback("Camera Off");
      return;
    }

    setLandmarkCount(landmarks ? landmarks.length : 0);

    if (!landmarks) {
      setFeedback("Show your hand");
      setDetectedText("Show your hand");
      setIsWrong(false);
      setIsCorrect(false);
      setStability(0);
      return;
    }

    const now = Date.now();
    if (now - lastCallRef.current < THROTTLE_MS) return;
    lastCallRef.current = now;

    try {
      const result = await evaluateGesture(landmarks, targetGesture);
      
      if (result) {
        const { predicted_class: displaySign, confidence: conf, isStable } = result;
        
        // Update UI Text
        if (displaySign === "unknown" || displaySign === "uncertain") {
          setDetectedText("Hold Gesture Steady");
          setFeedback("Hold Gesture Steady");
        } else if (displaySign && displaySign !== "nothing") {
          setDetectedText(SIGN_MAP[displaySign]?.text || displaySign);
        } else {
          setDetectedText("Detecting...");
        }

        // Logic for triggering success
        if (displaySign && displaySign !== "nothing" && displaySign !== "unknown" && displaySign !== "uncertain") {
          
          const expected = targetGesture.toUpperCase();
          const predicted = displaySign.toUpperCase();

          if (predicted === expected && conf >= 0.6) {
            // Check if stable or if it's been the same for a while
            if (isStable) {
              setIsCorrect(true);
              setIsWrong(false);
              setFeedback(`Detected: ${displaySign} ✅`);
              
              // Prevent multiple completions
              if (!evaluationCompleteRef.current) {
                evaluationCompleteRef.current = true;
                const finalScore = score + 10;
                setScore(finalScore);
                if (finalScore > bestScore) setBestScore(finalScore);
                setCorrectAttempts(prev => prev + 1);
                
                setTimeout(() => {
                  if (onComplete) {
                    onComplete(finalScore, {
                      totalAttempts: totalAttempts + 1,
                      correctAttempts: correctAttempts + 1,
                      type: "practice"
                    });
                  }
                }, 1000);
              }
            } else {
              setFeedback("Hold steady to confirm...");
            }
          } else if (conf >= 0.7 && predicted !== "NOTHING") {
            // Only flag as wrong if confidence is high enough to be sure
            if (predicted !== previousSign) {
              setPreviousSign(predicted);
              setTotalAttempts(prev => prev + 1);
              setIsWrong(true);
              setIsCorrect(false);
              setScore(prev => Math.max(0, prev - 2));
              setFeedback(`Detected: ${displaySign} (Try ${targetGesture}) ❌`);
              
              setTimeout(() => setIsWrong(false), 2000);
            }
          }
        }
      }
    } catch (err) {
      console.warn("Practice handleLandmarks failed:", err.message);
    }
  };

  return (
    <div className="flex flex-col h-full space-y-4">
      
      {/* Target UI Header */}
      <div className="flex justify-between items-center glass-sm p-4 rounded-2xl relative overflow-hidden">
        <div className="relative z-10">
          <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--primary)] opacity-70">
            Target Gesture
          </span>
          <div className="text-3xl font-extrabold text-[var(--text-primary)]">
            {targetGesture}
          </div>
        </div>
        
        <div className="text-right relative z-10">
          <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--primary)] opacity-70">
            Points
          </span>
          <div className="text-3xl font-extrabold text-[var(--primary)] tabular-nums">
            {score}
          </div>
        </div>

        {/* Global Progress Bar Background */}
        <div className="absolute bottom-0 left-0 h-1 bg-[var(--primary)] transition-all duration-500 opacity-20" 
             style={{ width: `${stability}%` }}></div>
      </div>

      <div className="relative flex-1 rounded-3xl overflow-hidden border-2 border-[var(--glass-border)] transition-all duration-500"
           style={{ 
             borderColor: passed ? "var(--success)" : stability >= 80 ? "var(--primary)" : "var(--glass-border)",
             boxShadow: (prediction?.agreement && isCorrect) ? "0 0 40px -10px var(--success)" : "none"
           }}>
        
        {/* Toggle Advanced AI Button */}
        <button 
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="absolute bottom-4 right-4 z-30 px-3 py-1.5 bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-lg border border-white/20 text-[10px] font-bold text-white transition-all uppercase tracking-widest"
        >
          {showAdvanced ? "Hide AI Core" : "AI Insights"}
        </button>

        {/* AI CORE PANEL (TRANS-MODE) */}
        <AnimatePresence>
          {showAdvanced && prediction && (
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="absolute top-4 right-4 z-20 w-48 glass-card p-3 rounded-2xl border-white/20 shadow-2xl space-y-3"
            >
              <div className="flex items-center justify-between border-b border-white/10 pb-2 mb-2">
                <span className="text-[9px] font-black uppercase text-white/50 tracking-tighter">AI Core v3.0</span>
                <div className={`w-1.5 h-1.5 rounded-full ${prediction.agreement ? 'bg-green-400' : 'bg-yellow-400'} animate-pulse`}></div>
              </div>

              {/* Model Breakdown */}
              <div className="space-y-2">
                {Object.entries(prediction.models_info || {}).map(([name, info]) => (
                  <div key={name} className="flex flex-col gap-1">
                    <div className="flex justify-between text-[10px] font-bold">
                      <span className="uppercase text-white/70">{name}</span>
                      <span className={info.status === 'online' ? 'text-green-400' : 'text-red-400'}>
                        {info.status === 'online' ? `${Math.round(info.conf * 100)}%` : info.status}
                      </span>
                    </div>
                    <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${info.conf * 100}%` }}
                        className={`h-full ${info.status === 'online' ? 'bg-[var(--primary)]' : 'bg-white/10'}`}
                      />
                    </div>
                  </div>
                ))}
              </div>

              <div className="pt-2 mt-2 border-t border-white/10 space-y-2">
                <div className="flex justify-between items-center text-[10px]">
                  <span className="font-medium text-white/40 uppercase">Landmarks</span>
                  <span className={`font-bold ${landmarkCount === 21 ? 'text-green-400' : 'text-yellow-400'}`}>{landmarkCount}</span>
                </div>
                <div className="flex justify-between items-center text-[10px]">
                  <span className="font-medium text-white/40 uppercase">Status</span>
                  <span className={`font-bold ${landmarkCount === 21 ? 'text-green-400' : 'text-white'}`}>{landmarkCount === 21 ? 'Tracking' : 'Waiting...'}</span>
                </div>
                <div>
                  <div className="text-[9px] font-medium text-white/40 uppercase mt-2">Decision Engine</div>
                  <div className="text-[10px] font-bold text-[var(--primary)] truncate">{prediction.method.replace(/_/g, ' ')}</div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Stability Indicator Circle */}
        <div className="absolute top-4 left-4 z-20 flex items-center gap-3">
          <div className="relative w-12 h-12">
            <svg className="w-full h-full transform -rotate-90">
              <circle cx="24" cy="24" r="20" stroke="currentColor" strokeWidth="4" fill="transparent" className="text-white/10" />
              <circle cx="24" cy="24" r="20" stroke="currentColor" strokeWidth="4" fill="transparent" 
                      strokeDasharray={125.6} strokeDashoffset={125.6 - (125.6 * stability) / 100}
                      className="text-[var(--primary)] transition-all duration-300" />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center text-[10px] font-black text-white">
              {stability}%
            </div>
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] font-black uppercase text-white/50 tracking-widest leading-none">Pose Integrity</span>
            <span className="text-sm font-bold text-white drop-shadow-md">
              {stability > 80 ? "Perfect" : stability > 50 ? "Steady..." : stability > 0 ? "Aligning" : "Waiting"}
            </span>
          </div>
        </div>
        
        <WebcamCapture 
          isActive={isActive} 
          onLandmarks={handleLandmarks} 
          showOverlay={true}
          onCameraReady={setCameraReady}
          onCameraError={setCameraError}
        />

        {/* Fallback UI Messages */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-30 pointer-events-none">
          {cameraError && (
            <div className="text-red-500 text-center bg-black/60 backdrop-blur-md p-4 rounded-2xl border border-red-500/50 font-bold">
              Camera not available. Please allow access or turn it on.
            </div>
          )}

          {!cameraError && !cameraReady && (
            <div className="text-yellow-500 text-center bg-black/60 backdrop-blur-md p-4 rounded-2xl border border-yellow-500/50 font-bold">
              Starting camera...
            </div>
          )}
        </div>

        {/* Step 5: AI Mode Indicator */}
        <div className="absolute top-4 right-4 z-20 pointer-events-none">
           <div className="bg-black/40 backdrop-blur-md px-3 py-1 rounded-full border border-white/10 text-[10px] font-bold text-white uppercase tracking-widest">
             Mode: {
               prediction?.method === "ensemble_agree" ? "Ensemble" :
               prediction?.method === "cnn_primary" ? "CNN" :
               prediction?.method === "knn_fallback" ? "KNN" :
               "Fallback"
             }
           </div>
        </div>

        {/* Step 6: Detection Feedback Text */}
        <div className="absolute bottom-12 left-1/2 -translate-x-1/2 z-20 pointer-events-none w-full px-12 text-center">
            <div className="text-sm font-bold text-white drop-shadow-lg opacity-80 py-2 px-4 rounded-full bg-black/20 backdrop-blur-sm inline-block">
              {detectedText === "Uncertain"
                ? "Hold steady..."
                : detectedText === "No hand detected"
                ? "Show your hand to camera"
                : `Detected: ${detectedText}`}
            </div>
        </div>

        {/* Status Overlays */}
        <AnimatePresence>
          {isCorrect && !passed && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 z-20 flex items-center justify-center bg-green-500/20 backdrop-blur-[2px]"
            >
              <div className="bg-[var(--success)] text-white px-8 py-3 rounded-full font-black shadow-2xl scale-110 flex items-center gap-3">
                 <HiOutlineCheckCircle className="w-6 h-6" />
                 SUCCESS: {targetGesture} +10
              </div>
            </motion.div>
          )}

          {isWrong && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20 bg-[var(--danger)] text-white px-6 py-2 rounded-full font-bold shadow-lg"
            >
              DETECTED: {detectedText} (Try {targetGesture})
            </motion.div>
          )}

          {passed && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="absolute inset-0 bg-[var(--bg-primary)]/90 backdrop-blur-xl flex flex-col items-center justify-center z-30"
            >
              <motion.div
                initial={{ scale: 0, rotate: -45 }}
                animate={{ scale: 1, rotate: 0 }}
                className="w-32 h-32 rounded-full bg-gradient-to-br from-[var(--success)] to-emerald-600 flex items-center justify-center text-white shadow-[0_0_50px_rgba(16,185,129,0.4)] mb-8"
              >
                <HiOutlineCheckCircle className="w-16 h-16" />
              </motion.div>
              <h3 className="text-4xl font-black text-[var(--text-primary)] mb-2 tracking-tighter">LESSON MASTERED</h3>
              <p className="text-[var(--text-secondary)] font-medium text-lg">Final Accuracy: {bestScore}%</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-4">
        <div className="glass-sm p-4 rounded-2xl flex flex-col items-center justify-center border border-white/5">
            <div className="text-[10px] uppercase font-black text-[var(--text-muted)] tracking-widest mb-1">Pass Ratio</div>
            <div className="text-2xl font-black text-[var(--text-primary)] leading-none">
              {correctAttempts}<span className="text-sm text-white/30 font-medium">/{totalAttempts}</span>
            </div>
        </div>
        <div className="glass-sm p-4 rounded-2xl flex flex-col items-center justify-center border border-white/5 bg-[var(--primary)] text-white shadow-[0_10px_30px_-10px_var(--primary)]">
            <div className="text-[10px] uppercase font-black text-white/60 tracking-widest mb-1">Precision</div>
            <div className="text-2xl font-black leading-none">
                {totalAttempts > 0 ? Math.round((correctAttempts / totalAttempts) * 100) : 0}<span className="text-sm opacity-50">%</span>
            </div>
        </div>
        <div className="glass-sm p-4 rounded-2xl flex flex-col items-center justify-center border border-white/5">
            <div className="text-[10px] uppercase font-black text-[var(--text-muted)] tracking-widest mb-1">Best Streak</div>
            <div className="text-2xl font-black text-[var(--text-primary)] leading-none">
                {Math.floor(bestScore/10)}
            </div>
        </div>
      </div>

      {/* Feedback Banner */}
      <div className={`p-5 rounded-2xl flex items-center gap-4 transition-all duration-500 ${
        isCorrect ? "bg-green-500/10 text-green-500 border-green-500/30" : 
        isWrong ? "bg-red-500/10 text-red-500 border-red-500/30" :
        "bg-white/5 text-[var(--text-secondary)] border-white/10"
      } border backdrop-blur-md`}>
        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${isCorrect ? "bg-green-500" : isWrong ? "bg-red-500" : "bg-white/10"}`}>
            {isCorrect || passed ? (
              <HiOutlineCheckCircle className="w-6 h-6 text-white" />
            ) : (
              <HiOutlineExclamationCircle className="w-6 h-6 text-[var(--text-muted)]" />
            )}
        </div>
        <div className="flex-1">
          <p className="text-xs font-black uppercase tracking-widest opacity-50 mb-0.5">System Status</p>
          <p className="text-base font-bold tracking-tight">{predictError ? "Connection Lost" : feedback}</p>
        </div>
      </div>
      
    </div>
  );
}

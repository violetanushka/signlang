"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import WebcamCapture from "../webcam/WebcamCapture";
import { HiOutlineCheckCircle, HiOutlineClock, HiOutlineExclamationCircle } from "react-icons/hi2";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";

const AI_SERVICE_URL = "http://localhost:8000";

export default function TestModule({ targetGesture, onComplete }) {
  const [testState, setTestState] = useState("intro"); // intro, running, finished
  const [timeLeft, setTimeLeft] = useState(5); // 5 seconds test duration
  const [score, setScore] = useState(0);
  const [results, setResults] = useState(null);
  
  // New States for HF Model
  const [lastPrediction, setLastPrediction] = useState("-");
  const [confidence, setConfidence] = useState(0);
  const [predictionHistory, setPredictionHistory] = useState([]); // For temporal smoothing
  const [isProcessing, setIsProcessing] = useState(false);
  
  const canvasRef = useRef(null);
  const lastCaptureTimeRef = useRef(0);
  const totalPredictionsRef = useRef(0);
  const correctPredictionsRef = useRef(0);
  const timerRef = useRef(null);

  // Temporal Smoothing: Calculate Majority Vote
  const smoothedPrediction = useMemo(() => {
    if (predictionHistory.length === 0) return "-";
    const counts = {};
    predictionHistory.forEach(p => {
      counts[p] = (counts[p] || 0) + 1;
    });
    return Object.keys(counts).reduce((a, b) => counts[a] > counts[b] ? a : b);
  }, [predictionHistory]);

  const startTest = () => {
    setTestState("running");
    setTimeLeft(5);
    setScore(0);
    setPredictionHistory([]);
    setLastPrediction("-");
    setConfidence(0);
    totalPredictionsRef.current = 0;
    correctPredictionsRef.current = 0;

    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          setTimeout(() => finishTest(), 100);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const finishTest = () => {
    clearInterval(timerRef.current);
    
    const finalScore = totalPredictionsRef.current > 0 
      ? Math.floor((correctPredictionsRef.current / totalPredictionsRef.current) * 100)
      : 0;
    
    const passed = finalScore >= 50;

    const finalResults = {
      score: finalScore,
      passed,
      message: passed
        ? "Excellent! You passed the test with high accuracy."
        : "Did not meet the 50% threshold. Try keeping your hand steadier.",
      suggestions: passed
        ? []
        : ["Move your hand closer", "Ensure better lighting", "Check the gesture reference"],
    };

    setResults(finalResults);
    setTestState("finished");
    if (onComplete) onComplete(finalScore, finalResults);
  };

  const handleLandmarks = async (landmarks) => {
    if (testState !== "running" || isProcessing) return;

    const now = Date.now();
    // 1. Limit to ~4 FPS (every 250ms)
    if (now - lastCaptureTimeRef.current < 250) return;
    
    const video = document.querySelector('video');
    if (!video || !landmarks || !canvasRef.current) return;

    setIsProcessing(true);
    lastCaptureTimeRef.current = now;

    try {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d");
      
      // 2. Calculate Hand Bounding Box for Cropping
      const xs = landmarks.map(l => l.x);
      const ys = landmarks.map(l => l.y);
      
      const minX = Math.max(0, Math.min(...xs) - 0.1);
      const maxX = Math.min(1, Math.max(...xs) + 0.1);
      const minY = Math.max(0, Math.min(...ys) - 0.1);
      const maxY = Math.min(1, Math.max(...ys) + 0.1);
      
      const width = maxX - minX;
      const height = maxY - minY;
      
      // 3. Draw Cropped Hand to Canvas
      canvas.width = 224;
      canvas.height = 224;
      
      ctx.drawImage(
        video,
        minX * video.videoWidth,
        minY * video.videoHeight,
        width * video.videoWidth,
        height * video.videoHeight,
        0, 0, 224, 224
      );

      // 4. Send to Backend
      const imageData = canvas.toDataURL("image/jpeg", 0.8);
      const response = await axios.post(`${AI_SERVICE_URL}/api/predict_image`, {
        image: imageData
      });

      if (response.data) {
        const { prediction, confidence: conf } = response.data;
        
        setLastPrediction(prediction);
        setConfidence(Math.round(conf * 100));
        
        // 5. Update Prediction Window (Temporal Smoothing)
        setPredictionHistory(prev => {
          const next = [...prev, prediction];
          if (next.length > 10) return next.slice(1);
          return next;
        });

        // 6. Accumulate Score
        totalPredictionsRef.current += 1;
        if (prediction.toUpperCase() === targetGesture.toUpperCase()) {
          correctPredictionsRef.current += 1;
        }

        // Live UI Score update
        setScore(Math.floor((correctPredictionsRef.current / totalPredictionsRef.current) * 100));
      }
    } catch (err) {
      console.error("HF Inference failed", err);
    } finally {
      setIsProcessing(false);
    }
  };

  useEffect(() => {
    return () => clearInterval(timerRef.current);
  }, []);

  if (testState === "intro") {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center h-[500px]">
        <div className="w-20 h-20 rounded-full bg-[var(--bg-secondary)] flex items-center justify-center mb-6">
          <HiOutlineClock className="w-10 h-10 text-[var(--primary)]" />
        </div>
        <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-4">
          Ready for the Expert Test?
        </h2>
        <p className="text-[var(--text-secondary)] mb-8 max-w-sm">
          You have 5 seconds to sign <strong>{targetGesture}</strong>. 
          We are using our advanced CNN engine for this test. Reach 50% accuracy to pass.
        </p>
        <button onClick={startTest} className="btn btn-primary btn-lg px-12">
          Start Test
        </button>
      </div>
    );
  }

  if (testState === "finished") {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex flex-col items-center justify-center p-8 text-center h-[500px]"
      >
        <div className={`w-24 h-24 rounded-full flex items-center justify-center shadow-xl mb-6
            ${results.passed ? "bg-[var(--success)]" : "bg-[var(--danger)]"}`}
        >
          {results.passed ? (
            <HiOutlineCheckCircle className="w-12 h-12 text-white" />
          ) : (
            <HiOutlineExclamationCircle className="w-12 h-12 text-white" />
          )}
        </div>
        <h2 className="text-3xl font-extrabold text-[var(--text-primary)] mb-2">
          {results.score}% Accuracy
        </h2>
        <p className={`text-lg font-medium mb-8 ${results.passed ? "text-[var(--success)]" : "text-[var(--danger)]"}`}>
          {results.message}
        </p>

        {!results.passed && (
          <button onClick={startTest} className="btn btn-primary">
            Retry Test
          </button>
        )}
      </motion.div>
    );
  }

  return (
    <div className="flex flex-col h-[600px] w-full max-w-2xl mx-auto space-y-4">
      {/* Test Header */}
      <div className="flex justify-between items-center p-4 bg-[var(--bg-secondary)] rounded-2xl border border-[var(--glass-border)] shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-[var(--bg-dark)] border-2 border-[var(--primary)] flex items-center justify-center text-[var(--primary)] font-bold text-xl">
            {timeLeft}s
          </div>
          <div>
            <span className="block text-xs font-bold uppercase text-[var(--text-muted)] tracking-wider">
              Time Remaining
            </span>
            <span className="font-bold text-[var(--text-primary)]">CNN Expert Evaluation</span>
          </div>
        </div>

        <div className="text-right">
          <span className="block text-xs font-bold uppercase text-[var(--text-muted)] tracking-wider">
            Live Accuracy
          </span>
          <div className={`text-2xl font-extrabold ${score >= 50 ? "text-[var(--success)]" : "text-[var(--primary)]"}`}>
            {score}%
          </div>
        </div>
      </div>

      {/* Progress Bar (Time) */}
      <div className="w-full h-1.5 rounded-full overflow-hidden bg-[var(--bg-secondary)]">
        <motion.div
          className="h-full bg-[var(--primary)]"
          initial={{ width: "100%" }}
          animate={{ width: `${(timeLeft / 5) * 100}%` }}
          transition={{ duration: 1, ease: "linear" }}
        />
      </div>

      {/* Webcam Main Container */}
      <div className="flex-1 relative rounded-3xl overflow-hidden border-2 border-[var(--glass-border)] shadow-2xl">
        <WebcamCapture
          isActive={true}
          onLandmarks={handleLandmarks}
          showOverlay={true}
        />

        {/* Prediction Stats Overlay */}
        <div className="absolute bottom-4 left-4 right-4 flex justify-between items-end z-10 pointer-events-none">
          {/* Live Smoothed Prediction */}
          <div className="bg-black/40 backdrop-blur-md p-3 rounded-2xl border border-white/20 text-white shadow-lg">
             <div className="text-[10px] uppercase font-bold tracking-tighter opacity-70 mb-1">Detected Gesture</div>
             <div className="flex items-center gap-2">
                <span className="text-3xl font-black">{smoothedPrediction}</span>
                <span className={`text-sm font-bold ${smoothedPrediction === targetGesture ? "text-green-400" : "text-white/60"}`}>
                  {confidence}%
                </span>
             </div>
          </div>

          {/* Validation Status */}
          <div className="bg-black/40 backdrop-blur-md p-3 rounded-2xl border border-white/20 text-white shadow-lg text-right">
             <div className="text-[10px] uppercase font-bold tracking-tighter opacity-70 mb-1">Status</div>
             <div className={`text-xl font-black ${smoothedPrediction === targetGesture ? "text-green-400" : "text-white/60"}`}>
                {smoothedPrediction === targetGesture ? "MATCH ✅" : "WAITING..."}
             </div>
          </div>
        </div>

        {/* Target Overlay corner */}
        <div className="absolute top-4 right-4 w-16 h-16 bg-white rounded-2xl shadow-lg flex flex-col items-center justify-center border-2 border-[var(--primary)]">
          <span className="text-[10px] font-bold text-[var(--text-muted)] uppercase mb-[-4px]">Target</span>
          <span className="text-3xl font-black text-[var(--primary)]">
            {targetGesture}
          </span>
        </div>
      </div>

      {/* Hidden Canvas for Cropping */}
      <canvas ref={canvasRef} style={{ display: "none" }} />
    </div>
  );
}

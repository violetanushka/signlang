"use client";

import { useState, useEffect } from "react";
import GestureAnimation from "./GestureAnimation";
import { HiOutlinePlay, HiOutlinePause, HiOutlineArrowPath, HiOutlineBackward, HiOutlineForward } from "react-icons/hi2";

export default function GestureSequencePlayer({ sequence = [], isPlaying, setIsPlaying, speed = 1500 }) {
  const [currentIndex, setCurrentIndex] = useState(0);

  // Auto-play interval logic
  useEffect(() => {
    let timer;
    if (isPlaying && sequence.length > 0) {
      if (currentIndex >= sequence.length) {
        // Paused at end
        setIsPlaying(false);
        setCurrentIndex(0);
        return;
      }

      timer = setTimeout(() => {
        setCurrentIndex(prev => prev + 1);
      }, speed);
    }

    return () => clearTimeout(timer);
  }, [isPlaying, currentIndex, sequence.length, speed, setIsPlaying]);

  // Restart when sequence changes (new translation)
  useEffect(() => {
    setCurrentIndex(0);
    if (sequence.length > 0) {
      setIsPlaying(true);
    }
  }, [sequence, setIsPlaying]);

  if (!sequence || sequence.length === 0) {
    return (
      <div className="w-full h-80 rounded-3xl glass-card flex flex-col items-center justify-center border-[var(--glass-border)] text-center p-6">
        <div className="w-16 h-16 rounded-full bg-[var(--bg-secondary)] flex items-center justify-center text-4xl mb-4 grayscale opacity-50">🤖</div>
        <p className="text-[var(--text-muted)] font-medium">Type a sentence to see the ASL translation animation here.</p>
      </div>
    );
  }

  const currentGesture = sequence[currentIndex] || sequence[0];

  return (
    <div className="w-full glass-card rounded-3xl overflow-hidden border-[var(--glass-border)] flex flex-col h-full max-h-[600px]">
      
      {/* 1. Animation Viewport */}
      <div className="flex-1 bg-[var(--bg-secondary)] relative flex items-center justify-center p-6">
        
        {/* Current Word Overlay */}
        <div className="absolute top-4 left-0 w-full text-center z-10 pointer-events-none">
          <div className="inline-block px-4 py-1.5 rounded-full bg-black/40 backdrop-blur-md text-white font-bold text-sm tracking-widest uppercase shadow-lg">
            Word {Math.min(currentIndex + 1, sequence.length)} of {sequence.length}
          </div>
        </div>

        <GestureAnimation 
          letter={currentGesture.type === "letter" ? currentGesture.word : undefined}
          word={currentGesture.type === "phrase" ? currentGesture.word : undefined}
          isPlaying={isPlaying}
          color="var(--accent)"
          className="w-full h-full max-h-[400px]"
        />
        
        {/* Instructions Overlay Bottom */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 w-4/5 text-center">
            <div className="inline-block px-6 py-3 rounded-2xl bg-black/60 backdrop-blur-lg text-white font-medium text-sm shadow-xl border border-white/10">
              {currentGesture.description}
            </div>
        </div>
      </div>

      {/* 2. Timeline Progress Bar */}
      <div className="h-1.5 w-full bg-[var(--bg-secondary)] flex">
        {sequence.map((item, idx) => (
          <div 
            key={item.id} 
            className="h-full border-r border-black/10 last:border-0 transition-opacity"
            style={{ 
              width: `${100 / sequence.length}%`,
              background: idx < currentIndex ? "var(--success)" : idx === currentIndex ? "var(--accent)" : "transparent"
            }}
          />
        ))}
      </div>

      {/* 3. Sequence Token List (Subtitles) */}
      <div className="bg-white/50 backdrop-blur-md border-b border-[var(--glass-border)] p-4 flex flex-wrap gap-2 justify-center max-h-32 overflow-y-auto">
        {sequence.map((item, idx) => (
          <span 
            key={item.id}
            onClick={() => { setCurrentIndex(idx); setIsPlaying(false); }}
            className={`cursor-pointer px-3 py-1.5 rounded-lg text-sm font-bold transition-all ${
              idx === currentIndex 
                ? "bg-[var(--accent)] text-white shadow-md scale-105" 
                : idx < currentIndex
                  ? "bg-black/5 text-[var(--text-secondary)] opacity-70 hover:opacity-100"
                  : "bg-white text-[var(--text-secondary)] border border-[var(--glass-border)] hover:border-gray-300"
            }`}
          >
            {item.word}
          </span>
        ))}
      </div>

      {/* 4. Playback Controls */}
      <div className="p-4 flex items-center justify-between">
        
        {/* Speed Controls */}
        <div className="flex gap-2 text-xs font-bold text-[var(--text-muted)]">
          Speed: {speed === 2500 ? "0.5x" : speed === 1500 ? "1x" : "2x"}
        </div>

        {/* Media Controls */}
        <div className="flex items-center gap-4">
          <button 
            onClick={() => setCurrentIndex(Math.max(0, currentIndex - 1))}
            disabled={currentIndex === 0}
            className="p-2 rounded-full text-[var(--text-secondary)] hover:bg-[var(--bg-secondary)] disabled:opacity-30 transition-colors"
          >
            <HiOutlineBackward className="w-6 h-6" />
          </button>
          
          <button 
            onClick={() => setIsPlaying(!isPlaying)}
            className="w-14 h-14 rounded-full flex items-center justify-center bg-[var(--primary)] text-white shadow-lg shadow-blue-500/30 transition-transform hover:scale-105 active:scale-95"
          >
             {isPlaying ? <HiOutlinePause className="w-6 h-6" /> : <HiOutlinePlay className="w-7 h-7 ml-1" />}
          </button>
          
          <button 
            onClick={() => setCurrentIndex(Math.min(sequence.length - 1, currentIndex + 1))}
            disabled={currentIndex >= sequence.length - 1}
            className="p-2 rounded-full text-[var(--text-secondary)] hover:bg-[var(--bg-secondary)] disabled:opacity-30 transition-colors"
          >
             <HiOutlineForward className="w-6 h-6" />
          </button>
        </div>

        {/* Restart */}
        <button 
          onClick={() => { setCurrentIndex(0); setIsPlaying(true); }}
          className="p-2 rounded-full text-[var(--text-secondary)] hover:bg-[var(--bg-secondary)] hover:text-[var(--primary)] transition-colors"
          title="Restart Sequence"
        >
           <HiOutlineArrowPath className="w-6 h-6" />
        </button>

      </div>
    </div>
  );
}

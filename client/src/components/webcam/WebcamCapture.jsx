"use client";

import { useRef, useEffect } from "react";
import useMediaPipe from "@/hooks/useMediaPipe";
import HandLandmarkOverlay from "./HandLandmarkOverlay";
import { HiOutlineVideoCameraSlash } from "react-icons/hi2";

/**
 * Wrapper for the webcam video element and MediaPipe integration.
 * Triggers `onLandmarks` callback every time new tracking data is available.
 */
export default function WebcamCapture({ 
  isActive = true, 
  onLandmarks,
  showOverlay = true 
}) {
  const videoRef = useRef(null);
  const containerRef = useRef(null);
  
  const { isLoaded, landmarks, error } = useMediaPipe(videoRef, isActive);

  // Bubble up landmarks to parent
  useEffect(() => {
    if (isActive && onLandmarks) {
      onLandmarks(landmarks);
    }
  }, [landmarks, isActive, onLandmarks]);

  return (
    <div 
      ref={containerRef}
      className="relative w-full aspect-video rounded-3xl overflow-hidden bg-[var(--bg-dark-secondary)] flex items-center justify-center border border-[var(--glass-border)] shadow-xl"
    >
      {/* Video Element (mirrored) */}
      <video
        ref={videoRef}
        className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-500 scale-x-[-1] ${isLoaded && isActive ? "opacity-100" : "opacity-0"}`}
        autoPlay
        playsInline
        muted
      />

      {/* Canvas Overlay for Hand Bones */}
      {showOverlay && landmarks && isActive && (
        <HandLandmarkOverlay 
          landmarks={landmarks} 
          containerRef={containerRef} 
        />
      )}

      {/* States */}
      {!isActive && (
        <div className="absolute inset-0 flex flex-col items-center justify-center text-white/50 bg-black/50 z-10 backdrop-blur-sm">
          <HiOutlineVideoCameraSlash className="w-12 h-12 mb-3" />
          <p className="font-medium">Camera Paused</p>
        </div>
      )}

      {isActive && !isLoaded && !error && (
        <div className="absolute inset-0 flex flex-col items-center justify-center text-white z-10 backdrop-blur-sm bg-black/30">
          <div className="w-10 h-10 border-4 border-white/30 border-t-white rounded-full animate-spin mb-4" />
          <p className="font-semibold tracking-wide">Initializing AI Camera...</p>
        </div>
      )}

      {error && (
        <div className="absolute inset-0 flex flex-col items-center justify-center text-red-100 bg-red-900/80 z-10 p-6 text-center backdrop-blur-sm">
          <p className="font-bold text-lg mb-2">Camera Error</p>
          <p className="text-sm opacity-90">{error}</p>
        </div>
      )}
    </div>
  );
}

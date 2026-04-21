"use client";

import { useRef, useEffect, useState } from "react";
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
  showOverlay = true,
  onCameraReady,
  onCameraError
}) {
  const videoRef = useRef(null);
  const containerRef = useRef(null);
  
  const [overlayLandmarks, setOverlayLandmarks] = useState(null);
  
  // Initialize hook with direct callback support
  const { cameraReady, cameraError } = useMediaPipe(videoRef, isActive, (lm) => {
    // Bubble up to parent (handles high-frequency refs)
    if (onLandmarks) onLandmarks(lm);
    
    // Update local state for overlay rendering (throttle handled in hook)
    setOverlayLandmarks(lm);
  });

  // Sync status to parent
  useEffect(() => {
    if (onCameraReady) onCameraReady(cameraReady);
  }, [cameraReady, onCameraReady]);

  useEffect(() => {
    if (onCameraError) onCameraError(cameraError);
  }, [cameraError, onCameraError]);

  return (
    <div 
      ref={containerRef}
      className="relative w-full aspect-video rounded-3xl overflow-hidden bg-[var(--bg-dark-secondary)] flex items-center justify-center border border-[var(--glass-border)] shadow-xl"
    >
      {/* Video Element (mirrored) */}
      <video
        ref={videoRef}
        className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-500 scale-x-[-1] ${cameraReady && isActive ? "opacity-100" : "opacity-0"}`}
        autoPlay
        playsInline
        muted
      />

      {/* Canvas Overlay for Hand Bones */}
      {showOverlay && overlayLandmarks && isActive && (
        <HandLandmarkOverlay 
          landmarks={overlayLandmarks} 
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

      {isActive && !cameraReady && !cameraError && (
        <div className="absolute inset-0 flex flex-col items-center justify-center text-white z-10 backdrop-blur-sm bg-black/30">
          <div className="w-10 h-10 border-4 border-white/30 border-t-white rounded-full animate-spin mb-4" />
          <p className="font-semibold tracking-wide">Initializing AI Camera...</p>
        </div>
      )}

      {cameraError && (
        <div className="absolute inset-0 flex flex-col items-center justify-center text-red-100 bg-red-900/80 z-10 p-6 text-center backdrop-blur-sm">
          <p className="font-bold text-lg mb-2">Camera Error</p>
          <p className="text-sm opacity-90">{cameraError}</p>
        </div>
      )}
    </div>
  );
}

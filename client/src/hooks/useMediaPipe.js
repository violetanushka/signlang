import { useEffect, useRef, useState, useCallback } from "react";

// Module-level lock to prevent concurrent initialization across components
let isMediaPipeInitializing = false;

/**
 * Hook to initialize and manage MediaPipe Hands with a native camera feed.
 * @param {HTMLVideoElement} videoRef - Ref to the video element
 * @param {boolean} isRunning - whether tracking should actively process frames
 */
export default function useMediaPipe(videoRef, isRunning = true) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState(null);
  const [landmarks, setLandmarks] = useState(null);
  
  const handsRef = useRef(null);
  const streamRef = useRef(null);
  const animationFrameIdRef = useRef(null);
  const isComponentMounted = useRef(true);

  // Callback passed to MediaPipe to handle results
  const onResults = useCallback((results) => {
    if (!isRunning || !isComponentMounted.current) return;

    if (results.multiHandLandmarks && results.multiHandLandmarks.length > 0) {
      setLandmarks(results.multiHandLandmarks[0]);
    } else {
      setLandmarks(null);
    }
  }, [isRunning]);

  useEffect(() => {
    isComponentMounted.current = true;
    if (!videoRef || !videoRef.current) return;

    const initMediaPipe = async (retries = 0) => {
      // 1. Wait for any previous instance to finish cleaning up
      if (isMediaPipeInitializing) {
        setTimeout(() => initMediaPipe(retries), 500);
        return;
      }

      try {
        isMediaPipeInitializing = true;
        
        // --- 1. Initialize MediaPipe Hands via Global Object (Turbopack Bypass) ---
        const handsCtor = window.Hands || window.mpHands?.Hands;
        
        if (!handsCtor) {
          if (retries < 15) { // Wait up to 7.5 seconds for the static script to load
            console.log(`[useMediaPipe] Waiting for local static script /mediapipe/hands.js... (${retries + 1}/15)`);
            isMediaPipeInitializing = false; // Release lock for retry
            setTimeout(() => initMediaPipe(retries + 1), 500);
            return;
          }
          throw new Error("Local static script '/mediapipe/hands.js' failed to load or attach to window.");
        }
        
        console.log("[useMediaPipe] Starting Native WebCam & MediaPipe Initialization...");

        const hands = new handsCtor({
          locateFile: (file) => `/mediapipe/${file}`,
        });

        hands.setOptions({
          maxNumHands: 1,
          modelComplexity: 0,
          minDetectionConfidence: 0.5,
          minTrackingConfidence: 0.5,
        });

        hands.onResults(onResults);
        await hands.initialize(); // Ensure Wasm is ready
        handsRef.current = hands;

        // --- 2. Initialize Native WebCam Stream ---
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
          throw new Error("Browser API navigator.mediaDevices.getUserMedia not available");
        }

        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            width: { ideal: 640 },
            height: { ideal: 480 },
            facingMode: "user"
          },
          audio: false,
        });
        
        streamRef.current = stream;
        videoRef.current.srcObject = stream;
        
        // Wait for video to be physically ready to play
        await new Promise((resolve) => {
          videoRef.current.onloadedmetadata = () => {
             resolve();
          };
        });
        
        videoRef.current.play();

        // --- 3. Start Processing Loop ---
        const processFrame = async () => {
          if (!isRunning || !isComponentMounted.current || !handsRef.current || !videoRef.current) return;
          
          if (videoRef.current.readyState >= 2) {
            try {
              // Send the current video frame to MediaPipe
              await handsRef.current.send({ image: videoRef.current });
            } catch (e) {
              // Ignore safe transient read errors on rapid unmounts
            }
          }
          
          // Loop
          animationFrameIdRef.current = requestAnimationFrame(processFrame);
        };
        
        // Start the recursively calling loop
        processFrame();
        
        if (isComponentMounted.current) {
          setIsLoaded(true);
          console.log("[useMediaPipe] Native Camera & Hands ready.");
        }
      } catch (err) {
        console.error("[useMediaPipe] Setup Error:", err);
        if (isComponentMounted.current) {
          setError(err.message || "Failed to access Native Camera or load models.");
        }
      } finally {
        isMediaPipeInitializing = false;
      }
    };

    if (isRunning) {
      initMediaPipe();
    }

    return () => {
      isComponentMounted.current = false;
      console.log("[useMediaPipe] Cleaning up Native Camera & MediaPipe resources...");
      
      // Stop Animation Loop
      if (animationFrameIdRef.current) {
        cancelAnimationFrame(animationFrameIdRef.current);
      }
      
      // Stop WebCam Stream Tracks
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
      }
      
      // Clear Video Src
      if (videoRef.current) {
        videoRef.current.srcObject = null;
      }
      
      // Deallocate MediaPipe Memory
      if (handsRef.current) {
        handsRef.current.close();
        handsRef.current = null;
      }
      
      setIsLoaded(false);
    };
  }, [videoRef, isRunning, onResults]);

  return { isLoaded, landmarks, error };
}

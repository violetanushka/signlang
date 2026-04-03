"use client";

import { useEffect, useRef } from "react";

// Standard MediaPipe Hands bone connections
const HAND_CONNECTIONS = [
  [0, 1], [1, 2], [2, 3], [3, 4],       // Thumb
  [0, 5], [5, 6], [6, 7], [7, 8],       // Index
  [5, 9], [9, 10], [10, 11], [11, 12],  // Middle
  [9, 13], [13, 14], [14, 15], [15, 16],// Ring
  [13, 17], [0, 17], [17, 18], [18, 19], [19, 20] // Pinky & Palm
];

export default function HandLandmarkOverlay({ landmarks, containerRef }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    if (!canvasRef.current || !containerRef.current || !landmarks) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    
    // Match canvas internal resolution to actual DOM display size
    const { width, height } = containerRef.current.getBoundingClientRect();
    canvas.width = width;
    canvas.height = height;

    // Clear previous drawing
    ctx.clearRect(0, 0, width, height);
    
    // Note: Video is scaled by -1 (mirrored), so we must mirror X coords
    const drawPoint = (x, y) => {
      ctx.beginPath();
      ctx.arc(x, y, 4, 0, 2 * Math.PI);
      ctx.fillStyle = "#10B981"; // Success green
      ctx.fill();
      ctx.strokeStyle = "#FFFFFF";
      ctx.lineWidth = 1.5;
      ctx.stroke();
    };

    const drawLine = (start, end) => {
      ctx.beginPath();
      ctx.moveTo(start.x, start.y);
      ctx.lineTo(end.x, end.y);
      ctx.strokeStyle = "rgba(16, 185, 129, 0.7)"; // Green translucent
      ctx.lineWidth = 3;
      ctx.lineCap = "round";
      ctx.stroke();
    };

    // Prepare scaled coords (with X mirrored)
    const scaledPoints = landmarks.map(lm => ({
      x: (1 - lm.x) * width, // Mirroring
      y: lm.y * height
    }));

    // Draw bones
    HAND_CONNECTIONS.forEach(([i, j]) => {
      const start = scaledPoints[i];
      const end = scaledPoints[j];
      drawLine(start, end);
    });

    // Draw joints
    scaledPoints.forEach(p => drawPoint(p.x, p.y));

  }, [landmarks, containerRef]);

  return (
    <canvas 
      ref={canvasRef} 
      className="absolute inset-0 w-full h-full pointer-events-none z-10"
    />
  );
}

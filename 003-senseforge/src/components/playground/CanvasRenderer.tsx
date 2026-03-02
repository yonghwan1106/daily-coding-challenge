"use client";

import { useRef, useEffect, useCallback } from "react";

interface CanvasRendererProps {
  onMouseMove?: (x: number, y: number, pressed: boolean) => void;
  onMouseDown?: () => void;
  onMouseUp?: () => void;
}

export default function CanvasRenderer({
  onMouseMove,
  onMouseDown,
  onMouseUp,
}: CanvasRendererProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const drawFrame = useCallback((bitmap: ImageBitmap) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    bitmap.close();
  }, []);

  useEffect(() => {
    const container = containerRef.current;
    const canvas = canvasRef.current;
    if (!container || !canvas) return;

    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect;
        const dpr = window.devicePixelRatio || 1;
        canvas.width = Math.floor(width * dpr);
        canvas.height = Math.floor(height * dpr);
        canvas.style.width = `${width}px`;
        canvas.style.height = `${height}px`;
        const ctx = canvas.getContext("2d");
        if (ctx) ctx.scale(dpr, dpr);
      }
    });

    observer.observe(container);
    return () => observer.disconnect();
  }, []);

  const getCanvasCoords = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      const canvas = canvasRef.current;
      if (!canvas) return { x: 0, y: 0 };
      const rect = canvas.getBoundingClientRect();
      return {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      };
    },
    [],
  );

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      const { x, y } = getCanvasCoords(e);
      onMouseMove?.(x, y, e.buttons > 0);
    },
    [getCanvasCoords, onMouseMove],
  );

  const handleMouseDown = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      const { x, y } = getCanvasCoords(e);
      onMouseMove?.(x, y, true);
      onMouseDown?.();
    },
    [getCanvasCoords, onMouseMove, onMouseDown],
  );

  const handleMouseUp = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      const { x, y } = getCanvasCoords(e);
      onMouseMove?.(x, y, false);
      onMouseUp?.();
    },
    [getCanvasCoords, onMouseMove, onMouseUp],
  );

  return (
    <div ref={containerRef} className="relative h-full w-full bg-black">
      <canvas
        ref={canvasRef}
        className="absolute inset-0"
        onMouseMove={handleMouseMove}
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
      />
    </div>
  );
}

export type { CanvasRendererProps };
export { CanvasRenderer };

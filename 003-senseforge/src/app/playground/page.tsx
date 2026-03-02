"use client";

import { useRef, useState, useCallback, useEffect } from "react";
import CanvasRenderer from "@/components/playground/CanvasRenderer";
import SandboxFrame, {
  type SandboxFrameHandle,
} from "@/components/playground/SandboxFrame";
import ControlPanel from "@/components/playground/ControlPanel";

export default function PlaygroundPage() {
  const sandboxRef = useRef<SandboxFrameHandle>(null);
  const canvasRef = useRef<{
    drawFrame: (frame: ImageData) => void;
  }>(null);

  const [isRunning, setIsRunning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);
  const [logs, setLogs] = useState<string[]>([]);

  const handleFrame = useCallback((frame: ImageData) => {
    canvasRef.current?.drawFrame(frame);
  }, []);

  const handleError = useCallback((message: string) => {
    setErrors((prev) => [...prev.slice(-49), message]);
    setIsRunning(false);
    setIsPaused(false);
  }, []);

  const handleLog = useCallback((message: string) => {
    setLogs((prev) => [...prev.slice(-99), message]);
  }, []);

  const handleReady = useCallback(() => {
    setLogs((prev) => [...prev, "Sandbox ready"]);
  }, []);

  const handleRun = useCallback(
    (code: string) => {
      setErrors([]);
      setLogs([]);
      sandboxRef.current?.execute(code);
      setIsRunning(true);
      setIsPaused(false);
    },
    [],
  );

  const handlePause = useCallback(() => {
    sandboxRef.current?.pause();
    setIsPaused(true);
  }, []);

  const handleResume = useCallback(() => {
    sandboxRef.current?.resume();
    setIsPaused(false);
  }, []);

  const handleReset = useCallback(() => {
    sandboxRef.current?.reset();
    setIsRunning(false);
    setIsPaused(false);
    setErrors([]);
    setLogs([]);
  }, []);

  const handleMouseMove = useCallback(
    (x: number, y: number, pressed: boolean) => {
      sandboxRef.current?.sendMouse(x, y, pressed);
    },
    [],
  );

  // Keyboard event forwarding
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      sandboxRef.current?.sendKey(e.key, true);
    }
    function handleKeyUp(e: KeyboardEvent) {
      sandboxRef.current?.sendKey(e.key, false);
    }
    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, []);

  return (
    <div className="flex h-full">
      {/* Canvas area */}
      <div className="flex-1 relative">
        <CanvasRendererWrapper ref={canvasRef} onMouseMove={handleMouseMove} />
      </div>

      {/* Control panel */}
      <div className="w-[480px] border-l border-gray-700 flex-shrink-0">
        <ControlPanel
          onRun={handleRun}
          onPause={handlePause}
          onResume={handleResume}
          onReset={handleReset}
          isRunning={isRunning}
          isPaused={isPaused}
          errors={errors}
          logs={logs}
        />
      </div>

      {/* Hidden sandbox iframe */}
      <SandboxFrame
        ref={sandboxRef}
        onFrame={handleFrame}
        onError={handleError}
        onLog={handleLog}
        onReady={handleReady}
      />
    </div>
  );
}

// Wrapper to expose drawFrame via ref
import { forwardRef, useImperativeHandle } from "react";

interface CanvasWrapperHandle {
  drawFrame: (frame: ImageData) => void;
}

const CanvasRendererWrapper = forwardRef<
  CanvasWrapperHandle,
  { onMouseMove: (x: number, y: number, pressed: boolean) => void }
>(function CanvasRendererWrapper({ onMouseMove }, ref) {
  const internalCanvasRef = useRef<HTMLCanvasElement | null>(null);

  useImperativeHandle(ref, () => ({
    drawFrame: (frame: ImageData) => {
      const canvas = internalCanvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      const tempCanvas = new OffscreenCanvas(frame.width, frame.height);
      const tempCtx = tempCanvas.getContext("2d")!;
      tempCtx.putImageData(frame, 0, 0);
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(tempCanvas, 0, 0, canvas.width, canvas.height);
    },
  }));

  useEffect(() => {
    const canvas = internalCanvasRef.current;
    if (!canvas) return;
    const container = canvas.parentElement;
    if (!container) return;

    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect;
        const dpr = window.devicePixelRatio || 1;
        canvas.width = Math.floor(width * dpr);
        canvas.height = Math.floor(height * dpr);
        canvas.style.width = `${width}px`;
        canvas.style.height = `${height}px`;
      }
    });

    observer.observe(container);
    return () => observer.disconnect();
  }, []);

  return (
    <div className="h-full w-full bg-black">
      <canvas
        ref={internalCanvasRef}
        className="h-full w-full"
        onMouseMove={(e) => {
          const rect = e.currentTarget.getBoundingClientRect();
          onMouseMove(
            e.clientX - rect.left,
            e.clientY - rect.top,
            e.buttons > 0,
          );
        }}
        onMouseDown={(e) => {
          const rect = e.currentTarget.getBoundingClientRect();
          onMouseMove(e.clientX - rect.left, e.clientY - rect.top, true);
        }}
        onMouseUp={(e) => {
          const rect = e.currentTarget.getBoundingClientRect();
          onMouseMove(e.clientX - rect.left, e.clientY - rect.top, false);
        }}
      />
    </div>
  );
});

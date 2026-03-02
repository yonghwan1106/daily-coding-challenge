"use client";

import { useRef, useEffect, useCallback, useImperativeHandle, forwardRef } from "react";
import type { SandboxMessage } from "@/engine/runtime/types";
import { handleAudioMessage, dispose as disposeAudio } from "@/engine/audio";

export interface SandboxFrameHandle {
  execute: (code: string) => void;
  pause: () => void;
  resume: () => void;
  reset: () => void;
  sendMouse: (x: number, y: number, pressed: boolean) => void;
  sendKey: (key: string, pressed: boolean) => void;
  sendResize: (width: number, height: number) => void;
}

interface SandboxFrameProps {
  onFrame: (frame: ImageData) => void;
  onError: (message: string) => void;
  onLog: (message: string) => void;
  onReady?: () => void;
}

const SandboxFrame = forwardRef<SandboxFrameHandle, SandboxFrameProps>(
  function SandboxFrame({ onFrame, onError, onLog, onReady }, ref) {
    const iframeRef = useRef<HTMLIFrameElement>(null);
    const callbacksRef = useRef({ onFrame, onError, onLog, onReady });

    useEffect(() => {
      callbacksRef.current = { onFrame, onError, onLog, onReady };
    }, [onFrame, onError, onLog, onReady]);

    const postToSandbox = useCallback((msg: unknown) => {
      iframeRef.current?.contentWindow?.postMessage(msg, "*");
    }, []);

    useImperativeHandle(ref, () => ({
      execute: (code: string) => postToSandbox({ type: "execute", code }),
      pause: () => postToSandbox({ type: "control", action: "pause" }),
      resume: () => postToSandbox({ type: "control", action: "resume" }),
      reset: () => postToSandbox({ type: "control", action: "reset" }),
      sendMouse: (x: number, y: number, pressed: boolean) =>
        postToSandbox({ type: "mouse", x, y, pressed }),
      sendKey: (key: string, pressed: boolean) =>
        postToSandbox({ type: "key", key, pressed }),
      sendResize: (width: number, height: number) =>
        postToSandbox({ type: "resize", width, height }),
    }), [postToSandbox]);

    useEffect(() => {
      function handleMessage(e: MessageEvent) {
        const msg = e.data as SandboxMessage;
        if (!msg || !msg.type) return;

        switch (msg.type) {
          case "frame": {
            const data = new ImageData(
              new Uint8ClampedArray(msg.buffer),
              msg.width,
              msg.height,
            );
            callbacksRef.current.onFrame(data);
            break;
          }
          case "audio":
            handleAudioMessage(msg.params);
            break;
          case "error":
            callbacksRef.current.onError(msg.message);
            break;
          case "log":
            callbacksRef.current.onLog(msg.message);
            break;
          case "ready":
            callbacksRef.current.onReady?.();
            break;
        }
      }

      window.addEventListener("message", handleMessage);
      return () => {
        window.removeEventListener("message", handleMessage);
        disposeAudio();
      };
    }, []);

    return (
      <iframe
        ref={iframeRef}
        src="/sandbox.html"
        sandbox="allow-scripts"
        style={{ position: "absolute", width: 0, height: 0, overflow: "hidden", pointerEvents: "none" }}
        title="SenseForge Sandbox"
      />
    );
  },
);

export default SandboxFrame;

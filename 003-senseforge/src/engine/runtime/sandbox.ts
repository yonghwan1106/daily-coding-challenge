import type { HostMessage, SandboxMessage, SandboxState } from "./types";
import { handleAudioMessage, dispose as disposeAudio } from "../audio";

export type FrameCallback = (frame: ImageData) => void;
export type ErrorCallback = (message: string, line?: number) => void;
export type LogCallback = (message: string) => void;

export class SandboxManager {
  private iframe: HTMLIFrameElement | null = null;
  private state: SandboxState = { status: "idle" };
  private onFrame: FrameCallback | null = null;
  private onError: ErrorCallback | null = null;
  private onLog: LogCallback | null = null;
  private messageHandler: ((e: MessageEvent) => void) | null = null;

  mount(container: HTMLElement) {
    this.iframe = document.createElement("iframe");
    this.iframe.src = "/sandbox.html";
    this.iframe.sandbox.add("allow-scripts");
    this.iframe.style.display = "none";
    container.appendChild(this.iframe);

    this.messageHandler = this.handleMessage.bind(this);
    window.addEventListener("message", this.messageHandler);
  }

  unmount() {
    if (this.messageHandler) {
      window.removeEventListener("message", this.messageHandler);
      this.messageHandler = null;
    }
    if (this.iframe) {
      this.iframe.remove();
      this.iframe = null;
    }
    disposeAudio();
    this.state = { status: "idle" };
  }

  setCallbacks(
    onFrame: FrameCallback,
    onError: ErrorCallback,
    onLog: LogCallback,
  ) {
    this.onFrame = onFrame;
    this.onError = onError;
    this.onLog = onLog;
  }

  execute(code: string) {
    this.postToSandbox({ type: "execute", code });
    this.state = { status: "running" };
  }

  pause() {
    this.postToSandbox({ type: "control", action: "pause" });
    this.state = { status: "paused" };
  }

  resume() {
    this.postToSandbox({ type: "control", action: "resume" });
    this.state = { status: "running" };
  }

  reset() {
    this.postToSandbox({ type: "control", action: "reset" });
    this.state = { status: "idle" };
  }

  sendMouse(x: number, y: number, pressed: boolean) {
    this.postToSandbox({ type: "mouse", x, y, pressed });
  }

  sendKey(key: string, pressed: boolean) {
    this.postToSandbox({ type: "key", key, pressed });
  }

  sendResize(width: number, height: number) {
    this.postToSandbox({ type: "resize", width, height });
  }

  getState(): SandboxState {
    return { ...this.state };
  }

  private postToSandbox(msg: HostMessage) {
    this.iframe?.contentWindow?.postMessage(msg, "*");
  }

  private handleMessage(e: MessageEvent) {
    const msg = e.data as SandboxMessage;
    if (!msg || !msg.type) return;

    switch (msg.type) {
      case "frame": {
        const data = new ImageData(
          new Uint8ClampedArray(msg.buffer),
          msg.width,
          msg.height,
        );
        this.onFrame?.(data);
        break;
      }
      case "audio":
        handleAudioMessage(msg.params);
        break;
      case "error":
        this.state = { status: "error", error: msg.message };
        this.onError?.(msg.message, msg.line);
        break;
      case "log":
        this.onLog?.(msg.message);
        break;
      case "ready":
        this.state = { status: "idle" };
        break;
    }
  }
}

/** Host -> Sandbox messages */
export type HostMessage =
  | { type: "execute"; code: string }
  | { type: "control"; action: "pause" | "resume" | "reset" }
  | { type: "mouse"; x: number; y: number; pressed: boolean }
  | { type: "key"; key: string; pressed: boolean }
  | { type: "resize"; width: number; height: number };

/** Sandbox -> Host messages */
export type SandboxMessage =
  | { type: "frame"; buffer: ArrayBuffer; width: number; height: number }
  | { type: "audio"; action: "playTone"; params: ToneParams }
  | { type: "error"; message: string; line?: number }
  | { type: "log"; message: string }
  | { type: "ready" };

export interface ToneParams {
  frequency: number;
  duration: number;
  waveform?: OscillatorType;
  volume?: number;
  attack?: number;
  decay?: number;
  sustain?: number;
  release?: number;
}

export interface SandboxState {
  status: "idle" | "running" | "paused" | "error";
  error?: string;
}

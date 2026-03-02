import type { ToneParams } from "../runtime/types";
import { playTone } from "./oscillator";

let audioCtx: AudioContext | null = null;

function getContext(): AudioContext {
  if (!audioCtx) {
    audioCtx = new AudioContext();
  }
  if (audioCtx.state === "suspended") {
    audioCtx.resume();
  }
  return audioCtx;
}

export function handleAudioMessage(params: ToneParams) {
  const ctx = getContext();
  playTone(ctx, params);
}

export function dispose() {
  if (audioCtx) {
    audioCtx.close();
    audioCtx = null;
  }
}

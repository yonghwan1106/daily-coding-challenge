import type { ToneParams } from "../runtime/types";

export function playTone(audioCtx: AudioContext, params: ToneParams) {
  const {
    frequency,
    duration,
    waveform = "sine",
    volume = 0.3,
    attack = 0.01,
    decay = 0.1,
    sustain = 0.5,
    release = 0.1,
  } = params;

  const now = audioCtx.currentTime;
  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();

  osc.type = waveform;
  osc.frequency.setValueAtTime(frequency, now);

  // ADSR envelope
  gain.gain.setValueAtTime(0, now);
  // Attack
  gain.gain.linearRampToValueAtTime(volume, now + attack);
  // Decay -> Sustain
  gain.gain.linearRampToValueAtTime(
    volume * sustain,
    now + attack + decay,
  );
  // Sustain hold
  gain.gain.setValueAtTime(
    volume * sustain,
    now + duration - release,
  );
  // Release
  gain.gain.linearRampToValueAtTime(0, now + duration);

  osc.connect(gain);
  gain.connect(audioCtx.destination);

  osc.start(now);
  osc.stop(now + duration + 0.05);

  osc.onended = () => {
    osc.disconnect();
    gain.disconnect();
  };
}

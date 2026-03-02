"use client";

import { useState, useCallback } from "react";

const PRESETS: Record<string, { label: string; code: string }> = {
  "particle-burst": {
    label: "Particle Burst",
    code: `function setup() {
  background('#0a0a1a');
}

function draw() {
  background('rgba(10,10,26,0.1)');

  if (mousePressed) {
    particles.burst({
      x: mouseX, y: mouseY,
      count: 15,
      color: ['#ff6b6b', '#ffd93d', '#6bcb77', '#4d96ff'],
      size: [2, 8],
      speed: [2, 8],
      life: [0.5, 1.5],
      gravity: 200,
      glow: true
    });
  }

  // Ambient particles
  particles.emit({
    x: random(width), y: height + 10,
    count: 1,
    color: '#4d96ff',
    size: [1, 3],
    speed: [0.5, 1.5],
    life: [2, 4],
    gravity: -50,
    glow: true,
    angle: -Math.PI / 2,
    spread: 0.5
  });
}`,
  },
  "audio-visualizer": {
    label: "Audio Visualizer",
    code: `let bars = [];
let hue = 0;

function setup() {
  background('#000');
  for (let i = 0; i < 32; i++) {
    bars.push({ value: 0, target: 0 });
  }
}

function draw() {
  background('rgba(0,0,0,0.15)');
  hue = (hue + 0.5) % 360;

  const barW = width / bars.length;

  for (let i = 0; i < bars.length; i++) {
    // Simulate audio reactivity with noise
    bars[i].target = noise(i * 0.3, frameCount * 0.02) * height * 0.8;
    bars[i].value = lerp(bars[i].value, bars[i].target, 0.1);

    const h = bars[i].value;
    const barHue = (hue + i * 8) % 360;

    fill('hsl(' + barHue + ', 80%, 60%)');
    noStroke();
    rect(i * barW + 2, height - h, barW - 4, h);
  }

  if (mousePressed) {
    audio.playTone({
      frequency: map(mouseX, 0, width, 200, 800),
      duration: 0.15,
      waveform: 'sine',
      volume: 0.2,
      attack: 0.01,
      decay: 0.05,
      sustain: 0.3,
      release: 0.05
    });
  }
}`,
  },
  "flow-field": {
    label: "Flow Field",
    code: `const agents = [];
const AGENT_COUNT = 500;
const NOISE_SCALE = 0.005;
let zOff = 0;

function setup() {
  background('#0a0a1a');
  for (let i = 0; i < AGENT_COUNT; i++) {
    agents.push({
      x: random(width),
      y: random(height),
      px: 0, py: 0
    });
    agents[i].px = agents[i].x;
    agents[i].py = agents[i].y;
  }
}

function draw() {
  // Slowly fade background
  background('rgba(10,10,26,0.02)');
  zOff += 0.001;

  for (const a of agents) {
    a.px = a.x;
    a.py = a.y;

    const angle = noise(a.x * NOISE_SCALE, a.y * NOISE_SCALE + zOff) * Math.PI * 4;
    const speed = 1.5;

    a.x += Math.cos(angle) * speed;
    a.y += Math.sin(angle) * speed;

    // Wrap around
    if (a.x < 0) { a.x = width; a.px = a.x; }
    if (a.x > width) { a.x = 0; a.px = a.x; }
    if (a.y < 0) { a.y = height; a.py = a.y; }
    if (a.y > height) { a.y = 0; a.py = a.y; }

    const hue = (noise(a.x * 0.003, a.y * 0.003) * 360) | 0;
    stroke('hsla(' + hue + ', 70%, 60%, 0.3)');
    strokeWeight(0.8);
    line(a.px, a.py, a.x, a.y);
  }
}`,
  },
};

interface ControlPanelProps {
  onRun: (code: string) => void;
  onPause: () => void;
  onResume: () => void;
  onReset: () => void;
  isRunning: boolean;
  isPaused: boolean;
  errors: string[];
  logs: string[];
}

export default function ControlPanel({
  onRun,
  onPause,
  onResume,
  onReset,
  isRunning,
  isPaused,
  errors,
  logs,
}: ControlPanelProps) {
  const [code, setCode] = useState(PRESETS["particle-burst"].code);

  const handleRun = useCallback(() => {
    onRun(code);
  }, [code, onRun]);

  const loadPreset = useCallback((key: string) => {
    const preset = PRESETS[key];
    if (preset) setCode(preset.code);
  }, []);

  return (
    <div className="flex h-full flex-col bg-[#0d1117] text-gray-200">
      {/* Toolbar */}
      <div className="flex items-center gap-2 border-b border-gray-700 px-3 py-2">
        <button
          onClick={handleRun}
          className="rounded bg-green-600 px-3 py-1.5 text-sm font-medium hover:bg-green-500 transition-colors"
        >
          Run
        </button>

        {isRunning && !isPaused && (
          <button
            onClick={onPause}
            className="rounded bg-yellow-600 px-3 py-1.5 text-sm font-medium hover:bg-yellow-500 transition-colors"
          >
            Pause
          </button>
        )}

        {isPaused && (
          <button
            onClick={onResume}
            className="rounded bg-blue-600 px-3 py-1.5 text-sm font-medium hover:bg-blue-500 transition-colors"
          >
            Resume
          </button>
        )}

        <button
          onClick={onReset}
          className="rounded bg-gray-600 px-3 py-1.5 text-sm font-medium hover:bg-gray-500 transition-colors"
        >
          Reset
        </button>

        <div className="mx-2 h-5 w-px bg-gray-700" />

        <span className="text-xs text-gray-500">Presets:</span>
        {Object.entries(PRESETS).map(([key, { label }]) => (
          <button
            key={key}
            onClick={() => loadPreset(key)}
            className="rounded bg-gray-700 px-2 py-1 text-xs hover:bg-gray-600 transition-colors"
          >
            {label}
          </button>
        ))}
      </div>

      {/* Code Editor */}
      <div className="flex-1 overflow-hidden">
        <textarea
          value={code}
          onChange={(e) => setCode(e.target.value)}
          spellCheck={false}
          className="h-full w-full resize-none bg-[#161b22] p-4 font-mono text-sm text-gray-200 outline-none placeholder:text-gray-600"
          placeholder="Write your creative code here..."
        />
      </div>

      {/* Console */}
      <div className="h-32 overflow-auto border-t border-gray-700 bg-[#0d1117] p-2 font-mono text-xs">
        {errors.map((err, i) => (
          <div key={`err-${i}`} className="text-red-400">
            Error: {err}
          </div>
        ))}
        {logs.map((log, i) => (
          <div key={`log-${i}`} className="text-gray-400">
            {log}
          </div>
        ))}
        {errors.length === 0 && logs.length === 0 && (
          <div className="text-gray-600">Console output will appear here...</div>
        )}
      </div>
    </div>
  );
}

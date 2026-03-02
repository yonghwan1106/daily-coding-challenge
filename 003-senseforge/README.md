# SenseForge

자연어로 인터랙티브 미디어 아트를 만드는 크리에이티브 코딩 플랫폼.

## Getting Started

```bash
cd 003-senseforge
npm install
npm run dev
```

`http://localhost:3000` 접속 시 `/playground`로 자동 리다이렉트됩니다.

## Architecture

```
Host (Next.js)                    iframe (sandbox="allow-scripts")
+-------------------+  postMessage  +--------------------+
| CanvasRenderer    |<=============>| sf.* Runtime API   |
| AudioEngine       |   (transfer)  | setup() / draw()   |
| ControlPanel      |               | User Code          |
+-------------------+               +--------------------+
```

- **Host -> Sandbox**: `execute(code)`, `control(pause/resume/reset)`, `mouse/key` events
- **Sandbox -> Host**: `frame(ImageBitmap)`, `audio(playTone)`, `error(msg)`, `log(msg)`

## API Reference

### Canvas

```javascript
function setup() {
  background('#1a1a2e');
}

function draw() {
  circle(mouseX, mouseY, 40);
  rect(100, 100, 50, 50);
  line(0, 0, width, height);
}
```

| Function | Description |
|----------|-------------|
| `background(color)` | 배경 채우기 |
| `circle(x, y, r)` | 원 그리기 |
| `rect(x, y, w, h)` | 사각형 그리기 |
| `line(x1, y1, x2, y2)` | 선 그리기 |
| `fill(color)` | 채우기 색상 설정 |
| `stroke(color)` | 테두리 색상 설정 |
| `strokeWeight(w)` | 테두리 두께 설정 |
| `push()` / `pop()` | 캔버스 상태 저장/복원 |
| `translate(x, y)` | 좌표 이동 |
| `rotate(angle)` | 회전 (라디안) |
| `scale(x, y?)` | 크기 변환 |

### Particles

```javascript
function draw() {
  background('#000');
  particles.emit({ x: mouseX, y: mouseY, count: 5, color: '#ff6b6b', glow: true });
  particles.burst({ x: width/2, y: height/2, count: 50, speed: [2, 8] });
}
```

### Audio

```javascript
audio.playTone({ frequency: 440, duration: 0.3, waveform: 'sine' });
```

### Globals

| Variable | Description |
|----------|-------------|
| `width` / `height` | 캔버스 크기 |
| `mouseX` / `mouseY` | 마우스 좌표 |
| `mousePressed` | 마우스 버튼 상태 |
| `frameCount` | 프레임 번호 |
| `deltaTime` | 프레임 간 시간 (초) |

### Utilities

| Function | Description |
|----------|-------------|
| `random(min?, max?)` | 랜덤 값 |
| `map(v, inMin, inMax, outMin, outMax)` | 값 매핑 |
| `lerp(a, b, t)` | 선형 보간 |
| `noise(x, y?)` | Perlin noise (0~1) |

## Tech Stack

- **Framework**: Next.js (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Rendering**: Canvas 2D API, Web Audio API
- **3D** (planned): Three.js

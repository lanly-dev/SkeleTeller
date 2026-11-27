import type { Avatar, Prop, Scene, Storyboard } from '../../../skeleton/src/types';
import { ambientParticles } from './ambient';
import { confetti, dustLook, fade, reaction, type Pose, type Puff } from './effects';
import type { GameState } from './game';
import { SIZE, type MoodObject, type SceneryItem } from './scenery';
import { fitText, wrapLines } from './text';
import type { ResolvedTheme } from './theme';
import { DOORWAY, WORLD_HEIGHT, WORLD_WIDTH, type Area } from './world';

/** Thickness of the wall band drawn around each area. */
const WALL = 24;
const FONT = 'system-ui, -apple-system, "Segoe UI", Roboto, sans-serif';
const MONO = 'ui-monospace, "Cascadia Mono", Consolas, monospace';


export interface Frame {
  storyboard: Storyboard;
  world: readonly Area[];
  state: GameState;
  theme: ResolvedTheme;
  /** Loaded capture or background image per scene index, when available. */
  images: ReadonlyMap<number, HTMLImageElement>;
  /** Seconds since start, for gentle motion. */
  time: number;
  moving: boolean;
  /** Text shown above a station in range, for example "E to view". */
  prompt: string;
  /** Short movement hint shown in the start area. */
  hint: string;
  living: Living;
}

/** Everything that makes the world respond. Kept by main.ts; drawing reads it as a snapshot. */
export interface Living {
  items: readonly SceneryItem[];
  /** When each object (by slot) was last poked, in seconds. */
  pokedAt: ReadonlyMap<number, number>;
  avatarPokedAt: number;
  /** When the character entered the current area. */
  enteredAt: number;
  visited: ReadonlySet<number>;
  stationsTotal: number;
  quip?: { text: string; at: number };
  dust: readonly Puff[];
  reduced: boolean;
}

// ---------- color helpers ----------

function rgb(hex: string): [number, number, number] {
  const n = parseInt(hex.slice(1), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

/** Mix a color toward white (amount > 0) or black (amount < 0). */
function shade(hex: string, amount: number): string {
  const target = amount > 0 ? 255 : 0;
  const a = Math.min(1, Math.abs(amount));
  const [r, g, b] = rgb(hex).map((c) => Math.round(c + (target - c) * a));
  return `rgb(${r}, ${g}, ${b})`;
}

function alpha(hex: string, a: number): string {
  const [r, g, b] = rgb(hex);
  return `rgba(${r}, ${g}, ${b}, ${a})`;
}

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function measureWith(ctx: CanvasRenderingContext2D) {
  return (s: string) => ctx.measureText(s).width;
}

/** Draw an image to cover the box, cropping the overflow. */
function drawCover(ctx: CanvasRenderingContext2D, img: HTMLImageElement, x: number, y: number, w: number, h: number) {
  const scale = Math.max(w / img.naturalWidth, h / img.naturalHeight);
  const sw = w / scale;
  const sh = h / scale;
  ctx.drawImage(img, (img.naturalWidth - sw) / 2, (img.naturalHeight - sh) / 2, sw, sh, x, y, w, h);
}

// ---------- world ----------

function drawFloor(ctx: CanvasRenderingContext2D, theme: ResolvedTheme, areaIndex: number) {
  const { ground, accent } = theme.palette;
  const x = WALL;
  const y = WALL;
  const w = WORLD_WIDTH - WALL * 2;
  const h = WORLD_HEIGHT - WALL * 2;
  ctx.fillStyle = ground;
  ctx.fillRect(x, y, w, h);

  ctx.save();
  ctx.beginPath();
  ctx.rect(x, y, w, h);
  ctx.clip();
  switch (theme.mood) {
    case 'cozy': {
      ctx.fillStyle = shade(ground, 0.06);
      for (let ty = y; ty < y + h; ty += 48) {
        for (let tx = x + (((ty - y) / 48) % 2) * 48; tx < x + w; tx += 96) ctx.fillRect(tx, ty, 48, 48);
      }
      break;
    }
    case 'neon': {
      ctx.strokeStyle = alpha(accent, 0.22);
      ctx.lineWidth = 1;
      for (let gx = x; gx <= x + w; gx += 48) {
        ctx.beginPath();
        ctx.moveTo(gx + 0.5, y);
        ctx.lineTo(gx + 0.5, y + h);
        ctx.stroke();
      }
      for (let gy = y; gy <= y + h; gy += 48) {
        ctx.beginPath();
        ctx.moveTo(x, gy + 0.5);
        ctx.lineTo(x + w, gy + 0.5);
        ctx.stroke();
      }
      break;
    }
    case 'spooky': {
      // Deterministic per area, so the floor does not flicker between frames.
      let seed = 1 + areaIndex * 7919;
      const rand = () => ((seed = (seed * 16807) % 2147483647) - 1) / 2147483646;
      ctx.fillStyle = shade(ground, 0.12);
      for (let i = 0; i < 90; i++) ctx.fillRect(x + rand() * w, y + rand() * h, 2 + rand() * 3, 2 + rand() * 3);
      break;
    }
    case 'clean':
      ctx.strokeStyle = alpha(accent, 0.2);
      ctx.lineWidth = 2;
      ctx.strokeRect(x + 16, y + 16, w - 32, h - 32);
      break;
  }
  ctx.restore();
}

function drawWalls(ctx: CanvasRenderingContext2D, area: Area, theme: ResolvedTheme) {
  const wall = shade(theme.palette.background, -0.35);
  ctx.fillStyle = wall;
  ctx.fillRect(0, 0, WORLD_WIDTH, WALL);
  ctx.fillRect(0, WORLD_HEIGHT - WALL, WORLD_WIDTH, WALL);
  for (const [side, open] of [
    [0, area.doorLeft],
    [WORLD_WIDTH - WALL, area.doorRight],
  ] as const) {
    if (open) {
      ctx.fillRect(side, 0, WALL, DOORWAY.top);
      ctx.fillRect(side, DOORWAY.bottom, WALL, WORLD_HEIGHT - DOORWAY.bottom);
      ctx.fillStyle = theme.palette.ground;
      ctx.fillRect(side, DOORWAY.top, WALL, DOORWAY.bottom - DOORWAY.top);
      ctx.fillStyle = wall;
    } else {
      ctx.fillRect(side, 0, WALL, WORLD_HEIGHT);
    }
  }
  // Chevrons pointing through each open doorway.
  ctx.fillStyle = alpha(theme.palette.accent, 0.8);
  const mid = (DOORWAY.top + DOORWAY.bottom) / 2;
  const chevron = (cx: number, dir: 1 | -1) => {
    ctx.beginPath();
    ctx.moveTo(cx - 6 * dir, mid - 12);
    ctx.lineTo(cx + 6 * dir, mid);
    ctx.lineTo(cx - 6 * dir, mid + 12);
    ctx.closePath();
    ctx.fill();
  };
  if (area.doorLeft) chevron(WALL + 14, -1);
  if (area.doorRight) chevron(WORLD_WIDTH - WALL - 14, 1);
}

function drawVignette(ctx: CanvasRenderingContext2D, theme: ResolvedTheme) {
  const strength = theme.mood === 'spooky' ? 0.6 : theme.mood === 'cozy' ? 0.25 : theme.mood === 'neon' ? 0.35 : 0.12;
  const g = ctx.createRadialGradient(
    WORLD_WIDTH / 2,
    WORLD_HEIGHT / 2,
    WORLD_HEIGHT * 0.35,
    WORLD_WIDTH / 2,
    WORLD_HEIGHT / 2,
    WORLD_WIDTH * 0.62,
  );
  g.addColorStop(0, 'rgba(0, 0, 0, 0)');
  g.addColorStop(1, `rgba(0, 0, 0, ${strength})`);
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, WORLD_WIDTH, WORLD_HEIGHT);
}

// ---------- props ----------

function drawProp(ctx: CanvasRenderingContext2D, prop: Prop, x: number, y: number, theme: ResolvedTheme, time: number) {
  const { accent, station, background } = theme.palette;
  const dark = shade(background, -0.3);
  ctx.save();
  ctx.translate(x, y);
  // Ground shadow
  ctx.fillStyle = 'rgba(0, 0, 0, 0.25)';
  ctx.beginPath();
  ctx.ellipse(0, 22, 22, 6, 0, 0, Math.PI * 2);
  ctx.fill();
  switch (prop) {
    case 'plant':
      ctx.fillStyle = shade(accent, -0.35);
      roundRect(ctx, -12, 6, 24, 18, 4);
      ctx.fill();
      ctx.fillStyle = '#4caf6a';
      for (const [lx, ly, r] of [
        [0, -10, 12],
        [-10, -2, 9],
        [10, -2, 9],
      ] as const) {
        ctx.beginPath();
        ctx.arc(lx, ly, r, 0, Math.PI * 2);
        ctx.fill();
      }
      break;
    case 'lamp': {
      ctx.fillStyle = dark;
      ctx.fillRect(-2, -14, 4, 36);
      ctx.fillRect(-10, 20, 20, 4);
      const glow = 0.25 + 0.08 * Math.sin(time * 2);
      ctx.fillStyle = alpha(accent, glow);
      ctx.beginPath();
      ctx.arc(0, -20, 22, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = accent;
      ctx.beginPath();
      ctx.moveTo(-12, -14);
      ctx.lineTo(12, -14);
      ctx.lineTo(6, -28);
      ctx.lineTo(-6, -28);
      ctx.closePath();
      ctx.fill();
      break;
    }
    case 'crate':
      ctx.fillStyle = '#a07a4a';
      ctx.fillRect(-18, -12, 36, 34);
      ctx.strokeStyle = '#6e5232';
      ctx.lineWidth = 3;
      ctx.strokeRect(-18, -12, 36, 34);
      ctx.beginPath();
      ctx.moveTo(-18, -12);
      ctx.lineTo(18, 22);
      ctx.stroke();
      break;
    case 'sign':
      ctx.fillStyle = dark;
      ctx.fillRect(-2, -4, 4, 26);
      ctx.fillStyle = station;
      roundRect(ctx, -20, -24, 40, 22, 4);
      ctx.fill();
      ctx.fillStyle = alpha('#ffffff', 0.7);
      ctx.fillRect(-12, -16, 24, 3);
      ctx.fillRect(-12, -10, 16, 3);
      break;
    case 'bookshelf': {
      ctx.fillStyle = '#6e5232';
      ctx.fillRect(-22, -26, 44, 48);
      const colors = [accent, station, '#c0504d', '#e8d8a8'];
      for (let row = 0; row < 3; row++) {
        for (let i = 0; i < 5; i++) {
          ctx.fillStyle = colors[(i + row) % colors.length];
          ctx.fillRect(-18 + i * 7.5, -22 + row * 15, 5, 12);
        }
      }
      break;
    }
    case 'banner': {
      ctx.fillStyle = dark;
      ctx.fillRect(-2, -30, 4, 52);
      const wave = Math.sin(time * 3) * 3;
      ctx.fillStyle = accent;
      ctx.beginPath();
      ctx.moveTo(2, -30);
      ctx.lineTo(26 + wave, -24);
      ctx.lineTo(2, -14);
      ctx.closePath();
      ctx.fill();
      break;
    }
  }
  ctx.restore();
}

// ---------- stations ----------

function drawTitleSign(ctx: CanvasRenderingContext2D, scene: Extract<Scene, { type: 'title' }>, area: Area, theme: ResolvedTheme) {
  const { x, y } = area.station;
  const w = 460;
  const h = 170;
  ctx.fillStyle = shade(theme.palette.background, -0.2);
  ctx.fillRect(x - 6, y + h / 2 - 4, 12, 40);
  ctx.fillStyle = alpha(theme.palette.background, 0.92);
  roundRect(ctx, x - w / 2, y - h / 2, w, h, 12);
  ctx.fill();
  ctx.strokeStyle = theme.palette.accent;
  ctx.lineWidth = 3;
  ctx.stroke();

  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = theme.palette.text;
  ctx.font = `bold 44px ${FONT}`;
  ctx.fillText(fitText(scene.title, w - 40, measureWith(ctx)), x, y - (scene.tagline ? 26 : 0));
  if (scene.tagline) {
    ctx.font = `20px ${FONT}`;
    ctx.fillStyle = alpha(theme.palette.text, 0.85);
    const lines = wrapLines(scene.tagline, w - 48, measureWith(ctx), 2);
    lines.forEach((line, i) => ctx.fillText(line, x, y + 22 + i * 26));
  }
}

function drawScreen(
  ctx: CanvasRenderingContext2D,
  scene: Scene,
  area: Area,
  theme: ResolvedTheme,
  img: HTMLImageElement | undefined,
  glow: number,
) {
  const { x, y } = area.station;
  const w = 168;
  const h = 104;
  const { station, accent } = theme.palette;
  ctx.fillStyle = shade(station, -0.4);
  ctx.fillRect(x - 6, y + h / 2, 12, 26);
  ctx.fillRect(x - 30, y + h / 2 + 24, 60, 6);

  ctx.save();
  if (theme.mood === 'neon' || glow > 0) {
    ctx.shadowColor = theme.mood === 'neon' ? accent : station;
    ctx.shadowBlur = 12 + glow * 18;
  }
  ctx.fillStyle = station;
  roundRect(ctx, x - w / 2, y - h / 2, w, h, 8);
  ctx.fill();
  ctx.restore();

  const ix = x - w / 2 + 8;
  const iy = y - h / 2 + 8;
  const iw = w - 16;
  const ih = h - 16;
  if (img) {
    drawCover(ctx, img, ix, iy, iw, ih);
  } else {
    ctx.fillStyle = shade(station, -0.55);
    ctx.fillRect(ix, iy, iw, ih);
  }
  if (scene.type === 'callout') {
    scene.callouts.forEach((c, i) => {
      const cx = ix + c.x * iw;
      const cy = iy + c.y * ih;
      ctx.fillStyle = accent;
      ctx.beginPath();
      ctx.arc(cx, cy, 7, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#000';
      ctx.font = `bold 9px ${FONT}`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(String(i + 1), cx, cy + 0.5);
    });
  }
}

function drawTerminal(ctx: CanvasRenderingContext2D, scene: Extract<Scene, { type: 'code' }>, area: Area, theme: ResolvedTheme, time: number, glow: number) {
  const { x, y } = area.station;
  const w = 180;
  const h = 112;
  const { station, accent } = theme.palette;
  ctx.fillStyle = shade(station, -0.45);
  roundRect(ctx, x - w / 2 - 10, y + h / 2 - 6, w + 20, 30, 6);
  ctx.fill();

  ctx.save();
  if (glow > 0) {
    ctx.shadowColor = accent;
    ctx.shadowBlur = 10 + glow * 18;
  }
  ctx.fillStyle = '#0d1117';
  roundRect(ctx, x - w / 2, y - h / 2, w, h, 8);
  ctx.fill();
  ctx.restore();
  ctx.strokeStyle = station;
  ctx.lineWidth = 3;
  roundRect(ctx, x - w / 2, y - h / 2, w, h, 8);
  ctx.stroke();

  ctx.font = `12px ${MONO}`;
  ctx.textAlign = 'left';
  ctx.textBaseline = 'top';
  const lines = scene.code.snippet.replace(/\n$/, '').split('\n').filter((l) => l.trim()).slice(0, 4);
  const measure = measureWith(ctx);
  lines.forEach((line, i) => {
    ctx.fillStyle = i === 0 ? accent : alpha('#c9d1d9', 0.85);
    ctx.fillText(fitText(line, w - 24, measure), x - w / 2 + 12, y - h / 2 + 12 + i * 17);
  });
  if (Math.floor(time * 2) % 2 === 0) {
    ctx.fillStyle = accent;
    ctx.fillRect(x - w / 2 + 12, y - h / 2 + 12 + lines.length * 17, 8, 13);
  }
}

function drawExit(ctx: CanvasRenderingContext2D, area: Area, theme: ResolvedTheme, time: number, glow: number) {
  const { x, y } = area.station;
  const w = 110;
  const h = 150;
  const { accent, text } = theme.palette;
  ctx.save();
  ctx.shadowColor = accent;
  ctx.shadowBlur = 16 + 8 * Math.sin(time * 2) + glow * 14;
  ctx.fillStyle = alpha(accent, 0.9);
  ctx.beginPath();
  ctx.moveTo(x - w / 2, y + h / 2);
  ctx.lineTo(x - w / 2, y - h / 2 + w / 2);
  ctx.arc(x, y - h / 2 + w / 2, w / 2, Math.PI, 0);
  ctx.lineTo(x + w / 2, y + h / 2);
  ctx.closePath();
  ctx.fill();
  ctx.restore();
  ctx.fillStyle = shade(theme.palette.background, -0.5);
  ctx.beginPath();
  const iw = w - 22;
  ctx.moveTo(x - iw / 2, y + h / 2);
  ctx.lineTo(x - iw / 2, y - h / 2 + w / 2 + 6);
  ctx.arc(x, y - h / 2 + w / 2 + 6, iw / 2, Math.PI, 0);
  ctx.lineTo(x + iw / 2, y + h / 2);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = text;
  ctx.font = `bold 16px ${FONT}`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('THE END', x, y + 14);
}

// ---------- avatar ----------

function drawAvatar(ctx: CanvasRenderingContext2D, avatar: Avatar, state: GameState, theme: ResolvedTheme, time: number, moving: boolean, reduced: boolean) {
  const bob = reduced ? 0 : moving ? Math.sin(time * 14) * 2.5 : Math.sin(time * 2) * 1;
  const stride = moving && !reduced ? Math.sin(time * 14) * 4 : 0;
  const { x } = state;
  const y = state.y + bob;
  const flip = state.facing === 'left' ? -1 : 1;
  const { accent, text } = theme.palette;
  ctx.save();
  ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
  ctx.beginPath();
  ctx.ellipse(state.x, state.y + 22, 16, 5, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.translate(x, y);
  ctx.scale(flip, 1);
  switch (avatar) {
    case 'explorer':
      ctx.fillStyle = '#2c3a4e';
      roundRect(ctx, -8 + stride, 14, 6, 10, 2);
      ctx.fill();
      roundRect(ctx, 2 - stride, 14, 6, 10, 2);
      ctx.fill();
      ctx.fillStyle = '#3d6fb6';
      roundRect(ctx, -11, -2, 22, 22, 6);
      ctx.fill();
      ctx.fillStyle = '#f1c9a5';
      ctx.beginPath();
      ctx.arc(0, -12, 11, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#8a5a2b';
      ctx.fillRect(-15, -22, 30, 4);
      roundRect(ctx, -9, -30, 18, 10, 3);
      ctx.fill();
      ctx.fillStyle = '#222';
      ctx.fillRect(4, -14, 3, 3);
      break;
    case 'robot':
      ctx.fillStyle = '#6b7a89';
      ctx.fillRect(-9 + stride * 0.7, 16, 6, 8);
      ctx.fillRect(3 - stride * 0.7, 16, 6, 8);
      ctx.fillStyle = '#9aa7b4';
      roundRect(ctx, -12, -2, 24, 22, 4);
      ctx.fill();
      roundRect(ctx, -11, -24, 22, 18, 4);
      ctx.fill();
      ctx.fillStyle = accent;
      ctx.fillRect(-1, -32, 2, 8);
      ctx.beginPath();
      ctx.arc(0, -33, 3, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#1b2733';
      ctx.fillRect(1, -18, 7, 5);
      break;
    case 'ghost':
      ctx.globalAlpha = 0.92;
      ctx.fillStyle = text;
      ctx.beginPath();
      ctx.moveTo(-14, 20);
      ctx.lineTo(-14, -12);
      ctx.arc(0, -12, 14, Math.PI, 0);
      ctx.lineTo(14, 20);
      for (let i = 0; i < 4; i++) {
        const sx = 14 - i * 7;
        ctx.lineTo(sx - 3.5, 14 + Math.sin(time * (moving ? 14 : 6) + i) * (moving ? 3.5 : 2));
        ctx.lineTo(sx - 7, 20);
      }
      ctx.closePath();
      ctx.fill();
      ctx.globalAlpha = 1;
      ctx.fillStyle = '#1b2733';
      ctx.beginPath();
      ctx.arc(3, -12, 2.5, 0, Math.PI * 2);
      ctx.arc(9, -12, 2.5, 0, Math.PI * 2);
      ctx.fill();
      break;
  }
  ctx.restore();
}

// ---------- mood objects ----------

type Ink = 'accent' | 'accentD' | 'accentL' | 'station' | 'stationD' | 'ink' | 'bgD' | string;
interface Shape {
  d: string;
  fill?: Ink;
  stroke?: Ink;
  width?: number;
  alpha?: number;
}

/** Same shapes as the storybook's mood objects, as SVG path data drawn through Path2D. */
const MOOD_SHAPES: Record<MoodObject, { scale: number; shapes: Shape[] }> = {
  pumpkin: {
    scale: 0.8,
    shapes: [
      { d: 'M-34 0 a34 6 0 1 0 68 0 a34 6 0 1 0 -68 0', fill: '#000', alpha: 0.26 },
      { d: 'M-34 -26 a19 25 0 1 0 38 0 a19 25 0 1 0 -38 0', fill: 'accentD' },
      { d: 'M-4 -26 a19 25 0 1 0 38 0 a19 25 0 1 0 -38 0', fill: 'accentD' },
      { d: 'M-19 -26 a19 26 0 1 0 38 0 a19 26 0 1 0 -38 0', fill: 'accent' },
      { d: 'M-1 -50 q2 -11 10 -13', stroke: '#4a6a2a', width: 5 },
      { d: 'M-15 -32 l6 -9 l6 9 z M3 -32 l6 -9 l6 9 z M-16 -17 q16 11 32 0 l-6 2 l-4 -3 l-6 4 l-6 -4 l-4 3 z', fill: '#3b2208' },
    ],
  },
  gravestone: {
    scale: 0.8,
    shapes: [
      { d: 'M-32 0 a32 6 0 1 0 64 0 a32 6 0 1 0 -64 0', fill: '#000', alpha: 0.26 },
      { d: 'M-26 0 V-52 Q-26 -80 0 -80 Q26 -80 26 -52 V0 Z', fill: '#6b7686' },
      { d: 'M-26 -10 V-52 Q-26 -80 0 -80', stroke: '#8b96a6', width: 3 },
      { d: 'M-10 -54 H10 M0 -64 V-36', stroke: '#4a5462', width: 5 },
      { d: 'M-30 0 q4 -10 8 0 q4 -8 8 0 M18 0 q4 -10 8 0', stroke: '#3f6b3a', width: 3 },
    ],
  },
  fence: {
    scale: 0.8,
    shapes: [
      { d: 'M-64 0 a64 6 0 1 0 128 0 a64 6 0 1 0 -128 0', fill: '#000', alpha: 0.26 },
      { d: 'M-62 -46 h124 v7 h-124 z M-62 -24 h124 v7 h-124 z', fill: '#c9a26b', stroke: '#8a6338', width: 2 },
      { d: 'M-61 0 V-56 L-54 -66 L-47 -56 V0 Z M-25 0 V-56 L-18 -66 L-11 -56 V0 Z M11 0 V-56 L18 -66 L25 -56 V0 Z M47 0 V-56 L54 -66 L61 -56 V0 Z', fill: '#c9a26b', stroke: '#8a6338', width: 2 },
    ],
  },
  flowers: {
    scale: 0.7,
    shapes: [
      { d: 'M-40 0 a40 6 0 1 0 80 0 a40 6 0 1 0 -80 0', fill: '#000', alpha: 0.26 },
      { d: 'M-26 0 V-44 M0 0 V-58 M24 0 V-40 M-8 0 V-30 M12 0 V-26', stroke: '#4a8a4a', width: 3 },
      { d: 'M-32 -44 a6 6 0 1 0 12 0 a6 6 0 1 0 -12 0 M18 -40 a6 6 0 1 0 12 0 a6 6 0 1 0 -12 0', fill: 'accent' },
      { d: 'M-6 -58 a7 7 0 1 0 14 0 a7 7 0 1 0 -14 0 M6 -26 a6 6 0 1 0 12 0 a6 6 0 1 0 -12 0', fill: 'station' },
      { d: 'M-14 -30 a6 6 0 1 0 12 0 a6 6 0 1 0 -12 0', fill: 'accentL' },
      { d: 'M-29 -44 a3 3 0 1 0 6 0 a3 3 0 1 0 -6 0 M-3 -58 a3 3 0 1 0 6 0 a3 3 0 1 0 -6 0 M21 -40 a3 3 0 1 0 6 0 a3 3 0 1 0 -6 0', fill: '#ffd27a' },
    ],
  },
  palm: {
    scale: 0.75,
    shapes: [
      { d: 'M-26 0 a26 6 0 1 0 52 0 a26 6 0 1 0 -52 0', fill: '#000', alpha: 0.26 },
      { d: 'M0 0 C6 -50 -4 -100 12 -150', stroke: 'ink', width: 12 },
      { d: 'M12 -150 C-18 -168 -46 -158 -62 -136 C-38 -150 -14 -152 12 -144 Z M12 -150 C42 -170 72 -160 88 -138 C64 -152 38 -154 12 -144 Z M12 -150 C2 -184 -24 -202 -48 -200 C-24 -190 -6 -174 8 -146 Z M12 -150 C24 -184 50 -200 74 -196 C50 -188 32 -172 16 -146 Z', fill: 'ink', stroke: 'station', width: 2.5 },
      { d: 'M0 0 C6 -50 -4 -100 12 -150', stroke: 'accent', width: 2, alpha: 0.7 },
    ],
  },
  arcade: {
    scale: 0.78,
    shapes: [
      { d: 'M-34 0 a34 6 0 1 0 68 0 a34 6 0 1 0 -68 0', fill: '#000', alpha: 0.26 },
      { d: 'M-30 0 V-118 L-22 -132 H22 L30 -118 V0 Z', fill: 'ink', stroke: 'accent', width: 2.5 },
      { d: 'M-20 -112 h40 v32 h-40 z', fill: 'station' },
      { d: 'M-34 -72 H34 L28 -54 H-28 Z', fill: 'bgD' },
      { d: 'M-17 -64 a5 5 0 1 0 10 0 a5 5 0 1 0 -10 0', fill: 'accent' },
      { d: 'M-1 -64 a5 5 0 1 0 10 0 a5 5 0 1 0 -10 0', fill: 'station' },
      { d: 'M11 -64 a5 5 0 1 0 10 0 a5 5 0 1 0 -10 0', fill: 'accentL' },
      { d: 'M-8 -126 h16 v6 h-16 z', fill: 'accent' },
    ],
  },
  tree: {
    scale: 0.8,
    shapes: [
      { d: 'M-40 0 a40 6 0 1 0 80 0 a40 6 0 1 0 -80 0', fill: '#000', alpha: 0.26 },
      { d: 'M-8 0 V-70 h16 V0 Z', fill: '#7a5532' },
      { d: 'M-44 -104 a44 44 0 1 0 88 0 a44 44 0 1 0 -88 0', fill: '#4f9f62' },
      { d: 'M-54 -82 a28 28 0 1 0 56 0 a28 28 0 1 0 -56 0 M-4 -84 a30 30 0 1 0 60 0 a30 30 0 1 0 -60 0', fill: '#5cae6e' },
      { d: 'M-24 -118 a12 12 0 1 0 24 0 a12 12 0 1 0 -24 0', fill: '#7cc78c', alpha: 0.6 },
    ],
  },
  bench: {
    scale: 0.74,
    shapes: [
      { d: 'M-56 0 a56 6 0 1 0 112 0 a56 6 0 1 0 -112 0', fill: '#000', alpha: 0.26 },
      { d: 'M-48 -72 h7 v72 h-7 z M41 -72 h7 v72 h-7 z', fill: '#4a3a2a' },
      { d: 'M-54 -34 h108 v9 h-108 z M-54 -58 h108 v8 h-108 z M-54 -72 h108 v8 h-108 z', fill: '#a07a4a' },
    ],
  },
};

const pathCache = new Map<string, Path2D>();
function path(d: string): Path2D {
  let p = pathCache.get(d);
  if (!p) {
    p = new Path2D(d);
    pathCache.set(d, p);
  }
  return p;
}

function ink(name: Ink, theme: ResolvedTheme): string {
  const { accent, station, background } = theme.palette;
  switch (name) {
    case 'accent':
      return accent;
    case 'accentD':
      return shade(accent, -0.38);
    case 'accentL':
      return shade(accent, 0.45);
    case 'station':
      return station;
    case 'stationD':
      return shade(station, -0.35);
    case 'ink':
      return shade(background, -0.55);
    case 'bgD':
      return shade(background, -0.38);
    default:
      return name;
  }
}

function drawMoodObject(ctx: CanvasRenderingContext2D, kind: MoodObject, bx: number, by: number, theme: ResolvedTheme) {
  const { scale, shapes } = MOOD_SHAPES[kind];
  const base = ctx.globalAlpha;
  ctx.save();
  ctx.translate(bx, by);
  ctx.scale(scale, scale);
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  for (const s of shapes) {
    ctx.globalAlpha = base * (s.alpha ?? 1);
    const p = path(s.d);
    if (s.fill) {
      ctx.fillStyle = ink(s.fill, theme);
      ctx.fill(p);
    }
    if (s.stroke) {
      ctx.strokeStyle = ink(s.stroke, theme);
      ctx.lineWidth = s.width ?? 2;
      ctx.stroke(p);
    }
  }
  ctx.restore();
}

/** Draw with a reaction pose applied around a base point, plus a soft light for glow. */
function withPose(ctx: CanvasRenderingContext2D, bx: number, by: number, pose: Pose, lift: number, theme: ResolvedTheme, draw: () => void) {
  ctx.save();
  ctx.translate(bx + pose.dx, by + pose.dy);
  ctx.rotate(pose.rot);
  ctx.scale(pose.sx, pose.sy);
  ctx.translate(-bx, -by);
  draw();
  ctx.restore();
  if (pose.glow > 0) {
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    const g = ctx.createRadialGradient(bx, by - lift, 0, bx, by - lift, 54);
    g.addColorStop(0, alpha(theme.palette.accent, 0.55 * pose.glow));
    g.addColorStop(1, alpha(theme.palette.accent, 0));
    ctx.fillStyle = g;
    ctx.fillRect(bx - 60, by - lift - 60, 120, 120);
    ctx.restore();
  }
}

function drawScenery(ctx: CanvasRenderingContext2D, it: SceneryItem, theme: ResolvedTheme, time: number, pose: Pose) {
  const mood = (['pumpkin', 'gravestone', 'fence', 'flowers', 'palm', 'arcade', 'tree', 'bench'] as const).includes(it.kind as MoodObject);
  withPose(ctx, it.x, it.y, pose, 30, theme, () => {
    if (mood) drawMoodObject(ctx, it.kind as MoodObject, it.x, it.y, theme);
    else drawProp(ctx, it.kind as Prop, it.x, it.y - 22, theme, time);
  });
}

function drawAmbient(ctx: CanvasRenderingContext2D, frame: Frame) {
  const { theme, time, state, living } = frame;
  const parts = ambientParticles(theme.mood, time, state.area, living.reduced);
  const { accent, station, text } = theme.palette;
  for (const p of parts) {
    ctx.save();
    ctx.globalAlpha = Math.max(0, Math.min(1, p.alpha));
    ctx.translate(p.x, p.y);
    switch (p.kind) {
      case 'wisp': {
        const g = ctx.createRadialGradient(0, 0, 0, 0, 0, p.size * 2.4);
        g.addColorStop(0, alpha(text, 0.9));
        g.addColorStop(1, alpha(text, 0));
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(0, 0, p.size * 2.4, 0, Math.PI * 2);
        ctx.fill();
        break;
      }
      case 'bat': {
        const wing = 6 + p.angle * 5;
        ctx.fillStyle = shade(theme.palette.background, -0.6);
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.quadraticCurveTo(-9, -wing, -18, 2);
        ctx.quadraticCurveTo(-9, -2, 0, 4);
        ctx.quadraticCurveTo(9, -2, 18, 2);
        ctx.quadraticCurveTo(9, -wing, 0, 0);
        ctx.fill();
        break;
      }
      case 'leaf':
        ctx.rotate(p.angle);
        ctx.fillStyle = shade(accent, -0.15);
        ctx.beginPath();
        ctx.ellipse(0, 0, p.size, p.size * 0.5, 0, 0, Math.PI * 2);
        ctx.fill();
        break;
      case 'firefly': {
        const g = ctx.createRadialGradient(0, 0, 0, 0, 0, 10);
        g.addColorStop(0, alpha('#fff2a8', 1));
        g.addColorStop(0.3, alpha(accent, 0.6));
        g.addColorStop(1, alpha(accent, 0));
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(0, 0, 10, 0, Math.PI * 2);
        ctx.fill();
        break;
      }
      case 'sparkle':
        ctx.rotate(p.angle);
        ctx.fillStyle = p.size > 4.5 ? station : accent;
        ctx.beginPath();
        for (let k = 0; k < 4; k++) {
          ctx.rotate(Math.PI / 2);
          ctx.moveTo(0, 0);
          ctx.lineTo(p.size * 0.35, p.size * 0.35);
          ctx.lineTo(0, p.size * 1.6);
          ctx.lineTo(-p.size * 0.35, p.size * 0.35);
        }
        ctx.fill();
        break;
      case 'butterfly': {
        const open = 0.45 + Math.abs(p.angle) * 0.55;
        ctx.fillStyle = accent;
        ctx.beginPath();
        ctx.ellipse(-5 * open, -2, 6 * open, 4.5, -0.4, 0, Math.PI * 2);
        ctx.ellipse(5 * open, -2, 6 * open, 4.5, 0.4, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = station;
        ctx.beginPath();
        ctx.ellipse(-4 * open, 4, 4 * open, 3, -0.6, 0, Math.PI * 2);
        ctx.ellipse(4 * open, 4, 4 * open, 3, 0.6, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#2b2118';
        ctx.fillRect(-1, -5, 2, 11);
        break;
      }
    }
    ctx.restore();
  }
}

function drawDust(ctx: CanvasRenderingContext2D, dust: readonly Puff[], time: number, theme: ResolvedTheme) {
  for (const puff of dust) {
    const look = dustLook(puff, time);
    if (!look) continue;
    ctx.fillStyle = alpha(theme.palette.text, look.alpha * 0.7);
    ctx.beginPath();
    ctx.arc(puff.x, puff.y, look.r, 0, Math.PI * 2);
    ctx.fill();
  }
}

/** Check mark on a station the player has already opened. */
function drawVisited(ctx: CanvasRenderingContext2D, area: Area, theme: ResolvedTheme) {
  const off: Record<string, [number, number]> = { screen: [86, -54], terminal: [92, -58], exit: [56, -78] };
  const o = off[area.station.kind];
  if (!o) return;
  const x = area.station.x + o[0];
  const y = area.station.y + o[1];
  ctx.fillStyle = theme.palette.accent;
  ctx.beginPath();
  ctx.arc(x, y, 13, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#111';
  ctx.lineWidth = 3.5;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.beginPath();
  ctx.moveTo(x - 6, y);
  ctx.lineTo(x - 1.5, y + 5);
  ctx.lineTo(x + 6.5, y - 5);
  ctx.stroke();
}

function drawEntryCard(ctx: CanvasRenderingContext2D, frame: Frame, scene: Scene) {
  const { living, time, state, world, theme } = frame;
  if (state.area === 0) return;
  const age = time - living.enteredAt;
  const a = fade(age, 0.25, 1.5, 0.5);
  if (a <= 0) return;
  const slide = living.reduced ? 0 : (1 - Math.min(1, age / 0.25)) * -14;
  const title = `Area ${state.area + 1} of ${world.length}`;
  ctx.save();
  ctx.globalAlpha = a;
  ctx.font = `bold 22px ${FONT}`;
  const caption = fitText(headline(frame.storyboard, scene), 560, measureWith(ctx));
  const w = Math.max(ctx.measureText(caption).width, 160) + 56;
  const x = WORLD_WIDTH / 2 - w / 2;
  const y = 62 + slide;
  ctx.fillStyle = alpha(theme.palette.background, 0.9);
  roundRect(ctx, x, y, w, 70, 14);
  ctx.fill();
  ctx.strokeStyle = theme.palette.accent;
  ctx.lineWidth = 2;
  ctx.stroke();
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.font = `bold 13px ${FONT}`;
  ctx.fillStyle = theme.palette.accent;
  ctx.fillText(title.toUpperCase(), WORLD_WIDTH / 2, y + 21);
  ctx.font = `bold 22px ${FONT}`;
  ctx.fillStyle = theme.palette.text;
  ctx.fillText(caption, WORLD_WIDTH / 2, y + 47);
  ctx.restore();
}

function drawQuip(ctx: CanvasRenderingContext2D, frame: Frame) {
  const { living, time, state, theme } = frame;
  if (!living.quip) return;
  const a = fade(time - living.quip.at, 0.12, 2, 0.35);
  if (a <= 0) return;
  ctx.save();
  ctx.globalAlpha = a;
  ctx.font = `bold 15px ${FONT}`;
  const w = ctx.measureText(living.quip.text).width + 26;
  const x = Math.max(WALL + 6, Math.min(WORLD_WIDTH - WALL - 6 - w, state.x - w / 2));
  const y = state.y - 78;
  ctx.fillStyle = '#fffdf6';
  roundRect(ctx, x, y, w, 32, 14);
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(state.x - 7, y + 32);
  ctx.lineTo(state.x + 7, y + 32);
  ctx.lineTo(state.x, y + 41);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = '#2b2118';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  ctx.fillText(living.quip.text, x + 13, y + 16.5);
  ctx.restore();
}

function drawConfetti(ctx: CanvasRenderingContext2D, frame: Frame, area: Area) {
  const { living, time, theme } = frame;
  if (area.sceneType !== 'outro') return;
  const pieces = confetti(time - living.enteredAt - 0.35, area.station.x, area.station.y + 40, living.reduced, 56);
  const colors = [theme.palette.accent, theme.palette.station, theme.palette.text, '#ff6b9a'];
  for (const p of pieces) {
    ctx.save();
    ctx.globalAlpha = p.alpha;
    ctx.translate(p.x, p.y);
    ctx.rotate(p.rot);
    ctx.fillStyle = colors[p.color];
    ctx.fillRect(-4, -2.5, 8, 5);
    ctx.restore();
  }
}

// ---------- overlays ----------

function drawPrompt(ctx: CanvasRenderingContext2D, area: Area, theme: ResolvedTheme, text: string, time: number) {
  const { x, y } = area.station;
  const top = y - 100 + Math.sin(time * 4) * 3;
  ctx.font = `bold 16px ${FONT}`;
  const w = ctx.measureText(text).width + 28;
  ctx.fillStyle = theme.palette.accent;
  roundRect(ctx, x - w / 2, top - 16, w, 32, 16);
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(x - 7, top + 16);
  ctx.lineTo(x + 7, top + 16);
  ctx.lineTo(x, top + 24);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = '#111';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(text, x, top + 1);
}

function headline(storyboard: Storyboard, scene: Scene): string {
  if (scene.type === 'title') return scene.tagline ?? storyboard.project.description;
  return scene.caption;
}

function drawHud(ctx: CanvasRenderingContext2D, frame: Frame, scene: Scene) {
  const { theme, state, world } = frame;
  const text = theme.palette.text;
  ctx.fillStyle = alpha(theme.palette.background, 0.82);
  roundRect(ctx, 12, 8, WORLD_WIDTH - 24, 36, 10);
  ctx.fill();
  ctx.textBaseline = 'middle';
  ctx.textAlign = 'left';
  ctx.font = `bold 15px ${FONT}`;
  ctx.fillStyle = theme.palette.accent;
  const counter = `Area ${state.area + 1} / ${world.length}`;
  ctx.fillText(counter, 26, 26);
  const counterW = ctx.measureText(counter).width;
  const seen = `Seen ${frame.living.visited.size} / ${frame.living.stationsTotal}`;
  ctx.textAlign = 'right';
  ctx.fillText(seen, WORLD_WIDTH - 26, 26);
  const seenW = ctx.measureText(seen).width;
  ctx.textAlign = 'left';
  ctx.font = `15px ${FONT}`;
  ctx.fillStyle = text;
  ctx.fillText(fitText(headline(frame.storyboard, scene), WORLD_WIDTH - 100 - counterW - seenW, measureWith(ctx)), 44 + counterW, 26);
}

function drawHint(ctx: CanvasRenderingContext2D, theme: ResolvedTheme, hint: string) {
  ctx.font = `15px ${FONT}`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  const w = ctx.measureText(hint).width + 28;
  ctx.fillStyle = alpha(theme.palette.background, 0.82);
  roundRect(ctx, WORLD_WIDTH / 2 - w / 2, WORLD_HEIGHT - WALL - 52, w, 32, 10);
  ctx.fill();
  ctx.fillStyle = theme.palette.text;
  ctx.fillText(hint, WORLD_WIDTH / 2, WORLD_HEIGHT - WALL - 36);
}

/** Draw one full frame in logical coordinates (960 by 540). */
export function drawFrame(ctx: CanvasRenderingContext2D, frame: Frame): void {
  const { storyboard, world, state, theme, images, time } = frame;
  const area = world[state.area];
  const scene = area ? storyboard.scenes[area.sceneRef] : undefined;
  ctx.fillStyle = theme.palette.background;
  ctx.fillRect(0, 0, WORLD_WIDTH, WORLD_HEIGHT);
  if (!area || !scene) return;

  drawFloor(ctx, theme, area.index);

  // Title and outro images are shown as a faint backdrop on the floor.
  const backdrop = scene.type === 'title' || scene.type === 'outro' ? images.get(area.sceneRef) : undefined;
  if (backdrop) {
    ctx.save();
    ctx.globalAlpha = 0.18;
    drawCover(ctx, backdrop, WALL, WALL, WORLD_WIDTH - WALL * 2, WORLD_HEIGHT - WALL * 2);
    ctx.restore();
  }

  const glow = state.nearStation ? 1 : 0;
  switch (scene.type) {
    case 'title':
      drawTitleSign(ctx, scene, area, theme);
      break;
    case 'feature':
    case 'callout':
      drawScreen(ctx, scene, area, theme, images.get(area.sceneRef), glow);
      break;
    case 'code':
      drawTerminal(ctx, scene, area, theme, time, glow);
      break;
    case 'outro':
      drawExit(ctx, area, theme, time, glow);
      break;
  }

  const { living } = frame;
  if (living.visited.has(area.index)) drawVisited(ctx, area, theme);
  if (!living.reduced) drawDust(ctx, living.dust, time, theme);

  // Scenery and the character in depth order: lower bases are nearer, so drawn later.
  const feet = state.y + 22;
  const layer: Array<{ y: number; draw: () => void }> = living.items.map((it) => ({
    y: it.y,
    draw: () => {
      // An object in front of the character turns see-through, so the character never disappears behind it.
      const [w, h] = SIZE[it.kind];
      const hiding = it.y > feet && Math.abs(it.x - state.x) < w / 2 + 12 && feet > it.y - h - 8;
      ctx.save();
      if (hiding) ctx.globalAlpha = 0.45;
      drawScenery(ctx, it, theme, time, reaction(it.kind, time - (living.pokedAt.get(it.slot) ?? -9), living.reduced));
      ctx.restore();
    },
  }));
  layer.push({
    y: feet,
    draw: () =>
      withPose(ctx, state.x, feet, reaction('avatar', time - living.avatarPokedAt, living.reduced), 26, theme, () =>
        drawAvatar(ctx, theme.avatar, state, theme, time, frame.moving, living.reduced),
      ),
  });
  layer.sort((a, b) => a.y - b.y).forEach((l) => l.draw());

  drawAmbient(ctx, frame);
  drawWalls(ctx, area, theme);
  drawVignette(ctx, theme);
  drawHud(ctx, frame, scene);
  if (state.nearStation && !state.panelOpen) drawPrompt(ctx, area, theme, frame.prompt, time);
  if (area.index === 0 && frame.hint) drawHint(ctx, theme, frame.hint);
  drawEntryCard(ctx, frame, scene);
  drawQuip(ctx, frame);
  // On top of everything, so the entry card never hides it.
  drawConfetti(ctx, frame, area);
}

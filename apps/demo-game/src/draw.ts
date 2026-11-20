import type { Avatar, Prop, Scene, Storyboard } from '../../../skeleton/src/types';
import type { GameState } from './game';
import { fitText, wrapLines } from './text';
import type { ResolvedTheme } from './theme';
import { DOORWAY, WORLD_HEIGHT, WORLD_WIDTH, type Area } from './world';

/** Thickness of the wall band drawn around each area. */
const WALL = 24;
const FONT = 'system-ui, -apple-system, "Segoe UI", Roboto, sans-serif';
const MONO = 'ui-monospace, "Cascadia Mono", Consolas, monospace';

/** Fixed decorative slots, clear of the central station and the doorway corridor. */
const PROP_SLOTS: ReadonlyArray<[number, number]> = [
  [110, 112],
  [850, 112],
  [110, 432],
  [850, 432],
  [300, 92],
  [660, 92],
  [300, 452],
  [660, 452],
];

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

function drawAvatar(ctx: CanvasRenderingContext2D, avatar: Avatar, state: GameState, theme: ResolvedTheme, time: number, moving: boolean) {
  const bob = moving ? Math.sin(time * 14) * 2.5 : Math.sin(time * 2) * 1;
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
        ctx.lineTo(sx - 3.5, 14 + Math.sin(time * 6 + i) * 2);
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
  ctx.font = `15px ${FONT}`;
  ctx.fillStyle = text;
  ctx.fillText(fitText(headline(frame.storyboard, scene), WORLD_WIDTH - 80 - counterW, measureWith(ctx)), 44 + counterW, 26);
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

  theme.props.forEach((prop, i) => {
    const slot = PROP_SLOTS[(i + area.index * 3) % PROP_SLOTS.length];
    drawProp(ctx, prop, slot[0], slot[1], theme, time);
  });

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

  drawAvatar(ctx, theme.avatar, state, theme, time, frame.moving);
  drawWalls(ctx, area, theme);
  drawVignette(ctx, theme);
  drawHud(ctx, frame, scene);
  if (state.nearStation && !state.panelOpen) drawPrompt(ctx, area, theme, frame.prompt, time);
  if (area.index === 0 && frame.hint) drawHint(ctx, theme, frame.hint);
}

import './style.css';
import { drawFrame } from './draw';
import type { Puff } from './effects';
import { hitScenery, nearestScenery, QUIPS, sceneryFor, type SceneryItem } from './scenery';
import { initialState, step, type GameState } from './game';
import { createInput } from './input';
import { createPanel } from './panel';
import { resolveTheme } from './theme';
import { createTouchControls } from './touch';
import { storyboard } from './storyboard';
import { layoutWorld, WORLD_HEIGHT, WORLD_WIDTH } from './world';

const world = layoutWorld(storyboard);
const theme = resolveTheme(storyboard.theme);

const canvas = document.getElementById('game') as HTMLCanvasElement;
const ctx = canvas.getContext('2d') as CanvasRenderingContext2D;
const live = document.getElementById('live') as HTMLElement;
document.title = `${storyboard.project.name} · SkeleTeller Quest`;

// Theme colors for the DOM parts (panel, focus rings).
const rootStyle = document.documentElement.style;
rootStyle.setProperty('--bg', theme.palette.background);
rootStyle.setProperty('--text', theme.palette.text);
rootStyle.setProperty('--accent', theme.palette.accent);
rootStyle.setProperty('--station', theme.palette.station);

/** Render at the device pixel ratio so text stays sharp, while game logic stays in 960 by 540. */
function fitCanvas() {
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  canvas.width = Math.round(WORLD_WIDTH * dpr);
  canvas.height = Math.round(WORLD_HEIGHT * dpr);
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
}
fitCanvas();
window.addEventListener('resize', fitCanvas);

// Load the images each scene shows on the canvas (screen thumbnails, title and outro backdrops).
const images = new Map<number, HTMLImageElement>();
storyboard.scenes.forEach((scene, i) => {
  const src = scene.type === 'title' ? scene.background : 'visual' in scene ? scene.visual : undefined;
  if (!src) return;
  const img = new Image();
  img.decoding = 'async';
  img.onload = () => images.set(i, img);
  img.src = `./${src}`;
});

const input = createInput(window);
const panel = createPanel({
  root: document.getElementById('panel') as HTMLElement,
  storyboard,
  assetBase: './',
  onRequestClose: () => input.pressClose(),
});

const touch = createTouchControls(document.getElementById('touch') as HTMLElement, input);
/** True once the device has a coarse pointer or has been touched. Switches prompt and hint wording. */
const isTouch = () => document.body.classList.contains('has-touch');

/** Convert a pointer position to logical world coordinates. */
function toWorld(e: PointerEvent): { x: number; y: number } {
  const rect = canvas.getBoundingClientRect();
  return {
    x: ((e.clientX - rect.left) / rect.width) * WORLD_WIDTH,
    y: ((e.clientY - rect.top) / rect.height) * WORLD_HEIGHT,
  };
}

let state: GameState = initialState();

// ---------- the living world (requirements 12 to 16); the game rules in game.ts are unchanged ----------

/** How close the character's feet must come to an object to brush past it or talk about it. */
const BRUSH_RADIUS = 52;
const TALK_RADIUS = 84;
const stationsTotal = world.filter((a) => a.sceneType !== 'title').length;
const visited = new Set<number>();
let items: SceneryItem[] = sceneryFor(0, theme);
let pokedAt = new Map<number, number>();
let nearNow = new Set<number>();
let avatarPokedAt = -9;
let enteredAt = 0;
let quip: { text: string; at: number } | undefined;
const dust: Puff[] = [];
let walked = 0;
let now = 0;

const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
let reduced = motionQuery.matches;
motionQuery.addEventListener?.('change', (e) => (reduced = e.matches));

function poke(it: SceneryItem, talk: boolean) {
  pokedAt.set(it.slot, now);
  if (talk) quip = { text: QUIPS[it.kind], at: now };
}

// Tapping the station opens it when the character is in range; tapping an object makes it react.
canvas.addEventListener('pointerup', (e) => {
  if (state.panelOpen) return;
  const area = world[state.area];
  const p = toWorld(e);
  if (area && state.nearStation && Math.hypot(p.x - area.station.x, p.y - area.station.y) <= 110) {
    input.pressAction();
    return;
  }
  const hit = hitScenery(items, p.x, p.y);
  if (hit) poke(hit, true);
});

function announce(index: number) {
  const scene = storyboard.scenes[index];
  const text = scene.type === 'title' ? scene.title : scene.caption;
  live.textContent = `Area ${index + 1} of ${world.length}: ${text}`;
}
announce(0);


let last = performance.now();
const start = last;
function frame(nowMs: number) {
  const dt = (nowMs - last) / 1000;
  last = nowMs;
  const prev = state;
  now = (nowMs - start) / 1000;
  const inp = input.read();
  state = step(state, inp, dt, world);

  if (state.area !== prev.area) {
    announce(state.area);
    items = sceneryFor(state.area, theme);
    pokedAt = new Map();
    nearNow = new Set();
    quip = undefined;
    dust.length = 0;
    enteredAt = now;
  }
  const feetX = state.x;
  const feetY = state.y + 22;

  // Brushing past: an object reacts when the character first comes within reach of it.
  const near = new Set<number>();
  for (const it of items) if (Math.hypot(it.x - feetX, it.y - feetY) <= BRUSH_RADIUS) near.add(it.slot);
  for (const slot of near) if (!nearNow.has(slot)) pokedAt.set(slot, now);
  nearNow = near;

  // The action key away from a station makes the nearest object react, and the character says something.
  if (inp.action && !state.panelOpen && !prev.panelOpen && !state.nearStation) {
    const it = nearestScenery(items, feetX, feetY, TALK_RADIUS);
    if (it) poke(it, true);
  }

  // Footstep dust while walking.
  const stepLen = Math.hypot(state.x - prev.x, state.y - prev.y);
  if (state.area === prev.area && stepLen > 0) {
    walked += stepLen;
    if (walked > 22) {
      walked = 0;
      dust.push({ x: feetX - (state.x - prev.x) * 2, y: feetY - 2, t: now });
      if (dust.length > 12) dust.shift();
    }
  }

  if (state.panelOpen && !panel.isOpen) {
    visited.add(state.area);
    avatarPokedAt = now;
    panel.open(world[state.area].sceneRef);
    touch.setVisible(false);
  }
  if (!state.panelOpen && panel.isOpen) {
    panel.close();
    touch.setVisible(true);
  }
  const touchMode = isTouch();

  drawFrame(ctx, {
    storyboard,
    world,
    state,
    theme,
    images,
    time: now,
    moving: state.x !== prev.x || state.y !== prev.y,
    prompt: touchMode ? 'Tap View or the station' : 'Press E to view',
    hint: touchMode ? 'Walk with the pad. Doors are on the right.' : 'Walk with arrow keys or WASD. Doors are on the right.',
    living: { items, pokedAt, avatarPokedAt, enteredAt, visited, stationsTotal, quip, dust, reduced },
  });
  requestAnimationFrame(frame);
}
requestAnimationFrame(frame);

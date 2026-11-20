import './style.css';
import type { Storyboard } from '../../../skeleton/src/types';
import data from './generated/storyboard.json';
import { drawFrame } from './draw';
import { initialState, step, type GameState } from './game';
import { createInput } from './input';
import { createPanel } from './panel';
import { resolveTheme } from './theme';
import { layoutWorld, WORLD_HEIGHT, WORLD_WIDTH } from './world';

const storyboard = data as unknown as Storyboard;
const world = layoutWorld(storyboard);
const theme = resolveTheme(storyboard.theme);
const coarse = window.matchMedia('(pointer: coarse)').matches;

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

/** Convert a pointer position to logical world coordinates. */
function toWorld(e: PointerEvent): { x: number; y: number } {
  const rect = canvas.getBoundingClientRect();
  return {
    x: ((e.clientX - rect.left) / rect.width) * WORLD_WIDTH,
    y: ((e.clientY - rect.top) / rect.height) * WORLD_HEIGHT,
  };
}

let state: GameState = initialState();

// Tapping or clicking the station activates it when the character is in range.
canvas.addEventListener('pointerup', (e) => {
  const area = world[state.area];
  if (!area || !state.nearStation || state.panelOpen) return;
  const p = toWorld(e);
  if (Math.hypot(p.x - area.station.x, p.y - area.station.y) <= 110) input.pressAction();
});

function announce(index: number) {
  const scene = storyboard.scenes[index];
  const text = scene.type === 'title' ? scene.title : scene.caption;
  live.textContent = `Area ${index + 1} of ${world.length}: ${text}`;
}
announce(0);

const prompt = coarse ? 'Tap to view' : 'Press E to view';
const hint = coarse ? 'Walk with the pad. Doors are on the right.' : 'Walk with arrow keys or WASD. Doors are on the right.';

let last = performance.now();
const start = last;
function frame(now: number) {
  const dt = (now - last) / 1000;
  last = now;
  const prev = state;
  state = step(state, input.read(), dt, world);

  if (state.area !== prev.area) announce(state.area);
  if (state.panelOpen && !panel.isOpen) panel.open(world[state.area].sceneRef);
  if (!state.panelOpen && panel.isOpen) panel.close();

  drawFrame(ctx, {
    storyboard,
    world,
    state,
    theme,
    images,
    time: (now - start) / 1000,
    moving: state.x !== prev.x || state.y !== prev.y,
    prompt,
    hint,
  });
  requestAnimationFrame(frame);
}
requestAnimationFrame(frame);

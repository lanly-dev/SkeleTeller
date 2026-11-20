import type { InputState } from './input';
import { DOORWAY, WALK_BOUNDS, WORLD_WIDTH, type Area } from './world';

/** Walking speed in logical pixels per second. */
export const SPEED = 220;
/** A station prompt appears when the character is within this distance of it. */
export const STATION_RADIUS = 72;
/** Longest time step handled at once, so a stalled frame cannot jump the character through a wall. */
export const MAX_DT = 0.05;

export type Facing = 'left' | 'right' | 'up' | 'down';

export interface GameState {
  /** Index of the current area. */
  area: number;
  x: number;
  y: number;
  facing: Facing;
  /** True while the current area's panel is open. */
  panelOpen: boolean;
  /** True when the current area has an interactable station within range. Drives the prompt. */
  nearStation: boolean;
}

export function initialState(): GameState {
  return {
    area: 0,
    x: WALK_BOUNDS.left + 40,
    y: (DOORWAY.top + DOORWAY.bottom) / 2,
    facing: 'right',
    panelOpen: false,
    nearStation: false,
  };
}

/** The title sign only shows text on the canvas, so it has no panel and no prompt. */
function isInteractable(area: Area): boolean {
  return area.sceneType !== 'title';
}

export function isNearStation(area: Area | undefined, x: number, y: number): boolean {
  if (!area || !isInteractable(area)) return false;
  return Math.hypot(area.station.x - x, area.station.y - y) <= STATION_RADIUS;
}

const clamp = (n: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, n));
const inDoorway = (y: number) => y >= DOORWAY.top && y <= DOORWAY.bottom;

/** Move within the walkable bounds. Doorway gaps let the position pass the edge so a crossing can be detected. */
function move(area: Area, x: number, y: number, dx: number, dy: number) {
  const insideX = x >= WALK_BOUNDS.left && x <= WALK_BOUNDS.right;
  // Inside a doorway corridor the character must stay within the gap.
  const ny = insideX
    ? clamp(y + dy, WALK_BOUNDS.top, WALK_BOUNDS.bottom)
    : clamp(y + dy, DOORWAY.top, DOORWAY.bottom);

  let nx = x + dx;
  const throughGap = inDoorway(ny);
  const minX = throughGap && area.doorLeft ? Number.NEGATIVE_INFINITY : WALK_BOUNDS.left;
  const maxX = throughGap && area.doorRight ? Number.POSITIVE_INFINITY : WALK_BOUNDS.right;
  nx = clamp(nx, minX, maxX);
  return { x: nx, y: ny };
}

/**
 * Next game state. Pure: returns a new object and never changes its arguments.
 * Input is ignored while a panel is open, except the close edge.
 */
export function step(state: GameState, input: InputState, dt: number, world: readonly Area[]): GameState {
  const area = world[state.area];
  if (!area) return state;

  if (state.panelOpen) {
    return input.close ? { ...state, panelOpen: false } : state;
  }

  const t = clamp(Number.isFinite(dt) ? dt : 0, 0, MAX_DT);
  let { x: dirX, y: dirY } = input.dir;
  const len = Math.hypot(dirX, dirY);
  if (len > 1) {
    dirX /= len;
    dirY /= len;
  }

  let facing = state.facing;
  if (dirX !== 0 || dirY !== 0) {
    facing = Math.abs(dirX) >= Math.abs(dirY) ? (dirX < 0 ? 'left' : 'right') : dirY < 0 ? 'up' : 'down';
  }

  let { x, y } = move(area, state.x, state.y, dirX * SPEED * t, dirY * SPEED * t);
  let index = state.area;

  if (x < 0 && area.doorLeft && index > 0) {
    index -= 1;
    x = WALK_BOUNDS.right;
  } else if (x > WORLD_WIDTH && area.doorRight && index < world.length - 1) {
    index += 1;
    x = WALK_BOUNDS.left;
  }

  const current = world[index];
  const near = isNearStation(current, x, y);
  const panelOpen = input.action && near && index === state.area;
  return { area: index, x, y, facing, panelOpen, nearStation: near };
}

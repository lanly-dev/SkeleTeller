import { describe, expect, it } from 'vitest';
import { initialState, isNearStation, MAX_DT, SPEED, STATION_RADIUS, step, type GameState } from './game';
import type { InputState } from './input';
import { DOORWAY, layoutWorld, WALK_BOUNDS, WORLD_WIDTH } from './world';

const world = layoutWorld({
  scenes: [
    { type: 'title', title: 'T' },
    { type: 'feature', visual: 'a.png', caption: 'c' },
    { type: 'code', caption: 'c', code: { language: 'ts', snippet: 'x' } },
    { type: 'outro', caption: 'c' },
  ],
});
const midY = (DOORWAY.top + DOORWAY.bottom) / 2;
const idle: InputState = { dir: { x: 0, y: 0 }, action: false, close: false };
const walk = (x: number, y: number): InputState => ({ ...idle, dir: { x, y } });
const at = (over: Partial<GameState>): GameState => ({ ...initialState(), ...over });

/** Run many small steps with the same input. */
function run(state: GameState, input: InputState, seconds: number): GameState {
  let s = state;
  for (let i = 0; i < Math.round(seconds / 0.016); i++) s = step(s, input, 0.016, world);
  return s;
}

describe('collision', () => {
  it('clamps movement to the walkable bounds', () => {
    const s = run(at({ x: 200, y: 200 }), walk(0, -1), 5);
    expect(s.y).toBe(WALK_BOUNDS.top);
    const d = run(at({ x: 200, y: 200 }), walk(0, 1), 5);
    expect(d.y).toBe(WALK_BOUNDS.bottom);
  });

  it('cannot leave through a wall outside the doorway gap', () => {
    const s = run(at({ area: 1, x: 200, y: WALK_BOUNDS.top }), walk(-1, 0), 5);
    expect(s.area).toBe(1);
    expect(s.x).toBe(WALK_BOUNDS.left);
  });

  it('has no left exit from the first area and no right exit from the last', () => {
    const first = run(at({ area: 0, x: 100, y: midY }), walk(-1, 0), 5);
    expect(first.area).toBe(0);
    expect(first.x).toBe(WALK_BOUNDS.left);
    const last = run(at({ area: 3, x: 800, y: midY }), walk(1, 0), 5);
    expect(last.area).toBe(3);
    expect(last.x).toBe(WALK_BOUNDS.right);
  });

  it('keeps the character inside the gap while crossing', () => {
    const s = step(at({ area: 1, x: WALK_BOUNDS.right + 10, y: midY }), walk(1, 1), 0.016, world);
    expect(s.y).toBeLessThanOrEqual(DOORWAY.bottom);
  });

  it('normalizes diagonal speed', () => {
    const s = step(at({ x: 300, y: 300 }), walk(1, 1), 0.016, world);
    const moved = Math.hypot(s.x - 300, s.y - 300);
    expect(moved).toBeCloseTo(SPEED * 0.016, 5);
  });

  it('caps the time step', () => {
    const s = step(at({ x: 300, y: 300 }), walk(1, 0), 10, world);
    expect(s.x - 300).toBeCloseTo(SPEED * MAX_DT, 5);
  });
});

describe('doorways', () => {
  it('enters the next area through the right doorway', () => {
    const s = run(at({ area: 1, x: 800, y: midY }), walk(1, 0), 2);
    expect(s.area).toBe(2);
    expect(s.x).toBeGreaterThanOrEqual(WALK_BOUNDS.left);
    expect(s.x).toBeLessThan(WORLD_WIDTH / 2);
  });

  it('returns to the previous area through the left doorway', () => {
    const s = run(at({ area: 2, x: 120, y: midY }), walk(-1, 0), 2);
    expect(s.area).toBe(1);
    expect(s.x).toBeGreaterThan(WORLD_WIDTH / 2);
  });

  it('walks the whole chain start to exit', () => {
    let s = initialState();
    for (let i = 0; i < 4000 && s.area < 3; i++) s = step(s, walk(1, 0), 0.016, world);
    expect(s.area).toBe(3);
  });

  it('keeps the vertical position when crossing', () => {
    const y = DOORWAY.top + 20;
    const s = run(at({ area: 1, x: 800, y }), walk(1, 0), 2);
    expect(s.area).toBe(2);
    expect(s.y).toBe(y);
  });
});

describe('station prompt and panel', () => {
  const station = world[1].station;

  it('shows the prompt within range and not outside it', () => {
    const near = step(at({ area: 1, x: station.x - STATION_RADIUS + 5, y: station.y }), idle, 0.016, world);
    expect(near.nearStation).toBe(true);
    const far = step(at({ area: 1, x: station.x - STATION_RADIUS - 20, y: station.y }), idle, 0.016, world);
    expect(far.nearStation).toBe(false);
    expect(isNearStation(world[1], station.x, station.y + STATION_RADIUS)).toBe(true);
  });

  it('opens the panel on action only when in range', () => {
    const open = step(at({ area: 1, x: station.x, y: station.y }), { ...idle, action: true }, 0.016, world);
    expect(open.panelOpen).toBe(true);
    const away = step(at({ area: 1, x: 100, y: 100 }), { ...idle, action: true }, 0.016, world);
    expect(away.panelOpen).toBe(false);
  });

  it('gives the title sign no prompt and no panel', () => {
    const t = world[0].station;
    const s = step(at({ area: 0, x: t.x, y: t.y }), { ...idle, action: true }, 0.016, world);
    expect(s.nearStation).toBe(false);
    expect(s.panelOpen).toBe(false);
  });

  it('ignores movement and action while the panel is open', () => {
    const open = at({ area: 1, x: station.x, y: station.y, panelOpen: true, nearStation: true });
    const s = step(open, { dir: { x: 1, y: 1 }, action: true, close: false }, 0.016, world);
    expect(s).toEqual(open);
  });

  it('closes the panel on close, then movement works again', () => {
    const open = at({ area: 1, x: station.x, y: station.y, panelOpen: true, nearStation: true });
    const closed = step(open, { ...idle, close: true }, 0.016, world);
    expect(closed.panelOpen).toBe(false);
    expect(closed.x).toBe(open.x);
    const moved = step(closed, walk(1, 0), 0.016, world);
    expect(moved.x).toBeGreaterThan(open.x);
  });

  it('does not change its input state', () => {
    const s = at({ area: 1, x: 300, y: 300 });
    const copy = { ...s };
    step(s, walk(1, 0), 0.016, world);
    expect(s).toEqual(copy);
  });

  it('returns the state unchanged for an empty world', () => {
    const s = initialState();
    expect(step(s, walk(1, 0), 0.016, [])).toBe(s);
  });
});

import type { SceneryKind } from './scenery';

/**
 * Timelines for reactions and feedback. Every function here maps an age in seconds
 * to how something looks at that moment, so drawing stays a pure function of time.
 */

export type ReactKind = SceneryKind | 'avatar';

export interface Pose {
  dx: number;
  dy: number;
  /** Radians, around the object's base. */
  rot: number;
  sx: number;
  sy: number;
  /** 0 to 1, extra brightness. */
  glow: number;
}

export const IDENTITY: Readonly<Pose> = { dx: 0, dy: 0, rot: 0, sx: 1, sy: 1, glow: 0 };
export const REACTION_TIME = 0.75;

type Style = 'hop' | 'sway' | 'swing' | 'flare' | 'wiggle' | 'squash' | 'bounce';

const STYLE: Record<ReactKind, Style> = {
  avatar: 'bounce',
  crate: 'hop',
  bench: 'wiggle',
  bookshelf: 'wiggle',
  fence: 'wiggle',
  plant: 'sway',
  flowers: 'sway',
  tree: 'sway',
  palm: 'sway',
  banner: 'sway',
  sign: 'swing',
  gravestone: 'swing',
  lamp: 'flare',
  arcade: 'flare',
  pumpkin: 'squash',
};

/** How an object looks `age` seconds after it was poked. Identity outside the reaction. */
export function reaction(kind: ReactKind, age: number, reduced = false): Pose {
  if (!(age >= 0) || age >= REACTION_TIME) return { ...IDENTITY };
  const p = age / REACTION_TIME;
  const decay = 1 - p;
  const glow = Math.max(0, 1 - p * 1.6);
  if (reduced) return { ...IDENTITY, glow };
  const wave = Math.sin(p * Math.PI * 3) * decay;
  switch (STYLE[kind]) {
    case 'hop':
      return { ...IDENTITY, dy: -Math.abs(Math.sin(p * Math.PI * 2)) * 14 * decay, glow: glow * 0.4 };
    case 'bounce':
      return { ...IDENTITY, dy: -Math.abs(Math.sin(p * Math.PI * 2)) * 18 * decay, sx: 1 + 0.08 * wave, sy: 1 - 0.08 * wave };
    case 'sway':
      return { ...IDENTITY, rot: wave * 0.22 };
    case 'swing':
      return { ...IDENTITY, rot: wave * 0.3 };
    case 'flare':
      return { ...IDENTITY, sx: 1 + 0.06 * glow, sy: 1 + 0.06 * glow, glow };
    case 'wiggle':
      return { ...IDENTITY, dx: Math.sin(p * Math.PI * 6) * 5 * decay };
    case 'squash':
      return { ...IDENTITY, sx: 1 + 0.22 * wave, sy: 1 - 0.22 * wave, glow: glow * 0.5 };
  }
}

/** Opacity for a card that fades in, holds, then fades out. 0 outside the timeline. */
export function fade(age: number, fadeIn: number, hold: number, fadeOut: number): number {
  if (!(age >= 0)) return 0;
  if (age < fadeIn) return age / fadeIn;
  if (age < fadeIn + hold) return 1;
  if (age < fadeIn + hold + fadeOut) return 1 - (age - fadeIn - hold) / fadeOut;
  return 0;
}

export interface Piece {
  x: number;
  y: number;
  rot: number;
  /** Index into the palette the caller supplies. */
  color: number;
  alpha: number;
}

export const CONFETTI_TIME = 2.6;

/** Confetti thrown up from (cx, cy), `age` seconds after the burst. Empty outside it or under reduced motion. */
export function confetti(age: number, cx: number, cy: number, reduced = false, count = 36): Piece[] {
  if (reduced || !(age >= 0) || age >= CONFETTI_TIME) return [];
  const out: Piece[] = [];
  for (let i = 0; i < count; i++) {
    const a = -Math.PI / 2 + (((i * 0.6180339887) % 1) - 0.5) * 2.2;
    const speed = 220 + ((i * 37) % 11) * 18;
    out.push({
      x: cx + Math.cos(a) * speed * age,
      y: cy + Math.sin(a) * speed * age + 230 * age * age,
      rot: age * (4 + (i % 5)),
      color: i % 4,
      alpha: Math.max(0, 1 - age / CONFETTI_TIME),
    });
  }
  return out;
}

export interface Puff {
  x: number;
  y: number;
  /** Time it appeared, seconds. */
  t: number;
}

export const DUST_TIME = 0.5;

/** Radius and opacity of a dust puff at time `now`, or undefined when it has faded. */
export function dustLook(puff: Puff, now: number): { r: number; alpha: number } | undefined {
  const age = now - puff.t;
  if (!(age >= 0) || age >= DUST_TIME) return undefined;
  const p = age / DUST_TIME;
  return { r: 3 + 7 * p, alpha: 0.35 * (1 - p) };
}

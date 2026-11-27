import type { Mood } from '../../../skeleton/src/types';
import { WORLD_HEIGHT, WORLD_WIDTH } from './world';

/**
 * Ambient life as a pure function of time: every particle's position comes from a
 * fixed seed and a formula, so there is no simulation state and nothing to keep in sync.
 */

export type ParticleKind = 'wisp' | 'bat' | 'leaf' | 'firefly' | 'sparkle' | 'butterfly';

export interface Particle {
  kind: ParticleKind;
  x: number;
  y: number;
  size: number;
  alpha: number;
  /** Rotation or wing phase, in radians. */
  angle: number;
}

const COUNTS: Record<Mood, ReadonlyArray<readonly [ParticleKind, number]>> = {
  spooky: [
    ['wisp', 5],
    ['bat', 2],
  ],
  cozy: [
    ['leaf', 7],
    ['firefly', 6],
  ],
  neon: [['sparkle', 10]],
  clean: [['butterfly', 3]],
};

/** Area the particles stay in: inside the walls, below the heads-up display. */
export const AMBIENT_BOUNDS = { left: 30, right: WORLD_WIDTH - 30, top: 56, bottom: WORLD_HEIGHT - 30 } as const;

/** Deterministic pseudo-random number in 0..1 for an integer seed. */
function rand(seed: number): number {
  const s = Math.sin(seed * 12.9898 + 78.233) * 43758.5453;
  return s - Math.floor(s);
}

const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v));
const wrap = (v: number, span: number) => ((v % span) + span) % span;

function particle(kind: ParticleKind, i: number, t: number, area: number): Particle {
  const seed = area * 97 + i * 13 + kind.length * 7;
  const a = rand(seed);
  const b = rand(seed + 1);
  const c = rand(seed + 2);
  const { left, right, top, bottom } = AMBIENT_BOUNDS;
  const w = right - left;
  const h = bottom - top;
  switch (kind) {
    case 'wisp':
      return {
        kind,
        x: left + w * (0.1 + 0.8 * a) + Math.sin(t * 0.35 + c * 6) * 38,
        y: top + h * (0.15 + 0.7 * b) + Math.sin(t * 0.5 + a * 6) * 22,
        size: 6 + 6 * c,
        alpha: 0.32 + 0.16 * Math.sin(t * 1.3 + b * 6),
        angle: 0,
      };
    case 'bat': {
      const span = w + 160;
      return {
        kind,
        x: left - 80 + wrap(t * (60 + 40 * a) + span * b, span),
        y: top + 20 + h * 0.25 * c + Math.sin(t * 2.6 + a * 6) * 10,
        size: 1,
        alpha: 0.85,
        angle: Math.sin(t * 12 + c * 6),
      };
    }
    case 'leaf': {
      const span = h + 40;
      return {
        kind,
        x: left + w * a + Math.sin(t * 0.9 + b * 6) * 26,
        y: top - 20 + wrap(t * (24 + 18 * c) + span * b, span),
        size: 5 + 3 * c,
        alpha: 0.85,
        angle: t * (1.2 + c) + a * 6,
      };
    }
    case 'firefly':
      return {
        kind,
        x: left + w * (0.05 + 0.9 * a) + Math.sin(t * 0.7 + c * 6) * 30,
        y: top + h * (0.35 + 0.6 * b) + Math.cos(t * 0.9 + a * 6) * 18,
        size: 2.5,
        alpha: Math.max(0, Math.sin(t * 1.7 + c * 6)),
        angle: 0,
      };
    case 'sparkle': {
      const period = 2.4 + c;
      const cycle = Math.floor((t + period * a) / period);
      const phase = wrap(t + period * a, period) / period;
      return {
        kind,
        x: left + w * rand(seed + cycle * 31),
        y: top + h * rand(seed + cycle * 31 + 5),
        size: 3 + 3 * b,
        alpha: Math.sin(Math.PI * phase),
        angle: phase * Math.PI,
      };
    }
    case 'butterfly':
      return {
        kind,
        x: left + w * (0.2 + 0.6 * a) + Math.sin(t * 0.35 + b * 6) * 140,
        y: top + h * (0.2 + 0.4 * c) + Math.sin(t * 1.1 + a * 6) * 30,
        size: 1,
        alpha: 0.9,
        angle: Math.sin(t * 14 + c * 6),
      };
  }
}

/** Particles for a mood at time t (seconds). Empty under reduced motion. */
export function ambientParticles(mood: Mood, t: number, area: number, reduced = false): Particle[] {
  if (reduced) return [];
  const out: Particle[] = [];
  for (const [kind, count] of COUNTS[mood]) {
    for (let i = 0; i < count; i++) {
      const p = particle(kind, i, t, area);
      out.push({ ...p, x: clamp(p.x, AMBIENT_BOUNDS.left - 80, AMBIENT_BOUNDS.right + 80), y: clamp(p.y, AMBIENT_BOUNDS.top - 20, AMBIENT_BOUNDS.bottom) });
    }
  }
  return out;
}

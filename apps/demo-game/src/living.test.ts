import fs from 'node:fs';
import yaml from 'js-yaml';
import { describe, expect, it } from 'vitest';
import type { Storyboard } from '../../../skeleton/src/types';
import { AMBIENT_BOUNDS, ambientParticles } from './ambient';
import { confetti, CONFETTI_TIME, dustLook, fade, IDENTITY, reaction, REACTION_TIME, type ReactKind } from './effects';
import { hitScenery, MOOD_OBJECTS, nearestScenery, PROP_SLOTS, QUIPS, sceneryFor, SIZE, type SceneryKind } from './scenery';
import { resolveTheme } from './theme';
import { DOORWAY, layoutWorld, WALK_BOUNDS, WORLD_WIDTH } from './world';

const MOODS = ['cozy', 'neon', 'spooky', 'clean'] as const;
const PROPS = ['plant', 'lamp', 'crate', 'sign', 'bookshelf', 'banner'] as const;
const ALL_KINDS = Object.keys(SIZE) as SceneryKind[];
const sample = yaml.load(fs.readFileSync(new URL('../../../skeleton/examples/sample-project.yml', import.meta.url), 'utf8')) as Storyboard;

/** Box an object covers, from its base and drawn size. */
function box(kind: SceneryKind, x: number, y: number) {
  const [w, h] = SIZE[kind];
  return { left: x - w / 2, right: x + w / 2, top: y - h, bottom: y };
}
const overlaps = (a: ReturnType<typeof box>, b: ReturnType<typeof box>) => a.left < b.right && b.left < a.right && a.top < b.bottom && b.top < a.bottom;

describe('scenery layout (requirement 12)', () => {
  it('puts both mood objects in every area, for every mood', () => {
    for (const mood of MOODS) {
      for (let area = 0; area < 7; area++) {
        const kinds = sceneryFor(area, { mood, props: [...PROPS] }).map((i) => i.kind);
        for (const m of MOOD_OBJECTS[mood]) expect(kinds).toContain(m);
      }
    }
  });

  it('places every theme prop, each in its own slot', () => {
    const items = sceneryFor(2, { mood: 'clean', props: [...PROPS] });
    const props = items.filter((i) => (PROPS as readonly string[]).includes(i.kind));
    expect(props).toHaveLength(PROPS.length);
    expect(new Set(props.map((p) => `${p.x},${p.y}`)).size).toBe(PROPS.length);
    expect(new Set(items.map((i) => i.slot)).size).toBe(items.length);
  });

  it('is deterministic', () => {
    expect(sceneryFor(3, { mood: 'neon', props: ['lamp', 'sign'] })).toEqual(sceneryFor(3, { mood: 'neon', props: ['lamp', 'sign'] }));
  });

  it('never covers a station, the title sign or a doorway', () => {
    const world = layoutWorld(sample);
    // The title sign is the largest station: 460 by 170 around its center, plus its post.
    const stationBox = (x: number, y: number) => ({ left: x - 230, right: x + 230, top: y - 85, bottom: y + 125 });
    const doorL = { left: 0, right: WALK_BOUNDS.left + 32, top: DOORWAY.top - 10, bottom: DOORWAY.bottom + 10 };
    const doorR = { left: WALK_BOUNDS.right - 32, right: WORLD_WIDTH, top: DOORWAY.top - 10, bottom: DOORWAY.bottom + 10 };
    for (const mood of MOODS) {
      for (const area of world) {
        for (const it of sceneryFor(area.index, { mood, props: [...PROPS] })) {
          const b = box(it.kind, it.x, it.y);
          expect(overlaps(b, stationBox(area.station.x, area.station.y)), `${it.kind} over station`).toBe(false);
          expect(overlaps(b, doorL) || overlaps(b, doorR), `${it.kind} in a doorway`).toBe(false);
        }
      }
    }
  });

  it('keeps every prop slot inside the walls', () => {
    for (const [x, y] of PROP_SLOTS) {
      expect(x).toBeGreaterThan(WALK_BOUNDS.left);
      expect(x).toBeLessThan(WALK_BOUNDS.right);
      expect(y).toBeLessThanOrEqual(WALK_BOUNDS.bottom);
    }
  });
});

describe('finding objects (requirement 13)', () => {
  const items = sceneryFor(0, { mood: 'spooky', props: ['lamp', 'crate'] });

  it('finds the nearest object within reach, and nothing beyond it', () => {
    const pumpkin = items.find((i) => i.kind === 'pumpkin')!;
    expect(nearestScenery(items, pumpkin.x + 10, pumpkin.y - 10, 60)?.kind).toBe('pumpkin');
    expect(nearestScenery(items, pumpkin.x + 300, pumpkin.y - 200, 60)).toBeUndefined();
  });

  it('hits an object by its drawn box', () => {
    const grave = items.find((i) => i.kind === 'gravestone')!;
    expect(hitScenery(items, grave.x, grave.y - 20)?.kind).toBe('gravestone');
    expect(hitScenery(items, grave.x, grave.y + 30)).toBeUndefined();
  });

  it('has a short fixed line for every kind', () => {
    for (const k of ALL_KINDS) {
      expect(QUIPS[k].length).toBeGreaterThan(5);
      expect(QUIPS[k].length).toBeLessThan(60);
    }
  });
});

describe('reactions (requirements 13, 14 and 16)', () => {
  const kinds: ReactKind[] = ['avatar', ...ALL_KINDS];

  it('is identity before and after the reaction', () => {
    for (const k of kinds) {
      expect(reaction(k, -0.1)).toEqual(IDENTITY);
      expect(reaction(k, REACTION_TIME)).toEqual(IDENTITY);
      expect(reaction(k, Number.NaN)).toEqual(IDENTITY);
    }
  });

  it('moves or lights up every kind during the reaction', () => {
    for (const k of kinds) {
      const p = reaction(k, 0.12);
      const changed = p.dx !== 0 || p.dy !== 0 || p.rot !== 0 || p.sx !== 1 || p.sy !== 1 || p.glow > 0;
      expect(changed, k).toBe(true);
    }
  });

  it('only highlights under reduced motion', () => {
    for (const k of kinds) {
      const p = reaction(k, 0.1, true);
      expect({ ...p, glow: 0 }).toEqual(IDENTITY);
      expect(p.glow).toBeGreaterThan(0);
    }
  });
});

describe('feedback timelines (requirement 15)', () => {
  it('fades a card in, holds it, and fades it out', () => {
    expect(fade(-1, 0.3, 1, 0.5)).toBe(0);
    expect(fade(0.15, 0.3, 1, 0.5)).toBeCloseTo(0.5);
    expect(fade(0.8, 0.3, 1, 0.5)).toBe(1);
    expect(fade(1.55, 0.3, 1, 0.5)).toBeCloseTo(0.5);
    expect(fade(2, 0.3, 1, 0.5)).toBe(0);
  });

  it('bursts confetti upward, then ends', () => {
    const early = confetti(0.2, 480, 300);
    expect(early.length).toBeGreaterThan(0);
    expect(early.every((p) => p.y < 300)).toBe(true);
    expect(confetti(CONFETTI_TIME, 480, 300)).toEqual([]);
    expect(confetti(0.2, 480, 300, true)).toEqual([]);
    expect(confetti(0.5, 480, 300)).toEqual(confetti(0.5, 480, 300));
  });

  it('grows and fades a dust puff', () => {
    const a = dustLook({ x: 0, y: 0, t: 1 }, 1.1)!;
    const b = dustLook({ x: 0, y: 0, t: 1 }, 1.4)!;
    expect(b.r).toBeGreaterThan(a.r);
    expect(b.alpha).toBeLessThan(a.alpha);
    expect(dustLook({ x: 0, y: 0, t: 1 }, 2)).toBeUndefined();
  });
});

describe('ambient life (requirements 12 and 16)', () => {
  it('gives every mood some life', () => {
    for (const mood of MOODS) expect(ambientParticles(mood, 3, 0).length).toBeGreaterThan(0);
  });

  it('is deterministic and stays in bounds over time', () => {
    for (const mood of MOODS) {
      expect(ambientParticles(mood, 7.25, 2)).toEqual(ambientParticles(mood, 7.25, 2));
      for (let t = 0; t < 120; t += 3.7) {
        for (const p of ambientParticles(mood, t, 1)) {
          expect(p.y).toBeGreaterThanOrEqual(AMBIENT_BOUNDS.top - 20);
          expect(p.y).toBeLessThanOrEqual(AMBIENT_BOUNDS.bottom);
          expect(Number.isFinite(p.x) && Number.isFinite(p.alpha)).toBe(true);
        }
      }
    }
  });

  it('draws nothing under reduced motion', () => {
    for (const mood of MOODS) expect(ambientParticles(mood, 3, 0, true)).toEqual([]);
  });

  it('works with the resolved default theme', () => {
    const t = resolveTheme(undefined);
    expect(sceneryFor(0, t).length).toBe(t.props.length + 2);
  });
});

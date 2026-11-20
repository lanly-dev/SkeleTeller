import fs from 'node:fs';
import yaml from 'js-yaml';
import { describe, expect, it } from 'vitest';
import type { Storyboard } from '../../../skeleton/src/types';
import { isNearStation } from './game';
import { layoutWorld, WALK_BOUNDS, DOORWAY, WORLD_HEIGHT, WORLD_WIDTH } from './world';

const sample = yaml.load(fs.readFileSync(new URL('../../../skeleton/examples/sample-project.yml', import.meta.url), 'utf8')) as Storyboard;

describe('layoutWorld', () => {
  const areas = layoutWorld(sample);

  it('gives one area per scene, in order', () => {
    expect(areas).toHaveLength(sample.scenes.length);
    expect(areas).toHaveLength(7);
    expect(areas.map((a) => a.sceneType)).toEqual(sample.scenes.map((s) => s.type));
    expect(areas.map((a) => a.index)).toEqual([0, 1, 2, 3, 4, 5, 6]);
    expect(areas.map((a) => a.sceneRef)).toEqual([0, 1, 2, 3, 4, 5, 6]);
  });

  it('maps scene types to station kinds', () => {
    const kinds = { title: 'sign', feature: 'screen', callout: 'screen', code: 'terminal', outro: 'exit' };
    for (const a of areas) expect(a.station.kind).toBe(kinds[a.sceneType]);
  });

  it('has no left door on the first area and no right door on the last', () => {
    expect(areas[0].doorLeft).toBe(false);
    expect(areas[0].doorRight).toBe(true);
    expect(areas[6].doorLeft).toBe(true);
    expect(areas[6].doorRight).toBe(false);
    for (const a of areas.slice(1, -1)) expect([a.doorLeft, a.doorRight]).toEqual([true, true]);
  });

  it('follows scene order when scenes are reordered', () => {
    const reordered = { ...sample, scenes: [...sample.scenes].reverse() };
    const out = layoutWorld(reordered);
    expect(out.map((a) => a.sceneType)).toEqual(areas.map((a) => a.sceneType).reverse());
    expect(out[0].doorLeft).toBe(false);
    expect(out[6].doorRight).toBe(false);
  });

  it('handles a single scene with no doors', () => {
    const [a] = layoutWorld({ scenes: [sample.scenes[0]] });
    expect([a.doorLeft, a.doorRight]).toEqual([false, false]);
  });

  it('is deterministic and keeps stations inside the walkable bounds', () => {
    expect(layoutWorld(sample)).toEqual(areas);
    for (const { station: s } of areas) {
      expect(s.x).toBeGreaterThan(WALK_BOUNDS.left);
      expect(s.x).toBeLessThan(WALK_BOUNDS.right);
      expect(s.y).toBeGreaterThan(WALK_BOUNDS.top);
      expect(s.y).toBeLessThan(WALK_BOUNDS.bottom);
    }
  });
});

describe('geometry', () => {
  it('places stations above the door-to-door line, within prompt range of it', () => {
    const walkLine = (DOORWAY.top + DOORWAY.bottom) / 2;
    for (const area of layoutWorld(sample)) {
      expect(area.station.y).toBeLessThan(walkLine);
      // Walking straight between the doors brings every interactable station into range.
      if (area.sceneType !== 'title') expect(isNearStation(area, area.station.x, walkLine)).toBe(true);
    }
  });

  it('puts the doorway gap in the middle of the screen height', () => {
    expect(DOORWAY.top).toBeLessThan(WORLD_HEIGHT / 2);
    expect(DOORWAY.bottom).toBeGreaterThan(WORLD_HEIGHT / 2);
    expect(WORLD_WIDTH).toBe(960);
  });
});

import type { Mood, Prop } from '../../../skeleton/src/types';
import type { ResolvedTheme } from './theme';

/** Two scenery objects that belong to each mood. Same set as the storybook, drawn in the game's own style. */
export type MoodObject = 'pumpkin' | 'gravestone' | 'fence' | 'flowers' | 'palm' | 'arcade' | 'tree' | 'bench';
export type SceneryKind = Prop | MoodObject;

export const MOOD_OBJECTS: Record<Mood, readonly [MoodObject, MoodObject]> = {
  spooky: ['pumpkin', 'gravestone'],
  cozy: ['fence', 'flowers'],
  neon: ['palm', 'arcade'],
  clean: ['tree', 'bench'],
};

export interface SceneryItem {
  kind: SceneryKind;
  /** Base point (where it stands), in logical pixels. Drawing order and reach use this point. */
  x: number;
  y: number;
  /** Index within the area, used to key reactions. */
  slot: number;
}

/** Decorative prop slots as base points, clear of the station and the doorway corridor. */
export const PROP_SLOTS: ReadonlyArray<readonly [number, number]> = [
  [110, 134],
  [850, 134],
  [110, 454],
  [850, 454],
  [300, 114],
  [660, 114],
  [300, 474],
  [660, 474],
];

/** Mood object slots, beside the walking line so the character brushes past them. */
export const MOOD_SLOTS: ReadonlyArray<readonly [number, number]> = [
  [178, 334],
  [786, 334],
];

/** Drawn size of each kind around its base: [width, height]. Used for tapping and layout checks. */
export const SIZE: Record<SceneryKind, readonly [number, number]> = {
  plant: [44, 50],
  lamp: [44, 58],
  crate: [40, 38],
  sign: [44, 48],
  bookshelf: [48, 52],
  banner: [34, 56],
  pumpkin: [64, 52],
  gravestone: [50, 68],
  fence: [104, 54],
  flowers: [56, 48],
  palm: [112, 150],
  arcade: [58, 104],
  tree: [84, 120],
  bench: [92, 56],
};

/** What the character says about an object. Fixed text, never storyboard text. */
export const QUIPS: Record<SceneryKind, string> = {
  plant: 'The plant rustles happily.',
  lamp: 'A warm little light.',
  crate: 'Thump. Just an empty crate.',
  sign: 'The sign says: keep exploring.',
  bookshelf: 'So many books, so little time.',
  banner: 'The banner flaps in the breeze.',
  pumpkin: 'The pumpkin grins back at me.',
  gravestone: 'Rest in peace, old bug.',
  fence: 'A sturdy little fence.',
  flowers: 'They smell like spring.',
  palm: 'The palm sways to the synth beat.',
  arcade: 'Insert coin... just kidding.',
  tree: 'A quiet, shady tree.',
  bench: 'A good spot for a break.',
};

/** Every object in an area: theme props rotated through the slots by area index, then the two mood objects. */
export function sceneryFor(areaIndex: number, theme: Pick<ResolvedTheme, 'mood' | 'props'>): SceneryItem[] {
  const items: SceneryItem[] = theme.props.slice(0, PROP_SLOTS.length).map((kind, i) => {
    const [x, y] = PROP_SLOTS[(i + areaIndex * 3) % PROP_SLOTS.length];
    return { kind, x, y, slot: i };
  });
  MOOD_OBJECTS[theme.mood].forEach((kind, i) => {
    items.push({ kind, x: MOOD_SLOTS[i][0], y: MOOD_SLOTS[i][1], slot: items.length });
  });
  return items;
}

/** The object whose base is closest to (x, y) within the radius, if any. */
export function nearestScenery(items: readonly SceneryItem[], x: number, y: number, radius: number): SceneryItem | undefined {
  let best: SceneryItem | undefined;
  let bestD = radius;
  for (const it of items) {
    const d = Math.hypot(it.x - x, it.y - y);
    if (d <= bestD) {
      best = it;
      bestD = d;
    }
  }
  return best;
}

/** The front-most object whose drawn box contains (x, y), for taps. */
export function hitScenery(items: readonly SceneryItem[], x: number, y: number): SceneryItem | undefined {
  let hit: SceneryItem | undefined;
  for (const it of items) {
    const [w, h] = SIZE[it.kind];
    const inside = x >= it.x - w / 2 && x <= it.x + w / 2 && y >= it.y - h && y <= it.y;
    // Lower base means drawn later, so it wins.
    if (inside && (!hit || it.y >= hit.y)) hit = it;
  }
  return hit;
}

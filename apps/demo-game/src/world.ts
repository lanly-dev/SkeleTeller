import type { Storyboard } from '../../../skeleton/src/types';

/** Logical canvas size. Each area is exactly one screen. */
export const WORLD_WIDTH = 960;
export const WORLD_HEIGHT = 540;

/** Distance from the screen edge to the walkable rectangle. */
export const WALL_INSET = 48;

/** Walkable rectangle for the character's position, inset from the area edges. */
export const WALK_BOUNDS = {
  left: WALL_INSET,
  top: WALL_INSET,
  right: WORLD_WIDTH - WALL_INSET,
  bottom: WORLD_HEIGHT - WALL_INSET,
} as const;

/** Doorway gap on the left and right edges, centered vertically. */
export const DOORWAY_HEIGHT = 120;
export const DOORWAY = {
  top: (WORLD_HEIGHT - DOORWAY_HEIGHT) / 2,
  bottom: (WORLD_HEIGHT + DOORWAY_HEIGHT) / 2,
} as const;

export type SceneType = 'title' | 'feature' | 'callout' | 'code' | 'outro';
export type StationKind = 'sign' | 'screen' | 'terminal' | 'exit';

export interface Station {
  x: number;
  y: number;
  kind: StationKind;
}

export interface Area {
  index: number;
  sceneType: SceneType;
  station: Station;
  /** False for the first area. */
  doorLeft: boolean;
  /** False for the last area. */
  doorRight: boolean;
  /** Index into storyboard.scenes. */
  sceneRef: number;
}

const STATION_KIND: Record<SceneType, StationKind> = {
  title: 'sign',
  feature: 'screen',
  callout: 'screen',
  code: 'terminal',
  outro: 'exit',
};

/** Center of the area. Fixed, so the same storyboard always gives the same world. */
const STATION_POSITION = { x: WORLD_WIDTH / 2, y: WORLD_HEIGHT / 2 };

/** One area per scene, in scene order. Reads scene types only, never layout hints. */
export function layoutWorld(storyboard: Pick<Storyboard, 'scenes'>): Area[] {
  const last = storyboard.scenes.length - 1;
  return storyboard.scenes.map((scene, i) => ({
    index: i,
    sceneType: scene.type,
    station: { ...STATION_POSITION, kind: STATION_KIND[scene.type] },
    doorLeft: i > 0,
    doorRight: i < last,
    sceneRef: i,
  }));
}

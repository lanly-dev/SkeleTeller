import type { Avatar, Mood, Prop, Theme } from '../../../skeleton/src/types';

export interface ResolvedTheme {
  palette: { background: string; ground: string; accent: string; text: string; station: string };
  mood: Mood;
  avatar: Avatar;
  props: Prop[];
}

export const MOODS: readonly Mood[] = ['cozy', 'neon', 'spooky', 'clean'];
export const AVATARS: readonly Avatar[] = ['explorer', 'robot', 'ghost'];
export const PROPS: readonly Prop[] = ['plant', 'lamp', 'crate', 'sign', 'bookshelf', 'banner'];
const MAX_PROPS = 8;
const COLOR = /^#[0-9a-fA-F]{6}$/;

export const DEFAULT_THEME: ResolvedTheme = {
  palette: {
    background: '#1a2332',
    ground: '#2c3e50',
    accent: '#f5a623',
    text: '#f4f6f8',
    station: '#4a90d9',
  },
  mood: 'clean',
  avatar: 'explorer',
  props: ['plant', 'lamp', 'crate'],
};

function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === 'object' && v !== null && !Array.isArray(v);
}

function oneOf<T extends string>(allowed: readonly T[], value: unknown, fallback: T): T {
  return typeof value === 'string' && (allowed as readonly string[]).includes(value) ? (value as T) : fallback;
}

function color(value: unknown, fallback: string): string {
  return typeof value === 'string' && COLOR.test(value) ? value : fallback;
}

/**
 * Merge a storyboard theme over DEFAULT_THEME. Each field falls back on its own,
 * so one bad value never discards the rest. Accepts unknown input and never throws.
 */
export function resolveTheme(raw?: Theme | unknown): ResolvedTheme {
  const d = DEFAULT_THEME;
  if (!isRecord(raw)) return { ...d, palette: { ...d.palette }, props: [...d.props] };

  const p = isRecord(raw.palette) ? raw.palette : {};
  let props = [...d.props];
  if (Array.isArray(raw.props)) {
    const valid = raw.props.filter((x): x is Prop => (PROPS as readonly unknown[]).includes(x));
    props = [...new Set(valid)].slice(0, MAX_PROPS);
  }

  return {
    palette: {
      background: color(p.background, d.palette.background),
      ground: color(p.ground, d.palette.ground),
      accent: color(p.accent, d.palette.accent),
      text: color(p.text, d.palette.text),
      station: color(p.station, d.palette.station),
    },
    mood: oneOf(MOODS, raw.mood, d.mood),
    avatar: oneOf(AVATARS, raw.avatar, d.avatar),
    props,
  };
}

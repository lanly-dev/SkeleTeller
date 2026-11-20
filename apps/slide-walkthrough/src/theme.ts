import type { Mood, Theme } from '../../../skeleton/src/types';

/** Same defaults as the game, so an unthemed storyboard looks related in both apps. */
export const DEFAULT_PALETTE = {
  background: '#1a2332',
  ground: '#2c3e50',
  accent: '#f5a623',
  text: '#f4f6f8',
  station: '#4a90d9',
} as const;

export const MIN_CONTRAST = 4.5;
const COLOR = /^#[0-9a-fA-F]{6}$/;
const MOODS: readonly Mood[] = ['cozy', 'neon', 'spooky', 'clean'];

function color(value: unknown, fallback: string): string {
  return typeof value === 'string' && COLOR.test(value) ? value.toLowerCase() : fallback;
}

/** WCAG relative luminance of a #rrggbb color. */
function luminance(hex: string): number {
  const n = parseInt(hex.slice(1), 16);
  const [r, g, b] = [(n >> 16) & 255, (n >> 8) & 255, n & 255].map((c) => {
    const s = c / 255;
    return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/** WCAG contrast ratio between two #rrggbb colors, from 1 to 21. */
export function contrast(a: string, b: string): number {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
}

/** Pick the most readable of the candidates against the background. */
function readable(background: string, preferred: string): string {
  if (contrast(preferred, background) >= MIN_CONTRAST) return preferred;
  const options = [DEFAULT_PALETTE.text, '#111111', '#ffffff'];
  return options.reduce((best, c) => (contrast(c, background) > contrast(best, background) ? c : best), options[0]);
}

const MOOD_STYLE: Record<Mood, { radius: string; border: string; glow: string }> = {
  cozy: { radius: '18px', border: '2px solid', glow: 'none' },
  neon: { radius: '6px', border: '2px solid', glow: '0 0 18px' },
  spooky: { radius: '4px', border: '2px dashed', glow: '0 0 28px' },
  clean: { radius: '10px', border: '1px solid', glow: 'none' },
};

/** CSS custom properties for a storyboard theme. Each field falls back on its own; never throws. */
export function themeVariables(raw: Theme | undefined | unknown): Record<string, string> {
  const t = typeof raw === 'object' && raw !== null && !Array.isArray(raw) ? (raw as Record<string, unknown>) : {};
  const p = typeof t.palette === 'object' && t.palette !== null ? (t.palette as Record<string, unknown>) : {};
  const bg = color(p.background, DEFAULT_PALETTE.background);
  const surface = color(p.ground, DEFAULT_PALETTE.ground);
  const accent = color(p.accent, DEFAULT_PALETTE.accent);
  const hotspot = color(p.station, DEFAULT_PALETTE.station);
  const mood: Mood = typeof t.mood === 'string' && (MOODS as readonly string[]).includes(t.mood) ? (t.mood as Mood) : 'clean';
  const style = MOOD_STYLE[mood];
  return {
    '--bg': bg,
    '--surface': surface,
    '--text': readable(surface, readable(bg, color(p.text, DEFAULT_PALETTE.text))),
    '--accent': accent,
    '--on-accent': readable(accent, '#111111'),
    '--hotspot': accent,
    '--hotspot-ring': hotspot,
    '--radius': style.radius,
    '--border-style': style.border,
    '--glow': style.glow === 'none' ? 'none' : `${style.glow} ${accent}55`,
  };
}

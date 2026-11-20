import { describe, expect, it } from 'vitest';
import { DEFAULT_THEME, resolveTheme } from './theme';

describe('resolveTheme', () => {
  it('returns the default theme when the theme is missing', () => {
    expect(resolveTheme(undefined)).toEqual(DEFAULT_THEME);
    expect(resolveTheme(null)).toEqual(DEFAULT_THEME);
    expect(resolveTheme('neon')).toEqual(DEFAULT_THEME);
  });

  it('returns a copy, so callers cannot change the default', () => {
    const t = resolveTheme(undefined);
    t.props.push('banner');
    t.palette.accent = '#000000';
    expect(DEFAULT_THEME.props).not.toContain('banner');
    expect(DEFAULT_THEME.palette.accent).not.toBe('#000000');
  });

  it('falls back per field on invalid values', () => {
    const t = resolveTheme({
      palette: { background: 'red', ground: '#123456', accent: 42 },
      mood: 'sparkly',
      avatar: 'ghost',
      props: 'lamp',
    });
    expect(t.palette.background).toBe(DEFAULT_THEME.palette.background);
    expect(t.palette.accent).toBe(DEFAULT_THEME.palette.accent);
    expect(t.palette.ground).toBe('#123456');
    expect(t.mood).toBe(DEFAULT_THEME.mood);
    expect(t.avatar).toBe('ghost');
    expect(t.props).toEqual(DEFAULT_THEME.props);
  });

  it('applies valid fields', () => {
    const t = resolveTheme({
      palette: { background: '#000000', ground: '#111111', accent: '#ff00ff', text: '#ffffff', station: '#00ffff' },
      mood: 'neon',
      avatar: 'robot',
      props: ['banner', 'sign'],
    });
    expect(t).toEqual({
      palette: { background: '#000000', ground: '#111111', accent: '#ff00ff', text: '#ffffff', station: '#00ffff' },
      mood: 'neon',
      avatar: 'robot',
      props: ['banner', 'sign'],
    });
  });

  it('drops unknown and duplicate props but keeps valid ones', () => {
    expect(resolveTheme({ props: ['lamp', 'dragon', 'lamp', 'plant'] }).props).toEqual(['lamp', 'plant']);
  });

  it('keeps an explicitly empty props list', () => {
    expect(resolveTheme({ props: [] }).props).toEqual([]);
  });
});

import { describe, expect, it } from 'vitest';
import { contrast, DEFAULT_PALETTE, MIN_CONTRAST, themeVariables } from './theme';

describe('themeVariables', () => {
  it('uses the defaults when there is no theme', () => {
    for (const raw of [undefined, null, 'neon', []]) {
      const v = themeVariables(raw);
      expect(v['--bg']).toBe(DEFAULT_PALETTE.background);
      expect(v['--accent']).toBe(DEFAULT_PALETTE.accent);
      expect(v['--text']).toBe(DEFAULT_PALETTE.text);
      expect(v['--radius']).toBe('10px');
    }
  });

  it('applies valid fields and falls back per field', () => {
    const v = themeVariables({ palette: { background: '#120F1F', accent: 'green', text: '#ece6ff' }, mood: 'spooky' });
    expect(v['--bg']).toBe('#120f1f');
    expect(v['--accent']).toBe(DEFAULT_PALETTE.accent);
    expect(v['--text']).toBe('#ece6ff');
    expect(v['--border-style']).toBe('2px dashed');
  });

  it('ignores an unknown mood', () => {
    expect(themeVariables({ mood: 'festive' })['--radius']).toBe('10px');
  });

  it('replaces unreadable text with a readable color', () => {
    const v = themeVariables({ palette: { background: '#ffffff', ground: '#fafafa', text: '#f0f0f0' } });
    expect(v['--text']).not.toBe('#f0f0f0');
    expect(contrast(v['--text'], '#ffffff')).toBeGreaterThanOrEqual(MIN_CONTRAST);
    expect(contrast(v['--text'], '#fafafa')).toBeGreaterThanOrEqual(MIN_CONTRAST);
  });

  it('picks a readable color for text on the accent', () => {
    const dark = themeVariables({ palette: { accent: '#101010' } });
    expect(contrast(dark['--on-accent'], '#101010')).toBeGreaterThanOrEqual(MIN_CONTRAST);
  });
});

describe('contrast', () => {
  it('matches the known black and white ratio', () => {
    expect(contrast('#000000', '#ffffff')).toBeCloseTo(21, 5);
    expect(contrast('#777777', '#777777')).toBeCloseTo(1, 5);
  });
});

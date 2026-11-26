import { describe, expect, it } from 'vitest';
import { AVATARS, backdrop, coverArt, DEFAULT_ART, endArt, MOODS, pageArt, PROPS, propsFor, resolveArt } from './art';

const all = (d: { backdrop: string; ground: string }) => d.backdrop + d.ground;

describe('resolveArt', () => {
  it('uses the defaults when there is no theme', () => {
    for (const raw of [undefined, null, 'spooky', [], 7]) expect(resolveArt(raw)).toEqual(DEFAULT_ART);
  });

  it('falls back per field and drops unknown or repeated props', () => {
    expect(resolveArt({ mood: 'spooky', avatar: 'dragon', props: ['lamp', 'rocket', 'lamp', 'sign'] })).toEqual({
      mood: 'spooky',
      avatar: DEFAULT_ART.avatar,
      props: ['lamp', 'sign'],
    });
  });

  it('keeps an empty prop list empty', () => {
    expect(resolveArt({ props: [] }).props).toEqual([]);
  });
});

describe('drawings', () => {
  it('renders every mood, avatar and prop without NaN or undefined', () => {
    for (const mood of MOODS) {
      for (const avatar of AVATARS) {
        const art = { mood, avatar, props: [...PROPS] };
        for (const d of [coverArt(art, 'c'), pageArt(art, 3, 'p'), endArt(art, 'e')]) {
          const s = all(d);
          expect(s).toMatch(/^<svg[\s\S]*<\/svg><svg[\s\S]*<\/svg>$/);
          expect(s).not.toMatch(/NaN|undefined|Infinity/);
        }
      }
    }
  });

  it('gives each mood its own scenery', () => {
    const outs = MOODS.map((m) => backdrop(m, 600, 640, 'x'));
    expect(new Set(outs).size).toBe(MOODS.length);
  });

  it('is deterministic', () => {
    const art = resolveArt({ mood: 'neon', avatar: 'robot', props: ['crate', 'plant'] });
    expect(all(pageArt(art, 2, 'a'))).toBe(all(pageArt(art, 2, 'a')));
    expect(all(coverArt(art, 'a'))).toBe(all(coverArt(art, 'a')));
  });

  it('draws bunting on the cover only when the theme has a banner', () => {
    const withBanner = coverArt({ ...DEFAULT_ART, props: ['banner'] }, 'b').backdrop;
    const without = coverArt({ ...DEFAULT_ART, props: ['lamp'] }, 'b').backdrop;
    expect(withBanner.length).toBeGreaterThan(without.length);
  });

  it('prefixes every id and every reference to it', () => {
    const s = all(coverArt({ mood: 'spooky', avatar: 'ghost', props: ['lamp'] }, 'cover1'));
    const ids = [...s.matchAll(/ id="([^"]+)"/g)].map((m) => m[1]);
    expect(ids.length).toBeGreaterThan(0);
    for (const id of ids) expect(id.startsWith('cover1-')).toBe(true);
    for (const [, ref] of s.matchAll(/url\(#([^)]+)\)/g)) expect(ids).toContain(ref);
  });

  it('strips unsafe characters from the id prefix', () => {
    const s = backdrop('clean', 600, 640, '"><script>');
    expect(s).not.toContain('<script');
    expect(s).toContain('id="script-sky"');
  });
});

describe('art safety', () => {
  // Requirement 17: the art never carries storyboard text or storyboard colors.
  const hostile = {
    mood: '<img src=x onerror=alert(1)>',
    avatar: '"><script>alert(1)</script>',
    props: ['<b>', 'lamp', 'javascript:alert(1)'],
    palette: { background: '#123456', accent: '#abcdef' },
  };

  it('contains no markup, script or color taken from the theme', () => {
    const art = resolveArt(hostile);
    for (const d of [coverArt(art, 'h'), pageArt(art, 0, 'h'), endArt(art, 'h')]) {
      const s = all(d);
      expect(s).not.toMatch(/onerror|<script|javascript:|<img|<b>/i);
      expect(s).not.toContain('#123456');
      expect(s).not.toContain('#abcdef');
    }
  });
});

describe('propsFor', () => {
  it('rotates through the props by slide index', () => {
    const props = ['plant', 'lamp', 'crate'] as const;
    expect(propsFor(props, 0, 2)).toEqual(['plant', 'lamp']);
    expect(propsFor(props, 1, 2)).toEqual(['lamp', 'crate']);
    expect(propsFor(props, 2, 2)).toEqual(['crate', 'plant']);
  });

  it('never repeats a prop on one page and handles short lists', () => {
    expect(propsFor(['sign'], 4, 2)).toEqual(['sign']);
    expect(propsFor([], 1, 2)).toEqual([]);
  });
});

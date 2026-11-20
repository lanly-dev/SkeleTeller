import { describe, expect, it } from 'vitest';
import { fitText, safeHttpUrl, wrapLines } from './text';

/** Each character is one unit wide. */
const measure = (s: string) => s.length;

describe('safeHttpUrl', () => {
  it('keeps http and https URLs', () => {
    expect(safeHttpUrl('https://github.com/example/taskflow')).toBe('https://github.com/example/taskflow');
    expect(safeHttpUrl('http://example.com')).toBe('http://example.com/');
  });

  it('drops other schemes, relative paths and non-strings', () => {
    expect(safeHttpUrl('javascript:alert(1)')).toBeUndefined();
    expect(safeHttpUrl('file:///etc/passwd')).toBeUndefined();
    expect(safeHttpUrl('data:text/html,hi')).toBeUndefined();
    expect(safeHttpUrl('/relative')).toBeUndefined();
    expect(safeHttpUrl(undefined)).toBeUndefined();
    expect(safeHttpUrl(42)).toBeUndefined();
  });
});

describe('fitText', () => {
  it('returns text that already fits', () => {
    expect(fitText('short', 10, measure)).toBe('short');
  });

  it('cuts with an ellipsis that fits the width', () => {
    const out = fitText('a long caption here', 8, measure);
    expect(out.endsWith('…')).toBe(true);
    expect(measure(out)).toBeLessThanOrEqual(8);
  });
});

describe('wrapLines', () => {
  it('wraps on word boundaries', () => {
    expect(wrapLines('one two three four', 9, measure)).toEqual(['one two', 'three', 'four']);
  });

  it('keeps a word longer than the width on its own line', () => {
    expect(wrapLines('a supercalifragilistic b', 5, measure)).toEqual(['a', 'supercalifragilistic', 'b']);
  });

  it('limits the line count and marks the cut', () => {
    const lines = wrapLines('one two three four five six', 9, measure, 2);
    expect(lines).toHaveLength(2);
    expect(lines[1].endsWith('…')).toBe(true);
    expect(measure(lines[1])).toBeLessThanOrEqual(9);
  });

  it('returns no lines for empty text', () => {
    expect(wrapLines('   ', 10, measure)).toEqual([]);
  });
});

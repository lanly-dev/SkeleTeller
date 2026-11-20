import { describe, expect, it } from 'vitest';
import { clampIndex, formatHash, parseHash } from './router';

describe('parseHash', () => {
  it('reads a one-based slide number', () => {
    expect(parseHash('#/1', 7)).toBe(0);
    expect(parseHash('#/4', 7)).toBe(3);
    expect(parseHash('#/7', 7)).toBe(6);
  });

  it('opens slide 1 for a missing or malformed fragment', () => {
    for (const h of ['', '#', '#/', '#4', '#/abc', '#/4x', '#/-2', '#/2.5', '#/ 3']) expect(parseHash(h, 7)).toBe(0);
  });

  it('opens slide 1 when the number is out of range', () => {
    expect(parseHash('#/0', 7)).toBe(0);
    expect(parseHash('#/8', 7)).toBe(0);
    expect(parseHash('#/99999', 7)).toBe(0);
  });

  it('handles an empty deck', () => {
    expect(parseHash('#/1', 0)).toBe(0);
  });
});

describe('formatHash', () => {
  it('round-trips with parseHash', () => {
    for (let i = 0; i < 7; i++) expect(parseHash(formatHash(i), 7)).toBe(i);
  });
});

describe('clampIndex', () => {
  it('keeps the index in range', () => {
    expect(clampIndex(-1, 7)).toBe(0);
    expect(clampIndex(9, 7)).toBe(6);
    expect(clampIndex(3, 7)).toBe(3);
    expect(clampIndex(Number.NaN, 7)).toBe(0);
    expect(clampIndex(2, 0)).toBe(0);
  });
});

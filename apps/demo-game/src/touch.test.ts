import { describe, expect, it } from 'vitest';
import { PAD_DEADZONE, padVector } from './touch';

describe('padVector', () => {
  it('is zero inside the dead zone', () => {
    expect(padVector(0, 0, 60)).toEqual({ x: 0, y: 0 });
    expect(padVector(60 * PAD_DEADZONE * 0.9, 0, 60)).toEqual({ x: 0, y: 0 });
  });

  it('points the way the thumb moved, y positive downward', () => {
    expect(padVector(30, 0, 60)).toEqual({ x: 0.5, y: 0 });
    expect(padVector(0, -45, 60)).toEqual({ x: 0, y: -0.75 });
  });

  it('clamps to length 1 past the rim', () => {
    const v = padVector(300, 400, 60);
    expect(Math.hypot(v.x, v.y)).toBeCloseTo(1, 10);
    expect(v.x).toBeCloseTo(0.6, 10);
    expect(v.y).toBeCloseTo(0.8, 10);
  });

  it('returns zero for bad input', () => {
    expect(padVector(10, 10, 0)).toEqual({ x: 0, y: 0 });
    expect(padVector(Number.NaN, 10, 60)).toEqual({ x: 0, y: 0 });
    expect(padVector(10, Number.POSITIVE_INFINITY, 60)).toEqual({ x: 0, y: 0 });
  });
});

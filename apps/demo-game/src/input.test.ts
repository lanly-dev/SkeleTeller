import { describe, expect, it } from 'vitest';
import { createInput } from './input';

/** An EventTarget that counts its live listeners. */
class CountingTarget extends EventTarget {
  count = 0;
  override addEventListener(type: string, cb: EventListenerOrEventListenerObject | null, o?: boolean | AddEventListenerOptions) {
    this.count++;
    super.addEventListener(type, cb, o);
  }
  override removeEventListener(type: string, cb: EventListenerOrEventListenerObject | null, o?: boolean | EventListenerOptions) {
    this.count--;
    super.removeEventListener(type, cb, o);
  }
}

function key(target: EventTarget, type: 'keydown' | 'keyup', k: string, repeat = false) {
  const e = new Event(type, { cancelable: true });
  Object.assign(e, { key: k, repeat });
  target.dispatchEvent(e);
  return e;
}

describe('createInput', () => {
  it('maps arrow keys and WASD to a direction', () => {
    const t = new EventTarget();
    const input = createInput(t);
    key(t, 'keydown', 'ArrowRight');
    key(t, 'keydown', 's');
    expect(input.read().dir).toEqual({ x: 1, y: 1 });
    key(t, 'keyup', 'ArrowRight');
    key(t, 'keyup', 's');
    key(t, 'keydown', 'A');
    key(t, 'keydown', 'ArrowUp');
    expect(input.read().dir).toEqual({ x: -1, y: -1 });
    input.destroy();
  });

  it('cancels opposite keys', () => {
    const t = new EventTarget();
    const input = createInput(t);
    key(t, 'keydown', 'ArrowLeft');
    key(t, 'keydown', 'ArrowRight');
    expect(input.read().dir.x).toBe(0);
    input.destroy();
  });

  it('gives action and close as one-shot edges, ignoring key repeat', () => {
    const t = new EventTarget();
    const input = createInput(t);
    key(t, 'keydown', 'e');
    expect(input.read().action).toBe(true);
    expect(input.read().action).toBe(false);
    key(t, 'keydown', ' ');
    key(t, 'keydown', ' ', true);
    expect(input.read().action).toBe(true);
    key(t, 'keydown', 'Escape');
    expect(input.read().close).toBe(true);
    expect(input.read().close).toBe(false);
    key(t, 'keydown', 'Escape', true);
    expect(input.read().close).toBe(false);
    input.destroy();
  });

  it('drives the same state from touch', () => {
    const t = new EventTarget();
    const input = createInput(t);
    input.setTouchDirection(-1, 0);
    expect(input.read().dir).toEqual({ x: -1, y: 0 });
    input.setTouchDirection(0, 0);
    input.pressAction();
    expect(input.read()).toEqual({ dir: { x: 0, y: 0 }, action: true, close: false });
    input.pressClose();
    expect(input.read().close).toBe(true);
    input.destroy();
  });

  it('combines keyboard and touch and clamps to -1..1', () => {
    const t = new EventTarget();
    const input = createInput(t);
    key(t, 'keydown', 'ArrowRight');
    input.setTouchDirection(1, Number.NaN);
    expect(input.read().dir).toEqual({ x: 1, y: 0 });
    input.destroy();
  });

  it('clears held keys on blur', () => {
    const t = new EventTarget();
    const input = createInput(t);
    key(t, 'keydown', 'd');
    t.dispatchEvent(new Event('blur'));
    expect(input.read().dir.x).toBe(0);
    input.destroy();
  });

  it('prevents default only for handled keys', () => {
    const t = new EventTarget();
    const input = createInput(t);
    expect(key(t, 'keydown', ' ').defaultPrevented).toBe(true);
    expect(key(t, 'keydown', 'F5').defaultPrevented).toBe(false);
    input.destroy();
  });

  it('leaves no listeners behind after destroy, including on re-init', () => {
    const t = new CountingTarget();
    for (let i = 0; i < 3; i++) createInput(t).destroy();
    expect(t.count).toBe(0);
    const input = createInput(t);
    expect(t.count).toBe(3);
    input.destroy();
    key(t, 'keydown', 'e');
    expect(input.read().action).toBe(false);
    expect(t.count).toBe(0);
  });
});

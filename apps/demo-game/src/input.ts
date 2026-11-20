/** What the game reads each frame. Keyboard and touch both write into this. */
export interface InputState {
  /** Direction, each axis in -1..1. Not normalized. y is positive downward. */
  dir: { x: number; y: number };
  /** True for one read after the action was pressed. */
  action: boolean;
  /** True for one read after close was pressed. */
  close: boolean;
}

export interface Input {
  /** Current state. Clears the action and close edges. */
  read(): InputState;
  /** Touch controls: set the direction from the on-screen pad (each axis -1..1). */
  setTouchDirection(x: number, y: number): void;
  /** Touch controls: the action button or a tap on a station. */
  pressAction(): void;
  /** Touch controls: the close control. */
  pressClose(): void;
  /** Remove every listener this instance added. */
  destroy(): void;
}

const MOVE_KEYS: Record<string, 'left' | 'right' | 'up' | 'down'> = {
  arrowleft: 'left',
  a: 'left',
  arrowright: 'right',
  d: 'right',
  arrowup: 'up',
  w: 'up',
  arrowdown: 'down',
  s: 'down',
};
const ACTION_KEYS = new Set(['e', ' ', 'spacebar']);
const CLOSE_KEYS = new Set(['escape', 'esc']);

const clamp = (n: number) => Math.max(-1, Math.min(1, Number.isFinite(n) ? n : 0));

/**
 * Create one input state fed by keyboard events on `target` and by the touch methods.
 * Call `destroy()` before creating another, for example on re-init, so no listener stays behind.
 */
export function createInput(target: EventTarget = window): Input {
  const held = new Set<'left' | 'right' | 'up' | 'down'>();
  let touchX = 0;
  let touchY = 0;
  let action = false;
  let close = false;

  const onKeyDown = (ev: Event) => {
    const e = ev as KeyboardEvent;
    const key = String(e.key).toLowerCase();
    const move = MOVE_KEYS[key];
    if (move) {
      held.add(move);
      e.preventDefault?.();
    } else if (ACTION_KEYS.has(key)) {
      if (!e.repeat) action = true;
      e.preventDefault?.();
    } else if (CLOSE_KEYS.has(key)) {
      if (!e.repeat) close = true;
      e.preventDefault?.();
    }
  };
  const onKeyUp = (ev: Event) => {
    const move = MOVE_KEYS[String((ev as KeyboardEvent).key).toLowerCase()];
    if (move) held.delete(move);
  };
  // Releasing keys while the window is unfocused would otherwise leave the character walking.
  const onBlur = () => held.clear();

  target.addEventListener('keydown', onKeyDown);
  target.addEventListener('keyup', onKeyUp);
  target.addEventListener('blur', onBlur);

  return {
    read() {
      const keyX = (held.has('right') ? 1 : 0) - (held.has('left') ? 1 : 0);
      const keyY = (held.has('down') ? 1 : 0) - (held.has('up') ? 1 : 0);
      const state: InputState = { dir: { x: clamp(keyX + touchX), y: clamp(keyY + touchY) }, action, close };
      action = false;
      close = false;
      return state;
    },
    setTouchDirection(x, y) {
      touchX = clamp(x);
      touchY = clamp(y);
    },
    pressAction() {
      action = true;
    },
    pressClose() {
      close = true;
    },
    destroy() {
      target.removeEventListener('keydown', onKeyDown);
      target.removeEventListener('keyup', onKeyUp);
      target.removeEventListener('blur', onBlur);
      held.clear();
    },
  };
}

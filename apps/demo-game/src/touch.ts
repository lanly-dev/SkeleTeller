import type { Input } from './input';

/** Fraction of the pad radius that counts as no movement. */
export const PAD_DEADZONE = 0.18;

/**
 * Direction for a touch at (dx, dy) from the pad center, with each axis in -1..1.
 * Inside the dead zone it is zero. Past the rim it is clamped to length 1, so a
 * thumb that slides off the pad keeps walking at full speed in the same direction.
 */
export function padVector(dx: number, dy: number, radius: number): { x: number; y: number } {
  if (!(radius > 0) || !Number.isFinite(dx) || !Number.isFinite(dy)) return { x: 0, y: 0 };
  const nx = dx / radius;
  const ny = dy / radius;
  const len = Math.hypot(nx, ny);
  if (len < PAD_DEADZONE) return { x: 0, y: 0 };
  const scale = len > 1 ? 1 / len : 1;
  return { x: nx * scale, y: ny * scale };
}

export interface TouchControls {
  /** Show or hide the controls, for example while a panel is open. */
  setVisible(visible: boolean): void;
  destroy(): void;
}

/**
 * On-screen pad and action button. They feed the same Input as the keyboard.
 * Shown on coarse pointers, and on any device as soon as it is touched.
 */
export function createTouchControls(root: HTMLElement, input: Input): TouchControls {
  root.replaceChildren();
  const pad = document.createElement('div');
  pad.className = 'touch-pad';
  pad.setAttribute('aria-hidden', 'true');
  const knob = document.createElement('div');
  knob.className = 'touch-knob';
  pad.append(knob);

  const action = document.createElement('button');
  action.type = 'button';
  action.className = 'touch-action';
  action.textContent = 'View';
  action.setAttribute('aria-label', 'View the station');
  root.append(pad, action);

  let padPointer: number | null = null;

  const movePad = (e: PointerEvent) => {
    const rect = pad.getBoundingClientRect();
    const radius = rect.width / 2;
    const v = padVector(e.clientX - (rect.left + radius), e.clientY - (rect.top + radius), radius);
    input.setTouchDirection(v.x, v.y);
    knob.style.transform = `translate(${v.x * radius * 0.55}px, ${v.y * radius * 0.55}px)`;
  };
  const releasePad = (e: PointerEvent) => {
    if (e.pointerId !== padPointer) return;
    padPointer = null;
    input.setTouchDirection(0, 0);
    knob.style.transform = '';
  };

  const onPadDown = (e: PointerEvent) => {
    e.preventDefault();
    padPointer = e.pointerId;
    pad.setPointerCapture?.(e.pointerId);
    movePad(e);
  };
  const onPadMove = (e: PointerEvent) => {
    if (e.pointerId === padPointer) movePad(e);
  };
  const onAction = (e: PointerEvent) => {
    e.preventDefault();
    input.pressAction();
  };
  // A keyboard user who tabs to the button can still press it.
  const onActionClick = (e: MouseEvent) => {
    if (e.detail === 0) input.pressAction();
  };
  const reveal = () => document.body.classList.add('has-touch');

  pad.addEventListener('pointerdown', onPadDown);
  pad.addEventListener('pointermove', onPadMove);
  pad.addEventListener('pointerup', releasePad);
  pad.addEventListener('pointercancel', releasePad);
  pad.addEventListener('lostpointercapture', releasePad);
  action.addEventListener('pointerdown', onAction);
  action.addEventListener('click', onActionClick);
  window.addEventListener('touchstart', reveal, { passive: true, once: true });
  if (window.matchMedia('(pointer: coarse)').matches) reveal();

  return {
    setVisible(visible) {
      root.hidden = !visible;
      if (!visible && padPointer !== null) {
        padPointer = null;
        input.setTouchDirection(0, 0);
        knob.style.transform = '';
      }
    },
    destroy() {
      pad.removeEventListener('pointerdown', onPadDown);
      pad.removeEventListener('pointermove', onPadMove);
      pad.removeEventListener('pointerup', releasePad);
      pad.removeEventListener('pointercancel', releasePad);
      pad.removeEventListener('lostpointercapture', releasePad);
      action.removeEventListener('pointerdown', onAction);
      action.removeEventListener('click', onActionClick);
      window.removeEventListener('touchstart', reveal);
      root.replaceChildren();
    },
  };
}

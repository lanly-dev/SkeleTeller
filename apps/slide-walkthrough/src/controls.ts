/** Back and next buttons, a progress bar of slide buttons, keyboard keys and swipe. */

export interface ControlHandlers {
  go(index: number): void;
  next(): void;
  prev(): void;
  first(): void;
  last(): void;
  /** Escape: close an open hotspot label. */
  escape(): void;
}

export interface Controls {
  update(index: number): void;
  destroy(): void;
}

/** Elements where Space and Enter belong to the element, not to paging. */
function ownsKeys(target: EventTarget | null): boolean {
  return target instanceof HTMLElement && !!target.closest('button, a, summary, input, textarea, select, [contenteditable="true"]');
}

export function createControls(nav: HTMLElement, swipeArea: HTMLElement, titles: string[], h: ControlHandlers): Controls {
  nav.replaceChildren();
  const prev = document.createElement('button');
  prev.type = 'button';
  prev.className = 'nav-step';
  prev.textContent = '← Back';
  prev.setAttribute('aria-label', 'Previous slide');

  const next = document.createElement('button');
  next.type = 'button';
  next.className = 'nav-step';
  next.textContent = 'Next →';
  next.setAttribute('aria-label', 'Next slide');

  const list = document.createElement('ol');
  list.className = 'progress';
  list.setAttribute('aria-label', 'Slides');
  const dots = titles.map((title, i) => {
    const li = document.createElement('li');
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'progress-step';
    b.setAttribute('aria-label', `Slide ${i + 1}: ${title}`);
    b.title = `${i + 1}. ${title}`;
    b.addEventListener('click', () => h.go(i));
    li.append(b);
    list.append(li);
    return b;
  });

  prev.addEventListener('click', h.prev);
  next.addEventListener('click', h.next);
  nav.append(prev, list, next);

  const onKey = (e: KeyboardEvent) => {
    if (e.altKey || e.ctrlKey || e.metaKey) return;
    switch (e.key) {
      case 'ArrowRight':
      case 'PageDown':
        h.next();
        break;
      case 'ArrowLeft':
      case 'PageUp':
        h.prev();
        break;
      case ' ':
        if (ownsKeys(e.target)) return;
        if (e.shiftKey) h.prev();
        else h.next();
        break;
      case 'Home':
        h.first();
        break;
      case 'End':
        h.last();
        break;
      case 'Escape':
        h.escape();
        return;
      default:
        return;
    }
    e.preventDefault();
  };

  let startX = 0;
  let startY = 0;
  let tracking = false;
  const onTouchStart = (e: TouchEvent) => {
    if (e.touches.length !== 1) return;
    tracking = true;
    startX = e.touches[0].clientX;
    startY = e.touches[0].clientY;
  };
  const onTouchEnd = (e: TouchEvent) => {
    if (!tracking) return;
    tracking = false;
    const t = e.changedTouches[0];
    const dx = t.clientX - startX;
    const dy = t.clientY - startY;
    if (Math.abs(dx) > 50 && Math.abs(dy) < Math.abs(dx) * 0.6) {
      if (dx < 0) h.next();
      else h.prev();
    }
  };

  window.addEventListener('keydown', onKey);
  swipeArea.addEventListener('touchstart', onTouchStart, { passive: true });
  swipeArea.addEventListener('touchend', onTouchEnd, { passive: true });

  return {
    update(index) {
      prev.disabled = index <= 0;
      next.disabled = index >= titles.length - 1;
      dots.forEach((b, i) => {
        if (i === index) b.setAttribute('aria-current', 'step');
        else b.removeAttribute('aria-current');
        b.classList.toggle('is-done', i < index);
      });
    },
    destroy() {
      window.removeEventListener('keydown', onKey);
      swipeArea.removeEventListener('touchstart', onTouchStart);
      swipeArea.removeEventListener('touchend', onTouchEnd);
      nav.replaceChildren();
    },
  };
}

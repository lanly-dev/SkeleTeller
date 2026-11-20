import type { Callout, Scene, Storyboard } from '../../../skeleton/src/types';
import { safeHttpUrl } from './text';

/**
 * The station panel: one DOM overlay that shows a scene's content.
 * Everything from the storyboard is inserted with textContent or as attribute values
 * of known-safe kinds (relative image paths already validated at build time, http(s) links).
 * No storyboard value is ever parsed as HTML.
 */
export interface Panel {
  open(sceneIndex: number): void;
  close(): void;
  readonly isOpen: boolean;
  destroy(): void;
}

export interface PanelOptions {
  root: HTMLElement;
  storyboard: Storyboard;
  /** Called when the player closes the panel with its own control. */
  onRequestClose(): void;
  /** Base URL for assets, for example "./". Storyboard asset paths are appended to it. */
  assetBase: string;
}

function el<K extends keyof HTMLElementTagNameMap>(tag: K, className?: string, text?: string): HTMLElementTagNameMap[K] {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
}

/** Image with a labelled placeholder when it fails to load. */
function image(src: string, alt: string, sceneNumber: number): HTMLElement {
  const img = el('img', 'panel-image');
  img.alt = alt;
  img.decoding = 'async';
  img.addEventListener(
    'error',
    () => {
      const ph = el('div', 'panel-image-missing', `The image for scene ${sceneNumber} could not be loaded.`);
      ph.setAttribute('role', 'img');
      ph.setAttribute('aria-label', alt);
      img.replaceWith(ph);
    },
    { once: true },
  );
  img.src = src;
  return img;
}

function narration(text: string | undefined): HTMLElement | undefined {
  if (!text) return undefined;
  if (text.length <= 180) return el('p', 'panel-narration', text);
  const details = el('details', 'panel-narration');
  details.append(el('summary', undefined, 'Read more'), el('p', undefined, text));
  return details;
}

function calloutFigure(src: string, alt: string, callouts: Callout[], sceneNumber: number): HTMLElement {
  const figure = el('div', 'panel-figure');
  figure.append(image(src, alt, sceneNumber));
  const label = el('p', 'panel-callout-label');
  label.setAttribute('aria-live', 'polite');
  label.textContent = 'Select a numbered point to learn more.';
  const buttons: HTMLButtonElement[] = [];
  callouts.forEach((c, i) => {
    const button = el('button', 'hotspot', String(i + 1));
    button.type = 'button';
    button.style.left = `${c.x * 100}%`;
    button.style.top = `${c.y * 100}%`;
    button.setAttribute('aria-label', `Point ${i + 1}: ${c.label}`);
    button.setAttribute('aria-expanded', 'false');
    button.addEventListener('click', () => {
      const wasOpen = button.getAttribute('aria-expanded') === 'true';
      for (const b of buttons) b.setAttribute('aria-expanded', 'false');
      if (wasOpen) {
        label.textContent = 'Select a numbered point to learn more.';
      } else {
        button.setAttribute('aria-expanded', 'true');
        label.textContent = `${i + 1}. ${c.label}`;
        // On short screens the label can sit below the fold of the panel.
        label.scrollIntoView?.({ block: 'nearest' });
      }
    });
    buttons.push(button);
    figure.append(button);
  });
  const wrap = el('div');
  wrap.append(figure, label);
  return wrap;
}

function codeBlock(code: Extract<Scene, { type: 'code' }>['code']): HTMLElement {
  const wrap = el('div', 'panel-code');
  wrap.append(el('span', 'panel-code-lang', code.language));
  const pre = el('pre');
  const highlighted = new Set(code.highlight_lines ?? []);
  code.snippet
    .replace(/\n$/, '')
    .split('\n')
    .forEach((line, i) => {
      const row = el('span', highlighted.has(i + 1) ? 'code-line is-highlighted' : 'code-line');
      row.append(el('span', 'code-num', String(i + 1)), el('span', 'code-text', line || ' '));
      pre.append(row);
    });
  wrap.append(pre);
  return wrap;
}

export function createPanel(opts: PanelOptions): Panel {
  const { root, storyboard } = opts;
  root.hidden = true;
  root.setAttribute('role', 'dialog');
  root.setAttribute('aria-modal', 'true');
  let lastFocus: Element | null = null;
  let isOpen = false;

  // Keep Space and Enter for the panel's own buttons instead of the game's action key.
  const onKeyDown = (e: KeyboardEvent) => {
    if (e.key === ' ' || e.key === 'Enter') e.stopPropagation();
  };
  root.addEventListener('keydown', onKeyDown);

  function render(sceneIndex: number) {
    const scene = storyboard.scenes[sceneIndex];
    const number = sceneIndex + 1;
    root.replaceChildren();
    const card = el('div', 'panel-card');
    const header = el('div', 'panel-header');
    header.append(el('span', 'panel-step', `Area ${number} of ${storyboard.scenes.length}`));
    const close = el('button', 'panel-close', 'Close');
    close.type = 'button';
    close.setAttribute('aria-label', 'Close (Escape)');
    close.addEventListener('click', () => opts.onRequestClose());
    header.append(close);
    card.append(header);

    const heading = el('h2', 'panel-caption');
    heading.id = 'panel-heading';
    root.setAttribute('aria-labelledby', heading.id);

    switch (scene.type) {
      case 'title':
        heading.textContent = scene.title;
        card.append(heading);
        if (scene.tagline) card.append(el('p', 'panel-narration', scene.tagline));
        break;
      case 'feature':
        heading.textContent = scene.caption;
        card.append(heading, image(opts.assetBase + scene.visual, scene.caption, number));
        break;
      case 'callout':
        heading.textContent = scene.caption;
        card.append(heading, calloutFigure(opts.assetBase + scene.visual, scene.caption, scene.callouts, number));
        break;
      case 'code':
        heading.textContent = scene.caption;
        card.append(heading, codeBlock(scene.code));
        break;
      case 'outro': {
        heading.textContent = scene.caption;
        card.append(heading);
        const link = safeHttpUrl(storyboard.project.repository) ?? safeHttpUrl(storyboard.project.website);
        if (link) {
          const a = el('a', 'panel-link', link.replace(/^https?:\/\//, '').replace(/\/$/, ''));
          a.href = link;
          a.target = '_blank';
          a.rel = 'noopener noreferrer';
          card.append(a);
        }
        break;
      }
    }
    if (scene.type !== 'title') {
      const more = narration(scene.narration);
      if (more) card.append(more);
    }
    root.append(card);
    close.focus();
  }

  return {
    open(sceneIndex) {
      if (isOpen) return;
      lastFocus = document.activeElement;
      render(sceneIndex);
      root.hidden = false;
      isOpen = true;
    },
    close() {
      if (!isOpen) return;
      root.hidden = true;
      root.replaceChildren();
      isOpen = false;
      if (lastFocus instanceof HTMLElement) lastFocus.focus();
    },
    get isOpen() {
      return isOpen;
    },
    destroy() {
      root.removeEventListener('keydown', onKeyDown);
      root.replaceChildren();
    },
  };
}

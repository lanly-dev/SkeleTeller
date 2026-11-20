import type { SlideModel } from './slides';

/**
 * Builds the DOM for one slide. Storyboard text only ever goes in through textContent
 * or plain attribute values; nothing is parsed as HTML. Image sources are relative
 * paths the build already validated, and links come pre-checked from buildSlides.
 */

function el<K extends keyof HTMLElementTagNameMap>(tag: K, className?: string, text?: string): HTMLElementTagNameMap[K] {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
}

function image(src: string, alt: string, slideNumber: number): HTMLElement {
  const img = el('img', 'slide-image');
  img.alt = alt;
  img.decoding = 'async';
  img.addEventListener(
    'error',
    () => {
      const ph = el('div', 'slide-image-missing', `The image for slide ${slideNumber} could not be loaded.`);
      ph.setAttribute('role', 'img');
      ph.setAttribute('aria-label', alt);
      img.replaceWith(ph);
    },
    { once: true },
  );
  img.src = src;
  return img;
}

export interface RenderedSlide {
  element: HTMLElement;
  /** Close an open hotspot label. Returns true if one was open. */
  closeHotspot(): boolean;
}

/** Figure whose hotspot buttons are placed in percent of the image. One label open at a time. */
function hotspotFigure(slide: SlideModel, assetBase: string) {
  const figure = el('div', 'figure');
  figure.append(image(assetBase + slide.image!.src, slide.image!.alt, slide.index + 1));
  const note = el('p', 'hotspot-note');
  note.setAttribute('aria-live', 'polite');
  const idle = 'Select a numbered point to learn more.';
  note.textContent = idle;
  const buttons: HTMLButtonElement[] = [];

  const closeAll = () => {
    const wasOpen = buttons.some((b) => b.getAttribute('aria-expanded') === 'true');
    for (const b of buttons) b.setAttribute('aria-expanded', 'false');
    note.textContent = idle;
    return wasOpen;
  };

  for (const h of slide.hotspots) {
    const b = el('button', 'hotspot', String(h.number));
    b.type = 'button';
    b.style.left = `${h.x * 100}%`;
    b.style.top = `${h.y * 100}%`;
    b.setAttribute('aria-label', `Point ${h.number}: ${h.label}`);
    b.setAttribute('aria-expanded', 'false');
    b.addEventListener('click', () => {
      const wasOpen = b.getAttribute('aria-expanded') === 'true';
      closeAll();
      if (!wasOpen) {
        b.setAttribute('aria-expanded', 'true');
        note.textContent = `${h.number}. ${h.label}`;
        note.scrollIntoView?.({ block: 'nearest' });
      }
    });
    buttons.push(b);
    figure.append(b);
  }
  return { figure, note, closeAll };
}

function codeBlock(code: NonNullable<SlideModel['code']>): HTMLElement {
  const wrap = el('div', 'code');
  wrap.append(el('span', 'code-lang', code.language));
  const pre = el('pre');
  for (const line of code.lines) {
    const row = el('span', line.highlighted ? 'code-line is-highlighted' : 'code-line');
    row.append(el('span', 'code-num', String(line.number)), el('span', 'code-text', line.text || ' '));
    if (line.highlighted) row.setAttribute('aria-label', `Highlighted line ${line.number}: ${line.text}`);
    pre.append(row);
  }
  wrap.append(pre);
  return wrap;
}

function narration(text: string | undefined): HTMLElement | undefined {
  if (!text) return undefined;
  const d = el('details', 'narration');
  d.append(el('summary', undefined, 'Read the narration'), el('p', undefined, text));
  return d;
}

export function renderSlide(slide: SlideModel, total: number, assetBase: string): RenderedSlide {
  const section = el('section', `slide slide-${slide.kind}`);
  section.setAttribute('aria-roledescription', 'slide');
  section.setAttribute('aria-label', `Slide ${slide.index + 1} of ${total}`);
  let closeHotspot = () => false;

  if (slide.background) {
    const bg = el('div', 'slide-backdrop');
    const img = el('img');
    img.alt = '';
    img.addEventListener('error', () => bg.remove(), { once: true });
    img.src = assetBase + slide.background;
    bg.append(img);
    section.append(bg);
  }

  const body = el('div', 'slide-body');
  const heading = el(slide.kind === 'title' ? 'h1' : 'h2', 'slide-heading', slide.heading);
  heading.id = 'slide-heading';
  heading.tabIndex = -1;

  switch (slide.kind) {
    case 'title':
    case 'outro': {
      body.append(heading);
      if (slide.subheading) body.append(el('p', 'slide-sub', slide.subheading));
      if (slide.link) {
        const a = el('a', 'slide-link', slide.link.text);
        a.href = slide.link.href;
        a.target = '_blank';
        a.rel = 'noopener noreferrer';
        body.append(a);
      }
      break;
    }
    case 'feature': {
      const media = el('div', 'slide-media');
      media.append(el('div', 'figure'));
      media.firstElementChild!.append(image(assetBase + slide.image!.src, slide.image!.alt, slide.index + 1));
      const text = el('div', 'slide-text');
      text.append(heading);
      body.append(media, text);
      break;
    }
    case 'callout': {
      const { figure, note, closeAll } = hotspotFigure(slide, assetBase);
      closeHotspot = closeAll;
      const media = el('div', 'slide-media');
      media.append(figure);
      const text = el('div', 'slide-text');
      text.append(heading, note);
      body.append(media, text);
      break;
    }
    case 'code': {
      body.append(heading, codeBlock(slide.code!));
      break;
    }
  }

  const more = narration(slide.narration);
  if (more) (body.querySelector('.slide-text') ?? body).append(more);
  section.append(body);
  return { element: section, closeHotspot };
}

import { coverArt, endArt, pageArt, type ArtTheme, type Drawing } from './art';
import type { SlideModel } from './slides';

/**
 * Builds the DOM for one page of the storybook.
 *
 * Storyboard text only ever goes in through textContent or plain attribute values;
 * nothing from the storyboard is parsed as HTML. The only markup parsed is the art
 * from art.ts, which is built from constants and theme enum values and is tested to
 * carry no storyboard text. Image sources are relative paths the build validated,
 * and links come pre-checked from buildSlides.
 */

function el<K extends keyof HTMLElementTagNameMap>(tag: K, className?: string, text?: string): HTMLElementTagNameMap[K] {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
}

/** Parse art markup from art.ts. Never called with storyboard text. */
function artNode(markup: string): Element {
  const tpl = document.createElement('template');
  tpl.innerHTML = markup;
  return tpl.content.firstElementChild!;
}

function illustration(className: string, drawing: Drawing): HTMLElement {
  const box = el('div', className);
  box.append(artNode(drawing.backdrop), artNode(drawing.ground));
  return box;
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
  const idle = 'Select a numbered point in the picture to learn more.';
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
  return text ? el('p', 'narration', text) : undefined;
}

function link(slide: SlideModel): HTMLElement | undefined {
  if (!slide.link) return undefined;
  const a = el('a', 'slide-link', slide.link.text);
  a.href = slide.link.href;
  a.target = '_blank';
  a.rel = 'noopener noreferrer';
  return a;
}

function heading(slide: SlideModel, level: 'h1' | 'h2'): HTMLElement {
  const h = el(level, 'slide-heading', slide.heading);
  h.id = 'slide-heading';
  h.tabIndex = -1;
  return h;
}

function cover(section: HTMLElement, slide: SlideModel, art: ArtTheme) {
  section.append(illustration('cover-art', coverArt(art, `cover${slide.index}`)));
  const plaque = el('div', 'cover-plaque');
  plaque.append(heading(slide, 'h1'));
  if (slide.subheading) plaque.append(el('p', 'cover-tagline', slide.subheading));
  section.append(plaque, el('p', 'cover-imprint', 'A SkeleTeller Storybook'));
}

function ending(section: HTMLElement, slide: SlideModel, art: ArtTheme) {
  section.append(illustration('cover-art', endArt(art, `end${slide.index}`)));
  const card = el('div', 'end-card');
  card.append(el('p', 'end-title', 'The End'), heading(slide, 'h2'));
  const story = narration(slide.narration);
  if (story) card.append(story);
  const a = link(slide);
  if (a) card.append(a);
  section.append(card);
}

function spread(section: HTMLElement, slide: SlideModel, art: ArtTheme, assetBase: string): () => boolean {
  let closeHotspot = () => false;
  const left = illustration('page-art', pageArt(art, slide.index, `page${slide.index}`));
  const frame = el('div', slide.kind === 'code' ? 'art-frame art-frame-code' : 'art-frame');
  const text = el('div', 'page-text');
  text.append(el('p', 'chapter', `Chapter ${slide.chapter ?? slide.index}`), heading(slide, 'h2'));

  if (slide.kind === 'callout') {
    const { figure, note, closeAll } = hotspotFigure(slide, assetBase);
    closeHotspot = closeAll;
    frame.append(figure);
    text.append(note);
  } else if (slide.kind === 'code') {
    frame.append(codeBlock(slide.code!));
  } else {
    const figure = el('div', 'figure');
    figure.append(image(assetBase + slide.image!.src, slide.image!.alt, slide.index + 1));
    frame.append(figure);
  }
  left.append(frame);

  const story = narration(slide.narration);
  if (story) text.append(story);
  text.append(el('p', 'page-number', String(slide.index + 1)));
  section.append(left, text);
  return closeHotspot;
}

export function renderSlide(slide: SlideModel, total: number, assetBase: string, art: ArtTheme): RenderedSlide {
  const layout = slide.kind === 'title' ? 'cover' : slide.kind === 'outro' ? 'end' : 'spread';
  const section = el('section', `slide slide-${slide.kind} slide-${layout}`);
  section.setAttribute('aria-roledescription', 'page');
  section.setAttribute('aria-label', `Page ${slide.index + 1} of ${total}`);
  let closeHotspot = () => false;

  if (layout === 'cover') cover(section, slide, art);
  else if (layout === 'end') ending(section, slide, art);
  else closeHotspot = spread(section, slide, art, assetBase);

  return { element: section, closeHotspot };
}

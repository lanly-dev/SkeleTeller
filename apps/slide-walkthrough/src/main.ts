import './style.css';
import { resolveArt } from './art';
import { createControls } from './controls';
import { stopSpeaking } from './readAloud';
import { renderSlide, type RenderedSlide } from './render';
import { clampIndex, formatHash, parseHash } from './router';
import { buildSlides } from './slides';
import { storyboard } from './storyboard';
import { themeVariables } from './theme';

const slides = buildSlides(storyboard);
const art = resolveArt(storyboard.theme);
const total = slides.length;

const stage = document.getElementById('stage') as HTMLElement;
const live = document.getElementById('live') as HTMLElement;
const counter = document.getElementById('counter') as HTMLElement;
const nav = document.getElementById('nav') as HTMLElement;

(document.getElementById('project') as HTMLElement).textContent = storyboard.project.name;
document.title = `${storyboard.project.name} · SkeleTeller Storybook`;
for (const [name, value] of Object.entries(themeVariables(storyboard.theme))) {
  document.documentElement.style.setProperty(name, value);
}
document.documentElement.dataset.mood = storyboard.theme?.mood ?? 'clean';

// Warm the cache with every image up front, so paging keeps working if the network drops.
const preloaded: HTMLImageElement[] = [];
for (const s of slides) {
  for (const src of [s.image?.src, s.background]) {
    if (!src) continue;
    const img = new Image();
    img.decoding = 'async';
    img.src = `./${src}`;
    preloaded.push(img);
  }
}

let current = -1;
let rendered: RenderedSlide | null = null;

/** Show a slide. `push` adds a browser history entry; `focus` moves focus to the heading. */
function show(index: number, opts: { push?: boolean; focus?: boolean } = {}) {
  const i = clampIndex(index, total);
  if (i === current) return;
  const direction = current < 0 ? '' : i > current ? 'turn-forward' : 'turn-back';
  current = i;
  const slide = slides[i];
  stopSpeaking();
  rendered = renderSlide(slide, total, './', art, (dir) => show(current + dir, { push: true }));
  if (direction) rendered.element.classList.add(direction);
  stage.replaceChildren(rendered.element);
  counter.textContent = `${i + 1} / ${total}`;
  live.textContent = `Page ${i + 1} of ${total}: ${slide.heading}`;
  controls.update(i);
  const hash = formatHash(i);
  if (opts.push && location.hash !== hash) history.pushState(null, '', hash);
  else if (location.hash !== hash) history.replaceState(null, '', hash);
  if (opts.focus) (stage.querySelector('#slide-heading') as HTMLElement | null)?.focus({ preventScroll: true });
  stage.scrollTop = 0;
}

const controls = createControls(
  nav,
  stage,
  slides.map((s) => s.heading),
  {
    go: (i) => show(i, { push: true, focus: true }),
    next: () => show(current + 1, { push: true }),
    prev: () => show(current - 1, { push: true }),
    first: () => show(0, { push: true }),
    last: () => show(total - 1, { push: true }),
    escape: () => {
      rendered?.closeHotspot();
    },
  },
);

window.addEventListener('popstate', () => show(parseHash(location.hash, total)));
window.addEventListener('hashchange', () => show(parseHash(location.hash, total)));
show(parseHash(location.hash, total));

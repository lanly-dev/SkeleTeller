import type { Avatar, Mood, Prop } from '../../../skeleton/src/types';

/**
 * Storybook illustrations, drawn in code.
 *
 * Every function returns SVG markup built only from constants, numbers and the
 * validated mood, avatar and prop values. No storyboard text and no storyboard color
 * ever appears in the markup: shapes use classes (see style.css) and gradient stops
 * use CSS variables, so the theme colors the art. That is why the renderer may
 * insert this markup with a <template>.
 *
 * Coordinates are fixed, so the same storyboard always gives the same art.
 */

export interface ArtTheme {
  mood: Mood;
  avatar: Avatar;
  props: Prop[];
}

export interface Drawing {
  /** Full-bleed scenery, scaled to cover its box. */
  backdrop: string;
  /** Characters and props, anchored to the bottom of their box. */
  ground: string;
}

export const MOODS: readonly Mood[] = ['cozy', 'neon', 'spooky', 'clean'];
export const AVATARS: readonly Avatar[] = ['explorer', 'robot', 'ghost'];
export const PROPS: readonly Prop[] = ['plant', 'lamp', 'crate', 'sign', 'bookshelf', 'banner'];
/** Same defaults as the game, so an unthemed storyboard looks related in both apps. */
export const DEFAULT_ART: ArtTheme = { mood: 'clean', avatar: 'explorer', props: ['plant', 'lamp', 'crate'] };

function oneOf<T extends string>(allowed: readonly T[], value: unknown, fallback: T): T {
  return typeof value === 'string' && (allowed as readonly string[]).includes(value) ? (value as T) : fallback;
}

/** Mood, avatar and props from a storyboard theme, each falling back on its own. */
export function resolveArt(raw: unknown): ArtTheme {
  const t = typeof raw === 'object' && raw !== null && !Array.isArray(raw) ? (raw as Record<string, unknown>) : {};
  let props = [...DEFAULT_ART.props];
  if (Array.isArray(t.props)) props = [...new Set(t.props.filter((p): p is Prop => (PROPS as readonly unknown[]).includes(p)))].slice(0, 8);
  return { mood: oneOf(MOODS, t.mood, DEFAULT_ART.mood), avatar: oneOf(AVATARS, t.avatar, DEFAULT_ART.avatar), props };
}

/** Ids are prefixed by the caller so several drawings can share one document. Only [a-z0-9-] is kept. */
function safeId(prefix: string): string {
  const p = prefix.replace(/[^a-z0-9-]/gi, '').slice(0, 24);
  return p ? `${p}-` : 'art-';
}

const n = (v: number) => Math.round(v * 10) / 10;

function svg(w: number, h: number, kind: 'backdrop' | 'ground', body: string): string {
  const fit = kind === 'backdrop' ? 'xMidYMid slice' : 'xMidYMax meet';
  return `<svg class="art art-${kind}" viewBox="0 0 ${w} ${h}" preserveAspectRatio="${fit}" aria-hidden="true" focusable="false" xmlns="http://www.w3.org/2000/svg">${body}</svg>`;
}

/** A filled hill from y = base to the bottom, with gentle bumps. */
function hill(w: number, h: number, base: number, amp: number, bumps: number, phase: number, cls: string): string {
  const seg = w / bumps;
  let d = `M0 ${n(base)}`;
  for (let i = 0; i < bumps; i++) {
    const up = (i + phase) % 2 === 0 ? -amp : amp * 0.55;
    const x0 = i * seg;
    d += ` C${n(x0 + seg * 0.3)} ${n(base + up)} ${n(x0 + seg * 0.7)} ${n(base + up)} ${n(x0 + seg)} ${n(base)}`;
  }
  return `<path class="${cls}" d="${d} V${h} H0 Z" />`;
}

/** Stars at fixed fractional positions: [x, y, radius, opacity]. */
const STARS: ReadonlyArray<[number, number, number, number]> = [
  [0.08, 0.12, 1.8, 0.8], [0.14, 0.26, 1.2, 0.55], [0.22, 0.09, 2.2, 0.9], [0.3, 0.2, 1.3, 0.6],
  [0.38, 0.07, 1.6, 0.7], [0.46, 0.17, 1.1, 0.5], [0.53, 0.06, 2, 0.8], [0.6, 0.24, 1.2, 0.5],
  [0.9, 0.34, 1.5, 0.6], [0.95, 0.1, 1.8, 0.7], [0.04, 0.38, 1.2, 0.45], [0.27, 0.36, 1.1, 0.45],
  [0.68, 0.04, 1.4, 0.6], [0.84, 0.44, 1.1, 0.4],
];

function stars(w: number, h: number, maxY = 1): string {
  return STARS.filter(([, y]) => y <= maxY)
    .map(([x, y, r, o]) => `<circle class="c-text" cx="${n(x * w)}" cy="${n(y * h)}" r="${r}" opacity="${o}" />`)
    .join('');
}

const BAT = 'M0 0 q8 -10 16 -2 q4 -6 8 0 q8 -8 16 2 q-8 -2 -12 6 q-4 -4 -8 0 q-4 -8 -12 -6 z';

/* ---------------------------------------------------------------- moods */

function spooky(w: number, h: number, p: string): string {
  const s = h / 640;
  const r = Math.min(w, h) * 0.085;
  const mx = w * 0.78;
  const my = h * 0.2;
  const tx = w * 0.1;
  const ty = h * 0.82;
  return `<defs>
<radialGradient id="${p}sky" cx="78%" cy="20%" r="95%"><stop offset="0" style="stop-color:color-mix(in srgb, var(--bg) 78%, white)" /><stop offset="0.45" style="stop-color:var(--bg)" /><stop offset="1" style="stop-color:color-mix(in srgb, var(--bg) 55%, black)" /></radialGradient>
<radialGradient id="${p}glow"><stop offset="0" style="stop-color:var(--text);stop-opacity:0.5" /><stop offset="1" style="stop-color:var(--text);stop-opacity:0" /></radialGradient>
<linearGradient id="${p}hz" x1="0" y1="0" x2="0" y2="1"><stop offset="0" style="stop-color:color-mix(in srgb, var(--bg) 60%, white);stop-opacity:0" /><stop offset="1" style="stop-color:color-mix(in srgb, var(--bg) 60%, white);stop-opacity:0.45" /></linearGradient>
<mask id="${p}moon"><rect x="${n(mx - r * 2)}" y="${n(my - r * 2)}" width="${n(r * 4)}" height="${n(r * 4)}" fill="#fff" /><circle cx="${n(mx + r * 0.42)}" cy="${n(my - r * 0.25)}" r="${n(r * 0.9)}" fill="#000" /></mask>
<filter id="${p}soft" x="-20%" y="-50%" width="140%" height="200%"><feGaussianBlur stdDeviation="6" /></filter>
</defs>
<rect width="${w}" height="${h}" fill="url(#${p}sky)" />
${stars(w, h, 0.5)}
<circle cx="${n(mx)}" cy="${n(my)}" r="${n(r * 2.1)}" fill="url(#${p}glow)" />
<circle class="c-text" cx="${n(mx)}" cy="${n(my)}" r="${n(r)}" opacity="0.95" mask="url(#${p}moon)" />
<path class="c-ink" d="${BAT}" transform="translate(${n(mx - r * 1.6)} ${n(my + r * 0.9)})" />
<path class="c-ink" d="${BAT}" transform="translate(${n(mx - r * 2.4)} ${n(my + r * 1.7)}) scale(0.7)" opacity="0.8" />
<rect x="0" y="${n(h * 0.5)}" width="${w}" height="${n(h * 0.3)}" fill="url(#${p}hz)" />
${hill(w, h, h * 0.72, 24 * s, 4, 0, 'c-far')}
<g class="s-ink" fill="none" stroke-linecap="round" transform="translate(${n(tx)} ${n(ty)}) scale(${n(s * 1.05)})">
<path d="M0 0 C-2 -60 4 -100 -4 -150" stroke-width="16" /><path d="M-2 -100 C20 -120 40 -130 62 -160" stroke-width="8" />
<path d="M-4 -130 C-24 -150 -38 -170 -48 -202" stroke-width="7" /><path d="M40 -138 C52 -148 70 -150 84 -148" stroke-width="4" />
<path d="M-38 -180 C-50 -186 -60 -196 -64 -208" stroke-width="3.5" /><path d="M-4 -150 C-6 -170 0 -188 12 -202" stroke-width="5" />
</g>
${hill(w, h, h * 0.81, 20 * s, 3, 1, 'c-ground')}
<g class="c-text" filter="url(#${p}soft)">
<ellipse cx="${n(w * 0.25)}" cy="${n(h * 0.9)}" rx="${n(w * 0.2)}" ry="${n(22 * s)}" opacity="0.13" />
<ellipse cx="${n(w * 0.66)}" cy="${n(h * 0.93)}" rx="${n(w * 0.26)}" ry="${n(26 * s)}" opacity="0.11" />
</g>
<g class="s-text" fill="none" stroke-width="1.2" opacity="0.32">
<path d="M0 0 L${n(120 * s)} 0 M0 0 L0 ${n(120 * s)} M0 0 L${n(100 * s)} ${n(100 * s)} M0 0 L${n(62 * s)} ${n(120 * s)} M0 0 L${n(120 * s)} ${n(52 * s)}" />
<path d="M${n(30 * s)} 0 Q${n(32 * s)} ${n(30 * s)} 0 ${n(32 * s)} M${n(62 * s)} 0 Q${n(66 * s)} ${n(60 * s)} 0 ${n(66 * s)} M${n(96 * s)} 0 Q${n(100 * s)} ${n(88 * s)} 0 ${n(98 * s)}" />
</g>`;
}

function cozy(w: number, h: number, p: string): string {
  const s = h / 640;
  const sr = Math.min(w, h) * 0.13;
  const cx = w * 0.78;
  const cy = h * 0.78;
  const leaves: ReadonlyArray<[number, number, number, string]> = [
    [0.12, 0.3, 20, 'c-accent'], [0.3, 0.18, -30, 'c-accent-d'], [0.52, 0.34, 45, 'c-accent'],
    [0.64, 0.14, 10, 'c-accent-d'], [0.9, 0.28, -50, 'c-accent'], [0.42, 0.5, 70, 'c-accent-d'],
  ];
  return `<defs>
<linearGradient id="${p}sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" style="stop-color:var(--bg)" /><stop offset="0.55" style="stop-color:color-mix(in srgb, var(--bg) 55%, var(--accent))" /><stop offset="1" style="stop-color:color-mix(in srgb, var(--accent) 50%, white)" /></linearGradient>
<radialGradient id="${p}sun"><stop offset="0" style="stop-color:var(--accent);stop-opacity:0.55" /><stop offset="1" style="stop-color:var(--accent);stop-opacity:0" /></radialGradient>
<radialGradient id="${p}win"><stop offset="0" style="stop-color:var(--accent);stop-opacity:0.7" /><stop offset="1" style="stop-color:var(--accent);stop-opacity:0" /></radialGradient>
</defs>
<rect width="${w}" height="${h}" fill="url(#${p}sky)" />
${stars(w, h, 0.22)}
<circle cx="${n(w * 0.28)}" cy="${n(h * 0.66)}" r="${n(sr * 2.6)}" fill="url(#${p}sun)" />
<circle class="c-accent-l" cx="${n(w * 0.28)}" cy="${n(h * 0.66)}" r="${n(sr)}" opacity="0.92" />
${hill(w, h, h * 0.7, 26 * s, 3, 0, 'c-far-warm')}
<g transform="translate(${n(cx)} ${n(cy)}) scale(${n(s)})">
<circle cx="0" cy="-34" r="70" fill="url(#${p}win)" />
<rect x="22" y="-112" width="14" height="34" fill="#5b4126" />
<circle class="c-text" cx="30" cy="-126" r="7" opacity="0.25" /><circle class="c-text" cx="38" cy="-142" r="9" opacity="0.18" /><circle class="c-text" cx="30" cy="-160" r="11" opacity="0.12" />
<rect x="-44" y="-64" width="88" height="64" fill="#e8d8b8" />
<path d="M-56 -60 L0 -108 L56 -60 Z" fill="#7a3b2e" />
<rect class="c-accent-l" x="-30" y="-48" width="24" height="22" rx="2" />
<path d="M-18 -48 V-26 M-30 -37 H-6" stroke="#5b4126" stroke-width="2.5" />
<rect x="10" y="-40" width="22" height="40" rx="3" fill="#8a6338" />
</g>
${hill(w, h, h * 0.8, 22 * s, 3, 1, 'c-ground')}
${leaves.map(([x, y, a, c]) => `<ellipse class="${c}" cx="${n(x * w)}" cy="${n(y * h)}" rx="${n(7 * s)}" ry="${n(3.5 * s)}" transform="rotate(${a} ${n(x * w)} ${n(y * h)})" opacity="0.85" />`).join('')}`;
}

function neon(w: number, h: number, p: string): string {
  const hz = h * 0.62;
  const r = h * 0.2;
  const sx = w / 2;
  const sy = hz - r * 0.35;
  const towers: ReadonlyArray<[number, number]> = [
    [0.02, 0.12], [0.07, 0.2], [0.12, 0.09], [0.17, 0.16], [0.22, 0.24], [0.28, 0.11], [0.33, 0.18],
    [0.62, 0.15], [0.67, 0.22], [0.73, 0.1], [0.78, 0.19], [0.84, 0.13], [0.89, 0.25], [0.95, 0.14],
  ];
  const stripes = [0.1, 0.28, 0.44, 0.58, 0.7, 0.8, 0.88]
    .map((t, i) => `<rect x="${n(sx - r)}" y="${n(sy + r * t)}" width="${n(r * 2)}" height="${n(r * (0.03 + i * 0.012))}" fill="#000" />`)
    .join('');
  let grid = '';
  for (let k = 1; k <= 8; k++) {
    const y = hz + (h - hz) * (k / 8) ** 2;
    grid += `<line x1="0" y1="${n(y)}" x2="${w}" y2="${n(y)}" />`;
  }
  for (let k = -10; k <= 10; k++) {
    grid += `<line x1="${n(sx + k * w * 0.02)}" y1="${n(hz)}" x2="${n(sx + k * w * 0.14)}" y2="${h}" />`;
  }
  return `<defs>
<linearGradient id="${p}sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" style="stop-color:color-mix(in srgb, var(--bg) 60%, black)" /><stop offset="1" style="stop-color:color-mix(in srgb, var(--bg) 60%, var(--station))" /></linearGradient>
<linearGradient id="${p}sun" x1="0" y1="0" x2="0" y2="1"><stop offset="0" style="stop-color:color-mix(in srgb, var(--accent) 60%, white)" /><stop offset="1" style="stop-color:color-mix(in srgb, var(--accent) 45%, var(--station))" /></linearGradient>
<mask id="${p}stripes"><rect x="${n(sx - r)}" y="${n(sy - r)}" width="${n(r * 2)}" height="${n(r * 2)}" fill="#fff" />${stripes}</mask>
<clipPath id="${p}top"><rect width="${w}" height="${n(hz)}" /></clipPath>
</defs>
<rect width="${w}" height="${h}" fill="url(#${p}sky)" />
${stars(w, h, 0.45)}
<g clip-path="url(#${p}top)"><circle cx="${n(sx)}" cy="${n(sy)}" r="${n(r)}" fill="url(#${p}sun)" mask="url(#${p}stripes)" /></g>
${towers.map(([x, th], i) => `<rect class="c-ink" x="${n(x * w)}" y="${n(hz - th * h)}" width="${n(w * 0.045)}" height="${n(th * h)}" />${i % 2 ? `<rect class="c-accent" x="${n(x * w + w * 0.012)}" y="${n(hz - th * h + h * 0.03)}" width="${n(w * 0.008)}" height="${n(h * 0.012)}" opacity="0.7" />` : ''}`).join('')}
<rect class="c-bg-d" x="0" y="${n(hz)}" width="${w}" height="${n(h - hz)}" />
<g class="s-station" stroke-width="1.5" opacity="0.6">${grid}</g>
<line class="s-accent" x1="0" y1="${n(hz)}" x2="${w}" y2="${n(hz)}" stroke-width="3" opacity="0.9" />`;
}

function clean(w: number, h: number, p: string): string {
  const s = h / 640;
  const cloud = (x: number, y: number, k: number) =>
    `<g class="c-text" opacity="0.16" transform="translate(${n(x * w)} ${n(y * h)}) scale(${n(k * s)})"><circle cx="0" cy="0" r="26" /><circle cx="28" cy="-12" r="32" /><circle cx="60" cy="0" r="24" /><rect x="0" y="0" width="60" height="22" /></g>`;
  const bird = (x: number, y: number) =>
    `<path class="s-text" d="M${n(x * w)} ${n(y * h)} q6 -6 12 0 q6 -6 12 0" fill="none" stroke-width="2" opacity="0.55" />`;
  return `<defs>
<linearGradient id="${p}sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" style="stop-color:var(--bg)" /><stop offset="1" style="stop-color:color-mix(in srgb, var(--bg) 68%, white)" /></linearGradient>
<radialGradient id="${p}sun"><stop offset="0" style="stop-color:var(--accent);stop-opacity:0.45" /><stop offset="1" style="stop-color:var(--accent);stop-opacity:0" /></radialGradient>
</defs>
<rect width="${w}" height="${h}" fill="url(#${p}sky)" />
<circle cx="${n(w * 0.8)}" cy="${n(h * 0.18)}" r="${n(Math.min(w, h) * 0.2)}" fill="url(#${p}sun)" />
<circle class="c-accent-l" cx="${n(w * 0.8)}" cy="${n(h * 0.18)}" r="${n(Math.min(w, h) * 0.07)}" opacity="0.9" />
${cloud(0.12, 0.2, 1)}${cloud(0.5, 0.12, 0.8)}${cloud(0.62, 0.36, 1.1)}
${bird(0.32, 0.28)}${bird(0.38, 0.24)}
${hill(w, h, h * 0.72, 22 * s, 2, 0, 'c-far')}
${hill(w, h, h * 0.82, 16 * s, 2, 1, 'c-ground')}`;
}

/** Scenery for a mood, drawn at w by h. */
export function backdrop(mood: Mood, w: number, h: number, prefix: string): string {
  const p = safeId(prefix);
  const body = mood === 'spooky' ? spooky(w, h, p) : mood === 'cozy' ? cozy(w, h, p) : mood === 'neon' ? neon(w, h, p) : clean(w, h, p);
  return svg(w, h, 'backdrop', body);
}

/** String of pennants hanging across the top. */
function bunting(w: number, y: number, sag: number): string {
  const x0 = w * 0.08;
  const x2 = w * 0.92;
  const pt = (t: number) => {
    const x = (1 - t) ** 2 * x0 + 2 * (1 - t) * t * (w / 2) + t * t * x2;
    const yy = (1 - t) ** 2 * y + 2 * (1 - t) * t * (y + sag) + t * t * y;
    return [x, yy] as const;
  };
  let flags = '';
  for (let i = 0; i < 11; i++) {
    const [x, yy] = pt(0.06 + i * 0.088);
    flags += `<path class="${i % 2 ? 'c-station' : 'c-accent'}" d="M${n(x - 12)} ${n(yy)} L${n(x + 12)} ${n(yy)} L${n(x)} ${n(yy + 26)} Z" />`;
  }
  return `<path class="s-text" d="M${n(x0)} ${n(y)} Q${n(w / 2)} ${n(y + sag * 2)} ${n(x2)} ${n(y)}" fill="none" stroke-width="2" opacity="0.5" />${flags}`;
}

/* -------------------------------------------------------------- characters */

type Pose = 'point' | 'wave';

function ghost(p: string, pose: Pose): string {
  // A soft, tapering arm made of the same sheet as the body. Its wide base is drawn
  // first and tucked under the body, so it grows out of the ghost instead of sticking out.
  const arm =
    pose === 'point'
      ? 'M30 -4 C60 -14 80 -30 92 -50 C97 -58 110 -54 106 -44 C96 -22 76 2 36 22 Z'
      : 'M28 -12 C46 -26 54 -48 56 -68 C57 -80 72 -82 72 -70 C74 -42 66 -12 40 14 Z';
  return `<ellipse cx="0" cy="0" rx="52" ry="8" fill="#000" opacity="0.28" />
<g transform="translate(0 -110)">
<path d="${arm}" fill="url(#${p}ghost)" />
<path d="M-58 70 C-62 10 -48 -62 0 -66 C48 -62 62 10 58 70 Q48 58 38 72 Q28 86 18 70 Q8 56 -2 72 Q-12 88 -22 70 Q-32 56 -42 72 Q-50 82 -58 70 Z" fill="url(#${p}ghost)" />
<ellipse cx="-18" cy="-14" rx="8" ry="11" fill="#1a2332" /><ellipse cx="18" cy="-14" rx="8" ry="11" fill="#1a2332" />
<circle cx="-15" cy="-18" r="2.6" fill="#fff" /><circle cx="21" cy="-18" r="2.6" fill="#fff" />
<ellipse cx="0" cy="12" rx="7" ry="9" fill="#1a2332" />
<ellipse class="c-accent" cx="-34" cy="4" rx="7" ry="4" opacity="0.3" /><ellipse class="c-accent" cx="34" cy="4" rx="7" ry="4" opacity="0.3" />
</g>`;
}

function robot(pose: Pose): string {
  const arm = pose === 'point' ? ['M36 -96 L70 -130', 74, -134] : ['M36 -96 L52 -150', 54, -156];
  return `<ellipse cx="0" cy="0" rx="46" ry="7" fill="#000" opacity="0.28" />
<rect x="-24" y="-40" width="16" height="40" rx="4" fill="#6b7a89" /><rect x="8" y="-40" width="16" height="40" rx="4" fill="#6b7a89" />
<rect x="-48" y="-104" width="12" height="42" rx="6" fill="#6b7a89" />
<rect x="-36" y="-112" width="72" height="74" rx="12" fill="#9aa7b4" />
<rect class="c-ink" x="-20" y="-98" width="40" height="22" rx="4" />
<circle class="c-accent" cx="-9" cy="-87" r="4" /><circle class="c-station" cx="7" cy="-87" r="4" />
<path d="${arm[0]}" stroke="#9aa7b4" stroke-width="12" stroke-linecap="round" /><circle cx="${arm[1]}" cy="${arm[2]}" r="8" fill="#6b7a89" />
<line x1="0" y1="-162" x2="0" y2="-182" stroke="#6b7a89" stroke-width="3" /><circle class="c-accent" cx="0" cy="-186" r="6" />
<rect x="-30" y="-164" width="60" height="48" rx="12" fill="#9aa7b4" />
<rect class="c-station" x="-22" y="-152" width="44" height="18" rx="9" />
<circle cx="-8" cy="-143" r="3" fill="#fff" /><circle cx="10" cy="-143" r="3" fill="#fff" />`;
}

function explorer(pose: Pose): string {
  const arm = pose === 'point' ? ['M22 -112 L58 -146', 62, -150] : ['M22 -112 L36 -170', 38, -176];
  return `<ellipse cx="0" cy="0" rx="42" ry="7" fill="#000" opacity="0.28" />
<rect x="-18" y="-58" width="14" height="52" fill="#3c4a5c" /><rect x="4" y="-58" width="14" height="52" fill="#3c4a5c" />
<rect x="-21" y="-10" width="19" height="10" rx="3" fill="#5b4126" /><rect x="2" y="-10" width="19" height="10" rx="3" fill="#5b4126" />
<rect x="-42" y="-118" width="18" height="52" rx="6" fill="#8a6338" />
<rect x="-32" y="-116" width="12" height="44" rx="6" class="c-station-d" />
<rect class="c-station" x="-26" y="-124" width="52" height="70" rx="14" />
<rect x="-26" y="-62" width="52" height="6" fill="#5b4126" />
<path d="${arm[0]}" class="s-station" stroke-width="12" stroke-linecap="round" /><circle cx="${arm[1]}" cy="${arm[2]}" r="7" fill="#f1c9a5" />
<circle cx="0" cy="-146" r="22" fill="#f1c9a5" />
<circle cx="9" cy="-148" r="2.6" fill="#222" /><path d="M2 -137 Q8 -133 14 -138" fill="none" stroke="#222" stroke-width="2" stroke-linecap="round" />
<ellipse cx="0" cy="-160" rx="34" ry="6" fill="#8a5a2b" />
<path d="M-18 -160 Q-16 -188 0 -188 Q16 -188 18 -160 Z" fill="#8a5a2b" />
<rect class="c-accent" x="-18" y="-167" width="36" height="5" />`;
}

function avatarBody(kind: Avatar, p: string, pose: Pose): string {
  return kind === 'ghost' ? ghost(p, pose) : kind === 'robot' ? robot(pose) : explorer(pose);
}

/* ------------------------------------------------------------------- props */

function propBody(kind: Prop, p: string): string {
  const shadow = (rx: number) => `<ellipse cx="0" cy="0" rx="${rx}" ry="6" fill="#000" opacity="0.26" />`;
  switch (kind) {
    case 'lamp':
      return `${shadow(22)}<circle cx="0" cy="-130" r="62" fill="url(#${p}lamp)" />
<rect x="-4" y="-120" width="8" height="120" fill="#4a3520" /><rect x="-14" y="-8" width="28" height="8" rx="2" fill="#4a3520" />
<rect x="-16" y="-156" width="32" height="7" rx="2" fill="#3b2a17" />
<path d="M-12 -149 H12 L15 -118 H-15 Z" fill="#ffd27a" /><path d="M0 -142 C5 -136 5 -128 0 -124 C-5 -128 -5 -136 0 -142 Z" fill="#fff6dc" />
<rect x="-18" y="-120" width="36" height="6" rx="2" fill="#3b2a17" />`;
    case 'banner':
      return `${shadow(16)}<rect x="-3" y="-150" width="6" height="150" fill="#4a3520" /><circle class="c-accent" cx="0" cy="-154" r="5" />
<path class="c-accent" d="M3 -146 C28 -140 46 -148 70 -138 L50 -120 L70 -102 C46 -112 28 -104 3 -110 Z" />`;
    case 'sign':
      return `${shadow(22)}<rect x="-5" y="-100" width="10" height="100" fill="#5b4126" />
<path d="M-58 -116 H40 L58 -100 L40 -84 H-58 Z" fill="#8a6338" stroke="#5b4126" stroke-width="3" />
<path d="M-44 -104 H22 M-44 -95 H6" stroke="#f4e7cc" stroke-width="3" stroke-linecap="round" opacity="0.6" />`;
    case 'plant':
      return `${shadow(26)}<path class="c-accent-d" d="M-22 -34 H22 L16 0 H-16 Z" /><rect class="c-accent" x="-26" y="-40" width="52" height="8" rx="3" />
<circle cx="0" cy="-74" r="26" fill="#3f9a5b" /><circle cx="-22" cy="-58" r="18" fill="#4caf6a" /><circle cx="22" cy="-58" r="18" fill="#4caf6a" />
<circle cx="-6" cy="-84" r="8" fill="#6fcf8a" opacity="0.6" />`;
    case 'crate':
      return `${shadow(36)}<rect x="-32" y="-62" width="64" height="62" fill="#a07a4a" stroke="#6e5232" stroke-width="4" />
<path d="M-32 -62 L32 0 M-32 -31 H32" stroke="#6e5232" stroke-width="3" />`;
    case 'bookshelf':
      return `${shadow(46)}<rect x="-42" y="-96" width="84" height="96" rx="3" fill="#6e5232" />
<rect x="-36" y="-90" width="72" height="38" fill="#3b2a17" /><rect x="-36" y="-46" width="72" height="38" fill="#3b2a17" />
<rect class="c-accent" x="-34" y="-86" width="9" height="34" /><rect class="c-station" x="-23" y="-82" width="8" height="30" />
<rect x="-13" y="-86" width="10" height="34" fill="#c0504d" /><rect x="-1" y="-80" width="8" height="28" fill="#e8d8a8" />
<rect class="c-station" x="10" y="-86" width="9" height="34" /><rect x="22" y="-84" width="10" height="32" fill="#c0504d" transform="rotate(8 27 -52)" />
<rect x="-34" y="-42" width="10" height="34" fill="#e8d8a8" /><rect class="c-accent" x="-22" y="-40" width="8" height="32" />
<rect class="c-station" x="-12" y="-42" width="10" height="34" /><rect x="0" y="-38" width="9" height="30" fill="#c0504d" />
<rect class="c-accent" x="12" y="-42" width="10" height="34" />`;
  }
}

/* ------------------------------------------------------------- composition */

function groundDefs(p: string): string {
  return `<defs>
<linearGradient id="${p}ghost" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffffff" /><stop offset="0.7" stop-color="#e6ecf3" /><stop offset="1" stop-color="#c9d4e2" stop-opacity="0.85" /></linearGradient>
<radialGradient id="${p}lamp"><stop offset="0" style="stop-color:var(--accent);stop-opacity:0.6" /><stop offset="0.45" style="stop-color:var(--accent);stop-opacity:0.18" /><stop offset="1" style="stop-color:var(--accent);stop-opacity:0" /></radialGradient>
</defs>`;
}

interface Placed {
  x: number;
  scale: number;
  flip?: boolean;
  body: string;
}

function ground(w: number, items: Placed[], p: string): string {
  const base = 226;
  const body = items
    .map((it) => `<g transform="translate(${n(it.x)} ${base}) scale(${it.flip ? -it.scale : it.scale} ${it.scale})">${it.body}</g>`)
    .join('');
  return svg(w, 240, 'ground', groundDefs(p) + body);
}

/** Pick `count` props for a page, rotating through the theme's props by slide index. */
export function propsFor(props: readonly Prop[], index: number, count: number): Prop[] {
  if (!props.length) return [];
  const out: Prop[] = [];
  for (let i = 0; i < Math.min(count, props.length); i++) out.push(props[(index + i) % props.length]);
  return out;
}

/** Cover for the title scene: wide scenery, bunting when the theme has a banner, the avatar waving. */
export function coverArt(art: ArtTheme, prefix: string): Drawing {
  const p = safeId(prefix);
  const sceneBunting = art.props.includes('banner') ? bunting(1200, 54, 42) : '';
  const back = backdrop(art.mood, 1200, 640, prefix).replace('</svg>', `${sceneBunting}</svg>`);
  const props = art.props.filter((x) => x !== 'banner').slice(0, 3);
  const slots = [1010, 1120, 300];
  const items: Placed[] = [{ x: 860, scale: 1, body: avatarBody(art.avatar, p, 'wave') }];
  props.forEach((k, i) => items.push({ x: slots[i], scale: 0.95, body: propBody(k, p) }));
  return { backdrop: back, ground: ground(1200, items, p) };
}

/** Left-hand page of a spread: scenery, and the avatar pointing up at the framed picture. */
export function pageArt(art: ArtTheme, index: number, prefix: string): Drawing {
  const p = safeId(prefix);
  const items: Placed[] = [{ x: 112, scale: 0.92, body: avatarBody(art.avatar, p, 'point') }];
  propsFor(art.props, index, 2).forEach((k, i) => items.push({ x: [450, 540][i], scale: 0.82, body: propBody(k, p) }));
  return { backdrop: backdrop(art.mood, 600, 640, prefix), ground: ground(600, items, p) };
}

/** Closing page for the outro: wide scenery, the avatar waving goodbye among the props. */
export function endArt(art: ArtTheme, prefix: string): Drawing {
  const p = safeId(prefix);
  const items: Placed[] = [{ x: 600, scale: 1.05, body: avatarBody(art.avatar, p, 'wave') }];
  art.props.slice(0, 4).forEach((k, i) => items.push({ x: [230, 370, 840, 980][i], scale: 0.92, flip: i < 2, body: propBody(k, p) }));
  return { backdrop: backdrop(art.mood, 1200, 640, prefix), ground: ground(1200, items, p) };
}

import type { Scene, Storyboard } from '../../../skeleton/src/types';

export type SlideKind = Scene['type'];

export interface Hotspot {
  /** One-based, as shown on the marker. */
  number: number;
  /** 0 to 1 across the image, from the left. */
  x: number;
  /** 0 to 1 down the image, from the top. */
  y: number;
  label: string;
}

export interface CodeLine {
  /** One-based line number. */
  number: number;
  text: string;
  highlighted: boolean;
}

/** Everything the renderer needs for one slide. All decisions about content live here, so they can be tested without a DOM. */
export interface SlideModel {
  index: number;
  kind: SlideKind;
  heading: string;
  subheading?: string;
  /** Main image (feature and callout). */
  image?: { src: string; alt: string };
  /** Dimmed full-slide background (title background, outro visual). */
  background?: string;
  hotspots: Hotspot[];
  code?: { language: string; lines: CodeLine[] };
  narration?: string;
  link?: { href: string; text: string };
}

/** Return the URL only when it is an absolute http or https URL, otherwise undefined. */
export function safeHttpUrl(value: unknown): string | undefined {
  if (typeof value !== 'string') return undefined;
  try {
    const url = new URL(value);
    return url.protocol === 'http:' || url.protocol === 'https:' ? url.href : undefined;
  } catch {
    return undefined;
  }
}

function codeLines(snippet: string, highlight: number[] | undefined): CodeLine[] {
  const marked = new Set(highlight ?? []);
  return snippet
    .replace(/\n$/, '')
    .split('\n')
    .map((text, i) => ({ number: i + 1, text, highlighted: marked.has(i + 1) }));
}

/** One slide per scene, in storyboard order. */
export function buildSlides(storyboard: Storyboard): SlideModel[] {
  const projectLink = safeHttpUrl(storyboard.project.repository) ?? safeHttpUrl(storyboard.project.website);
  return storyboard.scenes.map((scene, index): SlideModel => {
    const base = { index, kind: scene.type, hotspots: [] as Hotspot[] };
    switch (scene.type) {
      case 'title':
        return {
          ...base,
          heading: scene.title,
          subheading: scene.tagline ?? storyboard.project.description,
          background: scene.background,
        };
      case 'feature':
        return {
          ...base,
          heading: scene.caption,
          image: { src: scene.visual, alt: scene.caption },
          narration: scene.narration,
        };
      case 'callout':
        return {
          ...base,
          heading: scene.caption,
          image: { src: scene.visual, alt: scene.caption },
          hotspots: scene.callouts.map((c, i) => ({ number: i + 1, x: c.x, y: c.y, label: c.label })),
          narration: scene.narration,
        };
      case 'code':
        return {
          ...base,
          heading: scene.caption,
          code: { language: scene.code.language, lines: codeLines(scene.code.snippet, scene.code.highlight_lines) },
          narration: scene.narration,
        };
      case 'outro':
        return {
          ...base,
          heading: scene.caption,
          background: scene.visual,
          narration: scene.narration,
          link: projectLink ? { href: projectLink, text: projectLink.replace(/^https?:\/\//, '').replace(/\/$/, '') } : undefined,
        };
    }
  });
}

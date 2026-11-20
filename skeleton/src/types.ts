export type Mood = 'cozy' | 'neon' | 'spooky' | 'clean';
export type Avatar = 'explorer' | 'robot' | 'ghost';
export type Prop = 'plant' | 'lamp' | 'crate' | 'sign' | 'bookshelf' | 'banner';

export interface Theme {
  palette?: {
    background?: string;
    ground?: string;
    accent?: string;
    text?: string;
    station?: string;
  };
  mood?: Mood;
  avatar?: Avatar;
  props?: Prop[];
}

export interface Callout {
  /** 0 is the left edge of the capture, 1 is the right edge. */
  x: number;
  /** 0 is the top edge of the capture, 1 is the bottom edge. */
  y: number;
  label: string;
}

export interface TitleScene {
  type: 'title';
  title: string;
  tagline?: string;
  background?: string;
}

export interface FeatureScene {
  type: 'feature';
  visual: string;
  caption: string;
  narration?: string;
}

export interface CalloutScene {
  type: 'callout';
  visual: string;
  caption: string;
  narration?: string;
  callouts: Callout[];
}

export interface CodeScene {
  type: 'code';
  caption: string;
  narration?: string;
  code: { language: string; snippet: string; highlight_lines?: number[] };
}

export interface OutroScene {
  type: 'outro';
  caption: string;
  narration?: string;
  visual?: string;
}

export type Scene = TitleScene | FeatureScene | CalloutScene | CodeScene | OutroScene;

export interface Storyboard {
  version: '1.0';
  project: {
    name: string;
    description: string;
    repository?: string;
    website?: string;
  };
  theme?: Theme;
  metadata?: { target_audience?: string; created?: string };
  scenes: Scene[];
}

/** One validation problem. `scene` is one-based and present when the problem is inside a scene. */
export interface Issue {
  scene?: number;
  path: string;
  message: string;
}

export type ValidationResult = { ok: true; storyboard: Storyboard } | { ok: false; errors: Issue[] };

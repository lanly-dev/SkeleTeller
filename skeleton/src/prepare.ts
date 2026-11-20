import fs from 'node:fs';
import path from 'node:path';
import { loadStoryboard } from './load';
import type { Issue, Storyboard } from './types';

export interface PrepareOptions {
  /** Path to the storyboard file. */
  storyboard: string;
  /** Where to write the parsed storyboard as JSON. */
  outJson: string;
  /** Folder to copy assets into, keeping their paths relative to the storyboard. */
  outAssets: string;
}

export type PrepareResult = { ok: true; scenes: number } | { ok: false; errors: Issue[] };

/** Every distinct asset path a storyboard references, in scene order. */
function assetPaths(sb: Storyboard): string[] {
  const found = new Set<string>();
  for (const scene of sb.scenes) {
    if ('visual' in scene && scene.visual) found.add(scene.visual);
    if (scene.type === 'title' && scene.background) found.add(scene.background);
  }
  return [...found];
}

/**
 * Load and validate a storyboard with the shared loader, write it as JSON and copy its assets.
 * Nothing is written when validation fails, and files copied by a run that fails midway are removed. Never throws for bad storyboard input.
 */
export function prepareStoryboard(opts: PrepareOptions): PrepareResult {
  const result = loadStoryboard(opts.storyboard);
  if (!result.ok) return result;

  const baseDir = path.dirname(path.resolve(opts.storyboard));
  const outAssets = path.resolve(opts.outAssets);
  const copied: string[] = [];
  try {
    for (const asset of assetPaths(result.storyboard)) {
      const target = path.resolve(outAssets, asset);
      fs.mkdirSync(path.dirname(target), { recursive: true });
      fs.copyFileSync(path.resolve(baseDir, asset), target);
      copied.push(target);
    }
    fs.mkdirSync(path.dirname(path.resolve(opts.outJson)), { recursive: true });
    fs.writeFileSync(opts.outJson, JSON.stringify(result.storyboard, null, 2) + '\n');
  } catch (e) {
    // Remove what this run copied so a failure leaves no half-filled output.
    for (const file of copied) fs.rmSync(file, { force: true });
    const reason = e instanceof Error ? e.message : 'unknown error';
    return { ok: false, errors: [{ path: '', message: `cannot write prepared output: ${reason}` }] };
  }
  return { ok: true, scenes: result.storyboard.scenes.length };
}

import fs from 'node:fs';
import path from 'node:path';
import yaml from 'js-yaml';
import { checkAssets } from './assets';
import type { Issue, Storyboard } from './types';
import { validateStoryboard } from './validate';

export type LoadResult = { ok: true; storyboard: Storyboard } | { ok: false; errors: Issue[] };

/** Read a storyboard file, validate it, and check its assets. Never throws for bad input. */
export function loadStoryboard(file: string): LoadResult {
  let text: string;
  try {
    text = fs.readFileSync(file, 'utf8');
  } catch {
    return { ok: false, errors: [{ path: '', message: `cannot read storyboard file "${file}"` }] };
  }

  let data: unknown;
  try {
    data = yaml.load(text);
  } catch (e) {
    const reason = e instanceof Error ? e.message.split('\n')[0] : 'invalid YAML';
    return { ok: false, errors: [{ path: '', message: `YAML error: ${reason}` }] };
  }

  const result = validateStoryboard(data);
  if (!result.ok) return result;

  const assetIssues = checkAssets(result.storyboard, path.dirname(path.resolve(file)));
  return assetIssues.length ? { ok: false, errors: assetIssues } : result;
}

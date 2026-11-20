import fs from 'node:fs';
import path from 'node:path';
import type { Issue, Storyboard } from './types';

const URL_SCHEME = /^[a-z][a-z0-9+.-]*:/i;

function isAbsolute(p: string): boolean {
  return path.posix.isAbsolute(p) || path.win32.isAbsolute(p);
}

/** Why an asset path is not acceptable, or undefined when it resolves to a real file inside baseDir. */
function problem(assetPath: string, baseDir: string): string | undefined {
  if (isAbsolute(assetPath)) return 'must be a relative path, not an absolute one';
  if (URL_SCHEME.test(assetPath)) return 'must be a file path, not a URL';
  const resolved = path.resolve(baseDir, assetPath);
  const rel = path.relative(path.resolve(baseDir), resolved);
  if (rel.startsWith('..') || path.isAbsolute(rel)) return 'must stay inside the storyboard folder';
  let stat: fs.Stats;
  try {
    stat = fs.statSync(resolved);
  } catch {
    return 'file not found';
  }
  return stat.isFile() ? undefined : 'is not a file';
}

/** Check every `visual` and `background` path of a validated storyboard against the folder it lives in. */
export function checkAssets(sb: Storyboard, baseDir: string): Issue[] {
  const issues: Issue[] = [];
  sb.scenes.forEach((scene, i) => {
    const fields: Array<[string, string | undefined]> = [
      ['visual', 'visual' in scene ? scene.visual : undefined],
      ['background', scene.type === 'title' ? scene.background : undefined],
    ];
    for (const [field, value] of fields) {
      if (value === undefined) continue;
      const why = problem(value, baseDir);
      if (why) issues.push({ scene: i + 1, path: field, message: `${JSON.stringify(value)} ${why}` });
    }
  });
  return issues;
}

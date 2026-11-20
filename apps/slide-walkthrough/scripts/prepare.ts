import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { prepareStoryboard } from '../../../skeleton/src/prepare';

const appDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const repoRoot = path.resolve(appDir, '../..');
const DEFAULT_STORYBOARD = path.join(repoRoot, 'demo/storyboard.yml');

/** Explicit argument (relative to the current folder), else demo/storyboard.yml. No fallback. */
function pickStoryboard(arg: string | undefined): string {
  if (arg) return path.resolve(arg);
  if (!fs.existsSync(DEFAULT_STORYBOARD)) {
    console.error(`No storyboard found at ${path.relative(repoRoot, DEFAULT_STORYBOARD)}. Pass a storyboard path as the first argument.`);
    process.exit(1);
  }
  return DEFAULT_STORYBOARD;
}

// npm runs a workspace's `prepare` script during `npm install` and `npm ci`. Do nothing then,
// since a storyboard is only needed for dev and build, which run this script explicitly.
if (['install', 'ci'].includes(process.env.npm_command ?? '')) {
  console.log('Skipping slide-walkthrough prepare during npm install.');
  process.exit(0);
}

const storyboard = pickStoryboard(process.argv[2]);
const shown = path.relative(repoRoot, storyboard);

// Clear the output of any earlier storyboard so its assets do not linger in the build.
const publicDir = path.join(appDir, 'public');
fs.rmSync(publicDir, { recursive: true, force: true });
fs.rmSync(path.join(appDir, 'src/generated'), { recursive: true, force: true });

const result = prepareStoryboard({
  storyboard,
  outJson: path.join(appDir, 'src/generated/storyboard.json'),
  outAssets: publicDir,
});

if (result.ok) {
  console.log(`Prepared ${shown}: ${result.scenes} scene${result.scenes === 1 ? '' : 's'}`);
} else {
  console.error(`Prepare failed for ${shown}:`);
  for (const issue of result.errors) {
    const where = [issue.scene ? `scene ${issue.scene}` : '', issue.path].filter(Boolean).join(', ');
    console.error(where ? `  ${where}: ${issue.message}` : `  ${issue.message}`);
  }
  process.exit(1);
}

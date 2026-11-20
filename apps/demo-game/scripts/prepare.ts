import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { prepareStoryboard } from '../../../skeleton/src/prepare';

const appDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const repoRoot = path.resolve(appDir, '../..');
const DEFAULT_STORYBOARD = path.join(repoRoot, 'demo/storyboard.yml');
const SAMPLE_STORYBOARD = path.join(repoRoot, 'skeleton/examples/sample-project.yml');

/** Explicit argument, else demo/storyboard.yml, else the sample when the demo folder has not been written yet. */
function pickStoryboard(arg: string | undefined): string {
  if (arg) return path.resolve(arg);
  return fs.existsSync(DEFAULT_STORYBOARD) ? DEFAULT_STORYBOARD : SAMPLE_STORYBOARD;
}

const storyboard = pickStoryboard(process.argv[2]);
const shown = path.relative(repoRoot, storyboard);
const result = prepareStoryboard({
  storyboard,
  outJson: path.join(appDir, 'src/generated/storyboard.json'),
  outAssets: path.join(appDir, 'public'),
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

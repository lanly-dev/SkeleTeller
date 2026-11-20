import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { loadStoryboard } from './load';
import type { Issue } from './types';

/** Storyboards checked when no file is given, relative to the current folder. */
export const DEFAULT_TARGETS = ['skeleton/examples/sample-project.yml', 'demo/storyboard.yml'];

function format(issue: Issue): string {
  const where = [issue.scene ? `scene ${issue.scene}` : '', issue.path].filter(Boolean).join(', ');
  return where ? `  ${where}: ${issue.message}` : `  ${issue.message}`;
}

/** Validate one file and print the result. Returns true when it is valid. */
export function report(file: string, log: (line: string) => void = console.log): boolean {
  const shown = path.relative(process.cwd(), path.resolve(file)) || file;
  const result = loadStoryboard(file);
  if (result.ok) {
    const sb = result.storyboard;
    log(`OK    ${shown}: "${sb.project.name}", ${sb.scenes.length} scene${sb.scenes.length === 1 ? '' : 's'}`);
    return true;
  }
  log(`FAIL  ${shown}: ${result.errors.length} problem${result.errors.length === 1 ? '' : 's'}`);
  for (const issue of result.errors) log(format(issue));
  return false;
}

export function main(args: string[]): number {
  const explicit = args.filter((a) => !a.startsWith('-'));
  const files = explicit.length ? explicit : DEFAULT_TARGETS.filter((f) => fs.existsSync(f));
  if (!files.length) {
    console.log('No storyboard found. Pass a path, for example: npm run validate -- demo/storyboard.yml');
    return 1;
  }
  let ok = true;
  for (const file of files) ok = report(file) && ok;
  return ok ? 0 : 1;
}

const isEntry = !!process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (isEntry) process.exit(main(process.argv.slice(2)));

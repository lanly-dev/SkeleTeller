import type { Storyboard } from '../../../skeleton/src/types';

// The prepare step writes this file before dev and build. It is gitignored, so a fresh
// checkout does not have it. import.meta.glob keeps the typecheck independent of it,
// while Vite still bundles the JSON into the build.
const found = import.meta.glob<Storyboard>('./generated/storyboard.json', { eager: true, import: 'default' });
const loaded = Object.values(found)[0];

if (!loaded) {
  throw new Error('No prepared storyboard. Run "npm run dev" or "npm run build" in apps/demo-game, which prepare it first.');
}

/** The validated storyboard written by scripts/prepare.ts. */
export const storyboard: Storyboard = loaded;

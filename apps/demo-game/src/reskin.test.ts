import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { loadStoryboard } from '../../../skeleton/src/load';
import { resolveTheme } from './theme';
import { layoutWorld } from './world';

const examples = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../../skeleton/examples');

function load(name: string) {
  const r = loadStoryboard(path.join(examples, name));
  if (!r.ok) throw new Error(`${name} failed validation: ${JSON.stringify(r.errors)}`);
  return r.storyboard;
}

// T10: two storyboards that differ only in their theme give the same world in a different look.
describe('reskin by storyboard data alone', () => {
  const clean = load('sample-project.yml');
  const spooky = load('sample-spooky.yml');

  it('both example storyboards validate with their assets', () => {
    expect(clean.scenes.length).toBe(spooky.scenes.length);
  });

  it('lays out the same areas, because the scenes are the same', () => {
    expect(layoutWorld(spooky)).toEqual(layoutWorld(clean));
  });

  it('resolves to a different look in every themed field', () => {
    const a = resolveTheme(clean.theme);
    const b = resolveTheme(spooky.theme);
    expect(b.mood).not.toBe(a.mood);
    expect(b.avatar).not.toBe(a.avatar);
    expect(b.props).not.toEqual(a.props);
    for (const key of Object.keys(a.palette) as Array<keyof typeof a.palette>) {
      expect(b.palette[key]).not.toBe(a.palette[key]);
    }
  });
});

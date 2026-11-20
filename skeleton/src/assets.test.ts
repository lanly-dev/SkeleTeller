import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { checkAssets } from './assets';
import { loadStoryboard } from './load';
import type { Storyboard } from './types';

let dir: string;

beforeAll(() => {
  dir = fs.mkdtempSync(path.join(os.tmpdir(), 'skeleteller-'));
  fs.mkdirSync(path.join(dir, 'assets'));
  fs.writeFileSync(path.join(dir, 'assets', 'ok.png'), 'x');
  fs.mkdirSync(path.join(dir, 'assets', 'folder'));
  fs.writeFileSync(path.join(path.dirname(dir), 'outside.png'), 'x');
});

afterAll(() => {
  fs.rmSync(dir, { recursive: true, force: true });
  fs.rmSync(path.join(path.dirname(dir), 'outside.png'), { force: true });
});

function sbWith(visual: string, extra: Partial<Storyboard> = {}): Storyboard {
  return {
    version: '1.0',
    project: { name: 'Demo', description: 'd' },
    scenes: [{ type: 'feature', visual, caption: 'c' }],
    ...extra,
  };
}

describe('checkAssets', () => {
  it('accepts a file that exists', () => {
    expect(checkAssets(sbWith('assets/ok.png'), dir)).toEqual([]);
  });

  it('reports a missing file with the scene number', () => {
    const issues = checkAssets(sbWith('assets/missing.png'), dir);
    expect(issues).toHaveLength(1);
    expect(issues[0]).toMatchObject({ scene: 1, path: 'visual' });
    expect(issues[0].message).toMatch(/file not found/);
  });

  it('rejects a path that escapes the folder', () => {
    const issues = checkAssets(sbWith('../outside.png'), dir);
    expect(issues[0].message).toMatch(/inside the storyboard folder/);
  });

  it('rejects an absolute path (posix and windows)', () => {
    expect(checkAssets(sbWith('/etc/passwd'), dir)[0].message).toMatch(/absolute/);
    expect(checkAssets(sbWith('C:\\data\\a.png'), dir)[0].message).toMatch(/absolute/);
    expect(checkAssets(sbWith('C:/data/a.png'), dir)[0].message).toMatch(/absolute/);
  });

  it('rejects a URL', () => {
    expect(checkAssets(sbWith('https://example.com/a.png'), dir)[0].message).toMatch(/not a URL/);
  });

  it('rejects a directory', () => {
    expect(checkAssets(sbWith('assets/folder'), dir)[0].message).toMatch(/not a file/);
  });

  it('checks the title background', () => {
    const sb: Storyboard = {
      version: '1.0',
      project: { name: 'Demo', description: 'd' },
      scenes: [{ type: 'title', title: 'T', background: 'assets/none.png' }],
    };
    expect(checkAssets(sb, dir)[0]).toMatchObject({ scene: 1, path: 'background' });
  });
});

describe('loadStoryboard', () => {
  it('loads a valid storyboard with its assets', () => {
    const file = path.join(dir, 'good.yml');
    fs.writeFileSync(
      file,
      'version: "1.0"\nproject: {name: D, description: d}\nscenes:\n  - {type: feature, visual: assets/ok.png, caption: c}\n',
    );
    expect(loadStoryboard(file).ok).toBe(true);
  });

  it('fails on a missing asset', () => {
    const file = path.join(dir, 'missing.yml');
    fs.writeFileSync(
      file,
      'version: "1.0"\nproject: {name: D, description: d}\nscenes:\n  - {type: feature, visual: assets/gone.png, caption: c}\n',
    );
    const r = loadStoryboard(file);
    expect(r.ok).toBe(false);
  });

  it('reports schema errors before checking assets', () => {
    const file = path.join(dir, 'bad.yml');
    fs.writeFileSync(file, 'version: "1.0"\nproject: {name: D}\nscenes: []\n');
    const r = loadStoryboard(file);
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.errors.length).toBeGreaterThanOrEqual(2);
  });

  it('reports broken YAML without throwing', () => {
    const file = path.join(dir, 'broken.yml');
    fs.writeFileSync(file, 'a: [unclosed\n');
    const r = loadStoryboard(file);
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.errors[0].message).toMatch(/YAML/);
  });

  it('reports an unreadable file without throwing', () => {
    const r = loadStoryboard(path.join(dir, 'nope.yml'));
    expect(r.ok).toBe(false);
  });

  it('loads the checked-in sample with its assets', () => {
    const r = loadStoryboard(path.resolve(__dirname, '../examples/sample-project.yml'));
    expect(r.ok).toBe(true);
  });
});

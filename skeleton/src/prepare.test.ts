import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { prepareStoryboard } from './prepare';

const SAMPLE = 'skeleton/examples/sample-project.yml';
let tmp: string;

beforeEach(() => {
  tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'skeleteller-prepare-'));
});
afterEach(() => {
  fs.rmSync(tmp, { recursive: true, force: true });
});

function opts(storyboard: string) {
  return { storyboard, outJson: path.join(tmp, 'out/generated/storyboard.json'), outAssets: path.join(tmp, 'out/assets') };
}

describe('prepareStoryboard', () => {
  it('writes the parsed storyboard as JSON', () => {
    const o = opts(SAMPLE);
    const result = prepareStoryboard(o);
    expect(result).toEqual({ ok: true, scenes: 7 });
    const json = JSON.parse(fs.readFileSync(o.outJson, 'utf8'));
    expect(json.project.name).toBe('TaskFlow');
    expect(json.scenes).toHaveLength(7);
  });

  it('copies assets keeping relative paths', () => {
    const o = opts(SAMPLE);
    prepareStoryboard(o);
    for (const name of ['title-bg', 'dashboard', 'quick-add', 'task-detail', 'github-integration', 'outro-bg']) {
      const copy = path.join(o.outAssets, 'assets', `${name}.png`);
      expect(fs.readFileSync(copy).equals(fs.readFileSync(`skeleton/examples/assets/${name}.png`))).toBe(true);
    }
  });

  it('returns issues and writes nothing when an asset is missing', () => {
    const file = path.join(tmp, 'sb.yml');
    fs.writeFileSync(
      file,
      'version: "1.0"\nproject: { name: X, description: Y }\nscenes:\n  - { type: feature, visual: assets/nope.png, caption: Hi }\n',
    );
    const o = opts(file);
    const result = prepareStoryboard(o);
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.errors[0]).toMatchObject({ scene: 1, path: 'visual' });
    expect(fs.existsSync(o.outJson)).toBe(false);
    expect(fs.existsSync(o.outAssets)).toBe(false);
  });

  it('returns issues when an asset path escapes the storyboard folder', () => {
    const dir = path.join(tmp, 'project');
    fs.mkdirSync(dir);
    fs.writeFileSync(path.join(tmp, 'secret.png'), 'x');
    const file = path.join(dir, 'sb.yml');
    fs.writeFileSync(
      file,
      'version: "1.0"\nproject: { name: X, description: Y }\nscenes:\n  - { type: feature, visual: ../secret.png, caption: Hi }\n',
    );
    const result = prepareStoryboard(opts(file));
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.errors[0].message).toContain('inside the storyboard folder');
  });

  it('removes copied assets and writes no JSON when a copy fails midway', () => {
    const dir = path.join(tmp, 'project');
    fs.mkdirSync(path.join(dir, 'assets'), { recursive: true });
    fs.writeFileSync(path.join(dir, 'assets/a.png'), 'a');
    fs.writeFileSync(path.join(dir, 'assets/b.png'), 'b');
    const file = path.join(dir, 'sb.yml');
    fs.writeFileSync(
      file,
      'version: "1.0"\nproject: { name: X, description: Y }\nscenes:\n  - { type: feature, visual: assets/a.png, caption: A }\n  - { type: feature, visual: assets/b.png, caption: B }\n',
    );
    const o = opts(file);
    // A directory where the second asset should land makes its copy fail.
    fs.mkdirSync(path.join(o.outAssets, 'assets/b.png'), { recursive: true });
    const result = prepareStoryboard(o);
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.errors[0].message).toContain('cannot write prepared output');
    expect(fs.existsSync(path.join(o.outAssets, 'assets/a.png'))).toBe(false);
    expect(fs.existsSync(o.outJson)).toBe(false);
  });

  it('returns issues for a missing storyboard file', () => {
    const result = prepareStoryboard(opts(path.join(tmp, 'absent.yml')));
    expect(result.ok).toBe(false);
  });
});

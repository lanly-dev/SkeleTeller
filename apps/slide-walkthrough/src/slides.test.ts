import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { loadStoryboard } from '../../../skeleton/src/load';
import type { Storyboard } from '../../../skeleton/src/types';
import { buildSlides, safeHttpUrl } from './slides';

const examples = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../../skeleton/examples');
function load(name: string): Storyboard {
  const r = loadStoryboard(path.join(examples, name));
  if (!r.ok) throw new Error(JSON.stringify(r.errors));
  return r.storyboard;
}
const sample = load('sample-project.yml');

describe('buildSlides', () => {
  const slides = buildSlides(sample);

  it('gives one slide per scene, in order', () => {
    expect(slides).toHaveLength(7);
    expect(slides.map((s) => s.kind)).toEqual(sample.scenes.map((s) => s.type));
    expect(slides.map((s) => s.index)).toEqual([0, 1, 2, 3, 4, 5, 6]);
  });

  it('follows a reordered storyboard', () => {
    const reordered = { ...sample, scenes: [...sample.scenes].reverse() };
    expect(buildSlides(reordered).map((s) => s.kind)).toEqual([...sample.scenes].reverse().map((s) => s.type));
  });

  it('uses the title and tagline on the title slide', () => {
    expect(slides[0]).toMatchObject({ heading: 'TaskFlow', subheading: 'Task management that fits your workflow', background: 'assets/title-bg.png' });
  });

  it('keeps callout coordinates and numbers hotspots from one', () => {
    const callout = slides.find((s) => s.kind === 'callout')!;
    expect(callout.hotspots).toEqual([
      { number: 1, x: 0.1, y: 0.17, label: 'Inline editing' },
      { number: 2, x: 0.27, y: 0.17, label: 'Subtasks' },
      { number: 3, x: 0.38, y: 0.17, label: 'Time tracking' },
    ]);
    expect(callout.image).toEqual({ src: 'assets/task-detail.png', alt: callout.heading });
  });

  it('flags highlighted code lines and keeps blank lines', () => {
    const code = slides.find((s) => s.kind === 'code')!.code!;
    expect(code.language).toBe('bash');
    expect(code.lines.filter((l) => l.highlighted).map((l) => l.number)).toEqual([2]);
    expect(code.lines[2]).toEqual({ number: 3, text: '', highlighted: false });
    expect(code.lines.at(-1)!.text).toBe('taskflow done 42');
  });

  it('links the outro to the repository', () => {
    expect(slides[6].link).toEqual({ href: 'https://github.com/example/taskflow', text: 'github.com/example/taskflow' });
  });

  it('drops a link that is not http or https', () => {
    const sb = { ...sample, project: { ...sample.project, repository: 'javascript:alert(1)', website: undefined } };
    expect(buildSlides(sb)[6].link).toBeUndefined();
  });

  it('falls back to the project description when the title has no tagline', () => {
    const sb: Storyboard = { ...sample, scenes: [{ type: 'title', title: 'Only' }] };
    expect(buildSlides(sb)[0].subheading).toBe(sample.project.description);
  });
});

describe('safeHttpUrl', () => {
  it('keeps only http and https', () => {
    expect(safeHttpUrl('https://example.com/a')).toBe('https://example.com/a');
    expect(safeHttpUrl('data:text/html,x')).toBeUndefined();
    expect(safeHttpUrl('not a url')).toBeUndefined();
    expect(safeHttpUrl(3)).toBeUndefined();
  });
});

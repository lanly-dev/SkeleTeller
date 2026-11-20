import fs from 'node:fs';
import path from 'node:path';
import yaml from 'js-yaml';
import { describe, expect, it } from 'vitest';
import { validateStoryboard } from './validate';

const SAMPLE = path.resolve(__dirname, '../examples/sample-project.yml');

/** A small valid storyboard that every negative case starts from. */
function base(): any {
  return {
    version: '1.0',
    project: { name: 'Demo', description: 'A demo project' },
    scenes: [
      { type: 'title', title: 'Demo' },
      { type: 'feature', visual: 'assets/a.png', caption: 'A feature' },
      {
        type: 'callout',
        visual: 'assets/b.png',
        caption: 'A callout',
        callouts: [{ x: 0.5, y: 0.5, label: 'Here' }],
      },
      { type: 'code', caption: 'Some code', code: { language: 'ts', snippet: 'a\nb\nc\n', highlight_lines: [2] } },
      { type: 'outro', caption: 'Bye' },
    ],
  };
}

function errorsOf(data: unknown) {
  const r = validateStoryboard(data);
  if (r.ok) throw new Error('expected validation to fail');
  return r.errors;
}

function messages(data: unknown): string {
  return errorsOf(data)
    .map((e) => `${e.scene ?? '-'}:${e.path}:${e.message}`)
    .join('\n');
}

describe('valid input', () => {
  it('accepts the minimal storyboard', () => {
    expect(validateStoryboard(base()).ok).toBe(true);
  });

  it('accepts the checked-in sample', () => {
    const data = yaml.load(fs.readFileSync(SAMPLE, 'utf8'));
    const r = validateStoryboard(data);
    expect(r.ok).toBe(true);
  });

  it('accepts a storyboard with no theme', () => {
    const sb = base();
    delete sb.theme;
    expect(validateStoryboard(sb).ok).toBe(true);
  });
});

describe('rejected input', () => {
  const cases: Array<[string, (sb: any) => void, RegExp]> = [
    ['unknown top-level key', (sb) => (sb.extra = 1), /unknown field "extra"/],
    ['wrong version', (sb) => (sb.version = '2.0'), /must be "1.0"/],
    ['misspelled scene key', (sb) => (sb.scenes[1].captoin = 'x'), /1?2?.*unknown field "captoin"/],
    ['field from another scene type', (sb) => (sb.scenes[0].code = {}), /unknown field "code"/],
    ['missing feature visual', (sb) => delete sb.scenes[1].visual, /missing required field "visual"/],
    ['missing feature caption', (sb) => delete sb.scenes[1].caption, /missing required field "caption"/],
    ['missing title text', (sb) => delete sb.scenes[0].title, /missing required field "title"/],
    ['missing code block', (sb) => delete sb.scenes[3].code, /missing required field "code"/],
    ['missing outro caption', (sb) => delete sb.scenes[4].caption, /missing required field "caption"/],
    ['callout scene without callouts', (sb) => delete sb.scenes[2].callouts, /missing required field "callouts"/],
    ['callout scene with empty callouts', (sb) => (sb.scenes[2].callouts = []), /at least 1 item/],
    ['callout x above 1', (sb) => (sb.scenes[2].callouts[0].x = 1.2), /maximum|<= 1/],
    ['callout y below 0', (sb) => (sb.scenes[2].callouts[0].y = -0.1), /minimum|>= 0/],
    ['unknown scene type', (sb) => (sb.scenes[1].type = 'video'), /unknown scene type "video"/],
    ['missing scene type', (sb) => delete sb.scenes[1].type, /needs a "type"/],
    ['zero scenes', (sb) => (sb.scenes = []), /at least 1 item/],
    ['too many scenes', (sb) => (sb.scenes = Array(21).fill({ type: 'outro', caption: 'x' })), /at most 20 item/],
    ['caption too long', (sb) => (sb.scenes[1].caption = 'x'.repeat(201)), /200/],
    ['removed duration field', (sb) => (sb.scenes[1].duration = 5), /"duration" is no longer used/],
    ['removed total_duration field', (sb) => (sb.metadata = { total_duration: 40 }), /"total_duration" is no longer used/],
    ['bad repository URL', (sb) => (sb.project.repository = 'not a url'), /.+/],
    ['javascript URL', (sb) => (sb.project.repository = 'javascript:alert(1)'), /.+/],
    ['file URL', (sb) => (sb.project.website = 'file:///etc/passwd'), /.+/],
    ['bad created date', (sb) => (sb.metadata = { created: 'last tuesday' }), /format|date/],
    ['bad palette color', (sb) => (sb.theme = { palette: { accent: 'orange' } }), /pattern|match/],
    ['unknown palette key', (sb) => (sb.theme = { palette: { sky: '#000000' } }), /unknown field "sky"/],
    ['unknown mood', (sb) => (sb.theme = { mood: 'festive' }), /must be "cozy"/],
    ['unknown avatar', (sb) => (sb.theme = { avatar: 'dragon' }), /must be "explorer"/],
    ['unknown prop', (sb) => (sb.theme = { props: ['rocket'] }), /must be "plant"/],
    ['nine props', (sb) => (sb.theme = { props: Array(9).fill('plant') }), /at most 8 item/],
    ['duplicate props', (sb) => (sb.theme = { props: ['plant', 'plant'] }), /.+/],
    ['unknown theme key', (sb) => (sb.theme = { weather: 'rain' }), /unknown field "weather"/],
    ['highlight line past the snippet', (sb) => (sb.scenes[3].code.highlight_lines = [9]), /line 9 is past the end/],
    ['highlight line zero', (sb) => (sb.scenes[3].code.highlight_lines = [0]), /.+/],
  ];

  it.each(cases)('%s', (_name, mutate, expected) => {
    const sb = base();
    mutate(sb);
    expect(messages(sb)).toMatch(expected);
  });

  it('numbers scenes from one', () => {
    const sb = base();
    delete sb.scenes[3].code;
    const errs = errorsOf(sb);
    expect(errs.some((e) => e.scene === 4 && e.path === 'code')).toBe(true);
  });

  it('rejects non-object input', () => {
    expect(validateStoryboard(null).ok).toBe(false);
    expect(validateStoryboard('text').ok).toBe(false);
    expect(validateStoryboard([]).ok).toBe(false);
  });

  it('reports every problem in one run', () => {
    const sb = base();
    sb.scenes[1].captoin = 'x';
    delete sb.scenes[2].callouts;
    sb.scenes[3].code.highlight_lines = [9];
    sb.project.repository = 'nope';
    const errs = errorsOf(sb);
    // The highlight line check only runs once the schema passes, so expect the three schema errors here.
    expect(errs.length).toBeGreaterThanOrEqual(3);
  });
});

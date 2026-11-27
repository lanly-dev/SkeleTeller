import { describe, expect, it } from 'vitest';
import { pageSpeech } from './readAloud';
import type { SlideModel } from './slides';

const base: SlideModel = { index: 2, kind: 'feature', heading: 'See the whole track', hotspots: [] };

describe('pageSpeech', () => {
  it('reads the chapter, heading and story text in order', () => {
    expect(pageSpeech({ ...base, chapter: 2, narration: 'It draws the full spectrogram.' })).toBe(
      'Chapter 2. See the whole track. It draws the full spectrogram.',
    );
  });

  it('reads the cover title and tagline', () => {
    expect(pageSpeech({ ...base, kind: 'title', heading: 'SpectreGram', subheading: 'Let the ghost judge' })).toBe(
      'SpectreGram. Let the ghost judge.',
    );
  });

  it('keeps existing end punctuation and skips empty parts', () => {
    expect(pageSpeech({ ...base, heading: 'Is it real?', narration: '  ' })).toBe('Is it real?');
  });
});

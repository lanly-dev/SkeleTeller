import type { SlideModel } from './slides';

/**
 * Read aloud with the browser's built-in speech synthesis. Nothing is sent over the
 * network by this code; where the browser has no speech synthesis, the control is
 * simply not shown.
 */

/** The words read for a page: its heading, then its story text. Pure, so it is tested. */
export function pageSpeech(slide: SlideModel): string {
  const parts = [slide.chapter ? `Chapter ${slide.chapter}.` : '', slide.heading, slide.subheading ?? '', slide.narration ?? ''];
  return parts
    .map((p) => p.trim())
    .filter(Boolean)
    .map((p) => (/[.!?…]$/.test(p) ? p : `${p}.`))
    .join(' ');
}

export function canSpeak(): boolean {
  return typeof window !== 'undefined' && 'speechSynthesis' in window && typeof SpeechSynthesisUtterance !== 'undefined';
}

let onStop: (() => void) | null = null;

/** Speak text, replacing anything already being read. `done` runs when it ends or is stopped. */
export function speak(text: string, lang: string, done: () => void): void {
  if (!canSpeak()) return;
  stopSpeaking();
  const u = new SpeechSynthesisUtterance(text);
  u.lang = lang;
  u.rate = 0.95;
  onStop = done;
  const finish = () => {
    if (onStop === done) onStop = null;
    done();
  };
  u.onend = finish;
  u.onerror = finish;
  window.speechSynthesis.speak(u);
}

export function stopSpeaking(): void {
  if (!canSpeak()) return;
  const cb = onStop;
  onStop = null;
  window.speechSynthesis.cancel();
  cb?.();
}

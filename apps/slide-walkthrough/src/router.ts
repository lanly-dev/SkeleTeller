/**
 * The current slide lives in the URL fragment as a one-based number, for example "#/4".
 * Pure helpers, so the edge cases can be tested without a browser.
 */

/** Zero-based slide index for a fragment. Missing, malformed or out-of-range fragments give 0. */
export function parseHash(hash: string, total: number): number {
  const m = /^#\/(\d{1,4})$/.exec(hash.trim());
  if (!m || total < 1) return 0;
  const n = Number(m[1]);
  return n >= 1 && n <= total ? n - 1 : 0;
}

/** Fragment for a zero-based index. */
export function formatHash(index: number): string {
  return `#/${index + 1}`;
}

/** Keep an index inside 0..total-1. */
export function clampIndex(index: number, total: number): number {
  if (total < 1 || !Number.isFinite(index)) return 0;
  return Math.max(0, Math.min(total - 1, Math.trunc(index)));
}

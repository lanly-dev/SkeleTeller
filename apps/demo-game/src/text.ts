/** Pure text helpers shared by the canvas drawing and the panel. No DOM access. */

/** Return the URL only when it is an absolute http or https URL, otherwise undefined. */
export function safeHttpUrl(value: unknown): string | undefined {
  if (typeof value !== 'string') return undefined;
  try {
    const url = new URL(value);
    return url.protocol === 'http:' || url.protocol === 'https:' ? url.href : undefined;
  } catch {
    return undefined;
  }
}

/**
 * Split text into lines no wider than maxWidth, using the given width function.
 * Words longer than a line are kept whole. At most maxLines lines are returned,
 * and the last one ends with an ellipsis when text was cut.
 */
export function wrapLines(
  text: string,
  maxWidth: number,
  measure: (s: string) => number,
  maxLines = Infinity,
): string[] {
  const words = text.split(/\s+/).filter(Boolean);
  const lines: string[] = [];
  let current = '';
  for (const word of words) {
    const next = current ? `${current} ${word}` : word;
    if (current && measure(next) > maxWidth) {
      lines.push(current);
      current = word;
    } else {
      current = next;
    }
  }
  if (current) lines.push(current);
  if (lines.length <= maxLines) return lines;
  const kept = lines.slice(0, maxLines);
  kept[maxLines - 1] = fitText(`${kept[maxLines - 1]} ${lines[maxLines]}`, maxWidth, measure);
  if (!kept[maxLines - 1].endsWith('…')) kept[maxLines - 1] = fitText(`${kept[maxLines - 1]}…`, maxWidth, measure);
  return kept;
}

/** Shorten text with an ellipsis until it fits maxWidth. */
export function fitText(text: string, maxWidth: number, measure: (s: string) => number): string {
  if (measure(text) <= maxWidth) return text;
  let lo = 0;
  let hi = text.length;
  while (lo < hi) {
    const mid = Math.ceil((lo + hi) / 2);
    if (measure(`${text.slice(0, mid).trimEnd()}…`) <= maxWidth) lo = mid;
    else hi = mid - 1;
  }
  return `${text.slice(0, lo).trimEnd()}…`;
}

# SkeleTeller Storybook (Slide Walkthrough) — Design (spec-first)

> Spec status: **Design**. Requirements live in `requirements.md`. Uses the same
> stack and build pattern as `demo-game`, so both apps share one contract and one
> prepare step. No framework, no CDN, no syntax highlighting library.

## Overview

At build time a prepare step validates the storyboard with the shared validator,
copies its assets, and writes the parsed storyboard as JSON. At runtime a small
TypeScript module renders the current slide into one DOM region and handles paging,
hotspots, narration and the URL fragment.

```
demo/storyboard.yml
   |  prepare: shared loadStoryboard, copy assets, write generated JSON
   v
src/generated/storyboard.json + public/assets/
   |  runtime
   v
slides(storyboard) -> SlideModel[]      pure, tested
router: fragment <-> index              pure, tested
render(slide) -> DOM                    text nodes only
```

## Locked stack

Vite and TypeScript (strict, no framework). Plain CSS with custom properties for
the theme. Vitest for the pure modules. Static build with a relative base.
Dependency versions pinned exactly, matching the root workspace.

## Shared prepare step

The game and the slides both need the same thing at build time: load and validate
the storyboard, copy its assets, write JSON. To avoid two copies, this lives in the
skeleton as `skeleton/src/prepare.ts`:

```ts
function prepareStoryboard(opts: {
  storyboard: string;   // path, default demo/storyboard.yml
  outJson: string;      // where to write the parsed storyboard
  outAssets: string;    // folder to copy assets into, keeping relative paths
}): { ok: true; scenes: number } | { ok: false; errors: Issue[] };
```

It calls `loadStoryboard`, which already checks containment and existence, then
copies each referenced asset. Each app's `scripts/prepare.ts` is a two-line wrapper
that passes its own output paths. This is a small change to the skeleton, owned by
the schema spec's area, and is listed as task T1 here. The demo game's prepare task
uses the same function.

## File structure (maps to tasks)

```
skeleton/src/prepare.ts         shared prepare (new)
apps/slide-walkthrough/
  scripts/prepare.ts            wrapper around prepareStoryboard
  src/main.ts                   boot, wiring
  src/slides.ts                 storyboard -> SlideModel[]        (pure)
  src/router.ts                 fragment parse and format         (pure)
  src/theme.ts                  palette -> CSS custom properties  (pure)
  src/render.ts                 one SlideModel -> DOM, text nodes only
  src/controls.ts               buttons, progress, keys, swipe
  src/slides.test.ts            Vitest
  src/router.test.ts            Vitest
  src/theme.test.ts             Vitest
  index.html, src/style.css
  package.json, tsconfig.json, vite.config.ts
```

## Key decisions

### Slide model (`slides.ts`, pure)

`slides(storyboard)` maps each scene to a `SlideModel` with the fields the renderer
needs: kind, heading text, image path and alt text, hotspots, code lines with a
highlighted flag each, narration, and an optional safe link. Link safety is decided
here: a URL becomes a link only if its scheme is `http` or `https`. Keeping these
decisions in a pure function makes them testable without a DOM.

### Routing (`router.ts`, pure)

`parse(hash, total)` returns a zero-based index, defaulting to 0 for a missing,
malformed or out-of-range fragment. `format(index)` returns `#/n` with one-based
numbers. Paging calls `history.pushState`, and `popstate` re-renders, so browser
back and forward work.

### Rendering (`render.ts`)

One `<main>` region with `aria-live="polite"` and a visually hidden "Slide i of N"
announcement. Content is built with `createElement` and `textContent` only.

- **Hotspots:** the capture sits in a wrapper with `position: relative`. Each
  hotspot is a `<button>` placed with `left: x*100%` and `top: y*100%`, numbered,
  with `aria-expanded` and an `aria-label` of its label. The open label is a small
  panel next to the button. One open at a time. Escape and a second activation
  close it.
- **Narration:** a `<details>` element under the caption.
- **Code:** `<pre>` with one `<span>` per line. Highlighted lines get a class and a
  visible marker. The language shows as a small label.
- **Images:** `alt` is the caption. A failed load shows a placeholder naming the scene.

### Controls (`controls.ts`)

Back and next buttons, and a progress list of buttons (one per slide) with
`aria-current` on the active one. Keys per the requirements, ignored while focus is
in a form control. Swipe: a horizontal touch move over 50 pixels with little
vertical movement pages once.

### Theme (`theme.ts`, pure)

Maps the storyboard palette to CSS custom properties (`--bg`, `--text`, `--accent`,
`--hotspot`, `--surface`), falling back per field to defaults. When the chosen text
color has poor contrast against the background (below a 4.5:1 ratio), it falls back
to the default text color. Mood maps to small style variations, for example
corner radius and border style.

### Transitions

A short cross-fade between slides, disabled under `prefers-reduced-motion`.

## Error handling

| Operation | Failure | Behavior |
|---|---|---|
| Prepare | Invalid storyboard or missing asset | Print issues with scene numbers, exit non-zero, no build |
| Runtime: image | Load fails | Placeholder in the slide, paging continues |
| Runtime: fragment | Malformed or out of range | Open slide 1 |
| Runtime: theme | Unreadable text color | Default text color |

## Testing

- **Vitest:** `slides` on the sample (count, order, hotspot coordinates kept,
  highlighted lines flagged, unsafe link dropped); `router` (valid, missing,
  malformed, out of range); `theme` (defaults, per-field fallback, contrast fallback).
- **Manual acceptance:** keyboard-only and touch-only reads of the sample, hotspots
  at three widths, reload on slide 4, offline load, markup in a caption shown as text.

## Open decisions

1. **Page-flip look.** `AGENTS.md` allows an optional page-flip feel. Start with
   the cross-fade. Add a page-turn style only if time allows after the game ships.
2. **One shared Pages build.** Publish both apps from one GitHub Actions workflow
   to sibling paths. Settle the exact paths in the hosting task.

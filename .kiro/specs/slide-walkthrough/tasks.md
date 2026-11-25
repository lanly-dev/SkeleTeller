# SkeleTeller Storybook (Slide Walkthrough) — Tasks

> Tasks map to the file structure in `design.md`. Build after the demo game is
> playable (demo-game T9), per the order in `AGENTS.md`. T1 can land earlier
> because the game uses the same prepare function.

## T0 — Scaffold
- `apps/slide-walkthrough/` with `package.json` (pinned, matching the root
  workspace), `tsconfig.json` (strict), `vite.config.ts` (relative base),
  `index.html`, `src/style.css`.
- Scripts: `prepare`, `dev`, `build` (prepare, typecheck, vite build), `test`.
- Add `apps/slide-walkthrough/src/generated/` and `public/assets/` to `.gitignore`.
- **Done:** `npm run dev -w apps/slide-walkthrough` serves a blank page and the
  build is green.

## T1 — Shared prepare (`skeleton/src/prepare.ts`)
- `prepareStoryboard` per design, with tests in `skeleton/src/prepare.test.ts`
  (writes JSON, copies assets keeping relative paths, returns issues on failure).
- **Done:** tests pass and both apps can call it.

## T2 — `scripts/prepare.ts`
- Wrapper passing this app's output paths, with an optional storyboard argument.
- **Done:** the sample prepares. A broken storyboard fails the build with scene numbers.

## T3 — `src/slides.ts` and tests
- **Done:** sample gives seven slides in order. Hotspots, highlighted lines and link
  safety are covered by tests.

## T4 — `src/router.ts` and tests
- **Done:** valid, missing, malformed and out-of-range fragments are covered.

## T5 — `src/theme.ts` and tests
- **Done:** defaults, per-field fallback and contrast fallback are covered.

## T6 — `src/render.ts`
- Title, feature, callout, code and outro slides with text nodes only, hotspots,
  narration, image placeholder, live-region announcement.
- **Done:** all five types render from the sample. Markup in a caption shows as text.

## T7 — `src/controls.ts` and `src/main.ts`
- Back, next, progress, keys, swipe, fragment routing, browser history.
- **Done:** the sample can be read by keyboard only. Reload keeps the slide.

## T8 — Styling and responsive pass
- Theme custom properties, focus rings, phone layout, reduced-motion cross-fade.
- **Done:** touch-only read on a phone-sized viewport. Hotspots stay on target at
  three widths.

## T9 — Hosting
- Add the walkthrough to the GitHub Pages workflow next to the game.
- **Done:** the public URL loads and the sample can be paged through.

## T10 — README and acceptance
- `apps/slide-walkthrough/README.md`: build, dev, controls, how scenes map to slides.
- Run the acceptance list in `requirements.md` and record the result as a dated note.
- **Done:** every acceptance line passes or is listed with a reason.

## T11 — Storybook art module
- `src/art.ts` per the design: four mood backdrops, three avatars, six props, cover,
  page and end compositions. `src/art.test.ts`: deterministic output, every enum
  value renders, unknown values fall back, and no storyboard text in the markup.
- **Done:** tests pass.

## T12 — Spread layout, cover and end pages
- Rewrite `render.ts` for cover, spread and end pages; chapter numbers from
  `slides.ts` (with a test); narration as page text; paper text page; phone stack.
- **Done:** every sample slide renders, hotspots stay on target at three widths.

## T13 — Page turns
- Direction-aware turn animation, reduced motion respected.
- **Done:** every paging control still works.

## T14 — Story voice
- Update `.kiro/steering/storyboard-drafting.md`; rewrite the SpectreGram narration.
- **Done:** `npm run validate` passes on `demo/storyboard.yml`.

## T15 — Acceptance for 13 to 17
- Screenshots of all four moods and three avatars, rerun the earlier acceptance
  checks, record results.
- **Done:** recorded in `requirements.md`.

## Status

- **2026-11-20, Kiro IDE:** T0 and T2 to T10 done; T1 (shared prepare) came with the Kiro Web batch for the game. 21 new tests (slides, router, theme). The Pages workflow builds both apps and publishes the Storybook at `/storybook/`. Layout fixes found by screenshots: the stacked phone layout left a large gap, and an off-screen live region made the window scroll. Acceptance recorded in `requirements.md`: 10 of 12 pass, 3 passes in emulation pending a real phone, and 11 (hosting) waits for the deploy.
- **2026-11-20:** deployed; the live check passed. Requirement 11 now passes: 11 of 12 in full. Still open: a real phone (3).
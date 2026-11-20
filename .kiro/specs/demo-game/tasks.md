# SkeleTeller Quest (Demo Game) — Tasks

> Tasks map to the file structure in `design.md`. Depends on the schema spec for
> the shared validator, the theme block and the callout coordinate frame. Lean by
> intent: one engine, no extras. Do not start T1 before the schema spec is merged.

## T0 — Scaffold
- `apps/demo-game/` with `package.json` (pinned exact versions: vite, typescript,
  vitest), `tsconfig.json` (strict), `vite.config.ts` (relative base),
  `vitest.config.ts`, `index.html`, `src/style.css`.
- Scripts: `prepare`, `dev` (prepare then vite), `build` (prepare then tsc
  --noEmit then vite build), `test`.
- Add `apps/demo-game/dist/` and `src/generated/` to `.gitignore`.
- **Done:** `npm run dev` shows a blank canvas page and `npm run build` is green.

## T1 — `scripts/prepare.ts`
- Read storyboard path (default `demo/storyboard.yml`) and call the shared
  `prepareStoryboard` from `skeleton/src/prepare.ts` (see `slide-walkthrough`
  design and its task T1, which adds it). It validates, enforces asset containment,
  writes generated JSON and copies assets.
- **Done:** the sample storyboard prepares cleanly. A missing asset and an
  escaping path each fail with a clear message and non-zero exit.

## T2 — `src/theme.ts` and `src/theme.test.ts`
- `DEFAULT_THEME`, `resolveTheme` with per-field fallback.
- **Done:** tests for missing theme, invalid field and valid field pass.

## T3 — `src/world.ts` and `src/world.test.ts`
- `Area`, `layoutWorld` per design. Walkable bounds and doorway geometry exported.
- **Done:** tests for sample length, station kinds, door flags and reorder pass.

## T4 — `src/input.ts`
- Keyboard and touch to one input state (direction, action edge, close edge).
- **Done:** both devices drive the same state. No listeners leak on re-init.

## T5 — `src/game.ts` and `src/game.test.ts`
- `step` with movement, clamping, doorway crossing, nearest station, panel lock.
- **Done:** tests for collision, doorway, prompt range and panel lock pass.

## T6 — `src/draw.ts`
- Draw ground, border, doorways, station kinds, props, avatars, prompt, HUD from
  the resolved theme. Scale the canvas to fit while keeping aspect.
- **Done:** the sample renders all five scene types with the default theme.

## T7 — `src/panel.ts`
- Panels for feature, callout (hotspots), code, outro. Text nodes only. Link scheme
  check. Image failure placeholder.
- **Done:** markup in a caption displays as text. Hotspots reveal labels.

## T8 — `src/main.ts`
- Boot from generated JSON, wire input, game, draw and panel, handle resize and
  panel open and close.
- **Done:** the keyboard tour of the sample completes start to exit.

## T9 — Touch and responsive pass
- Directional pad, action button, tap on stations and panel controls, phone-sized
  layout.
- **Done:** the touch-only tour of the sample completes on a phone-sized viewport.

## T10 — Theme comparison
- Add a second sample theme (in a test storyboard, not in app code) and confirm
  the world looks different with no code change.
- **Done:** two themes render visibly different worlds.

## T11 — Hosting
- GitHub Actions workflow that builds and publishes the game (and later the
  slides) to GitHub Pages.
- **Done:** the public URL loads and the sample tour completes.

## T12 — README and acceptance
- `apps/demo-game/README.md`: install, build, dev, how the storyboard maps to
  areas, controls.
- Run the acceptance list from `requirements.md` against the sample and record the
  result as a dated note.
- **Done:** every acceptance line passes or is listed with a reason.

---

**Review gate:** after T9 the game is playable. T10 to T12 prove versatility and
hosting.

## Status

- **2026-11-20, Kiro Web:** shared prepare helper and T0 to T5, merged as PR #1. Checked locally: tests, typecheck, validate and the build all pass.
- **2026-11-20, Kiro IDE:** T6 (draw.ts), T7 (panel.ts) and T8 (main.ts) done, plus text.ts helpers with tests. The station moved 60 px above the walking line (see design.md). `dev` and `build` now read `demo/storyboard.yml`; `dev:sample` and `build:sample` use the sample. The prepare wrapper clears `public/` and the generated JSON before copying.
- **Keyboard tour verified in headless Edge:** each station panel opens with E and closes with Escape, the title sign has no panel, callout hotspot 2 reveals its label, the outro shows the safe repository link, and the left door works. No console errors. Not verified yet: touch (T9) and a real phone.

- **2026-11-20, Kiro IDE:** T9 done. touch.ts adds an on-screen pad (dead zone, clamped at the rim, tested) and a View button, shown on coarse pointers or after the first touch, and hidden while a panel is open. Prompt and hint switch to touch wording. Portrait phones get a rotate hint. Panel images are capped at 58% of the screen height, with the figure shrinking to the image so hotspots stay on target, and a tapped hotspot's label scrolls into view. Verified in headless Edge with touch emulation at 844 by 390 and 390 by 844: pad walking across areas, View and station taps open panels, Close works, hotspot 3 reveals its label. Still to do: one check on a real phone.

- **2026-11-20, Kiro IDE:** T10 done. `skeleton/examples/sample-spooky.yml` is the sample with only its theme changed (spooky mood, ghost avatar, other props and palette). `reskin.test.ts` checks that both validate, lay out identical areas and resolve to a different value in every themed field. Screenshots of both builds show visibly different worlds with no code edited.
- **2026-11-20, Kiro IDE:** T11 written. `.github/workflows/pages.yml` installs, tests, typechecks, builds the game from `demo/storyboard.yml` (or the sample when there is none yet), and publishes the landing page at `/` and the game at `/quest/`. The same steps were run locally, including a clean `npm ci`, and the assembled site served from a subpath loaded every file with status 200. Not done until the first deploy succeeds on GitHub.

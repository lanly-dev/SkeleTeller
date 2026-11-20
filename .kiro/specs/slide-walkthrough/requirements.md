# SkeleTeller Storybook (Slide Walkthrough) — Requirements (spec-first)

> Spec status: **Requirements**. App B in `apps/slide-walkthrough/`. Replaces the
> flat `.kiro/specs/slide-walkthrough-app.md`. Depends on the `storyboard-schema`
> spec for the contract and validator. Scope caps in `AGENTS.md` bind this spec:
> paging, hotspots and progress only, and no live embedding of the demoed project.

Feature: a static, storybook-style slide walkthrough generated from
`demo/storyboard.yml`. The viewer pages through one slide per scene at their own
pace and clicks hotspots to reveal explanations.

## 1. One slide per scene
- **Requirement:** One slide per scene, in storyboard order:
  - `title`: project name and tagline, over the background image when given.
  - `feature`: capture and caption. Narration is available on request.
  - `callout`: capture with numbered hotspots. Activating one reveals its label.
  - `code`: caption and snippet, with highlighted lines marked and the language named.
  - `outro`: caption, and the repository link when present.
- **Acceptance:** The sample storyboard yields seven slides in the same order as its
  scenes. Reordering scenes in the YAML reorders the slides after a rebuild.

## 2. Paging
- **Requirement:** Next and back controls, and a progress indicator showing the
  current slide out of the total. Each progress step jumps to its slide. Back is
  disabled on the first slide and next is disabled on the last.
- **Acceptance:** Every slide of the sample is reachable with each of the controls.

## 3. Keyboard and touch
- **Requirement:** Right arrow, Page Down and Space go forward. Left arrow and Page
  Up go back. Home and End jump to the first and last slide. On touch screens, a
  horizontal swipe pages forward or back. All controls are reachable by Tab and
  show a visible focus ring.
- **Acceptance:** The sample can be read start to end by keyboard only, and by touch
  only on a phone-sized viewport.

## 4. Hotspots
- **Requirement:** Hotspots are buttons placed over the capture from the callout's
  normalized `x` and `y`, so they stay on the same spot at any display size.
  Activating one reveals its label. One label is open at a time, and Escape closes it.
- **Acceptance:** At three viewport widths, each sample hotspot sits over the same
  point of the image.

## 5. Narration
- **Requirement:** When a scene has narration, the slide shows a control that
  reveals it. Captions are always visible.
- **Acceptance:** Every sample narration is readable from its slide.

## 6. Shareable position
- **Requirement:** The current slide number is kept in the URL fragment, for
  example `#/4`. Loading that URL opens that slide. Browser back and forward move
  between slides visited.
- **Acceptance:** Reloading on slide 4 stays on slide 4. An out-of-range fragment
  opens slide 1.

## 7. Theme
- **Requirement:** The storyboard's palette colors the page (background, text,
  accent, hotspot color). Without a theme, a built-in default applies. Text keeps
  readable contrast.
- **Acceptance:** Two storyboards with different palettes give visibly different
  walkthroughs with no code edited.

## 8. Build and run
- **Requirement:** One command builds static files from `demo/storyboard.yml`,
  validating it with the shared validator first. A dev command serves it locally.
  A different storyboard path can be passed in.
- **Acceptance:** The build fails with scene numbers on an invalid storyboard or a
  missing image. The output works from any static host.

## 9. No external requests
- **Requirement:** The built walkthrough loads everything from its own files. No
  CDN scripts, fonts or styles.
- **Acceptance:** With the network disconnected after the first load of the page
  files, the walkthrough still works when served locally.

## 10. Safe rendering
- **Requirement:** Storyboard text is inserted as text, never as HTML. Links are
  rendered only for `http` and `https` URLs. Copied asset paths must resolve inside
  the storyboard folder.
- **Acceptance:** A caption containing markup displays as plain text.

## 11. Hosting
- **Requirement:** The build is deployable to GitHub Pages at a relative base path
  next to the game, and stays free and open through Jan 29, 2027.
- **Acceptance:** The public URL loads and the sample can be paged through.

## 12. Accessibility
- **Requirement:** Each capture has alt text from its caption. The slide region
  announces slide changes to screen readers. Motion respects the reduced-motion
  preference.
- **Acceptance:** A keyboard and screen-reader pass over the sample finds no
  unlabelled control.

## Non-goals
- No live embedding or simulation of the demoed project.
- No video, audio or autoplay. The viewer sets the pace.
- No editor, comments, accounts, analytics or saved progress beyond the URL fragment.
- No syntax highlighting library. Highlighted lines and a language label only.
- No print or PDF export.

## Acceptance record

Run on 2026-11-20 in the Kiro IDE, against `vite preview` with headless Edge (Chromium) driven over the DevTools protocol. Fixtures for 1, 7, 8 and 10 were the same 4-scene storyboard used for the game: reordered scenes, no theme block, HTML markup in a caption and a callout label, and one image deleted from the build.

| # | Requirement | Result |
|---|---|---|
| 1 | One slide per scene | **Pass.** The sample gives 7 slides in order; the 4-scene storyboard gave 4 slides in its own order (also `slides.test.ts`). |
| 2 | Paging | **Pass.** Back is disabled on slide 1 and Next on slide 7; Next, Back and each progress step reach their slide. |
| 3 | Keyboard and touch | **Pass in emulation.** Right, Left, Page Down, Page Up, Space, Home and End all page. Swipe left and right page on a 390 by 844 touch viewport; the first try was taken by the browser's back gesture, fixed with `touch-action: pan-y` and `overscroll-behavior-x: none`. Every control has a visible focus ring. **Open:** a real phone. |
| 4 | Hotspots | **Pass.** At 1280, 900 and 390 px wide, each hotspot's center sits at its storyboard coordinate (0.100,0.170 / 0.270,0.170 / 0.380,0.170) to three decimals. One label at a time; Escape closes it. |
| 5 | Narration | **Pass.** "Read the narration" opens the scene's narration. |
| 6 | Shareable position | **Pass.** Loading `#/4` and reloading stay on slide 4; `#/99` opens slide 1; browser back returns to the previous slide (also `router.test.ts`). |
| 7 | Theme | **Pass.** The sample and `sample-spooky.yml` give visibly different books with no code change (screenshots). No theme block falls back to the default palette. Unreadable text colors are replaced (`theme.test.ts`). |
| 8 | Build and run | **Pass.** A missing image fails with "scene 2, visual: … file not found"; `build`, `build:sample` and `dev:sample` work; the output is static files. |
| 9 | No external requests | **Pass.** No request leaves the page's origin. With the network set offline after the first load, paging through all 7 slides showed every image (no placeholders). |
| 10 | Safe rendering | **Pass.** `<b>Bold?</b><img src=x onerror=alert(1)>` and `<i>label</i>` show as plain text, create no elements and open no dialog. Links are http(s) only. A `../` asset path fails the build with "must stay inside the storyboard folder". |
| 11 | Hosting | **Pass.** Run 44810671438 (commit `6363af1`) deployed both apps. The full check above passed again at https://lanly-dev.github.io/SkeleTeller/storybook/, including offline paging and no external requests. |
| 12 | Accessibility | **Pass.** No unlabelled buttons, every image has alt text, the live region announces "Slide n of N: caption", and motion stops under reduced-motion. A screen-reader listening pass was not done. |
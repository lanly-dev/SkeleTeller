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

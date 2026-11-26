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

## Storybook presentation (added 2026-11-21)

The walkthrough becomes an illustrated storybook. Requirements 13 to 17 add to the
ones above; requirement 5 is amended by 15.

## 13. Illustrated pages
- **Requirement:** The title scene becomes an illustrated cover. Every feature,
  callout and code scene gets an illustrated page. The outro becomes an illustrated
  closing page. The art is drawn in code from the storyboard theme: the mood picks
  the backdrop, the avatar is the same character as in the game, and the props and
  palette dress the scene. No art files ship and no art is fetched.
- **Acceptance:** Each of the four moods, three avatars and six props renders. The
  same storyboard gives the same art on every build. Two storyboards that differ only
  in theme give visibly different books.

## 14. Story layout
- **Requirement:** On wide screens each scene is a two-page spread: the
  illustration with the scene's screenshot (or code) framed in it on the left, and
  the story on the right. On narrow screens the two pages stack. Content scenes are
  numbered as chapters, with the caption as the chapter title.
- **Acceptance:** The sample's five content scenes read Chapter 1 to Chapter 5.
  Hotspots stay on target inside the framed screenshot at any width.

## 15. Narration as the page text
- **Requirement:** Narration is shown as the story text of its page, opened with a
  decorated first letter. This replaces the reveal control from requirement 5.
- **Acceptance:** Every narration in the sample is visible on its page without any
  extra click.

## 16. Page turns
- **Requirement:** Moving forward or back animates like turning a page. Under the
  reduced-motion preference there is no animation.
- **Acceptance:** Paging still works with every control in requirements 2 and 3.

## 17. Art safety
- **Requirement:** The art markup is built only from constants, numbers and theme
  enum values; colors reach it through CSS variables. No storyboard text appears in
  the art; titles and captions stay in HTML text nodes. The art is decorative and
  hidden from screen readers.
- **Acceptance:** A test renders the art for a storyboard full of markup and finds
  none of its text in the art markup.

## Living pages (added 2026-11-21)

Interactivity stays within the storybook scope cap in `AGENTS.md`: it adds feel to
paging, pictures and hotspots, and never simulates the demoed project.

## 18. Fuller scenes
- **Requirement:** Like the areas of the game, each illustrated page shows several
  objects: up to four of the theme's props (rotating by page), plus two scenery
  objects that belong to the mood (spooky: pumpkin and gravestone; cozy: fence and
  flowers; neon: palm and arcade cabinet; clean: round tree and bench).
- **Acceptance:** Every sample page with art shows the avatar, at least two props
  when the theme has them, and both mood objects.

## 19. Touchable art
- **Requirement:** Clicking or tapping the avatar or any object makes it react with
  a short animation that fits it (the lamp flares, the banner flaps, the crate hops,
  the plant sways, the sign swings, books wiggle, the avatar bounces). Pages also
  have gentle idle motion: the avatar floats or breathes, stars twinkle, bats flap.
  Under reduced motion there is no idle motion and reactions are a brief highlight.
- **Acceptance:** Each object type reacts when clicked. The art carries no
  information that is not also in the page text, so it can stay hidden from screen
  readers.

## 20. A guide character
- **Requirement:** Tapping the avatar shows a short speech bubble with a hint for
  that page (for example "Tap the numbered points!" on a callout page). Opening a
  hotspot makes the avatar bounce toward it. Bubble text is fixed per page type, not
  taken from the storyboard.
- **Acceptance:** The bubble appears on each page type and closes on its own.

## 21. Page corners
- **Requirement:** Each spread shows a folded corner at the bottom of each page.
  The right one turns forward and the left one turns back, like a real book. They
  repeat the Back and Next buttons, which stay as the accessible controls.
- **Acceptance:** The corners page the book in both directions; no corner shows
  where there is no page to turn to.

## 22. Read aloud
- **Requirement:** When the browser offers speech synthesis, each page has a "Read
  aloud" control that reads the page heading and story text. Changing page stops it.
  Where the browser has none, the control does not appear. No speech service is
  called over the network.
- **Acceptance:** Pressing it starts speech of the current page; paging stops it.

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
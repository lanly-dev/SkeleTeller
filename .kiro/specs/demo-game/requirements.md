# SkeleTeller Quest (Demo Game) — Requirements (spec-first)

> Spec status: **Requirements**. App A in `apps/demo-game/`. Replaces the retired
> video app per the 2026-11-18 pivot in `AGENTS.md`. Names and the shared web
> stack were approved in session on 2026-11-19. Scope caps in `AGENTS.md` bind
> this spec: one fixed 2D walk-around engine, walk and interact only.

Feature: a playable browser game generated from `demo/storyboard.yml`. A
character walks through a chain of areas themed on the target project. Each
storyboard scene is one area, and interacting with its station shows that
scene's capture, caption and narration.

## 1. Scene-to-area mapping
- **Requirement:** One area per scene, in storyboard order. Mapping:
  - `title`: start area. Shows the project name and tagline on a sign.
  - `feature`: area with one station. Interacting opens the capture, caption and narration.
  - `callout`: area with one station. The opened capture shows numbered hotspots. Selecting one reveals its label.
  - `code`: area with a terminal station. Interacting opens the snippet with highlighted lines.
  - `outro`: final area with an exit. Shows the closing caption and link.
- **Acceptance:** The sample storyboard (`skeleton/examples/sample-project.yml`)
  yields seven areas in the same order as its scenes. Reordering scenes in the
  YAML reorders the areas after a rebuild.

## 2. Movement and navigation
- **Requirement:** One character moves freely inside the current area. A
  doorway at the right edge leads to the next area, and a doorway at the left edge
  returns to the previous one. Doorways are always open.
- **Acceptance:** The character cannot leave an area except through a doorway.
  Walking through the last doorway of an area enters the next area. There is no
  gating, scoring or fail state.

## 3. Interaction
- **Requirement:** Near a station, a prompt appears. The player activates it with
  the action key or by tapping the station. A panel opens over the game showing
  the scene content. The player closes it with the close key or a close control.
- **Acceptance:** Every non-title scene's caption and visual are reachable in the
  game. Narration, when present, is shown in the panel. Movement is paused while a
  panel is open.

## 4. Controls
- **Requirement:** Keyboard (arrow keys or WASD to move, E or Space to interact,
  Escape to close). Touch (on-screen directional pad, an action button, tap on
  stations and panel controls).
- **Acceptance:** The full tour of the sample is completable using only the
  keyboard, and again using only touch input on a phone-sized viewport.

## 5. Progress display
- **Requirement:** A heads-up display shows the area number out of the total and
  the scene caption of the current area.
- **Acceptance:** The count is correct for any valid storyboard length.

## 6. Theme from storyboard data
- **Requirement:** Palette, mood, avatar and props come from the storyboard's
  theme data (shape owned by the schema spec). When theme data is absent, the game
  uses a built-in default theme.
- **Acceptance:** Two different themes in two storyboards produce visibly
  different worlds with no game code edited. A storyboard with no theme block
  still plays.

## 7. Captures and assets
- **Requirement:** Captures come from the storyboard's asset paths and are copied
  into the build output. No other art or audio files ship. The world itself is
  drawn from the theme at runtime.
- **Acceptance:** A build with a missing capture fails with the scene number. At
  runtime, an image that fails to load shows a labelled placeholder in the panel
  rather than breaking the game.

## 8. Build and run
- **Requirement:** One command builds the game from `demo/storyboard.yml`. A dev
  command serves it locally. The build output is static files.
- **Acceptance:** Running the build with the sample storyboard produces a folder
  that works when served by any static host and when opened through the dev server.

## 9. Hosting
- **Requirement:** The built game is deployable to GitHub Pages at a relative base
  path, with a public URL that stays free and open through Jan 29, 2027.
- **Acceptance:** The deployed URL loads and the sample tour completes.

## 10. Safe rendering
- **Requirement:** Storyboard text is rendered as text only (canvas text, or DOM
  text nodes). No storyboard value is inserted as HTML or used as a URL scheme.
  Asset paths must resolve inside the project folder at build time.
- **Acceptance:** A storyboard whose caption contains markup shows the markup as
  plain text. A path that escapes the project folder fails the build.

## 11. Performance and compatibility
- **Requirement:** Holds 60 frames per second on a typical laptop on the sample.
  Works in current Chrome, Firefox, Safari and Edge, and on a phone-sized viewport.
- **Acceptance:** The canvas scales to the window while keeping aspect ratio.

## Living world (added 2026-11-26)

Everything here stays inside the scope cap in `AGENTS.md`: one character, walk and
interact only. No combat, enemies, inventory, puzzles, physics, scores, second
character, or level generation. Nothing simulates the demoed project.

## 12. Fuller areas
- **Requirement:** Besides the theme props, each area shows the two scenery objects
  of its mood (spooky: pumpkin and gravestone; cozy: fence and flowers; neon: palm
  and arcade cabinet; clean: tree and bench), and gentle ambient life (spooky: wisps
  and bats; cozy: falling leaves and fireflies; neon: sparkles; clean: butterflies).
  Objects and the character are drawn in depth order, so the character passes in
  front of things below it and behind things above it.
- **Acceptance:** Every area of the sample shows both mood objects and ambient life
  for each of the four moods. Objects never cover the station or the doorways.

## 13. A world that responds
- **Requirement:** A prop or scenery object reacts with a short animation that fits
  it when the character brushes past it, when the player presses the action key
  next to it (away from a station), or when the player taps it. On an action press
  or tap the character also says a short fixed line about the object. Objects do
  not block movement.
- **Acceptance:** Each object kind reacts in all three ways. The lines are fixed
  text, not storyboard text.

## 14. A livelier character
- **Requirement:** The character swings its legs or bobs while walking, kicks up
  small dust puffs, breathes or floats when idle, and hops when it opens a station.
- **Acceptance:** Each avatar shows the walk and idle motion.

## 15. Area and progress feedback
- **Requirement:** Entering an area shows a short entry card with its number and
  caption. Stations already opened show a check mark, and the heads-up display shows
  how many stations have been seen out of the total. Reaching the exit area sets off
  a short confetti burst. Nothing is locked, gated or scored.
- **Acceptance:** The count rises as stations are opened, and the card and burst
  appear and fade on their own.

## 16. Reduced motion
- **Requirement:** Under the reduced-motion preference, ambient life, particles and
  bouncing are off; reactions become a short highlight, and the entry card appears
  without sliding.
- **Acceptance:** With reduced motion set, no ambient particle is drawn.

## Non-goals
- No combat, enemies, inventory, puzzles, physics, multiplayer, or procedural
  level generation beyond scenes to areas.
- No bespoke game per project. The theme is a reskin only.
- No saved progress, accounts, scores or analytics.
- No audio.
- No embedding or running of the demoed project.
- No level editor and no layout hints in the storyboard.

## Acceptance record

Run on 2026-11-20 in the Kiro IDE. Browser checks used headless Edge (Chromium) driven over the DevTools protocol against `vite preview`. The fixtures for 1, 3, 5, 6, 7 and 10 were a separate 4-scene storyboard with its scenes reordered, no theme block and HTML markup in a caption, built into the game, with one copied image deleted afterwards.

| # | Requirement | Result |
|---|---|---|
| 1 | Scene-to-area mapping | **Pass.** The sample gives 7 areas in scene order (tests and the keyboard tour). The reordered 4-scene storyboard gave 4 areas in its own order after a rebuild. |
| 2 | Movement and navigation | **Pass.** Walls clamp except at doorways (tests); the tour walked right through every door and back left through one. No gating or fail state. |
| 3 | Interaction | **Pass.** Every non-title station opened its panel with caption, image and narration; holding a move key for 3 s with a panel open did not move the character; Escape and Close both close. |
| 4 | Controls | **Pass in emulation.** Keyboard: arrows, WASD, E, Space and Escape. Touch at 844 by 390 and 390 by 844: pad, View button, station tap and Close. **Open:** one check on a real phone. |
| 5 | Progress display | **Pass.** The count read 1 / 7 for the sample and 1 / 4 for the 4-scene storyboard. |
| 6 | Theme from storyboard data | **Pass.** `sample-project.yml` and `sample-spooky.yml` render visibly different worlds with no code change (screenshots, `reskin.test.ts`). A storyboard with no theme block plays with the default. |
| 7 | Captures and assets | **Pass.** A missing capture fails the build with "scene 2, visual: … file not found". A capture deleted from the build shows "The image for scene 3 could not be loaded." and the game continues. |
| 8 | Build and run | **Pass.** `build` reads `demo/storyboard.yml` and fails clearly when it is absent; `build:sample` and `dev:sample` work; the static output loads from a subpath with every file at status 200. |
| 9 | Hosting | **Pass.** After Pages was enabled, run 44808628929 (commit `0ab8dae`) built and deployed. The keyboard tour of the sample completed at https://lanly-dev.github.io/SkeleTeller/quest/ with no console errors. |
| 10 | Safe rendering | **Pass.** A caption of `<b>Bold?</b><img src=x onerror=alert(1)>` and a callout label with `<i>` show as plain text, create no elements and open no dialog. A path with `../` that leaves the storyboard folder fails the build. Links are http(s) only (tests). |
| 11 | Performance and compatibility | **Partly verified.** About 60 frames per second (121 frames in 2 s, headless Edge). The canvas keeps 16:9 at 1280 by 760 and 900 by 900. **Open:** Firefox and Safari were not tested. |
## Acceptance record, living world (12 to 16)

Run on 2026-11-26 in headless Edge with real key and mouse events. This machine
reports reduced motion by default, so the normal-motion run forced
`prefers-reduced-motion: no-preference` and a second run checked reduced motion.
Fixtures: `demo/storyboard.yml` (spooky, ghost), the TaskFlow sample (clean,
explorer), and cozy and neon copies of it outside the repo.

| # | Requirement | Result |
|---|---|---|
| 12 | Fuller areas | **Pass.** All four moods show their two objects and ambient life (wisps and bats, leaves, sparkles, butterflies). Depth order works: the explorer stands behind the fence. `living.test.ts` checks that no object covers a station, the title sign or a doorway in any area or mood. Found by screenshot and fixed: a tree hid the character completely, so objects in front of the character now turn see-through. |
| 13 | A world that responds | **Pass.** Walking past the pumpkin made it react; pressing E next to it gave "The pumpkin grins back at me."; tapping the gravestone made it react and gave "Rest in peace, old bug." Every kind has a reaction and a line (unit tests). Objects do not block movement. |
| 14 | A livelier character | **Pass.** Legs swing while walking (explorer, robot), the ghost's hem ripples faster, dust puffs trail behind, and the character hops when it opens a station. |
| 15 | Area and progress feedback | **Pass.** Entry card on each area after the first; opening the area 2 station changed "Seen 0 / 6" to "Seen 1 / 6" and added a check mark; confetti burst at the exit. Nothing is gated or scored. |
| 16 | Reduced motion | **Pass.** With reduced motion, no wisps, bats, dust or confetti were drawn, and a tapped object only glowed. |

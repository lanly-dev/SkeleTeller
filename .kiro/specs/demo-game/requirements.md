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

## Non-goals
- No combat, enemies, inventory, puzzles, physics, multiplayer, or procedural
  level generation beyond scenes to areas.
- No bespoke game per project. The theme is a reskin only.
- No saved progress, accounts, scores or analytics.
- No audio.
- No embedding or running of the demoed project.
- No level editor and no layout hints in the storyboard.

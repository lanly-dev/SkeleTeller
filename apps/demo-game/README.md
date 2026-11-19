# Demo Game App

**Status:** Not yet implemented (Phase 2). This app replaces the former Demo Video app (pivot decided 2026-11-18: a video is not an application). A fresh spec for this app must be written in `/.kiro/specs/` before implementation — the old demo-video specs are superseded and must not be implemented.

This app generates a playable 2D walk-around game from a storyboard, themed on the project being demoed.

## Concept

- One character runs around a world skinned in the target app's theme (palette, props, signage, mood from the storyboard and its assets).
- Each storyboard scene becomes an area/room, in storyboard order. Running around the game *is* touring the app:
  - **Title** — start area: project name + tagline
  - **Feature** — an area where the feature's station/sign/interactable shows its capture with caption and callouts
  - **Callout** — interactables that highlight specific elements
  - **Code** — a terminal-style interactable showing the snippet
  - **Outro** — goal/exit area: call-to-action
- Playable in the browser: keyboard + touch, walk + interact only.

## Scope caps

- One fixed engine: a chain of areas in storyboard order, one character, walk + interact.
- No combat, enemies, inventory, puzzles, physics, multiplayer, or procedural level generation beyond scenes → areas.
- The per-project theme is a reskin driven by storyboard data — never a bespoke game per project.

## Usage (Planned)

```bash
cd apps/demo-game
# build/run with a storyboard (exact commands follow the demo-game spec)
```

Output: a hosted, playable web game generated from that storyboard.

---

This will be implemented in Phase 2 after a new demo-game spec is approved.

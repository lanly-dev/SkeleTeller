# SkeleTeller Quest (Demo Game)

**Status:** specified, not built yet. The spec is in `.kiro/specs/demo-game/`
(requirements, design, tasks). This app replaces the former Demo Video app (pivot
decided 2026-11-18: a video is not an application).

App A of SkeleTeller. It generates a playable 2D walk-around game from a
storyboard, themed on the project being demoed.

## Concept

- One character walks through a chain of areas, one per storyboard scene, in order.
  Walking the game is touring the project.
- The world's palette, mood, avatar and props come from the storyboard's `theme`
  block. Without one, a default look applies.
- Each area has a station. Interacting with it shows that scene's capture, caption
  and narration.

| Scene | Area |
|---|---|
| `title` | Start area, with the project name and tagline on a sign |
| `feature` | A screen station that opens the capture and caption |
| `callout` | A screen station whose capture has numbered hotspots |
| `code` | A terminal station that shows the snippet |
| `outro` | The exit, with the closing caption |

## Controls (planned)

- Keyboard: arrow keys or WASD to move, E or Space to interact, Escape to close.
- Touch: on-screen pad, action button, tap a station.

## Scope caps

- One fixed engine: a chain of areas, one character, walk and interact only.
- No combat, enemies, inventory, puzzles, physics, multiplayer, or procedural levels.
- The per-project theme is a reskin driven by storyboard data, never a bespoke game.

## Usage (planned)

```bash
npm run dev -w apps/demo-game      # serve locally
npm run build -w apps/demo-game    # static build from demo/storyboard.yml
```

The build validates the storyboard first and fails with scene numbers when
something is wrong.

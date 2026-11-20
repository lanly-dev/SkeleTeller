# SkeleTeller Quest (Demo Game) — Design (spec-first)

> Spec status: **Design**. Requirements live in `requirements.md`. The storyboard
> and theme shapes are owned by the schema spec and loaded through the shared
> validator. This design adds no framework, no game engine library, no audio and
> no backend.

## Overview

A static single-page game. At build time a prepare script validates
`demo/storyboard.yml`, writes the parsed result as JSON, and copies the captures
next to the build. At runtime a pure layout function turns the storyboard into a
list of areas. A small loop moves one character, draws the current area from the
theme on a Canvas 2D, and opens a DOM panel when a station is activated.

```
demo/storyboard.yml
   |  (prepare script: shared validator, path containment check, copy assets)
   v
generated storyboard.json + assets/
   |  (runtime)
   v
layoutWorld(storyboard) -> Area[]     pure, tested
resolveTheme(storyboard.theme)        pure, tested
   |
game loop: input -> update -> draw    Canvas 2D
station interact -> DOM panel         text nodes only
```

## Locked stack

Vite and TypeScript (strict, no framework). Canvas 2D for the world. DOM for the
panel and touch controls. Vitest for the pure modules. Shared validator and
loader imported from `skeleton/` so both apps use one contract. Static build.
Dependency versions pinned exactly.

## File structure (maps to tasks)

```
apps/demo-game/
  scripts/prepare.ts     validate, write generated JSON, copy and contain assets
  src/main.ts            boot, wiring, resize, state
  src/world.ts           layoutWorld, Area and Station types       (pure)
  src/theme.ts           resolveTheme, DEFAULT_THEME               (pure)
  src/input.ts           keyboard and touch to a single input state
  src/game.ts            update step: movement, collision, doorways, nearest station (pure parts tested)
  src/draw.ts            area, props, avatar, HUD drawing from theme
  src/panel.ts           DOM panel per scene type, text nodes only
  src/world.test.ts      Vitest
  src/theme.test.ts      Vitest
  src/game.test.ts       Vitest
  index.html, src/style.css
  package.json, tsconfig.json, vite.config.ts, vitest.config.ts
```

## Key decisions

### World layout (`world.ts`, pure)

Logical canvas is 960 by 540, scaled to fit the window. Each area is one
screen. Areas are placed as a chain, indexed by scene order.

```ts
type Area = {
  index: number;
  sceneType: 'title' | 'feature' | 'callout' | 'code' | 'outro';
  station: { x: number; y: number; kind: 'sign' | 'screen' | 'terminal' | 'exit' };
  doorLeft: boolean;   // false for the first area
  doorRight: boolean;  // false for the last area
  sceneRef: number;    // index into storyboard.scenes
};
function layoutWorld(storyboard): Area[];
```

- Station kind: title is `sign`, feature and callout are `screen`, code is
  `terminal`, outro is `exit`.
- Station position is fixed per kind at the center of the area. No layout hints
  are read from the storyboard, so the layout is deterministic and the same
  storyboard always gives the same world.
- Walkable bounds are a rectangle inset from the area edges. Doorways are gaps at
  the middle of the left and right edges.

### Theme (`theme.ts`, pure)

`resolveTheme(raw)` merges the storyboard theme over `DEFAULT_THEME` and
validates each field, falling back per field on anything invalid. Fields consumed:
- `palette`: background, ground, accent, text, station colors.
- `mood`: one of a small fixed set that selects ground pattern and vignette
  strength.
- `avatar`: one of a small fixed set of procedurally drawn characters.
- `props`: list of identifiers from a small fixed set of procedural props placed
  at fixed decorative slots.

The shape and allowed values are defined in the schema spec. The game owns only
the drawing of each allowed value. Unknown values fall back to defaults.

### Game step (`game.ts`)

State: current area, character position and facing, open panel (or none),
nearest station in range. Pure function `step(state, input, dt, world)` returns
the next state. It handles:
- Movement at fixed speed, normalized on diagonals.
- Clamping to walkable bounds, except through a doorway gap.
- Crossing a doorway: switch area, place the character just inside the opposite door.
- Nearest-station check within a radius, which drives the prompt.
- Action input opens the panel when in range. Close input closes it. Movement is
  ignored while a panel is open.

### Input (`input.ts`)

Keyboard and touch both write the same input state: a direction vector, an
action edge and a close edge. Touch has an on-screen directional pad and an action
button. Taps on a station and on panel controls also route to the same edges.

### Panel (`panel.ts`)

One DOM overlay, content built with `textContent` and `createElement` only.
- `feature`: image, caption, narration (collapsible when long).
- `callout`: image with numbered hotspot buttons positioned from normalized
  coordinates. Selecting one shows its label.
- `code`: monospace block with highlighted lines marked by a class and a language
  label. No syntax highlighting library.
- `outro`: caption, and the repository link only when the URL scheme is `http` or
  `https`.
- Image load failure shows a placeholder naming the scene.

Callout coordinates follow the schema spec's reference frame (normalized to the
image), so the same values place hotspots in the game and in the slides.

### Drawing (`draw.ts`)

Everything is drawn from the resolved theme: ground, border, doorways, station,
decorative props, avatar, prompt, HUD. Pixel-snapped rectangles and simple shapes
give a consistent style without art assets. HUD shows `area i / N` and the
scene caption.

### Prepare script (`scripts/prepare.ts`)

1. Read the storyboard path from an argument, default `demo/storyboard.yml`.
2. Validate with the shared validator. A failure prints scene number and message
   and exits non-zero. A missing asset is a failure.
3. Resolve every asset path against the storyboard folder and reject any that
   resolve outside it.
4. Write `src/generated/storyboard.json` and copy assets into the public folder.

The build command runs prepare, then the Vite build. The dev command runs prepare,
then the dev server.

### Hosting

Vite `base` is relative so the build works from a GitHub Pages project path. A
GitHub Actions workflow builds and publishes it. The slides app is published from
the same workflow to a sibling path.

## Error handling

| Operation | Failure | Behavior |
|---|---|---|
| Prepare: validation | Schema or asset error | Print scene number and message, exit non-zero, no build |
| Prepare: asset path | Resolves outside the project folder | Fail the build |
| Runtime: image load | Capture fails to load | Placeholder in the panel, game continues |
| Runtime: bad theme field | Invalid or unknown value | Fall back to default for that field |
| Runtime: empty storyboard | Zero scenes | Not reachable, rejected by the schema |

## Testing

- **Vitest, pure modules:**
  - `layoutWorld` on the sample: seven areas, correct station kinds, first has no
    left door, last has no right door, order follows scenes. Reordered input gives
    reordered areas.
  - `resolveTheme`: missing theme gives defaults, invalid field falls back,
    valid field applies.
  - `step`: collision clamps movement, doorway crossing switches area, nearest
    station in range drives the prompt, input is ignored while a panel is open.
- **Manual acceptance against the sample:** full keyboard tour, full touch tour on
  a phone-sized viewport, markup in a caption shown as text, a missing image shows
  the placeholder, a two-theme comparison.

## Open decisions

1. **Camera.** Fixed screen per area with a cut at doorways (chosen), or a
   scrolling camera. Fixed is simpler and keeps the layout pure.
2. **Prop and avatar set size.** Start with three avatars and six props. Add only
   if a dogfood project needs one.
3. **Tap-only mode.** Whether touch needs a dpad at all, or tap-to-walk is enough.
   Start with the dpad. Revisit after the phone test.

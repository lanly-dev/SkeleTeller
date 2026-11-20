# SkeleTeller Quest (Demo Game)

App A of SkeleTeller. It turns a storyboard into a small browser game: one
character walks through a chain of areas themed on your project, and each area
shows one scene. Walking the game is touring the project.

The spec is in `.kiro/specs/demo-game/` (requirements, design, tasks).

## Run it

From the repository root, once:

```bash
npm install
```

Then, with your storyboard at `demo/storyboard.yml`:

```bash
npm run dev -w apps/demo-game      # local server with live reload
npm run build -w apps/demo-game    # static site in apps/demo-game/dist/
```

To try it with the bundled sample instead:

```bash
npm run dev:sample -w apps/demo-game
npm run build:sample -w apps/demo-game
```

Any other storyboard works too. The path is relative to `apps/demo-game/`:

```bash
npm run prepare -w apps/demo-game -- ../../skeleton/examples/sample-spooky.yml
```

Every dev and build run starts with a prepare step. It validates the storyboard
with the shared validator in `skeleton/`, stops with scene numbers if anything is
wrong (including a missing image or a path outside the storyboard folder), copies
the images, and writes the parsed storyboard for the game to load.

## How scenes become areas

Areas follow the storyboard order. Each one is a single screen, with doors on the
left and right edges.

| Scene | Area |
|---|---|
| `title` | Start area, with the project name and tagline on a sign |
| `feature` | A screen station. Opening it shows the image, caption and narration |
| `callout` | A screen station whose image has numbered hotspots. Each reveals its label |
| `code` | A terminal station that shows the snippet with highlighted lines |
| `outro` | The exit, with the closing caption and the repository link |

The heads-up bar shows the area number and the current scene's caption.

## Controls

| Action | Keyboard | Touch |
|---|---|---|
| Walk | Arrow keys or WASD | On-screen pad |
| Open a station | E or Space, when "Press E to view" shows | View button, or tap the station |
| Close | Escape, or the Close button | Close button |

Touch controls appear on touch screens, or as soon as the screen is touched. On a
phone, landscape gives the biggest view.

## Theme

The storyboard's optional `theme` block sets the look. Without it, a default
theme applies, and any invalid value falls back to its default on its own.

- `palette`: background, ground, accent, text and station colors.
- `mood`: `cozy` (tiles), `neon` (grid and glow), `spooky` (specks and a dark vignette) or `clean`.
- `avatar`: `explorer`, `robot` or `ghost`.
- `props`: up to eight of `plant`, `lamp`, `crate`, `sign`, `bookshelf`, `banner`.

Compare `skeleton/examples/sample-project.yml` with `sample-spooky.yml`: the scenes
are the same, only the theme differs, and the two builds look different with no
code change.

## Hosting

The build is a static folder with relative paths, so it works from any static host
and from a subpath. `.github/workflows/pages.yml` publishes it to GitHub Pages at
`/quest/` on every push to `main`. It builds from `demo/storyboard.yml` when the
repository has one, and from the sample until then.

## Scope

One fixed engine: walk and interact only. No combat, enemies, inventory, puzzles,
physics, saving, scores, audio or level editor. The theme reskins the world; it
never changes the game.

## Development

```bash
npm test            # from the repository root: all tests
npm run typecheck   # from the repository root: strict TypeScript, skeleton and game
```

| File | Role |
|---|---|
| `scripts/prepare.ts` | Validates the storyboard, copies images, writes the generated JSON |
| `src/storyboard.ts` | Loads the generated storyboard |
| `src/world.ts` | Areas, stations and doors from scene order (pure, tested) |
| `src/theme.ts` | Theme with per-field defaults (pure, tested) |
| `src/game.ts` | Movement, walls, doors, station range, panel lock (pure, tested) |
| `src/input.ts`, `src/touch.ts` | Keyboard and touch into one input state |
| `src/draw.ts` | Canvas drawing of the world, avatar and heads-up bar |
| `src/panel.ts` | Station panels, built with text nodes only |
| `src/text.ts` | Link and text-fitting helpers (pure, tested) |
| `src/main.ts` | Wiring and the frame loop |

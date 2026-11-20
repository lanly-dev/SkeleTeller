# SkeleTeller Storybook (Slide Walkthrough)

App B of SkeleTeller. It turns the same storyboard as the game into a storybook
style slide walkthrough: one slide per scene, paged at the reader's own pace, with
numbered hotspots that reveal explanations. It shows the project's images and
story. It does not embed or run the project itself.

**Read it:** https://lanly-dev.github.io/SkeleTeller/storybook/ (built from the sample storyboard).

The spec is in `.kiro/specs/slide-walkthrough/` (requirements, design, tasks).

## Run it

From the repository root, once:

```bash
npm install
```

Then, with your storyboard at `demo/storyboard.yml`:

```bash
npm run dev -w apps/slide-walkthrough      # local server with live reload
npm run build -w apps/slide-walkthrough    # static site in apps/slide-walkthrough/dist/
```

With the bundled sample instead:

```bash
npm run dev:sample -w apps/slide-walkthrough
npm run build:sample -w apps/slide-walkthrough
```

Every dev and build run starts with the same prepare step as the game, from
`skeleton/src/prepare.ts`. It validates the storyboard with the shared validator,
stops with scene numbers if anything is wrong, copies the images, and writes the
parsed storyboard for the app to load.

## How scenes become slides

| Scene | Slide |
|---|---|
| `title` | Title page with the tagline, over a dimmed background image |
| `feature` | Image beside the caption, with the narration behind "Read the narration" |
| `callout` | Image with numbered hotspots. Selecting one shows its label |
| `code` | The snippet with line numbers and highlighted lines marked |
| `outro` | Closing caption and the repository link |

Hotspot positions come from the storyboard's 0 to 1 callout coordinates, so they
stay on the same point of the image at any screen size, and match the game.

## Controls

| Action | Keyboard | Mouse or touch |
|---|---|---|
| Next slide | Right arrow, Page Down, Space | Next button, swipe left |
| Previous slide | Left arrow, Page Up, Shift+Space | Back button, swipe right |
| First or last slide | Home, End | Progress bar |
| Jump to a slide | Tab to the progress bar | Click or tap a progress step |
| Hotspot | Tab to it, then Enter or Space | Click or tap it |
| Close a hotspot label | Escape | Select the hotspot again |

The slide number is kept in the address, for example `#/4`, so reloading or
sharing the link opens the same slide, and browser back and forward move between
slides.

## Theme

The storyboard's optional `theme` block colors the book. The palette sets the page,
text, accent and hotspot colors, and the mood changes corners and borders. Text
that would be hard to read on the chosen background is replaced with a readable
color. Without a theme block, the same defaults as the game apply.

## Hosting and offline use

The build is a static folder with relative paths and no external requests: no CDN
scripts, fonts or styles. All images are loaded when the page opens, so paging
keeps working if the connection drops afterwards. `.github/workflows/pages.yml`
publishes it to GitHub Pages at `/storybook/`, next to the game at `/quest/`.

## Scope

Paging, hotspots and progress only. No video, audio, autoplay, editor, comments,
accounts, analytics or saved progress beyond the address.

## Development

```bash
npm test            # from the repository root: all tests
npm run typecheck   # from the repository root: strict TypeScript for all projects
```

| File | Role |
|---|---|
| `scripts/prepare.ts` | Validates the storyboard, copies images, writes the generated JSON |
| `src/storyboard.ts` | Loads the generated storyboard |
| `src/slides.ts` | Storyboard to slide models, link safety (pure, tested) |
| `src/router.ts` | Slide number in the address (pure, tested) |
| `src/theme.ts` | Palette and mood to CSS variables, contrast check (pure, tested) |
| `src/render.ts` | One slide to DOM, text nodes only |
| `src/controls.ts` | Buttons, progress bar, keys and swipe |
| `src/main.ts` | Wiring, history and image preloading |

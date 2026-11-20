# SkeleTeller Storybook (Slide Walkthrough)

**Status:** specified, not built yet. The spec is in
`.kiro/specs/slide-walkthrough/` (requirements, design, tasks). It is built after
the demo game is playable.

App B of SkeleTeller. It builds a static, storybook-style walkthrough from the same
storyboard as the game. The viewer pages through one slide per scene at their own
pace and clicks hotspots to reveal explanations. It does not embed or run the
demoed project.

## How scenes appear

| Scene | Slide |
|---|---|
| `title` | Title page |
| `feature` | Capture and caption, with narration on request |
| `callout` | Capture with numbered hotspots that reveal their labels |
| `code` | Snippet with highlighted lines |
| `outro` | Closing page with the repository link |

## Controls (planned)

- Next and back buttons, and a progress bar where each step jumps to its slide.
- Arrow keys, Page Up and Page Down, Space, Home and End.
- Swipe left or right on touch screens.
- The slide number is kept in the URL, so a link opens the same slide.

## Usage (planned)

```bash
npm run dev -w apps/slide-walkthrough      # serve locally
npm run build -w apps/slide-walkthrough    # static build from demo/storyboard.yml
```

The build validates the storyboard first and fails with scene numbers when
something is wrong. The output has no external requests and can be hosted on any
static host.

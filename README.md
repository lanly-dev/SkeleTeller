# SkeleTeller

**A Kiroween 2026 Skeleton Crew Entry**

SkeleTeller tells a project's story from its bones — the storyboard. Write one storyboard specification, get two outputs:

1. **Demo Video** — A rendered MP4 showcasing your project (under 3 minutes)
2. **Slide Walkthrough** — An interactive, storybook-style web presentation

## What is This?

SkeleTeller is a skeleton (boilerplate) for producing software demos programmatically. The core idea:

- **One storyboard spec** (YAML file) describes your project's story as ordered scenes
- **Two different tellings** of that story: a video you watch, and interactive slides you page through
- **Repeatable procedure** — use the skeleton for any project

## Repository Structure

```
skeleton/              # The reusable template
├── schema/           # Storyboard format and validator
├── scene-types/      # Scene primitive documentation
├── examples/         # Sample storyboard with assets
└── README.md         # How to use the skeleton

apps/
├── demo-video/       # App A: storyboard → rendered video
└── slide-walkthrough/ # App B: storyboard → interactive web app

.kiro/                # Kiro layer (specs, steering, hooks)
```

## Quick Start

1. **Write a storyboard** (or use the example):
   ```bash
   cp skeleton/examples/sample-project.yml my-project.yml
   ```

2. **Gather your assets** (screenshots, code snippets) and reference them in the storyboard

3. **Generate outputs:**
   - Video: `cd apps/demo-video && python render.py ../../my-project.yml`
   - Slides: `cd apps/slide-walkthrough && npm run build ../../my-project.yml`

See `skeleton/README.md` for detailed instructions.

## Scene Types

SkeleTeller supports 5 scene types:

- **Title** — Project name, tagline, intro
- **Feature** — Show a capability with a screenshot
- **Callout** — Highlight specific UI elements with annotations
- **Code** — Display code snippets with syntax highlighting
- **Outro** — Closing frame, call-to-action

Each scene becomes a timed video segment AND an interactive slide.

## Requirements

- Python 3.8+ (for video rendering)
- Node.js 16+ (for slide walkthrough)
- FFmpeg (for video output)

## License

MIT — see LICENSE file

## Credits

Built with [Kiro](https://kiro.dev) for Kiroween 2026.

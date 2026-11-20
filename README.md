# SkeleTeller

<p align="center">
  <img src="assets/icon.png" width="180" alt="SkeleTeller — a skeleton wizard conjuring a demo video from an open storybook">
</p>

**A Kiroween 2026 Skeleton Crew Entry**

SkeleTeller tells a project's story from its bones — the storyboard. Write one storyboard specification, get two outputs:

1. **SkeleTeller Quest** — A playable 2D walk-around game themed on your project: a character runs around its world, and each area conveys a feature
2. **SkeleTeller Storybook** — An interactive, storybook-style slide walkthrough you page through yourself

## Try it

- **SkeleTeller Quest:** https://lanly-dev.github.io/SkeleTeller/quest/
- **SkeleTeller Storybook:** coming next

Both are built from the same sample storyboard, `skeleton/examples/sample-project.yml`.

## What is This?

SkeleTeller is a skeleton (boilerplate) for producing software demos programmatically. The core idea:

- **One storyboard spec** (YAML file) describes your project's story as ordered scenes
- **Two different tellings** of that story: a game you play, and interactive slides you page through
- **Repeatable procedure** — use the skeleton for any project

## Repository Structure

```
skeleton/              # The reusable template
├── schema/           # Storyboard JSON Schema
├── src/              # Shared TypeScript validator, loader, CLI and tests
├── scene-types/      # Scene type reference
├── examples/         # Sample storyboard with assets
└── README.md         # How to use the skeleton

apps/
├── demo-game/        # App A, SkeleTeller Quest: storyboard → playable game
└── slide-walkthrough/ # App B, SkeleTeller Storybook: storyboard → interactive slides

demo/                 # Your storyboard and assets (drafted by Kiro)

.kiro/                # Kiro layer: specs, steering, hooks, workflows
```

## Quick Start

1. **Clone this repo and open it in Kiro.** Run `npm install` once.
2. **Point Kiro at your project.** Give it a local folder path or a public GitHub URL and ask it to draft a storyboard. Kiro writes `demo/storyboard.yml` and copies the screenshots it picks into `demo/assets/`.
3. **Trim the draft by hand** and check it:
   ```bash
   npm run validate -- demo/storyboard.yml
   ```
4. **Build the two apps** from `demo/`. The game and the slides are still being built, so these commands are planned:
   - Game: `npm run build -w apps/demo-game`
   - Slides: `npm run build -w apps/slide-walkthrough`

See `skeleton/README.md` for the full procedure.

## Scene Types

SkeleTeller supports 5 scene types:

- **Title** — Project name, tagline, intro
- **Feature** — Show a capability with a screenshot
- **Callout** — Highlight specific UI elements with annotations
- **Code** — Display a code snippet with highlighted lines
- **Outro** — Closing frame, call-to-action

Each scene becomes an area in the game AND an interactive slide.

## Requirements

- Node.js 20 or later (validation, and building both apps)
- A web browser (the game and the walkthrough both run in it)

## License

MIT — see LICENSE file

## Credits

Built with [Kiro](https://kiro.dev) for Kiroween 2026.

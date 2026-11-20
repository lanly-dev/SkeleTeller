# SkeleTeller Skeleton

The reusable part of SkeleTeller. One storyboard file drives two apps:
**SkeleTeller Quest** (a playable walk-around game) and **SkeleTeller Storybook**
(an interactive slide walkthrough). This folder holds the storyboard contract and
the shared validator both apps use.

## Contents

```
skeleton/
  schema/storyboard.schema.json   the storyboard contract (JSON Schema)
  src/                            shared validator, loader, CLI, tests (TypeScript)
  scene-types/README.md           what each scene type needs and how it appears
  examples/sample-project.yml     a complete sample storyboard
  examples/assets/                placeholder captures used by the sample
```

## Make a demo of your project

### 1. Set up

Clone the repo, open it in Kiro, and install once from the repo root:

```bash
npm install
```

Node.js 20 or later is required.

### 2. Point Kiro at your project

Tell Kiro where your project is. Either form works:

- A local folder: "Draft a storyboard from `../my-app`."
- A public GitHub repo: "Draft a storyboard from https://github.com/you/my-app."

You can also put the project's README and screenshots in a `project/` folder in
this repo (git ignores it) and say "Draft a storyboard from `project/`."

Kiro follows `.kiro/steering/storyboard-drafting.md`. It reads the README, picks
real UI screenshots, writes `demo/storyboard.yml`, copies the screenshots into
`demo/assets/`, and validates the result. It asks you when it cannot find enough
screenshots. The same steps are packaged as the workflow in
`.kiro/workflows/generate-storyboard.workflow.json`.

### 3. Trim the draft

Open `demo/storyboard.yml` and edit it by hand: shorten captions, reorder scenes,
remove what you don't need. Five to eight scenes is a good size. Then check it:

```bash
npm run validate -- demo/storyboard.yml
```

With no file given, `npm run validate` checks the sample and `demo/storyboard.yml`.
Every problem is listed with its scene number. The command exits non-zero on any
error, including a missing image. Saving a storyboard in Kiro runs the same check
through a hook.

### 4. Build the apps

Both apps read `demo/` only. They are still being built, so these commands are
planned and follow the app specs in `.kiro/specs/`:

```bash
npm run build -w apps/demo-game          # SkeleTeller Quest
npm run build -w apps/slide-walkthrough  # SkeleTeller Storybook
```

Change the storyboard and rebuild to update both. No app code is edited per project.

## Storyboard format

```yaml
version: "1.0"

project:
  name: "MyApp"
  description: "What it does, in one sentence"
  repository: "https://github.com/you/my-app"   # optional, http or https only

theme:              # optional, every field optional
  palette:
    background: "#1a2332"
    ground: "#26364d"
    accent: "#ffb347"
    text: "#f2f5f9"
    station: "#4fc3f7"
  mood: "clean"     # cozy | neon | spooky | clean
  avatar: "explorer" # explorer | robot | ghost
  props: ["plant", "lamp"]  # up to 8 of: plant lamp crate sign bookshelf banner

scenes:
  - type: title
    title: "MyApp"
    tagline: "One-line value"
  - type: feature
    visual: "assets/dashboard.png"
    caption: "What this screen does"
  - type: outro
    caption: "github.com/you/my-app"
```

- Scenes appear in the order written. Each becomes one game area and one slide.
- Image paths are relative to the storyboard file and must stay inside its folder.
- Unknown or misspelled fields are errors, so typos are caught early.
- When `theme` is left out, both apps use a built-in default look.
- There is no duration field. Both outputs are self-paced.

See [scene-types/README.md](scene-types/README.md) for each scene type's fields.

## Limits

- **Private repositories:** Kiro cannot fetch a private GitHub URL. Use a local
  folder path instead.
- **No live capture:** Kiro does not screenshot a running app. The images must
  already exist in the project, or you supply them.
- **Image rights:** use screenshots from your own project, or one you have
  permission to use.

## Developing the skeleton

```bash
npm test            # schema and validator tests
npm run typecheck   # strict TypeScript check
```

The schema and validator are specified in `.kiro/specs/storyboard-schema/`.
Saving a file under `skeleton/schema/` or `skeleton/src/` runs the tests through a hook.

## License

MIT, see the repository root `LICENSE`.

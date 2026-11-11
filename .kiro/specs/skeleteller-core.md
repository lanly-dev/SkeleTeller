# SkeleTeller Core Spec

**Status:** Draft  
**Created:** 2026-11-11  
**Category:** Kiroween 2026 - Skeleton Crew

## Overview

SkeleTeller is a skeleton (boilerplate) for programmatically producing demos of software projects from a single storyboard specification. One storyboard produces two distinct outputs:
1. A rendered demo video (watch format)
2. An interactive slide walkthrough (storybook format — viewer-paced with clickable hotspots)

## Requirements

### Storyboard Concept

A storyboard is an ordered list of scenes. Each scene has:
- **Type:** one of ~5 fixed types
- **Visual:** reference to a capture/asset (screenshot, code snippet, diagram)
- **Caption/Narration Text:** what this scene explains
- **Callouts:** optional highlights/annotations on the visual
- **Duration:** how long this scene plays (for video output)

#### Scene Types (Fixed Set)

1. **Title** — Project name, tagline, intro frame
2. **Feature/Capture** — Show a feature in action via screenshot or screen capture
3. **Callout/Zoom** — Highlight a specific UI element or code block with annotation
4. **Code-or-Spec Highlight** — Display code snippet or spec excerpt with syntax highlighting
5. **Outro** — Closing frame, credits, call-to-action

### Two Output Formats

#### Output 1: Demo Video (App A)
- Rendered MP4 file, under 3 minutes total
- Each scene becomes a timed segment with visuals, captions, and callouts
- Scenes stitched in order: title → feature scenes → outro
- No voice pipeline beyond text captions (TTS optional only if trivial from the stack)

#### Output 2: Slide Walkthrough (App B)
- Static web app, hosted and interactive
- Each scene becomes a page/slide
- Interactivity: page navigation (next/back/progress), keyboard controls, clickable hotspots/callouts that reveal explanations
- Optional page-flip visual feel
- **Does NOT embed or run the target project** — only presents the storyboard's captures and story

### Shared Storyboard Format

- One file format (YAML or JSON), shared by both apps
- One schema/validator used by both
- Both apps consume the same storyboard file without hand-editing app code

### Acceptance Checks (from AGENTS.md)

- [ ] One storyboard spec produces BOTH outputs with no hand-editing of app code
- [ ] Editing the storyboard (change text, reorder scenes) changes both outputs on re-run
- [ ] A demo for a sample project can be produced from skeleton/ by following skeleton README alone
- [ ] Demo Video and Slide Walkthrough each run from their own folder with working URLs
- [ ] Dogfood: the procedure produces a real demo for at least one other Kiroween entry (e.g. Skinwalker or SpectreGram), and this entry's own submission video is produced by App A

### Scope Caps (Hard Constraints from AGENTS.md)

- Skeleton stays LEAN: storyboard schema, ~5 scene types, capture/asset step, one render step, one slide build step, Kiro layer
- **No visual editor, no timeline UI** — storyboard is a file you edit
- Slide interactivity is storybook-level only (paging, hotspots, progress) — no live project embedding
- Narration is captions/text only (TTS optional if trivial)
- No accounts, no project hosting, no saved history beyond local files

### Repository Structure (Fixed)

```
SkeleTeller/
├── skeleton/              # The template itself
│   ├── schema/           # Storyboard schema + validator
│   ├── scene-types/      # Scene primitives
│   ├── examples/         # Sample storyboard
│   └── README.md         # How to use the skeleton
├── apps/
│   ├── demo-video/       # App A: storyboard → MP4
│   └── slide-walkthrough/ # App B: storyboard → web app
├── .kiro/                # Kiro layer (specs, steering, hooks)
│   ├── specs/
│   ├── steering/
│   └── hooks/
├── LICENSE               # MIT
└── README.md             # Project overview
```

### Kiro Layer Requirements

The skeleton's `.kiro/` must include:
- **Spec templates** for drafting new storyboards
- **Steering docs** explaining how to draft a storyboard from a project's README/screenshots
- **At least one agent hook** that automates part of the workflow

### Compliance Requirements (Kiroween 2026)

- No absolute local paths anywhere (code, comments, specs, docs, commits)
- `.kiro/` never gitignored
- MIT license at repo root
- Public GitHub repo
- Core implementation by Kiro, spec-first (specs committed before implementation)
- Demo video < 3 minutes, public YouTube
- Working URLs for both apps
- Git history shows spec-first discipline

## Design

### Stack Decision

**Storyboard Format:** YAML  
**Why:** Human-readable, easy to edit by hand, good library support in both Python and Node, natural fit for ordered lists with metadata.

**Schema/Validation:** JSON Schema (with YAML parser)  
**Why:** Language-agnostic, can validate YAML parsed to JSON, tooling exists for both Python and Node.

**Demo Video (App A) Stack:** Python + FFmpeg  
**Why:**
- FFmpeg is the industry standard for video rendering
- Python has mature libraries: `moviepy` (high-level FFmpeg wrapper), `Pillow` (image manipulation), `pyyaml` (YAML parsing)
- Lightweight: no heavy frameworks, just a script pipeline
- Cross-platform

**Slide Walkthrough (App B) Stack:** Static HTML/CSS/JS (vanilla or minimal framework like Alpine.js)  
**Why:**
- Static web app = easy hosting (GitHub Pages, Netlify, Vercel)
- No build complexity for a storybook viewer
- Minimal dependencies
- Same YAML storyboard consumed via fetch or bundled JSON

**Shared Components:**
- `storyboard.schema.json` — JSON Schema for validation
- `validator.py` or `validator.js` — thin wrapper for schema validation
- Both apps parse the same YAML storyboard file

### Architecture

```
Storyboard (YAML)
    ↓
Schema Validator
    ↓
├─→ Demo Video Pipeline (Python + FFmpeg)
│   ├─ Parse YAML
│   ├─ Load assets (images, code snippets)
│   ├─ Render scenes (captions, callouts, timing)
│   └─ Stitch → output.mp4
│
└─→ Slide Walkthrough Builder (Static Web)
    ├─ Parse YAML
    ├─ Generate HTML slides
    ├─ Add interactivity (nav, hotspots)
    └─ Bundle → index.html + assets
```

### Scene Primitive Design

Each scene type is a reusable primitive with:
- **Input schema** (YAML structure)
- **Video renderer** (Python: generates video segment)
- **Slide renderer** (JS/HTML: generates slide markup)

Example Title scene:
```yaml
- type: title
  title: "MyApp"
  tagline: "A revolutionary tool"
  background: "assets/title-bg.png"
  duration: 3
```

### Storyboard Schema (Draft)

```yaml
version: "1.0"
project:
  name: string
  description: string
  
scenes:
  - type: title | feature | callout | code | outro
    # Common fields
    duration: number (seconds, for video)
    visual: string (path to asset)
    caption: string
    narration: string (optional)
    
    # Type-specific fields
    callouts:  # for callout/zoom scenes
      - x: number
        y: number
        label: string
        
    code:  # for code scenes
      language: string
      snippet: string
      highlight_lines: [number]
```

### Implementation Order (Tasks)

**Phase 1: Skeleton Only**

1. **Repository Scaffold**
   - Create folder structure (skeleton/, apps/demo-video/, apps/slide-walkthrough/)
   - Add MIT LICENSE
   - Add root README.md
   - Add .gitignore (excluding .kiro/)
   - Create .kiro/ with subdirs (specs/, steering/, hooks/)

2. **Storyboard Schema**
   - Write `skeleton/schema/storyboard.schema.json`
   - Define all 5 scene types with required/optional fields
   - Write `skeleton/schema/validator.py` (JSON Schema validator)

3. **Scene Primitives**
   - Document each scene type in `skeleton/scene-types/README.md`
   - Create reference implementations (Python functions for video, HTML templates for web)

4. **Sample Storyboard**
   - Write `skeleton/examples/sample-project.yml`
   - Include at least one of each scene type
   - Add corresponding assets in `skeleton/examples/assets/`

5. **Skeleton README**
   - Document: how to write a storyboard, scene type reference, how to run the procedure
   - Should be self-contained: someone can produce a demo by following it

6. **Kiro Layer**
   - `/.kiro/specs/` — this spec file
   - `/.kiro/steering/storyboard-drafting.md` — guide for drafting storyboards from project READMEs
   - `/.kiro/hooks/validate-storyboard.json` — hook that validates storyboard on save
   - Add spec templates for new projects

**Phase 2: Demo Video App (Not Started Yet)**

Will be designed in a separate spec after Phase 1 approval.

**Phase 3: Slide Walkthrough App (Not Started Yet)**

Will be designed in a separate spec after Phase 1 approval.

## Open Questions

1. Should the schema allow custom scene types, or keep it strictly to the 5 fixed types? → **Decision pending**
2. Asset paths: relative to storyboard file, or absolute from skeleton root? → **Recommend relative to storyboard file for portability**
3. Should we include a capture script/tool in the skeleton, or assume assets are provided? → **Decision pending**

## Success Criteria

Phase 1 is complete when:
- [ ] Skeleton folder contains: schema, validator, scene type docs, sample storyboard with assets, and README
- [ ] Kiro layer contains: this spec, steering for storyboard drafting, at least one hook
- [ ] Repo structure matches the fixed layout (skeleton/, apps/, .kiro/, LICENSE, README)
- [ ] No absolute paths anywhere in the codebase
- [ ] .kiro/ is tracked in git (not ignored)
- [ ] Someone can read skeleton/README.md and understand how to write a storyboard
- [ ] Validator successfully validates the sample storyboard

## Credit Budget

~1,300 Kiro credits allocated for this entire project (largest of 4 Kiroween entries).  
**Strategy:** Be economical. Lean implementations, minimal dependencies, working > polished.

## Notes

- This is a **proof skeleton** — the goal is to prove the concept with two genuinely different outputs from one storyboard format, not to build production tooling.
- The submission video itself will be produced using App A (dogfooding requirement).
- Judge visibility: git history must show specs committed before implementation code.

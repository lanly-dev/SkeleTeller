---
inclusion: auto
name: SkeleTeller Workflow
description: Development workflow and conventions for the SkeleTeller project
---

# SkeleTeller Project Workflow

This steering file documents the development workflow and conventions for SkeleTeller.

## Project Context

SkeleTeller is a Kiroween 2026 Skeleton Crew entry. It's a skeleton (boilerplate) for programmatically producing demos from a single storyboard specification.

**Key Constraint:** Spec-driven development. Specs are committed BEFORE implementation code. The git history is evidence for judges.

## Repository Structure (Fixed)

```
SkeleTeller/
├── skeleton/              # The reusable template
│   ├── schema/           # Storyboard JSON Schema + validator
│   ├── scene-types/      # Scene primitive documentation  
│   ├── examples/         # Sample storyboard with assets
│   └── README.md
├── apps/
│   ├── demo-video/       # App A: storyboard → MP4
│   └── slide-walkthrough/ # App B: storyboard → interactive web
├── .kiro/                # Kiro layer (specs, steering, hooks)
│   ├── specs/
│   ├── steering/
│   └── hooks/
├── LICENSE               # MIT
└── README.md
```

**This structure is fixed per Skeleton Crew rules.** Both apps must remain genuinely separate.

## Development Phases

### Phase 0: Specs (COMPLETE)
- ✅ Core spec in `.kiro/specs/skeleteller-core.md`
- ✅ Steering docs in `.kiro/steering/`
- ✅ Defines: requirements, design, task breakdown

### Phase 1: Skeleton Only (COMPLETE)
- ✅ Storyboard schema + validator
- ✅ Scene type documentation
- ✅ Sample storyboard with assets
- ✅ Skeleton README
- ✅ Agent hook for validation
- ✅ Repository scaffold with .gitignore, LICENSE

**Acceptance:** Someone can write a storyboard by following skeleton/README.md alone.

### Phase 2: Demo Video App (NOT STARTED)
Will be spec'd separately after Phase 1 approval.

### Phase 3: Slide Walkthrough App (NOT STARTED)
Will be spec'd separately after Phase 2 completion.

## Hard Rules

**No absolute local paths**
- NEVER commit paths like `/home/user/...` or `C:\Users\...`
- Use repo-relative paths only: `skeleton/schema/...`, `.kiro/specs/...`
- This applies to: code, comments, specs, docs, commit messages, README

**Never gitignore .kiro/**
- The `.kiro/` directory MUST be tracked in git
- It's required for Kiroween compliance
- Specs, steering, and hooks are judging evidence

**Spec-first discipline**
- Specs committed before implementation
- Git history shows the order clearly
- This IS the product claim for this entry

**Lean and economical**
- Budget: ~1,300 Kiro credits for the entire project
- Keep implementations minimal
- Working > polished

## Stack Decisions (From Core Spec)

**Storyboard Format:** YAML  
**Schema:** JSON Schema  
**Demo Video:** Python + FFmpeg (moviepy)  
**Slide Walkthrough:** Static HTML/CSS/JS (vanilla or Alpine.js)

These decisions are locked in the core spec. Don't change the stack without updating the spec first.

## Scene Types (Fixed Set of 5)

1. **title** — Opening frame with project name
2. **feature** — Show a capability with screenshot
3. **callout** — Highlight UI details with annotations
4. **code** — Display code snippet with syntax highlighting
5. **outro** — Closing frame with call-to-action

Do NOT add new scene types without updating the schema and spec.

## Validation Workflow

The PostFileSave hook runs the validator automatically on YAML files:
```bash
python skeleton/schema/validator.py <file.yml>
```

Manual validation:
```bash
python skeleton/schema/validator.py skeleton/examples/sample-project.yml
```

## Scope Caps (From AGENTS.md)

These are **hard limits** to keep the project shippable:

❌ **Do NOT add:**
- Visual editor or timeline UI
- Live project embedding in slide walkthrough
- Voice pipeline / TTS (unless trivial from stack)
- User accounts or project hosting
- Saved history beyond local files
- Additional scene types beyond the 5
- Advanced video effects or transitions

✅ **Stay focused on:**
- Clean, minimal implementations
- The core procedure: one storyboard → two outputs
- Proving the skeleton concept works

## Kiro Layer Components

**Specs** (`.kiro/specs/`)
- `skeleteller-core.md` — main project spec

**Steering** (`.kiro/steering/`)
- `storyboard-drafting.md` — guide for writing storyboards (manual inclusion)
- `project-workflow.md` — this file (auto inclusion)

**Hooks** (`.kiro/hooks/`)
- `validate-storyboard.json` — validates YAML on save

## Testing Strategy

**Skeleton Phase:**
- Validator correctly validates the sample storyboard ✅
- Validator catches common errors (missing fields, invalid types)
- Sample storyboard renders correctly in both apps (after apps are built)

**App Phase:**
- One storyboard → both outputs with no code changes between
- Editing storyboard → both outputs update on re-run
- Dogfooding: use skeleton to produce demo for another Kiroween entry

## Acceptance Checks (From AGENTS.md)

Before submission, verify:
- [ ] One storyboard produces BOTH outputs without hand-editing app code
- [ ] Editing the storyboard changes both outputs on re-run
- [ ] Demo can be produced from skeleton/ by following README alone
- [ ] Both apps run from separate folders with working URLs
- [ ] Dogfood complete: skeleton used for another entry, and this entry's submission video is produced by App A

## File Naming Conventions

- Storyboards: `project-name.yml` or `storyboard.yml`
- Assets: descriptive names (`dashboard.png`, not `img1.png`)
- Python scripts: lowercase with underscores (`validator.py`, `render.py`)
- Docs: uppercase for major files (`README.md`), lowercase for others

## Commit Message Style

Follows conventional commits loosely:

```
feat: add storyboard schema and validator
docs: create scene types reference
fix: correct duration validation in schema
chore: add MIT license
```

Keep commits atomic and descriptive.

## Credit Budget Tracking

~1,300 credits allocated for this entry (largest of 4 Kiroween entries).

**Phase allocations (rough):**
- Phase 0-1 (Skeleton): ~400 credits
- Phase 2 (Demo Video): ~450 credits
- Phase 3 (Slide Walkthrough): ~400 credits
- Dogfooding + polish: ~50 credits

Monitor usage; if running low, simplify implementations.

## When to Ask for Approval

**Before proceeding to Phase 2 or 3:**
- Summarize what's complete
- Show the file structure
- Explain the stack choices and why
- List the remaining tasks
- Wait for user approval

**For major design changes:**
- Update the spec first
- Explain the reasoning
- Get confirmation before implementing

## Dependencies

**Python (Skeleton + Demo Video):**
```bash
pip install PyYAML jsonschema Pillow moviepy
```

**Node.js (Slide Walkthrough):**
```bash
npm install js-yaml prismjs
```

FFmpeg (external dependency for video rendering):
- Install via system package manager or from ffmpeg.org

## Common Tasks

**Validate a storyboard:**
```bash
python skeleton/schema/validator.py path/to/storyboard.yml
```

**Generate sample assets:**
```bash
python skeleton/examples/generate-assets.py
```

**Render a video (after Phase 2):**
```bash
cd apps/demo-video
python render.py ../../storyboard.yml
```

**Build slide walkthrough (after Phase 3):**
```bash
cd apps/slide-walkthrough
npm run build ../../storyboard.yml
```

## References

- **Core Spec:** `.kiro/specs/skeleteller-core.md`
- **AGENTS.md:** Project brief and compliance requirements
- **Scene Types:** `skeleton/scene-types/README.md`
- **Storyboard Guide:** `.kiro/steering/storyboard-drafting.md`

## Notes for AI Agents

When working on this project:

1. **Always read AGENTS.md first** — it's the binding brief
2. **Check the phase** — don't implement Phase 2/3 work during Phase 1
3. **Respect scope caps** — no features beyond what's in the spec
4. **No absolute paths** — ever
5. **Validate often** — run the validator after any storyboard changes
6. **Stay economical** — lean implementations, minimal dependencies

If unsure about scope, design, or next steps: **ask the user before proceeding**.

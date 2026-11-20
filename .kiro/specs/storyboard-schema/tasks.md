# Storyboard Schema and Validator — Tasks

> Foundation for the game and the slides. Finish this before `demo-game` T1.
> Tasks are ordered so the repo stays working after each one.

## T0 — Workspace
- Add root `package.json` with npm workspaces (`skeleton`, `apps/*`), a root
  `test` script and a `validate` script.
- Add `skeleton/package.json` with pinned exact versions: ajv, ajv-formats,
  js-yaml, tsx, typescript, vitest.
- Add root `tsconfig` settings (strict) shared by workspaces.
- **Done:** `npm install` succeeds and `npm test` runs (no tests yet is fine).

## T1 — Schema rewrite
- Rewrite `skeleton/schema/storyboard.schema.json` per the design: five scene
  definitions with `additionalProperties: false`, `theme`, normalized callouts,
  `callouts` required with `minItems: 1`, removed `duration`, format checks.
- **Done:** schema compiles in Ajv with `strict` mode and `discriminator: true`.

## T2 — Types and validator
- `src/types.ts`, `src/validate.ts` with `validateStoryboard`, path-to-scene-number
  translation, the removed-field message, and the highlight-line check.
- **Done:** returns all errors for a storyboard with several problems.

## T3 — Assets and loader
- `src/assets.ts` with `checkAssets` (existence, containment, no absolute or URL).
- `src/load.ts` combining YAML parse, validation and asset check.
- **Done:** loader returns a storyboard for the sample and issues for a broken file.

## T4 — Tests
- `src/validate.test.ts` and `src/assets.test.ts` with the cases listed in the
  design.
- **Done:** `npm test` green. Deleting one schema rule makes its case fail.

## T5 — CLI
- `src/cli.ts` with readable lines, summary, exit codes. Wire `npm run validate`.
- **Done:** sample exits zero. A broken file exits non-zero and lists every error.

## T6 — Sample and docs
- Convert `skeleton/examples/sample-project.yml`: remove durations and
  `total_duration`, normalize callout coordinates, add a `theme` block.
- Update `skeleton/scene-types/README.md` and the sample-related part of
  `skeleton/README.md` for the new fields and for game areas and slides.
- Update `.kiro/steering/storyboard-drafting.md` examples to match.
- Remove `skeleton/schema/validator.py`, `skeleton/requirements.txt` and
  `skeleton/examples/generate-assets.py`.
- **Done:** the sample validates through the CLI. Searching the docs for
  "duration" and "video" finds nothing outside archived specs.

## T7 — Hooks
- Replace the two storyboard hooks and fix the delete-confirmation hook per the
  design. Trigger each one once and note the result.
- **Done:** each hook fires and shows its output in this shell.

## T8 — Acceptance
- Run the full test suite and the CLI against the sample and against one
  deliberately broken storyboard in a temp folder.
- Note the date and result at the end of `requirements.md`.
- **Done:** every acceptance line in `requirements.md` passes or is listed with a reason.

---

**Review gate:** after T4 the contract is testable and the game spec can start.
T5 to T8 finish the skeleton.

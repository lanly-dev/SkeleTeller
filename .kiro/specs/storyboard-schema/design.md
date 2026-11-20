# Storyboard Schema and Validator — Design (spec-first)

> Spec status: **Design**. Requirements live in `requirements.md`. The stack
> matches the approved shared web stack: TypeScript and Node, no framework.

## Overview

The schema stays a JSON Schema file, so it remains readable by any tool. The
validator is a small TypeScript module that loads YAML, validates it with Ajv,
checks assets against the filesystem, and returns structured results. A thin CLI
wraps it for people, hooks and the draft workflow. Both apps import the same
function from `skeleton/`.

```
YAML text
  -> parse (js-yaml, safe load)
  -> validateStoryboard(data)        Ajv, schema, formats, discriminated scenes
  -> checkAssets(data, baseDir)      existence + containment (Node only)
  -> { ok, errors[] }
```

## Locked stack

TypeScript (strict), Node. `ajv` with `ajv-formats` for validation. `js-yaml` for
parsing. Vitest for tests. Dependency versions pinned exactly. The Python
validator and Pillow asset generator are removed (see Decisions).

## File structure (maps to tasks)

```
package.json                       root, npm workspaces: skeleton, apps/*
skeleton/
  package.json
  schema/storyboard.schema.json    the contract
  src/validate.ts                  validateStoryboard (pure, no filesystem)
  src/assets.ts                    checkAssets (filesystem, containment)
  src/load.ts                      loadStoryboard(path): parse YAML, run both checks
  src/cli.ts                       readable output, exit code
  src/types.ts                     Storyboard, Scene, Theme types
  src/validate.test.ts             table-driven cases
  src/assets.test.ts               temp-folder cases
  examples/sample-project.yml
  examples/assets/                 existing placeholder PNGs
  scene-types/README.md
```

`validate.ts` has no Node-only imports, so the slides app can reuse it in the
browser later if needed. `assets.ts` and `load.ts` are Node only.

## Schema structure

- Draft-07 JSON Schema. Top level: `version` (const `"1.0"`), `project`,
  `theme` (optional), `metadata` (optional), `scenes`.
- `scenes` is an array of one to twenty items. Each item is `oneOf` five
  definitions in `$defs`, one per type. Each definition fixes `type` with `const`
  and sets `additionalProperties: false`. Ajv runs with `discriminator: true` on
  `type`, so errors name the failing type rather than listing all five branches.
- Shared scene fields (`caption`, `narration`, `visual`) are repeated per
  definition through a small `$ref` to keep limits in one place: caption up to 200
  characters, narration up to 1000.
- `callout` definition: `callouts` has `minItems: 1`. Each item has `x` and `y`
  with `minimum: 0` and `maximum: 1`, and `label` up to 100 characters.
- `code` definition: `code` has `language`, `snippet` and optional
  `highlight_lines` (positive integers). A semantic check in the validator rejects
  a highlight line number greater than the snippet's line count.
- `theme` definition: hex color pattern `^#[0-9a-fA-F]{6}$`, enums for `mood` and
  `avatar`, `props` as an array of enum values with `maxItems: 8` and
  `uniqueItems: true`. `additionalProperties: false` throughout.
- `project.repository` and `project.website` use `format: uri` plus a pattern
  requiring `http` or `https`.
- `metadata.created` uses `format: date`.

## Validator API

```ts
type Issue = { scene?: number; path: string; message: string };
type Result = { ok: true } | { ok: false; errors: Issue[] };

function validateStoryboard(data: unknown): Result;          // schema + semantic checks
function checkAssets(sb: Storyboard, baseDir: string): Issue[];
function loadStoryboard(file: string): { storyboard: Storyboard } | { errors: Issue[] };
```

- Ajv runs with `allErrors: true` so every problem is reported at once.
- Scene numbers in messages are one-based. Ajv paths like `/scenes/3/caption` are
  translated to `scene 4, caption`.
- Messages for removed fields are specific: "`duration` is no longer used, remove it".
- `checkAssets` resolves each `visual` and `background` against `baseDir`. It
  rejects absolute paths, URLs and any path whose resolved location is outside
  `baseDir`, then checks existence.

## CLI

`node skeleton/src/cli.ts <storyboard>` (run through `tsx`) prints one line per
issue, then a summary with project name and scene count. With no file given it
checks the default targets that exist: `skeleton/examples/sample-project.yml` and
`demo/storyboard.yml`. Hooks rely on this, so they never need the saved file's path. Exit code is zero only
when there are no errors. It exposes the root script `npm run validate -- <file>`.

## Defaults

The schema declares no defaults. The default theme lives in each app's
`resolveTheme`. The skeleton README documents the default values so authors know
what an absent theme means.

## Decisions

1. **TypeScript replaces Python.** One stack across the repo and both apps import
   the same validator. Cost: rewrite of about 140 lines.
2. **Remove `duration` and `total_duration`.** No consumer remains. Keeping an
   unused required field forces authors to invent numbers.
3. **Normalized callout coordinates.** One frame that works at any display size
   in both apps. Cost: the sample's coordinates are converted once.
4. **Drop `generate-assets.py`.** The placeholder PNGs are committed. Keeping a
   Python dependency only to regenerate placeholders is not worth it.
5. **No theme per scene.** One world look per storyboard keeps the game a reskin.
6. **Missing assets fail by default.** Matches the intake spec.

## Hooks and automation changes

- Replace `validate-storyboard` with a hook that runs `npm run validate` on
  save, scoped to `demo/` and `skeleton/examples/`. It calls a Node command, so
  it does not depend on shell syntax.
- Replace `test-on-schema-change` with a hook that runs `npm test` when a file
  under `skeleton/schema/` or `skeleton/src/` is saved.
- Fix the delete-confirmation hook so it emits valid JSON from a Node one-liner or
  a small script, then verify by triggering it.

## Testing

- **validate.test.ts:** valid sample passes. One case per rule: unknown top-level
  key, unknown scene key, cross-type field, missing required field per type,
  callout scene with no callouts, callout value of 1.2, invalid hex color, unknown
  mood, ninth prop, bad URL, `javascript:` URL, bad date, removed `duration`,
  zero scenes, twenty-one scenes, highlight line past the snippet. Multi-error
  case asserts all errors are returned.
- **assets.test.ts:** temp folder with present and missing files, a path with
  `..` that escapes, an absolute path, a URL value.
- **Sample as fixture:** the checked-in sample must always validate with assets.

## Open decisions

1. **Run TypeScript directly or compile.** Start with `tsx` for the CLI. Revisit
   only if hook startup is too slow.
2. **Browser use of `validate.ts`.** Kept possible, not required.

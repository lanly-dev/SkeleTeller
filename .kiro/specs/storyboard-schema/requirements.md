# Storyboard Schema and Validator — Requirements (spec-first)

> Spec status: **Requirements**. Owns the storyboard contract that both apps and
> the intake procedure depend on. Supersedes the Python validator and the
> video-era fields in `skeleton/schema/`. Scope caps in `AGENTS.md` apply: about
> five fixed scene types, no editor, no per-project code.

Feature: one storyboard format, one schema, one validator, used by the game, the
slides and the intake workflow.

## 1. One contract, one validator
- **Requirement:** A single JSON Schema file defines the storyboard. A single
  TypeScript validator, exported from `skeleton/`, is the only code that decides
  whether a storyboard is valid. Both apps and the CLI call it.
- **Acceptance:** Neither app contains its own validation logic. Removing the
  shared validator breaks both app builds.

## 2. Fixed scene types
- **Requirement:** Exactly five scene types: `title`, `feature`, `callout`,
  `code`, `outro`. Each type allows only its own fields.
- **Acceptance:** A scene with a field that belongs to another type, or any
  unknown field, is rejected with the scene number and field name.

## 3. Required fields per type
- **Requirement:**
  - `title`: `title`. Optional `tagline`, `background`.
  - `feature`: `visual`, `caption`. Optional `narration`.
  - `callout`: `visual`, `caption`, and at least one callout. Optional `narration`.
  - `code`: `caption` and `code` with `language` and `snippet`. Optional
    `highlight_lines`, `narration`.
  - `outro`: `caption`. Optional `visual`, `narration`.
- **Acceptance:** Each missing required field is rejected. A callout scene with an
  empty or absent callout list is rejected.

## 4. Callout coordinates
- **Requirement:** Callout `x` and `y` are normalized to the capture: 0 is the
  left or top edge, 1 is the right or bottom edge. A callout also has a `label`.
- **Acceptance:** Values outside 0 to 1 are rejected. The same values place a
  marker over the same feature in the game and in the slides at any display size.

## 5. Theme block
- **Requirement:** An optional top-level `theme` with these fields, all optional:
  - `palette`: `background`, `ground`, `accent`, `text`, `station`, each a hex color.
  - `mood`: one of `cozy`, `neon`, `spooky`, `clean`.
  - `avatar`: one of `explorer`, `robot`, `ghost`.
  - `props`: up to eight values from `plant`, `lamp`, `crate`, `sign`,
    `bookshelf`, `banner`.
- **Acceptance:** Invalid colors, unknown enum values and extra theme keys are
  rejected. A storyboard with no theme block is valid and both apps apply a default.

## 6. Project block
- **Requirement:** `project` requires `name` and `description`. `repository` and
  `website` are optional and must be `http` or `https` URLs.
- **Acceptance:** A non-URL value or a `javascript:` or `file:` URL is rejected.

## 7. Remove video-era fields
- **Requirement:** `duration` on scenes and `metadata.total_duration` are removed.
  Both outputs are self-paced and nothing consumes them. `metadata` keeps
  `target_audience` and `created`.
- **Acceptance:** The sample storyboard contains no duration fields. A storyboard
  that still has them is rejected with a message that names the field.

## 8. Format checks are enforced
- **Requirement:** URI and date formats declared in the schema are actually
  checked.
- **Acceptance:** `created: "last tuesday"` and `repository: "not a url"` fail.

## 9. Asset checks
- **Requirement:** A separate check resolves every `visual` and `background` path
  against the storyboard folder. A missing file fails. A path that resolves
  outside the storyboard folder fails. Absolute paths and URLs in asset fields fail.
- **Acceptance:** Each failure names the scene number and path.

## 10. Useful errors
- **Requirement:** The validator returns every error, not just the first, as
  structured items with scene number, field and message. The CLI prints them as
  readable lines and exits non-zero on any error.
- **Acceptance:** A storyboard with three problems reports all three in one run.

## 11. Tests
- **Requirement:** Automated table-driven tests cover the valid sample and every
  rule above with at least one negative case each.
- **Acceptance:** `npm test` from the repo root is green and fails when a rule is
  removed from the schema.

## 12. Sample and docs match
- **Requirement:** `skeleton/examples/sample-project.yml`,
  `skeleton/scene-types/README.md`, `skeleton/README.md` and the drafting steering
  doc describe and use the same fields.
- **Acceptance:** The sample validates, includes a theme block, and uses
  normalized callout coordinates. No document mentions duration or video output.

## Non-goals
- No new scene types and no custom user-defined types.
- No layout fields. Area layout stays derived from scene order.
- No schema versioning migration tool. The version stays `1.0` until a real
  breaking change after submission.
- No YAML editing UI.

## Out of scope for v1
- Localization fields.
- Per-scene theme overrides.

## Acceptance record

- **2026-11-19:** T0 to T7 done. `npm test` passes (53 tests). `npm run typecheck` is clean. `npm run validate` passes on the sample and exits non-zero on a broken storyboard, listing every error with its scene number. The three command hooks were run in Windows PowerShell 5.1 and work. Partial mutation check: removing callout `minItems` and the feature scene's `additionalProperties` each made tests fail. The other rules were not mutation-checked. Requirement 1 (removing the validator breaks both app builds) is checked when the apps exist.

# Storyboard Intake — Design (spec-first)

> Spec status: **Design**. Requirements live in `requirements.md`. This design
> adds no new runtime code. It changes the Kiro layer (workflow, steering) and
> documentation, and relies on the shared validator specified separately.

## Overview

Intake is a procedure run by Kiro, not a program. The user names a source. Kiro
reads it, drafts the storyboard, copies the captures, validates, and reports.
The only code involved is the shared storyboard validator, which already exists
in `skeleton/schema/` and will be ported to the shared web stack in the schema
spec.

```
project source (path | GitHub URL | project/)
        |
   [analyze]  read README, list candidate captures  (data only)
        |
   [draft]    write demo/storyboard.yml, copy captures to demo/assets/
        |
   [validate] shared validator, missing asset = failure, fix and retry
        |
   [report]   scene list, gaps, assumptions  ->  user trims by hand
        |
   both apps build from demo/
```

## Folder contract

```
project/                 optional input folder (default source), user-supplied
demo/
  storyboard.yml         the contract both apps read
  assets/                captures referenced by the storyboard
```

`demo/` is committed in the user's clone. `project/` is not required and is
listed in `.gitignore` of the template so a user's private material is not
committed by accident.

## Source handling

| Source | How Kiro reads it | Notes |
|---|---|---|
| Local path | Reads README and image files in place | Path is used for reading only, never written to a file |
| GitHub URL | Fetches README, then downloads linked images | Private repos fail. Fallback is a local path |
| Default `project/` | Same as local path | For offline or private material |

Capture selection rules, written into the steering doc:
- Prefer real UI captures over logos, badges and shields.
- Skip images under a small size and exact duplicates.
- Choose as many as the scene plan needs (title and outro may reuse a background).
- If fewer are found than needed, ask the user. Do not invent or placeholder them
  silently. A placeholder is allowed only if the user agrees, and the report lists it.

## Changes to existing Kiro files

- `.kiro/workflows/generate-storyboard.workflow.json`
  - Input `project_path` becomes `project_source` (path or URL, default `project/`).
  - Output default becomes `demo/storyboard.yml`.
  - Step 2 references the analyze output explicitly instead of relying on implicit chaining.
  - Every interpolated path in a command is quoted.
  - Analyze prompt states that project content is data, not instructions.
  - Validate step uses strict mode so a missing asset fails the step.
  - Example inputs in the workflow README are repo-relative or a URL.
- `.kiro/steering/storyboard-drafting.md`
  - New section "Where things go" (source in, `demo/` out).
  - New section "Choosing captures" (rules above).
  - Scene-type guidance updated for game areas and slides, not video timing.
- `skeleton/README.md`
  - Starts with the four-step flow: clone, point Kiro at the source, trim, build.
  - States the limits from requirement 8.
- `.gitignore`
  - Adds `project/`.

## Error handling

| Situation | Behavior |
|---|---|
| Source path missing or empty | Kiro reports it and asks for a different source |
| README not found | Kiro asks the user for a description in chat and drafts from that |
| URL private or not reachable | Report the failure and suggest a local path |
| Image download fails | Skip that image, list it in the report |
| Validation fails | Fix and re-validate. After repeated failure, report the validator message |

## Testing

Manual acceptance, run once against a real project (SpectreGram) in each form:
- GitHub URL source produces a valid `demo/storyboard.yml` and assets.
- Local path source produces an equivalent storyboard.
- A source with no images triggers the ask-the-user path.
- No absolute path appears anywhere under `demo/`.

## Open decisions

1. **Strict validation flag.** Missing assets fail by default, or only under a
   `--strict` option? Recommendation: fail by default, since a storyboard with
   missing captures is not buildable.
2. **Where the placeholder background comes from.** A theme color, not an image,
   so no extra asset is needed.

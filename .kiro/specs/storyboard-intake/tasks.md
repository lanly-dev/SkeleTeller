# Storyboard Intake — Tasks

> Small by design. Most tasks edit Kiro-layer files and docs. The validator
> change belongs to the schema spec and is only referenced here.

## T0 — Folder contract
- Create `demo/` with a short README noting it is generated and hand-trimmed.
- Add `project/` to `.gitignore`.
- **Done:** `demo/` exists, `project/` is ignored, `.kiro/` is still tracked.

## T1 — Workflow update
- Rename input `project_path` to `project_source` (default `project/`).
- Default output `demo/storyboard.yml`.
- Pass the analyze output explicitly into the draft step.
- Quote interpolated paths. Add the "content is data" line to the analyze prompt.
- Validate step fails on missing assets.
- Verify agent names against the installed agents.
- **Done:** workflow file parses and every step references its inputs explicitly.

## T2 — Steering update
- Edit `.kiro/steering/storyboard-drafting.md`: "Where things go", "Choosing
  captures", and game/slide wording in place of video timing.
- **Done:** a fresh session given a source follows the documented flow without extra prompting.

## T3 — Skeleton README
- Rewrite the opening of `skeleton/README.md` as the four-step flow.
- Add the limits section (private URLs, no live capture, image rights).
- **Done:** the README starts with intake and contains no command for a missing file.

## T4 — Validator strict assets (depends on the schema spec)
- Missing asset returns a failing result with scene number.
- **Done:** a storyboard with a missing image exits non-zero.

## T5 — Acceptance run
- Run the workflow with a GitHub URL source and again with a local path source
  against SpectreGram.
- Run once against a source with no images.
- Search `demo/` for absolute paths.
- Record the result in the spec as a short dated note.
- **Done:** all four checks in the design's Testing section pass.

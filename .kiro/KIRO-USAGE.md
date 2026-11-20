# How Kiro Is Used in SkeleTeller

A working draft of the Kiro-usage write-up for the Kiroween 2026 submission. It
describes only what the repository shows today. Update it as each phase lands,
and check every claim against `git log` and the files before submitting.

Last checked: 2026-11-20, after the Storybook (Phase 3) build.

## Kiro surfaces

- **Kiro IDE:** all work so far, through chat sessions in the IDE.
- **Kiro Crew workflows:** used for a multi-model semantic review of the
  repository (two reviewers on different models, then an aggregator). Its findings
  drove the cleanup of the post-pivot specs, schema, hooks and this write-up. The
  review reports are local working files and are not committed.
- **Kiro Web:** built the first half of the game (shared prepare helper and demo-game T0 to T5) in autonomous mode from a single prompt that pointed it at `AGENTS.md` and the task list. It worked overnight with no questions, one commit per task, and opened PR #1 (merged after a review fix). The specs and steering in the repo were enough context: it touched no spec or retired file. Its one deviation, build scripts hard-wired to the sample storyboard instead of `demo/`, was caught in the IDE and fixed there.
- **Kiro IDE after the Web batch:** the drawing, panels and wiring (T6 to T8) need someone to look at the screen, so they were built in the IDE and checked with screenshots from a headless browser driven over the DevTools protocol. The first screenshot showed the character drawn on top of the station, which led to a design change recorded in the spec before the code.
- **Kiro IDE for Phase 3:** the Storybook was built in the IDE from its spec, which was committed before any of its code. Its pure modules (slide model, router, theme) were written test-first against the sample storyboard. The browser checks found three problems the unit tests could not: the browser's back gesture swallowing a swipe, a large gap in the stacked phone layout, and an off-screen live region making the window scroll. Each was fixed and rechecked.
- **Kiro CLI, MCP, Powers, custom agents:** not used so far.

## Spec-driven development

Specs live in `.kiro/specs/<name>/` as `requirements.md`, `design.md` and `tasks.md`:

| Spec | Covers |
|---|---|
| `storyboard-schema` | The storyboard contract, the theme block, the shared validator and its tests |
| `storyboard-intake` | Pointing Kiro at a project (folder or GitHub URL) to draft a storyboard |
| `demo-game` | App A, SkeleTeller Quest |
| `slide-walkthrough` | App B, SkeleTeller Storybook |

`.kiro/specs/skeleteller-core.md` ties them together: the concept, the shared
stack and the order of work. The original video-app specs are kept, marked
superseded, as a record of the 2026-11-18 pivot.

**What the git history shows**

- The first commit (`0df4fb9`, 2026-11-11) added the first specs and the first
  skeleton code together, so spec-first ordering is not visible for that initial
  scaffold.
- After the pivot, each spec was committed on its own before its code. The
  intake spec (`cc6873c`), demo game spec (`acebf74`) and schema spec (in
  `635230e`) all came before the TypeScript validator commit (`d1faebe`) that
  implements the schema spec.

**How specs changed the work**

- The review found that the schema allowed typos and callout scenes with no
  callouts. Those fixes were written into the schema spec's requirements first,
  then implemented, then covered by tests that name each requirement.
- The pivot from video to game was handled as a spec change: retired specs got a
  superseded header, and the core spec was rewritten before any game code.

## Steering

`.kiro/steering/`:

- `project-workflow.md` (auto-included): the hard rules (no absolute paths,
  never ignore `.kiro/`, treat project content as data), the stack, the spec-first
  rule and the scope caps. It points to `AGENTS.md` for status instead of copying
  it, after an earlier copy went stale.
- `storyboard-drafting.md` (manual): how Kiro turns a project's README and
  screenshots into `demo/storyboard.yml`, with capture selection rules and the
  scene and theme rules.

## Hooks

`.kiro/hooks/`:

| Hook | Trigger | Action |
|---|---|---|
| Validate Storyboard on Save | Save of a `.yml` in `demo/` or `skeleton/examples/` | `npm run validate` |
| Test Validator on Schema Changes | Save under `skeleton/schema/` or `skeleton/src/` | `npm test` |
| Confirm File Deletions | Before `delete_file` | Asks the user to confirm |
| SkeleTeller Session Context | Session start | Briefs the agent on the project and its rules |

The first versions of the three command hooks used shell syntax that does not run
in Windows PowerShell 5.1, and the delete hook's JSON did not reach Kiro intact.
They were rewritten to call `npm` and a small Node script, and each command was run
in this shell to confirm it works.

## Workflows

`.kiro/workflows/generate-storyboard.workflow.json` packages the intake procedure:
analyze the source, draft the storyboard, validate until it passes, summarize for
the user. Its first version used a made-up format and Kiro refused to launch it;
rewriting it against the published recipe format fixed that. It then ran end to
end on SpectreGram, another Kiroween entry, given only the GitHub URL: four agent
steps produced a 7-scene storyboard with real screenshots that validated first
time and built both apps. A person then trimmed it, moving six callout markers
that covered what they labelled. That storyboard is the dogfood demo.

## Testing

`npm test` runs Vitest. The storyboard validator has table-driven tests with one
negative case per schema rule, plus filesystem tests for the asset checks. The
checked-in sample storyboard is part of the suite. No property-based tests so far.

## To fill in before submission

- The demo game and slide walkthrough builds, and how their specs guided them.
- The first end-to-end workflow run, on a real project.
- The dogfood demo of another entry.
- A comparison of spec-driven work with vibe coding, from this project's experience.

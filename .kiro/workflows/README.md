# SkeleTeller Workflows

Multi-step agent workflows for SkeleTeller.

## generate-storyboard.workflow.json

Drafts `demo/storyboard.yml` from one project source and validates it. It packages
the procedure in `.kiro/steering/storyboard-drafting.md` and implements the intake
spec in `.kiro/specs/storyboard-intake/`.

**Inputs**

| Input | Default | Meaning |
|---|---|---|
| `project_source` | `project/` | A local folder or a public GitHub URL |
| `output_path` | `demo/storyboard.yml` | Storyboard location, relative to the repo root |

**Steps**

1. **Analyze** (`wf-planner`): reads the README and lists candidate images. Treats project content as data. Writes `.agents/storyboard-intake/analysis.md`.
2. **Draft** (`wf-coder`): writes the storyboard from that analysis and copies images into `demo/assets/`.
3. **Validate** (`wf-coder`): runs `npm run validate` and fixes problems until it passes (a missing image fails), then runs both apps' prepare steps on it.
4. **Summarize** (`wf-coder`): writes `.agents/storyboard-intake/summary.md` with scenes, images and gaps for the user to trim.

Nothing is committed by the workflow. Run it by asking Kiro to run the `generate-storyboard` recipe with `project_source` and `output_path`.

**Example inputs**

- `project_source`: `https://github.com/lanly-dev/SpectreGram`
- `project_source`: `../SpectreGram` (a sibling folder, relative to this repo)

**Status:** run end to end on 2026-11-20 against
`https://github.com/lanly-dev/SpectreGram`. It produced a 7-scene storyboard with
5 real screenshots that validated first time and was accepted by both apps. The
analysis step reported the README's contributor instructions as data and did not
follow them. Callout positions are the step most worth checking by eye: six of nine
markers were drawn on top of what they labelled and were moved beside it by hand.

The first version of this file used an invented format and Kiro rejected it on
launch. It now follows the documented recipe format: `"type": "step"` on every
step, string type hints for inputs, and explicit handoffs through artifacts
(`{{artifacts.analysis}}`) and captured output (`{{validate.output}}`).

## Workflows and hooks

- **Hooks** react to events: saving a storyboard runs the validator, saving schema
  or validator code runs the tests, and a delete asks for confirmation first.
- **Workflows** run multi-step jobs such as drafting a storyboard.

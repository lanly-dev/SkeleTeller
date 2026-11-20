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

1. **Analyze** (`wf-planner`): reads the README and lists candidate images. Treats project content as data.
2. **Draft** (`wf-coder`): writes the storyboard from the analysis and copies images into `demo/assets/`.
3. **Validate** (`wf-coder`): runs `npm run validate` and fixes problems until it passes. A missing image fails.
4. **Summarize** (`wf-coder`): lists scenes, images used, and gaps for the user to trim.

**Example inputs**

- `project_source`: `https://github.com/lanly-dev/SpectreGram`
- `project_source`: `../SpectreGram` (a sibling folder, relative to this repo)

**Status:** the steps are written against the agents available in this Kiro
install. The workflow has not been run end to end yet. The intake spec's task T5
covers that run.

## Workflows and hooks

- **Hooks** react to events: saving a storyboard runs the validator, saving schema
  or validator code runs the tests, and a delete asks for confirmation first.
- **Workflows** run multi-step jobs such as drafting a storyboard.

# SkeleTeller Workflows

Kiro Crew workflows for automating common SkeleTeller tasks.

## Available Workflows

### generate-storyboard.workflow.json

**Purpose:** Automatically generate a draft storyboard from a project's README and assets.

**Usage:**
```bash
# From Kiro IDE or CLI
kiro workflow run .kiro/workflows/generate-storyboard.workflow.json \
  --input project_path=/path/to/project \
  --input output_path=storyboard.yml
```

**What it does:**
1. **Analyze Project** — Reads README, examines screenshots, identifies key features
2. **Draft Storyboard** — Creates YAML following SkeleTeller schema
3. **Validate** — Runs schema validator, fixes errors if needed
4. **Summarize** — Produces summary of scenes and assets

**Inputs:**
- `project_path` (required) — Path to project directory with README and assets
- `output_path` (optional) — Where to save storyboard (default: `storyboard.yml`)

**Outputs:**
- Generated storyboard YAML file
- Analysis markdown
- Validation results
- Summary markdown

**Example:**
```bash
# Generate storyboard for another Kiroween project
kiro workflow run .kiro/workflows/generate-storyboard.workflow.json \
  --input project_path=../Skinwalker \
  --input output_path=skinwalker-storyboard.yml
```

**Notes:**
- The workflow uses wf-planner and wf-coder agents
- Assets are referenced with relative paths
- Manual editing recommended after generation (trim to 5-8 scenes)
- Follow guidelines in `.kiro/steering/storyboard-drafting.md`

---

## Workflow Design Principles

### Why Workflows for SkeleTeller?

1. **Repeatability** — Generate storyboards for multiple projects consistently
2. **Quality Gates** — Built-in validation step ensures schema compliance
3. **Documentation** — Each step produces artifacts (analysis, summary)
4. **Agent Orchestration** — Shows Kiro Crew capabilities

### Workflow vs. Manual Process

**Manual approach:**
- Read project README
- Identify features manually
- Write YAML by hand
- Run validator separately

**Workflow approach:**
- One command generates draft
- Automated analysis and validation
- Structured output with summaries
- Faster iteration

Both approaches are valid; workflows shine when processing multiple projects.

---

## Creating Custom Workflows

To create a workflow for your project:

1. **Define inputs/outputs** — What does the workflow need and produce?
2. **Break into steps** — Each step is one agent with one prompt
3. **Choose agents** — wf-planner (investigate), wf-coder (implement), wf-design-reviewer (review)
4. **Add validation** — Always validate outputs against schemas
5. **Document** — Add to this README

See `generate-storyboard.workflow.json` as a reference template.

---

## Future Workflow Ideas

Potential workflows for later phases:

### render-outputs.workflow.json
- Input: storyboard path
- Steps: validate → render video → build slides → verify outputs
- Output: both demo video and slide walkthrough

### optimize-storyboard.workflow.json
- Input: existing storyboard
- Steps: analyze duration → check asset quality → suggest improvements
- Output: recommendations markdown

### dogfood-entry.workflow.json
- Input: Kiroween entry path
- Steps: generate storyboard → render both outputs → create submission video
- Output: complete demo package

---

## Workflow Execution Tips

**From Kiro IDE:**
- Use the workflow panel to browse and run workflows
- Workflows appear in the sidebar when `.kiro/workflows/` contains `.workflow.json` files

**From Kiro CLI:**
```bash
kiro workflow run <workflow-file> [--input key=value ...]
```

**Monitoring:**
- Workflows run in the background
- Progress appears in notifications
- Check workflow panel for status

**Debugging:**
- Each step produces output artifacts
- Check step logs in the workflow results
- Re-run individual steps if needed

---

## Integration with Hooks

Workflows and hooks complement each other:

- **Hooks** — React to events (file save, session start)
- **Workflows** — Orchestrate multi-step processes

Example:
- Hook validates storyboard on save → instant feedback
- Workflow generates storyboard from project → automation

Both contribute to the "thoroughly used Kiro" evidence for judging.

# Scene Types

A storyboard is an ordered list of scenes. There are exactly five types. Each scene
becomes one area in SkeleTeller Quest and one page in SkeleTeller Storybook.

Each type allows only the fields listed for it. A misspelled field, or a field from
another type, is a validation error.

Shared text limits: `caption` up to 200 characters, `narration` up to 1000.
Image paths are relative to the storyboard file and must stay inside its folder.

## title

The opening. Shows the project name.

| Field | Required | Notes |
|---|---|---|
| `title` | yes | Up to 100 characters |
| `tagline` | no | One line under the title |
| `background` | no | Image path |

- **Game:** the start area, with the name and tagline on a sign.
- **Slides:** the title page.

```yaml
- type: title
  title: "TaskFlow"
  tagline: "Task management that fits your workflow"
  background: "assets/title-bg.png"
```

## feature

One capability, shown with a screenshot.

| Field | Required | Notes |
|---|---|---|
| `visual` | yes | Screenshot path |
| `caption` | yes | The headline |
| `narration` | no | Longer explanation |

- **Game:** an area with a station. Interacting opens the screenshot, caption and narration.
- **Slides:** a page with the screenshot and caption. Narration expands on request.

```yaml
- type: feature
  visual: "assets/dashboard.png"
  caption: "Track tasks across projects with a unified dashboard"
  narration: "Tasks are grouped by project and priority, so blocked work stands out."
```

## callout

A screenshot with numbered points of interest.

| Field | Required | Notes |
|---|---|---|
| `visual` | yes | Screenshot path |
| `caption` | yes | The headline |
| `callouts` | yes | One to eight items |
| `narration` | no | Longer explanation |

Each callout has `x`, `y` and `label`. `x` and `y` are fractions of the image, from
0 to 1, measured from the top-left corner. This keeps markers on the right spot at
any display size.

- **Game:** a station whose screenshot shows numbered hotspots. Selecting one shows its label.
- **Slides:** a page with clickable hotspots that reveal their labels.

```yaml
- type: callout
  visual: "assets/task-detail.png"
  caption: "Rich task details without leaving the list"
  callouts:
    - { x: 0.10, y: 0.17, label: "Inline editing" }
    - { x: 0.27, y: 0.17, label: "Subtasks" }
```

## code

A short snippet with highlighted lines.

| Field | Required | Notes |
|---|---|---|
| `caption` | yes | The headline |
| `code.language` | yes | Language label, for example `bash` or `ts` |
| `code.snippet` | yes | The code, as a multi-line string |
| `code.highlight_lines` | no | One-based line numbers that must exist in the snippet |
| `narration` | no | Longer explanation |

- **Game:** a terminal station that shows the snippet.
- **Slides:** a page with the code block.

```yaml
- type: code
  caption: "Integrate with your terminal workflow"
  code:
    language: "bash"
    snippet: |
      taskflow add "Fix login bug" --priority high
      taskflow list --due today
    highlight_lines: [1]
```

## outro

The closing.

| Field | Required | Notes |
|---|---|---|
| `caption` | yes | Usually the call to action or link |
| `visual` | no | Background image path |
| `narration` | no | Closing remarks |

- **Game:** the exit area.
- **Slides:** the closing page.

```yaml
- type: outro
  caption: "Open source, MIT License, github.com/example/taskflow"
```

## Ordering

A typical storyboard has five to eight scenes: one title, two to five feature or
callout scenes, at most one code scene, and one outro. Both apps keep the order you
write.

## Checking a storyboard

```bash
npm run validate -- path/to/storyboard.yml
```

See `examples/sample-project.yml` for a full example.

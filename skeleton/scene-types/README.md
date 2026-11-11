# Scene Types Reference

SkeleTeller supports 5 scene types. Each scene becomes both a video segment and an interactive slide.

## Common Fields

All scenes share these fields:

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `type` | string | ✅ | Scene type: `title`, `feature`, `callout`, `code`, or `outro` |
| `duration` | number | ✅ | Duration in seconds (for video timing) |
| `caption` | string | ⚠️ | Short caption text (max 200 chars) — required for most types |
| `narration` | string | ❌ | Longer explanation (max 1000 chars) — used in slide walkthrough |
| `visual` | string | ⚠️ | Path to visual asset, relative to storyboard file — required for most types |

## Scene Types

### 1. Title

**Purpose:** Opening frame with project name and tagline.

**Required Fields:**
- `type`: `"title"`
- `duration`: seconds
- `title`: project name

**Optional Fields:**
- `tagline`: subtitle or value proposition
- `background`: path to background image
- `caption`: additional text (rarely used for title scenes)

**Example:**
```yaml
- type: title
  title: "DataViz Pro"
  tagline: "Beautiful charts in seconds"
  background: "assets/title-bg.png"
  duration: 3
```

**Visual Guidelines:**
- Clean, uncluttered background
- Title should be prominently readable
- Keep tagline short (under 60 characters)
- Duration: 2-4 seconds

---

### 2. Feature

**Purpose:** Show a specific capability or feature with a screenshot.

**Required Fields:**
- `type`: `"feature"`
- `duration`: seconds
- `visual`: path to screenshot or screen capture
- `caption`: what this feature does

**Optional Fields:**
- `narration`: detailed explanation for slide walkthrough

**Example:**
```yaml
- type: feature
  visual: "assets/dashboard.png"
  caption: "Real-time analytics dashboard with customizable widgets"
  narration: "The dashboard provides live metrics, drill-down capabilities, and exportable reports. Users can arrange widgets via drag-and-drop."
  duration: 7
```

**Visual Guidelines:**
- Use actual screenshots of the feature in action
- Crop to focus on the relevant UI
- Resolution: 1920x1080 recommended
- Duration: 5-8 seconds (enough time to read caption)

---

### 3. Callout

**Purpose:** Highlight specific UI elements or details with annotations.

**Required Fields:**
- `type`: `"callout"`
- `duration`: seconds
- `visual`: path to screenshot
- `caption`: what's being highlighted
- `callouts`: array of `{x, y, label}` objects

**Optional Fields:**
- `narration`: additional context

**Callout Object:**
```yaml
callouts:
  - x: 150        # X coordinate in pixels (from left)
    y: 200        # Y coordinate in pixels (from top)
    label: "Export button"
```

**Example:**
```yaml
- type: callout
  visual: "assets/editor-ui.png"
  caption: "One-click formatting and export"
  callouts:
    - x: 120
      y: 340
      label: "Format button"
    - x: 180
      y: 340
      label: "Export menu"
  duration: 6
```

**Visual Guidelines:**
- Use high-contrast callouts (e.g., bright circle or arrow)
- Don't overcrowd — 2-4 callouts maximum per scene
- Coordinates should be absolute pixel positions
- Duration: 4-6 seconds

**Implementation Notes:**
- Video renderer: overlays callout graphics at specified coordinates
- Slide renderer: makes callouts clickable hotspots

---

### 4. Code

**Purpose:** Display code snippets or configuration with syntax highlighting.

**Required Fields:**
- `type`: `"code"`
- `duration`: seconds
- `caption`: what the code demonstrates
- `code`: object with `language` and `snippet`

**Code Object:**
```yaml
code:
  language: "python"          # Language for syntax highlighting
  snippet: |                  # Code text (multiline string)
    def hello(name):
        return f"Hello, {name}!"
  highlight_lines: [2]        # Optional: line numbers to emphasize (1-indexed)
```

**Example:**
```yaml
- type: code
  caption: "Simple three-line integration"
  code:
    language: "javascript"
    snippet: |
      import { Client } from 'dataviz-pro';
      const client = new Client({ apiKey });
      const chart = client.render(data);
    highlight_lines: [3]
  duration: 7
```

**Visual Guidelines:**
- Keep snippets short (10-15 lines maximum)
- Use readable font size (16-18pt for video)
- Highlight key lines sparingly
- Duration: 6-8 seconds (code takes longer to read)

**Supported Languages:**
Common syntax highlighting languages: `python`, `javascript`, `typescript`, `java`, `go`, `rust`, `yaml`, `json`, `sql`, `bash`, `html`, `css`

**Implementation Notes:**
- Video renderer: renders code with syntax highlighting as image
- Slide renderer: uses a syntax highlighting library (e.g., Prism.js)
- The `visual` field is optional for code scenes (code is the visual)

---

### 5. Outro

**Purpose:** Closing frame with call-to-action or links.

**Required Fields:**
- `type`: `"outro"`
- `duration`: seconds
- `caption`: call-to-action text (e.g., GitHub link, website)

**Optional Fields:**
- `visual`: background image
- `narration`: additional closing remarks

**Example:**
```yaml
- type: outro
  caption: "Try it today: github.com/user/dataviz-pro"
  visual: "assets/outro-bg.png"
  duration: 4
```

**Visual Guidelines:**
- Simple, clean background
- Caption should be the main focus
- Include actionable link or next step
- Duration: 3-4 seconds

---

## Scene Ordering Best Practices

A typical storyboard follows this pattern:

1. **Title** (1 scene, 3-4s)
2. **Feature/Callout scenes** (3-6 scenes, 5-8s each)
   - Mix feature and callout types for variety
   - Consider including 1 code scene if showing integration/implementation
3. **Outro** (1 scene, 3-4s)

**Total:** 5-8 scenes, under 3 minutes

**Example Arc:**
```
Title (3s)
→ Feature: Overview (7s)
→ Feature: Key capability 1 (6s)
→ Callout: UI detail (5s)
→ Code: Integration example (7s)
→ Feature: Key capability 2 (6s)
→ Outro (4s)
= 38 seconds total
```

## Duration Guidelines

| Scene Type | Recommended Duration | Min | Max |
|------------|---------------------|-----|-----|
| Title | 3-4s | 2s | 5s |
| Feature | 5-8s | 4s | 10s |
| Callout | 4-6s | 3s | 8s |
| Code | 6-8s | 5s | 12s |
| Outro | 3-4s | 2s | 5s |

**Rule of thumb:** Give viewers enough time to read the caption out loud twice.

## Asset Requirements

### Image Assets
- **Format:** PNG (preferred) or JPG
- **Resolution:** 1920x1080 (Full HD) recommended
- **Aspect Ratio:** 16:9
- **File Size:** Keep under 5MB per image

### Code Assets
- **Embedding:** Use `code.snippet` field (no separate file)
- **Length:** 5-20 lines maximum
- **Formatting:** Preserve indentation (YAML multiline strings preserve whitespace)

## Validation

All storyboards are validated against the JSON Schema. Common validation errors:

| Error | Fix |
|-------|-----|
| "Required field 'caption' missing" | Add `caption` to feature/callout/code/outro scenes |
| "Duration exceeds maximum" | Reduce scene duration to ≤ 30 seconds |
| "Invalid scene type" | Use one of: `title`, `feature`, `callout`, `code`, `outro` |
| "Callouts array is empty" | Callout scenes require at least one callout object |
| "Code object missing required fields" | Ensure `code.language` and `code.snippet` are present |

Run the validator:
```bash
python skeleton/schema/validator.py my-storyboard.yml
```

## Examples

See `skeleton/examples/sample-project.yml` for a complete, working storyboard.

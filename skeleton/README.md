# SkeleTeller Skeleton

This is the reusable template for creating project demos. One storyboard specification produces two outputs: a demo video and an interactive slide walkthrough.

## What's in the Skeleton?

```
skeleton/
├── schema/
│   ├── storyboard.schema.json    # JSON Schema for storyboards
│   └── validator.py              # Validation script
├── scene-types/
│   └── README.md                 # Scene type reference
├── examples/
│   ├── sample-project.yml        # Example storyboard
│   ├── assets/                   # Sample assets
│   └── generate-assets.py        # Asset generator
└── README.md                     # This file
```

## Quick Start

### 1. Install Dependencies

**Python (for validation and video rendering):**
```bash
pip install PyYAML jsonschema Pillow
```

**Node.js (for slide walkthrough):**
```bash
npm install
```

### 2. Create a Storyboard

Start with the example:
```bash
cp skeleton/examples/sample-project.yml my-project.yml
```

Edit `my-project.yml` to tell your project's story. See [Scene Types Reference](scene-types/README.md) for details.

**Storyboard Structure:**
```yaml
version: "1.0"

project:
  name: "YourProject"
  description: "What your project does"

metadata:
  total_duration: 45  # Sum of all scene durations
  target_audience: "developers"

scenes:
  - type: title
    title: "YourProject"
    tagline: "Your value proposition"
    duration: 3
    # ... scene-specific fields

  - type: feature
    visual: "assets/screenshot1.png"
    caption: "Your feature description"
    duration: 6

  # ... more scenes

  - type: outro
    caption: "github.com/you/project"
    duration: 4
```

### 3. Gather Assets

Create an `assets/` directory next to your storyboard:
```bash
mkdir assets
```

Add your screenshots, diagrams, and visual assets. Reference them in the storyboard with relative paths: `visual: "assets/screenshot1.png"`

**Asset Requirements:**
- **Format:** PNG or JPG
- **Resolution:** 1920x1080 (Full HD) recommended
- **Aspect Ratio:** 16:9

### 4. Validate

Check your storyboard before generating outputs:
```bash
python skeleton/schema/validator.py my-project.yml
```

Fix any validation errors. The validator checks:
- Schema compliance (required fields, valid scene types)
- Duration consistency (metadata matches scene sum)
- Asset existence (warns if files are missing)

### 5. Generate Outputs

**Demo Video:**
```bash
cd apps/demo-video
python render.py ../../my-project.yml
# Output: output/demo.mp4
```

**Slide Walkthrough:**
```bash
cd apps/slide-walkthrough
npm run build ../../my-project.yml
# Output: dist/index.html
```

## Scene Types

SkeleTeller supports 5 scene types. Each type has specific required fields:

| Type | Purpose | Key Fields |
|------|---------|------------|
| `title` | Opening frame | `title`, `tagline`, `background` |
| `feature` | Show a capability | `visual`, `caption` |
| `callout` | Highlight UI details | `visual`, `caption`, `callouts` |
| `code` | Display code snippets | `caption`, `code` (language, snippet) |
| `outro` | Closing frame | `caption` |

See [scene-types/README.md](scene-types/README.md) for complete reference with examples.

## Storyboard Best Practices

**Keep it focused**
- 5-8 scenes total
- Under 3 minutes (for video output)
- One idea per scene

**Show, don't just tell**
- Every scene needs a strong visual
- Let screenshots do the talking
- Captions should complement, not repeat the visual

**Follow a narrative arc**
- Problem → Solution → Features → Call-to-action
- Or: Title → Feature tour → Integration → Outro

**Duration guidelines**
- Title: 3-4 seconds
- Features: 5-8 seconds
- Code: 6-8 seconds (code takes longer to read)
- Outro: 3-4 seconds

## File Organization

When using the skeleton for a new project, organize files like this:

```
my-project-demo/
├── storyboard.yml          # Your storyboard
├── assets/                 # Visual assets
│   ├── title-bg.png
│   ├── feature1.png
│   └── ...
└── output/                 # Generated outputs
    ├── demo.mp4           # Rendered video
    └── slides/            # Built slide walkthrough
```

## Validation Reference

The validator checks:

✅ **Schema validation**
- All required fields present
- Valid scene types (`title`, `feature`, `callout`, `code`, `outro`)
- Field types match schema (strings, numbers, arrays)
- Constraints met (max durations, max caption length)

⚠️ **Warnings (non-blocking)**
- `total_duration` mismatch with scene sum
- Missing asset files

Common errors and fixes:

| Error | Fix |
|-------|-----|
| Missing required field `caption` | Add `caption` to the scene |
| Invalid scene type | Use one of the 5 valid types |
| Duration exceeds maximum | Scene durations must be ≤ 30s |
| Empty `callouts` array | Callout scenes need ≥1 callout object |

## Examples

### Minimal Storyboard (5 scenes, 28 seconds)

```yaml
version: "1.0"
project:
  name: "QuickDemo"
  description: "Minimal demo example"

metadata:
  total_duration: 28

scenes:
  - type: title
    title: "QuickDemo"
    tagline: "Fast and simple"
    duration: 3

  - type: feature
    visual: "assets/ui.png"
    caption: "Clean, intuitive interface"
    duration: 6

  - type: callout
    visual: "assets/detail.png"
    caption: "One-click actions"
    callouts:
      - {x: 100, y: 200, label: "Action button"}
    duration: 5

  - type: code
    caption: "Simple integration"
    code:
      language: "python"
      snippet: |
        import quickdemo
        result = quickdemo.run()
    duration: 7

  - type: outro
    caption: "github.com/you/quickdemo"
    duration: 4
```

## Tips

**Starting from scratch?**
1. Identify your 3-4 key features
2. Take screenshots of each
3. Write a caption for each (1-2 sentences)
4. Add title and outro scenes
5. Validate and generate

**Need help drafting a storyboard?**
- Use the Kiro steering guide: see `.kiro/steering/storyboard-drafting.md`
- Ask Kiro to draft a first version from your README and screenshots
- Refine the generated storyboard by hand

**Asset tips:**
- Capture at consistent resolution (1920x1080)
- Use high contrast for code snippets
- Crop screenshots to focus on relevant UI
- Name files descriptively: `feature-dashboard.png`, not `img1.png`

## Next Steps

Once you have a validated storyboard:

1. **Generate the demo video** with `apps/demo-video/`
2. **Build the slide walkthrough** with `apps/slide-walkthrough/`
3. Both outputs share the same storyboard — edit once, rebuild both

See the app-specific READMEs for rendering/building instructions:
- [apps/demo-video/README.md](../apps/demo-video/README.md)
- [apps/slide-walkthrough/README.md](../apps/slide-walkthrough/README.md)

## Troubleshooting

**Validation fails with "file not found"**
→ Check that asset paths are relative to the storyboard file

**"YAML parsing error"**
→ Check indentation (use spaces, not tabs) and multiline string syntax

**Total duration warning**
→ Recalculate: sum all scene durations and update `metadata.total_duration`

**Assets not loading in outputs**
→ Ensure assets are in the correct relative path from the storyboard file

## License

MIT — see repository root LICENSE file

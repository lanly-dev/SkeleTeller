---
inclusion: manual
name: Storyboard Drafting
description: Guide for drafting a storyboard from a project's README and assets
---

# Storyboard Drafting Guide

This guide explains how to draft a SkeleTeller storyboard from a software project's README, screenshots, and description.

## Purpose

A storyboard is the single source of truth for both demo outputs (video and slide walkthrough). It tells the project's story through an ordered sequence of scenes.

## Process

### 1. Understand the Project

Read:
- The project README
- Any available screenshots or screen captures
- The project description or feature list
- Code samples (if highlighting implementation is part of the story)

Identify:
- **Core value proposition:** What problem does this solve?
- **Key features:** What are the 2-4 most important capabilities?
- **Visual moments:** What can be shown (not just described)?
- **Target audience:** Who is this demo for?

### 2. Choose the Story Arc

A good demo follows a narrative structure. Common patterns:

**Problem → Solution → Features → Call-to-Action**
```
Title → Problem scene → Solution intro → Feature 1 → Feature 2 → Feature 3 → Outro
```

**Feature Tour**
```
Title → Overview → Feature A → Feature B → Feature C → Integration → Outro
```

**Before/After**
```
Title → Before (pain point) → After (with the tool) → Key capabilities → Outro
```

Aim for **5-8 scenes total** (under 3 minutes for video output).

### 3. Draft Each Scene

For each scene, specify:

#### Required Fields
- `type`: one of `title`, `feature`, `callout`, `code`, `outro`
- `duration`: seconds (for video timing)
- `visual`: path to asset file (screenshot, diagram, code snippet image)
- `caption`: the main text overlay (keep it short: 1-2 sentences max)

#### Optional Fields
- `narration`: longer explanation text (for slide walkthrough detail)
- `callouts`: array of `{x, y, label}` for highlighting specific UI elements
- `code`: for code scenes — `{language, snippet, highlight_lines}`

### 4. Scene Type Guidelines

#### Title Scene
- Project name + tagline
- Clean, uncluttered background
- Duration: 2-4 seconds

```yaml
- type: title
  title: "ProjectName"
  tagline: "One-line value proposition"
  visual: "assets/title-bg.png"
  duration: 3
  caption: ""
```

#### Feature Scene
- Show the feature in action
- Use actual screenshots or screen captures
- Caption explains what the user is seeing
- Duration: 5-8 seconds

```yaml
- type: feature
  visual: "assets/dashboard-screenshot.png"
  caption: "Real-time analytics dashboard tracks user engagement"
  narration: "The dashboard provides live metrics with customizable widgets and drill-down capabilities."
  duration: 7
```

#### Callout/Zoom Scene
- Highlight a specific element
- Use callouts to point out what matters
- Duration: 4-6 seconds

```yaml
- type: callout
  visual: "assets/ui-detail.png"
  caption: "One-click export to multiple formats"
  callouts:
    - x: 120
      y: 340
      label: "Export button"
    - x: 180
      y: 380
      label: "Format selector"
  duration: 5
```

#### Code/Spec Scene
- Show implementation or configuration
- Highlight key lines
- Keep snippets short (10-15 lines max)
- Duration: 6-8 seconds

```yaml
- type: code
  visual: "assets/code-snippet.png"
  caption: "Simple three-line integration"
  code:
    language: "python"
    snippet: |
      import projectname
      client = projectname.Client(api_key)
      result = client.process(data)
    highlight_lines: [3]
  duration: 6
```

#### Outro Scene
- Call-to-action or closing message
- Links (GitHub, docs, website)
- Duration: 3-4 seconds

```yaml
- type: outro
  visual: "assets/outro-bg.png"
  caption: "Try it today: github.com/user/project"
  duration: 4
```

### 5. Write the Storyboard File

Structure:
```yaml
version: "1.0"

project:
  name: "ProjectName"
  description: "Brief description of the project"
  repository: "https://github.com/user/project"

metadata:
  total_duration: 45  # sum of all scene durations
  target_audience: "developers"
  
scenes:
  - type: title
    # ... scene fields
    
  - type: feature
    # ... scene fields
    
  # ... more scenes
  
  - type: outro
    # ... scene fields
```

Save as: `storyboard.yml` in your project directory.

### 6. Gather Assets

For each scene's `visual` field:
- Capture screenshots at consistent resolution (recommend 1920x1080)
- Use clear, readable fonts if including text
- Crop to focus on the relevant part
- Name files descriptively: `feature-dashboard.png`, `code-integration.py.png`
- Place in `assets/` subdirectory relative to the storyboard file

### 7. Validate

Run the validator:
```bash
python skeleton/schema/validator.py storyboard.yml
```

Fix any schema errors before generating outputs.

## Tips for Effective Storyboards

**Keep it focused**
- Fewer scenes, more impact
- Each scene should advance the story
- Cut ruthlessly — if it doesn't add value, remove it

**Show, don't just tell**
- Every scene needs a strong visual
- Avoid text-heavy slides
- Let the captures do the talking

**Timing matters**
- Give each scene enough time to read the caption (4-6 seconds minimum)
- Complex scenes (code, detailed UI) need longer (6-8 seconds)
- Total under 3 minutes for video compliance

**Captions are headlines**
- Short, punchy, active voice
- One idea per caption
- Save details for the narration field (used in slide walkthrough)

**Test the flow**
- Read through the scene sequence
- Does it tell a coherent story?
- Is there a clear beginning, middle, and end?

## Common Mistakes to Avoid

- **Too many scenes:** Aim for 5-8, not 15-20
- **Weak visuals:** Blurry screenshots or text-only slides kill engagement
- **Missing narrative arc:** Random feature list ≠ story
- **Over-explaining:** Trust the visual; caption should complement, not repeat
- **Inconsistent asset quality:** All screenshots should match in resolution and style

## Example: Minimal Viable Storyboard

```yaml
version: "1.0"
project:
  name: "QuickSort Visualizer"
  description: "Educational tool for understanding sorting algorithms"

metadata:
  total_duration: 28

scenes:
  - type: title
    title: "QuickSort Visualizer"
    tagline: "See the algorithm in action"
    visual: "assets/title.png"
    duration: 3
    caption: ""

  - type: feature
    visual: "assets/main-ui.png"
    caption: "Step through the algorithm with visual feedback"
    duration: 7

  - type: callout
    visual: "assets/partition-detail.png"
    caption: "Watch the partition operation in real-time"
    callouts:
      - {x: 200, y: 150, label: "Pivot"}
      - {x: 400, y: 150, label: "Partition boundary"}
    duration: 6

  - type: code
    visual: "assets/code.png"
    caption: "Clean, readable implementation"
    code:
      language: "python"
      snippet: |
        def quicksort(arr, low, high):
            if low < high:
                pi = partition(arr, low, high)
                quicksort(arr, low, pi - 1)
                quicksort(arr, pi + 1, high)
      highlight_lines: [3]
    duration: 8

  - type: outro
    visual: "assets/outro.png"
    caption: "github.com/user/quicksort-viz"
    duration: 4
```

This is a complete, shippable storyboard: 5 scenes, 28 seconds, clear story (what → how → code → link).

## When to Draft a Storyboard

You should create a storyboard when:
- Starting a new project demo for SkeleTeller
- The project has a README and at least 2-3 screenshots
- You need both a video demo and an interactive walkthrough

You can draft by hand (following this guide) or ask Kiro to generate a first draft from the project's README and assets, then refine it yourself.

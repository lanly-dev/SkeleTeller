# Demo Video App Spec

**Status:** Draft  
**Created:** 2026-11-11  
**Phase:** 2  
**App:** apps/demo-video/

## Overview

The Demo Video App (App A) is a Python-based renderer that takes a SkeleTeller storyboard (YAML) and produces a demo video (MP4 format, under 3 minutes).

## Requirements

### Input
- A validated storyboard YAML file (conforming to `skeleton/schema/storyboard.schema.json`)
- Asset files referenced in the storyboard (images, referenced via relative paths)

### Output
- An MP4 video file in `apps/demo-video/output/`
- Resolution: 1920x1080 (Full HD)
- Frame rate: 30 fps
- Duration: Sum of all scene durations (must be under 180 seconds)
- Codec: H.264 (widely compatible)

### Functional Requirements

**FR1: Parse Storyboard**
- Load and parse YAML storyboard
- Validate against schema (reuse `skeleton/schema/validator.py`)
- Extract project metadata and scene list

**FR2: Render Each Scene Type**
- **Title:** Project title + tagline overlaid on background image
- **Feature:** Screenshot with caption overlay
- **Callout:** Screenshot with highlighted callouts (circles/arrows) + caption
- **Code:** Syntax-highlighted code snippet + caption
- **Outro:** Call-to-action text overlaid on background

**FR3: Apply Timing**
- Each scene renders for its specified `duration` (seconds)
- Scenes play in the order they appear in the storyboard

**FR4: Caption Rendering**
- Captions overlaid as text on video frames
- Readable font (e.g., Arial, Helvetica)
- High contrast (white text on dark semi-transparent background, or vice versa)
- Positioned at bottom-center or top of frame (configurable per scene type)

**FR5: Concatenate Scenes**
- Stitch all scene segments into a single MP4
- Smooth transitions (simple cuts, no fancy effects to keep it lean)

**FR6: Asset Loading**
- Load images from paths relative to storyboard file
- Resize/scale images to fit 1920x1080 canvas
- Handle missing assets gracefully (show placeholder or error frame)

**FR7: Code Scene Rendering**
- Render code snippet as image with syntax highlighting
- Use a library like Pygments for highlighting
- Monospace font (e.g., Courier, Consolas)
- Highlight specified lines with background color

**FR8: Callout Rendering**
- Draw circles or arrows at specified (x, y) coordinates
- Add callout label text near the marker
- Use high-contrast colors (e.g., bright yellow/orange)

### Non-Functional Requirements

**NFR1: Performance**
- Render a 60-second video in under 2 minutes on typical hardware

**NFR2: Dependencies**
- Minimize dependencies (use only: moviepy, Pillow, PyYAML, Pygments, jsonschema)
- FFmpeg must be installed separately (documented in README)

**NFR3: Error Handling**
- Clear error messages for missing assets, invalid storyboards, or FFmpeg issues
- Graceful degradation (e.g., missing asset → placeholder frame, not crash)

**NFR4: Logging**
- Print progress to console (e.g., "Rendering scene 1/7: Title...")
- Report final output path and duration

## Design

### Architecture

```
Storyboard (YAML)
    ↓
Validator (reuse skeleton/schema/validator.py)
    ↓
Parser (load YAML, extract scenes)
    ↓
Scene Renderers (5 types: title, feature, callout, code, outro)
    ↓ (each produces a VideoClip)
Compositor (concatenate clips)
    ↓
Encoder (write MP4 with H.264)
    ↓
output/demo.mp4
```

### Stack

- **Python 3.8+**
- **moviepy:** High-level FFmpeg wrapper for video composition
- **Pillow (PIL):** Image manipulation (loading, resizing, compositing)
- **Pygments:** Syntax highlighting for code scenes
- **PyYAML:** YAML parsing (already in skeleton requirements)
- **jsonschema:** Validation (already in skeleton requirements)

### File Structure

```
apps/demo-video/
├── render.py              # Main entry point (CLI)
├── renderers/
│   ├── __init__.py
│   ├── base.py           # BaseSceneRenderer abstract class
│   ├── title.py          # TitleSceneRenderer
│   ├── feature.py        # FeatureSceneRenderer
│   ├── callout.py        # CalloutSceneRenderer
│   ├── code.py           # CodeSceneRenderer
│   └── outro.py          # OutroSceneRenderer
├── compositor.py          # Concatenates clips, writes MP4
├── utils.py               # Helpers (load image, draw text, etc.)
├── output/                # Output directory (gitignored)
├── requirements.txt       # Python dependencies
└── README.md              # Usage instructions
```

### Scene Renderer Interface

Each renderer implements:

```python
class BaseSceneRenderer:
    def render(self, scene: dict, storyboard_dir: Path) -> VideoClip:
        """
        Render a scene as a VideoClip.
        
        Args:
            scene: Scene dict from storyboard
            storyboard_dir: Path to storyboard file's directory (for resolving asset paths)
        
        Returns:
            VideoClip with the specified duration
        """
        pass
```

### Rendering Strategy

**Option A: Frame-by-frame (more control, slower)**
- Generate each frame as an image
- Compose frames into video

**Option B: Static image + text overlay (faster, simpler)**
- Load background image
- Add text/graphics as overlays
- Hold for duration

**Decision: Option B** — faster, simpler, sufficient for static scenes. All SkeleTeller scenes are static (no animation required).

### Text Rendering

Use Pillow's `ImageDraw.text()` with:
- Font: Arial or DejaVu Sans (cross-platform)
- Size: 36-48pt (readable at 1080p)
- Color: White text with black outline, or black text on semi-transparent white box
- Position: Bottom-center for captions, top-center for titles

### Callout Rendering

For callout scenes:
- Load the base image
- For each callout in `scene['callouts']`:
  - Draw a circle at (x, y) using `ImageDraw.ellipse()`
  - Draw an arrow or line to a label box
  - Render the label text
- Use bright colors (yellow, orange, cyan) for visibility

### Code Rendering

For code scenes:
1. Use Pygments to highlight the code snippet:
   ```python
   from pygments import highlight
   from pygments.lexers import get_lexer_by_name
   from pygments.formatters import ImageFormatter
   ```
2. Render as PNG image
3. Optionally highlight specific lines with background color
4. Overlay caption at bottom

### Validation Integration

Before rendering, run the validator:
```python
from skeleton.schema.validator import validate_storyboard

if not validate_storyboard(storyboard_path, verbose=False):
    sys.exit(1)
```

### CLI Interface

```bash
python render.py <storyboard.yml> [options]

Options:
  --output, -o    Output file path (default: output/demo.mp4)
  --fps           Frame rate (default: 30)
  --resolution    Resolution WxH (default: 1920x1080)
  --verbose, -v   Verbose logging
```

## Implementation Tasks

### Task 1: Project Setup
- [ ] Create `apps/demo-video/` structure
- [ ] Create `requirements.txt` with dependencies
- [ ] Create `output/` directory (add to .gitignore)
- [ ] Create `renderers/` package with `__init__.py`

### Task 2: Base Infrastructure
- [ ] Implement `render.py` (CLI, argument parsing)
- [ ] Implement `utils.py` (load_image, draw_text, create_canvas helpers)
- [ ] Implement `compositor.py` (concatenate clips, write MP4)
- [ ] Implement `renderers/base.py` (BaseSceneRenderer abstract class)

### Task 3: Scene Renderers
- [ ] Implement `renderers/title.py` (title + tagline on background)
- [ ] Implement `renderers/feature.py` (image + caption)
- [ ] Implement `renderers/outro.py` (caption on background)
- [ ] Implement `renderers/callout.py` (image + callouts + caption)
- [ ] Implement `renderers/code.py` (syntax-highlighted code + caption)

### Task 4: Integration & Testing
- [ ] Test with `skeleton/examples/sample-project.yml`
- [ ] Verify output is valid MP4, plays correctly
- [ ] Verify all scene types render correctly
- [ ] Verify captions are readable
- [ ] Verify total duration matches storyboard

### Task 5: Documentation
- [ ] Write `apps/demo-video/README.md` with usage instructions
- [ ] Document dependencies and installation
- [ ] Add troubleshooting section

### Task 6: Error Handling & Polish
- [ ] Handle missing assets gracefully
- [ ] Add progress logging (e.g., "Rendering scene 3/7...")
- [ ] Validate FFmpeg installation on startup
- [ ] Add helpful error messages

## Acceptance Criteria

- [ ] `python apps/demo-video/render.py skeleton/examples/sample-project.yml` produces a valid MP4
- [ ] Output video is under 3 minutes (180 seconds)
- [ ] All 5 scene types render correctly with readable captions
- [ ] Callouts are visible and positioned correctly
- [ ] Code scenes have syntax highlighting
- [ ] Video plays in standard players (VLC, QuickTime, browser)
- [ ] Asset paths are resolved relative to storyboard file
- [ ] Missing assets produce a clear error (or placeholder frame)
- [ ] README explains how to install dependencies and render a video

## Open Questions

1. **Font availability:** Should we bundle a font, or rely on system fonts?
   - **Proposal:** Use DejaVu Sans (permissive license, widely available) and bundle it in `apps/demo-video/fonts/`

2. **Callout style:** Circles, arrows, or both?
   - **Proposal:** Circles with leader lines to labels (simple, clear)

3. **Transition style:** Hard cuts or crossfades?
   - **Proposal:** Hard cuts (simpler, faster to render, no fade complexity)

4. **Text animation:** Static or fade-in?
   - **Proposal:** Static text (keeps render simple, aligns with "lean" constraint)

5. **Background music:** Should we support it?
   - **Proposal:** No — adds complexity, licensing issues, and scope creep. Captions + visuals only.

## Dependencies

```
# apps/demo-video/requirements.txt
moviepy>=1.0.3
Pillow>=10.0.0
PyYAML>=6.0.0
jsonschema>=4.0.0
Pygments>=2.15.0
```

Note: FFmpeg must be installed separately (moviepy dependency).

## Success Metrics

- [ ] Render the sample storyboard (40 seconds) in under 2 minutes
- [ ] Output file size reasonable (under 50MB for a 1-minute video)
- [ ] No crashes on valid storyboards
- [ ] Clear error messages on invalid input

## Scope Boundaries

**In Scope:**
- Render all 5 scene types
- Caption overlays
- Callout graphics
- Syntax-highlighted code
- MP4 output with H.264

**Out of Scope (per AGENTS.md scope caps):**
- Animation or motion graphics
- Video effects (transitions, filters, etc.)
- Voice-over / TTS (caption text only)
- Background music
- Subtitles / closed captions (caption overlays are sufficient)
- Multiple output formats (MP4 only)
- Video editing UI (CLI only)

## Risks & Mitigations

**Risk 1: FFmpeg installation complexity**
- Mitigation: Clear installation instructions in README, check for FFmpeg on startup

**Risk 2: Rendering performance on large storyboards**
- Mitigation: Keep scenes static (no animation), use efficient image compositing

**Risk 3: Font rendering inconsistencies across platforms**
- Mitigation: Bundle a font (DejaVu Sans) with the app

**Risk 4: Asset loading failures**
- Mitigation: Validate asset paths early, provide clear error messages

## Timeline Estimate

- **Task 1-2 (Setup + Base):** ~100 credits
- **Task 3 (Scene Renderers):** ~200 credits
- **Task 4 (Testing):** ~50 credits
- **Task 5-6 (Docs + Polish):** ~100 credits

**Total: ~450 credits** (aligns with Phase 2 budget)

## References

- Core Spec: `.kiro/specs/skeleteller-core.md`
- Storyboard Schema: `skeleton/schema/storyboard.schema.json`
- Scene Types Reference: `skeleton/scene-types/README.md`
- Sample Storyboard: `skeleton/examples/sample-project.yml`

## Notes

- This spec follows spec-first discipline: committed before implementation
- Stack choices match core spec decisions (Python + FFmpeg)
- Design emphasizes simplicity and economy (static scenes, minimal effects)
- All paths remain repo-relative (no absolute paths)

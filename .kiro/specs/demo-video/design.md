# Demo Video Renderer — Design (spec-first)

> Spec status: **Design**. Requirements live in `requirements.md`; this file is
> the concrete, implementable design. Stack locked in `AGENTS.md` and
> `.kiro/specs/skeleteller-core.md`. Clean-room implementation for SkeleTeller.

## Overview

Demo Video Renderer is a Python + FFmpeg pipeline. Input: validated storyboard
YAML. Output: MP4 video (1920x1080, 30fps, H.264). Architecture: Parse → Render
scenes → Concatenate → Encode. Each of the 5 scene types has a dedicated
renderer that produces a VideoClip; clips are stitched by moviepy's concatenate.

## Locked stack

Python 3.8+ · moviepy (FFmpeg wrapper) · Pillow (image manipulation) · Pygments
(syntax highlighting) · PyYAML + jsonschema (already in skeleton). FFmpeg
installed separately. Dependency versions pinned exactly.

## File structure (maps to tasks)

```
apps/demo-video/
├── render.py              # CLI entry point
├── renderers/
│   ├── __init__.py
│   ├── base.py           # BaseSceneRenderer abstract class
│   ├── title.py          # TitleSceneRenderer
│   ├── feature.py        # FeatureSceneRenderer
│   ├── callout.py        # CalloutSceneRenderer
│   ├── code.py           # CodeSceneRenderer
│   └── outro.py          # OutroSceneRenderer
├── compositor.py          # Concatenate clips, write MP4
├── utils.py               # Helpers (load_image, draw_text, etc.)
├── output/                # Output directory (gitignored)
├── requirements.txt       # Python dependencies
└── README.md              # Usage instructions
```

## Key decisions

### Rendering strategy

**Static image + text overlay** (no animation). Each scene is a still image with
text/graphics overlaid, held for the specified duration. This is sufficient for
all SkeleTeller scene types (no motion required).

### Scene renderer interface

Each renderer implements:

```python
class BaseSceneRenderer:
    def render(self, scene: dict, storyboard_dir: Path) -> VideoClip:
        """Render a scene as a VideoClip with the specified duration."""
        pass
```

### Title scene (`title.py`)
- Load background image (or create solid color if none specified)
- Draw title text (large, centered, 72pt)
- Draw tagline text (smaller, below title, 36pt)
- Return ImageClip with scene duration

### Feature scene (`feature.py`)
- Load visual asset image
- Resize to fit 1920x1080 (preserve aspect ratio)
- Draw caption at bottom with semi-transparent background
- Return ImageClip with scene duration

### Callout scene (`callout.py`)
- Load visual asset image
- For each callout in `scene['callouts']`:
  - Draw circle at (x, y) with bright yellow/orange
  - Draw label text near the marker
- Draw caption at bottom
- Return ImageClip with scene duration

### Code scene (`code.py`)
- Use Pygments to render code snippet as image:
  ```python
  from pygments import highlight
  from pygments.lexers import get_lexer_by_name
  from pygments.formatters import ImageFormatter
  ```
- Highlight specified lines with background color
- Draw caption at bottom
- Return ImageClip with scene duration

### Outro scene (`outro.py`)
- Load background image (or create solid color if none specified)
- Draw caption text (centered, large font)
- Return ImageClip with scene duration

### Text rendering

Use Pillow's `ImageDraw.text()` with:
- **Font:** DejaVu Sans (bundled for consistency) or fallback to system Arial
- **Size:** 48pt for captions, 72pt for titles, 36pt for taglines
- **Color:** White text with black outline (1px), or black text on semi-transparent white box
- **Position:** Bottom-center for captions (20px margin), centered for titles

### Compositor (`compositor.py`)

```python
from moviepy.editor import concatenate_videoclips

def concatenate_scenes(clips: List[VideoClip]) -> VideoClip:
    return concatenate_videoclips(clips, method="compose")

def write_video(clip: VideoClip, output_path: Path):
    clip.write_videofile(
        str(output_path),
        codec='libx264',
        fps=30,
        preset='medium',
        audio=False  # no audio in SkeleTeller videos
    )
```

### CLI interface (`render.py`)

```python
import argparse

parser = argparse.ArgumentParser(description='Render SkeleTeller storyboard to video')
parser.add_argument('storyboard', help='Path to storyboard YAML file')
parser.add_argument('--output', '-o', default='output/demo.mp4', help='Output video path')
parser.add_argument('--fps', type=int, default=30, help='Frame rate (default: 30)')
parser.add_argument('--verbose', '-v', action='store_true', help='Verbose logging')
```

### Validation integration

Before rendering, run the validator:

```python
from skeleton.schema.validator import validate_storyboard

if not validate_storyboard(storyboard_path, verbose=False):
    print("❌ Storyboard validation failed")
    sys.exit(1)
```

### Asset path resolution

All asset paths in the storyboard are relative to the storyboard file's
directory:

```python
storyboard_dir = Path(storyboard_path).parent
asset_path = storyboard_dir / scene['visual']
```

### Error handling

| Operation | Failure condition | Recoverable? | Behavior |
|-----------|------------------|--------------|----------|
| Load storyboard | File not found / parse error | fatal | Print error, exit(1) |
| Validate storyboard | Schema validation fails | fatal | Print errors, exit(1) |
| Load asset | Image file missing | fatal | Print error with scene number, exit(1) |
| Render scene | Any exception | fatal | Print error, exit(1) |
| Write video | FFmpeg error | fatal | Print error, exit(1) |

All failures are fatal (fail-fast); no partial videos written. Progress logged
to console: "Rendering scene 3/7: Feature...".

### Dependencies (pinned exact)

```txt
# apps/demo-video/requirements.txt
moviepy==1.0.3
Pillow==10.0.0
PyYAML==6.0.0
jsonschema==4.25.0
Pygments==2.15.0
```

External: FFmpeg must be installed separately.

## Open decisions

1. **Font bundling:** Bundle DejaVu Sans in `apps/demo-video/fonts/` for
   cross-platform consistency.
   - **Decision:** Bundle it.

2. **Missing asset behavior:** Error out or placeholder frame?
   - **Decision:** Error out (fail-fast with clear message).

3. **Callout style:** Circles, arrows, or both?
   - **Decision:** Circles with leader lines to labels (simple, clear).

## Testability

Manual acceptance (no automated tests in v1):
- [ ] `python render.py skeleton/examples/sample-project.yml` produces valid MP4
- [ ] Video duration matches storyboard (40 seconds)
- [ ] All 5 scene types render correctly
- [ ] Captions are readable
- [ ] Callouts are visible and positioned correctly
- [ ] Code has syntax highlighting
- [ ] Video plays in VLC and browser

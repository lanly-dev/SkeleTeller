# Demo Video App

**Status:** Not yet implemented (Phase 2)

This app renders a storyboard into a demo video (MP4 format, under 3 minutes).

## Architecture (Planned)

**Stack:** Python + FFmpeg + moviepy

**Pipeline:**
1. Parse storyboard YAML
2. Load and prepare assets (images, code snippets)
3. Render each scene as a video segment
   - Add captions/overlays
   - Draw callouts (for callout scenes)
   - Apply timing
4. Concatenate segments into final video
5. Output: `output/demo.mp4`

## Usage (Planned)

```bash
cd apps/demo-video
python render.py ../../path/to/storyboard.yml
```

Output will be in `output/demo.mp4`.

## Scene Rendering (Planned)

Each scene type has a dedicated renderer:

- **Title:** Title text + tagline over background
- **Feature:** Screenshot + caption overlay
- **Callout:** Screenshot + highlighted callouts + caption
- **Code:** Syntax-highlighted code snippet + caption
- **Outro:** Call-to-action text over background

## Dependencies (Planned)

```bash
pip install moviepy pillow pyyaml
```

FFmpeg must be installed separately.

---

This will be implemented in Phase 2 after skeleton approval.

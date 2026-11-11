# Demo Video Renderer — Requirements (spec-first)

> Spec status: **Requirements** — `design.md` and `tasks.md` follow in the spec
> session. Stack decisions locked in `AGENTS.md` and `.kiro/specs/skeleteller-core.md`.

Feature: Demo Video Renderer — converts SkeleTeller storyboards (YAML) into
rendered demo videos (MP4, under 3 minutes).

## 1. Storyboard parsing
- **Requirement:** Load and parse a YAML storyboard file; validate against
  `skeleton/schema/storyboard.schema.json` before rendering.
- **Acceptance:** Valid storyboards parse cleanly; invalid storyboards produce
  clear error messages without crashing.

## 2. Scene rendering (5 types)
- **Requirement:** Render each of the 5 SkeleTeller scene types:
  - **Title:** Project title + tagline overlaid on background image
  - **Feature:** Screenshot with caption overlay
  - **Callout:** Screenshot with highlighted callouts (circles/markers) + caption
  - **Code:** Syntax-highlighted code snippet + caption
  - **Outro:** Call-to-action text overlaid on background
- **Acceptance:** Each scene type renders correctly with readable captions; the
  sample storyboard (`skeleton/examples/sample-project.yml`) produces a complete
  video with all 5 types visible.

## 3. Timing & duration
- **Requirement:** Each scene renders for its specified `duration` (seconds);
  total video duration equals the sum of scene durations; must be under 180
  seconds (3 minutes).
- **Acceptance:** A 40-second storyboard yields a 40-second video; scenes play
  in the order specified in the storyboard.

## 4. Caption overlays
- **Requirement:** Captions rendered as readable text overlays with high
  contrast (white on dark background or vice versa); positioned bottom-center
  or top of frame.
- **Acceptance:** Captions are readable at 1920x1080 on typical displays;
  captions do not obscure critical visual content.

## 5. Asset loading
- **Requirement:** Load image assets from paths relative to the storyboard file;
  resize/scale to fit 1920x1080 canvas; handle missing assets gracefully.
- **Acceptance:** Storyboard assets in `skeleton/examples/assets/` load and
  render correctly; missing assets produce clear error messages (not crashes).

## 6. Callout rendering
- **Requirement:** For callout scenes, draw markers (circles or arrows) at
  specified (x, y) coordinates with callout label text; use high-contrast colors
  (bright yellow/orange).
- **Acceptance:** Callouts from the sample storyboard are visible and positioned
  correctly; labels are readable.

## 7. Code syntax highlighting
- **Requirement:** For code scenes, render code snippets with syntax
  highlighting using Pygments; highlight specified lines with background color;
  use monospace font.
- **Acceptance:** Code from the sample storyboard has correct syntax
  highlighting and highlighted lines are visible.

## 8. Video output
- **Requirement:** Produce an MP4 file with H.264 codec at 1920x1080, 30 fps,
  saved to `apps/demo-video/output/`.
- **Acceptance:** Output video plays in standard players (VLC, browser); video
  matches the storyboard's specified duration and scene order.

## 9. Performance
- **Requirement:** Render a 60-second video in under 2 minutes on typical
  hardware (no freeze or hang).
- **Acceptance:** The sample storyboard (40 seconds) renders completely within
  a reasonable time (<80 seconds).

## 10. CLI interface
- **Requirement:** Command-line interface:
  ```bash
  python apps/demo-video/render.py <storyboard.yml> [--output path]
  ```
- **Acceptance:** Running the command produces the video at the specified
  output path; progress is logged to console.

## Non-goals
- No video editor UI (CLI only).
- No animation or motion graphics (static scenes).
- No video effects beyond simple cuts between scenes.
- No voice-over / TTS (caption text only, per scope caps).
- No background music (captions only).
- No multiple output formats (MP4 only).

## Out of scope for v1
- Advanced transitions (crossfades, wipes).
- Real-time preview during rendering.
- Video editing after render (trim, crop, etc.).
- Batch processing multiple storyboards.

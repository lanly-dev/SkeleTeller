# Demo Video Renderer — Tasks

> Implementation breakdown. Tasks map 1:1 to the file structure in `design.md`.
> Lean by intent: get to working video fast, polish later.

## T0 — Project setup
- [ ] Create `apps/demo-video/` directory structure
- [ ] Create `requirements.txt` with pinned dependencies:
  ```
  moviepy==1.0.3
  Pillow==10.0.0
  PyYAML==6.0.0
  jsonschema==4.25.0
  Pygments==2.15.0
  ```
- [ ] Create `output/` directory
- [ ] Add `apps/demo-video/output/` to `.gitignore`
- [ ] Create `renderers/__init__.py` (empty package marker)
- [ ] **Done:** `pip install -r apps/demo-video/requirements.txt` succeeds; directory structure exists.

## T1 — `utils.py` (helpers)
- [ ] `load_image(path: Path) -> Image.Image`: Load image with Pillow, handle errors
- [ ] `create_canvas(width: int, height: int, color: tuple) -> Image.Image`: Create blank RGB image
- [ ] `draw_text(image, text, position, font_size, color, outline)`: Draw text with outline using ImageDraw
- [ ] `resize_to_fit(image, target_width, target_height) -> Image.Image`: Resize preserving aspect ratio
- [ ] **Done:** Functions work independently; `load_image` on a test PNG succeeds; `draw_text` renders readable text.

## T2 — `renderers/base.py` (abstract class)
- [ ] Define `BaseSceneRenderer` abstract class with `render(scene: dict, storyboard_dir: Path) -> VideoClip`
- [ ] Add docstring explaining the interface
- [ ] **Done:** Subclasses can import and extend `BaseSceneRenderer`.

## T3 — `renderers/title.py`
- [ ] Implement `TitleSceneRenderer(BaseSceneRenderer)`
- [ ] Load background from `scene.get('background')` or create solid color (#1a2332 dark blue)
- [ ] Draw `scene['title']` centered, 72pt, white with black outline
- [ ] Draw `scene.get('tagline', '')` below title, 36pt
- [ ] Return `ImageClip(np_array, duration=scene['duration'])`
- [ ] **Done:** Title scene from sample storyboard renders with readable text.

## T4 — `renderers/feature.py`
- [ ] Implement `FeatureSceneRenderer(BaseSceneRenderer)`
- [ ] Load `scene['visual']` image
- [ ] Resize to fit 1920x1080 (preserve aspect)
- [ ] Draw caption at bottom (semi-transparent black box + white text, 48pt)
- [ ] Return `ImageClip` with duration
- [ ] **Done:** Feature scene renders with image + readable caption.

## T5 — `renderers/outro.py`
- [ ] Implement `OutroSceneRenderer(BaseSceneRenderer)`
- [ ] Load background from `scene.get('visual')` or solid color (#262e38 dark gray)
- [ ] Draw `scene['caption']` centered, 48pt, white
- [ ] Return `ImageClip` with duration
- [ ] **Done:** Outro scene renders with centered text.

## T6 — `renderers/callout.py`
- [ ] Implement `CalloutSceneRenderer(BaseSceneRenderer)`
- [ ] Load `scene['visual']` image
- [ ] For each callout in `scene['callouts']`:
  - Draw circle at `(x, y)` with bright yellow (#FFD700), 40px radius, 4px width
  - Draw label text near marker, 32pt, yellow with black outline
- [ ] Draw caption at bottom
- [ ] Return `ImageClip` with duration
- [ ] **Done:** Callout scene renders with visible markers and labels at correct positions.

## T7 — `renderers/code.py`
- [ ] Implement `CodeSceneRenderer(BaseSceneRenderer)`
- [ ] Use Pygments to render `scene['code']['snippet']` as image:
  ```python
  from pygments import highlight
  from pygments.lexers import get_lexer_by_name
  from pygments.formatters import ImageFormatter
  lexer = get_lexer_by_name(scene['code']['language'])
  formatter = ImageFormatter(font_size=24, line_numbers=False)
  code_image = highlight(scene['code']['snippet'], lexer, formatter)
  ```
- [ ] Highlight specified lines with background color (if `highlight_lines` present)
- [ ] Create canvas, paste code image, draw caption at bottom
- [ ] Return `ImageClip` with duration
- [ ] **Done:** Code scene renders with syntax highlighting; highlighted lines visible.

## T8 — `compositor.py`
- [ ] `concatenate_scenes(clips: List[VideoClip]) -> VideoClip`: Use `concatenate_videoclips(clips, method="compose")`
- [ ] `write_video(clip: VideoClip, output_path: Path)`: Call `clip.write_videofile(str(output_path), codec='libx264', fps=30, preset='medium', audio=False)`
- [ ] Handle FFmpeg errors with clear messages
- [ ] **Done:** Concatenating 2+ clips and writing MP4 succeeds; output plays in VLC.

## T9 — `render.py` (CLI + wiring)
- [ ] Argument parsing: `storyboard` (required), `--output` (default: `output/demo.mp4`), `--fps` (default: 30), `--verbose`
- [ ] Load and parse storyboard YAML
- [ ] Validate with `skeleton.schema.validator.validate_storyboard()`
- [ ] Instantiate renderers: `{'title': TitleSceneRenderer(), 'feature': FeatureSceneRenderer(), ...}`
- [ ] For each scene:
  - Look up renderer by `scene['type']`
  - Call `renderer.render(scene, storyboard_dir)`
  - Log progress: "Rendering scene 3/7: Feature..."
- [ ] Concatenate all clips with `compositor.concatenate_scenes()`
- [ ] Write video with `compositor.write_video()`
- [ ] Print success message with output path and duration
- [ ] **Done:** `python apps/demo-video/render.py skeleton/examples/sample-project.yml` produces `output/demo.mp4`.

## T10 — Error handling
- [ ] Wrap storyboard load in try/except → print error, exit(1)
- [ ] Validation failure → print errors from validator, exit(1)
- [ ] Missing asset → print "Scene X: asset not found: <path>", exit(1)
- [ ] Renderer exception → print "Scene X failed: <error>", exit(1)
- [ ] FFmpeg error → print "Video encoding failed: <error>", exit(1)
- [ ] **Done:** All failure modes produce clear error messages without crashes.

## T11 — README documentation
- [ ] Write `apps/demo-video/README.md`:
  - Overview (what it does)
  - Dependencies (Python 3.8+, FFmpeg)
  - Installation: `pip install -r requirements.txt`
  - Usage: `python render.py <storyboard.yml>`
  - CLI options
  - Troubleshooting (FFmpeg not found, missing assets)
- [ ] **Done:** README is complete and someone can use the renderer by following it alone.

## T12 — Integration test (manual acceptance)
- [ ] Run: `python apps/demo-video/render.py skeleton/examples/sample-project.yml`
- [ ] Verify: `output/demo.mp4` exists and is ~40 seconds
- [ ] Open in VLC: all 7 scenes render in order
- [ ] Check: title scene has project name, feature scenes have images + captions, callout scene has markers, code scene has syntax highlighting, outro has text
- [ ] Verify: captions are readable
- [ ] Verify: duration matches storyboard (40 seconds)
- [ ] **Done:** All checks pass; video is production-ready.

## T13 — Font bundling (optional polish)
- [ ] Download DejaVu Sans font (`.ttf`)
- [ ] Place in `apps/demo-video/fonts/DejaVuSans.ttf`
- [ ] Update `utils.py` to load bundled font: `ImageFont.truetype("fonts/DejaVuSans.ttf", size)`
- [ ] Fallback to system font if bundle missing
- [ ] **Done:** Text renders consistently across platforms.

---

**Review gate:** After T12, the demo video app is functionally complete. T13 is optional polish.

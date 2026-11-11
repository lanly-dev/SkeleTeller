# Slide Walkthrough App Spec

**Status:** Draft  
**Created:** 2026-11-11  
**Phase:** 3  
**App:** apps/slide-walkthrough/

## Overview

The Slide Walkthrough App (App B) is a static web application generator that takes a SkeleTeller storyboard (YAML) and produces an interactive, storybook-style slide presentation.

**Key Distinction:** This is NOT a live demo of the target project — it's an interactive presentation of the storyboard itself. The viewer pages through slides, clicks hotspots to reveal details, and moves at their own pace.

## Requirements

### Input
- A validated storyboard YAML file (conforming to `skeleton/schema/storyboard.schema.json`)
- Asset files referenced in the storyboard (images)

### Output
- Static HTML/CSS/JS files in `apps/slide-walkthrough/dist/`
- Deployable to any static hosting (GitHub Pages, Netlify, Vercel)
- Single-page application (no server required)
- Responsive layout (desktop-first, mobile-friendly)

### Functional Requirements

**FR1: Parse Storyboard**
- Load and parse YAML storyboard (client-side via js-yaml)
- Extract project metadata and scene list

**FR2: Generate Slides**
- Each scene becomes one interactive slide
- Slide types correspond to the 5 scene types (title, feature, callout, code, outro)

**FR3: Navigation**
- **Next/Previous buttons:** Advance or go back one slide
- **Progress indicator:** Dots or progress bar showing current position
- **Keyboard controls:** Arrow keys (left/right), Space (next), Escape (go to start)
- **Direct navigation:** Click progress dots to jump to a slide

**FR4: Callout Interactivity**
- For callout scenes: display clickable hotspot markers on the image
- Click a hotspot → reveal the callout label (tooltip or highlight)
- Visual feedback on hover (cursor change, marker pulse)

**FR5: Code Syntax Highlighting**
- For code scenes: render code with syntax highlighting (Prism.js)
- Highlight specified lines with background color
- Copyable code block

**FR6: Narration Display**
- Caption text displayed prominently on each slide
- Narration text (if present) displayed as expandable detail or secondary text
- Narration can be longer than caption (use accordion or "Read more" pattern)

**FR7: Responsive Layout**
- Desktop: Full-screen slides with side navigation
- Mobile: Swipe gestures for navigation, stacked layout

**FR8: Visual Polish**
- Optional page-flip animation (CSS transitions)
- Smooth transitions between slides (fade or slide)
- Clean, modern design (minimalist)

### Non-Functional Requirements

**NFR1: Performance**
- Instant page load (static assets, no server requests)
- Smooth animations (60 fps transitions)

**NFR2: Dependencies**
- Minimal: js-yaml (YAML parsing), Prism.js (syntax highlighting)
- No framework required (vanilla JS, or lightweight Alpine.js for reactivity)

**NFR3: Browser Compatibility**
- Modern browsers (Chrome, Firefox, Safari, Edge — last 2 versions)
- Progressive enhancement (works without JS for basic content)

**NFR4: Accessibility**
- Keyboard navigation works fully
- Focus indicators visible
- Alt text for images (from storyboard metadata)
- Semantic HTML (nav, main, section)

**NFR5: Build Process**
- Simple build script: `node build.js <storyboard.yml>`
- Outputs static files to `dist/`
- No complex bundler (or use Vite for minimal bundling if needed)

## Design

### Architecture

```
Storyboard (YAML)
    ↓
Builder Script (Node.js)
    ↓
Template Engine (generate HTML from storyboard)
    ↓
Asset Copier (copy images to dist/)
    ↓
dist/
  ├── index.html       # Main page
  ├── styles.css       # Styling
  ├── script.js        # Interactivity
  ├── storyboard.json  # Parsed storyboard (embedded or separate)
  └── assets/          # Copied images
```

### Stack

**Option A: Vanilla JS (no framework)**
- Pros: Zero dependencies, maximum control, fast load
- Cons: More manual DOM manipulation

**Option B: Alpine.js (minimal framework)**
- Pros: Reactive data binding, cleaner code, tiny footprint (~15KB)
- Cons: One more dependency

**Decision: Alpine.js** — keeps code clean without heavy framework overhead, perfect for interactive slides.

**Build Tool:** Node.js script (or Vite if bundling is needed for ES modules)

### File Structure

```
apps/slide-walkthrough/
├── build.js               # Build script (CLI)
├── templates/
│   ├── index.html        # HTML template
│   ├── styles.css        # Stylesheet
│   └── script.js         # Client-side JS (navigation, interactivity)
├── dist/                  # Output directory (gitignored)
│   ├── index.html
│   ├── styles.css
│   ├── script.js
│   ├── storyboard.json   # Embedded storyboard data
│   └── assets/           # Copied images
├── package.json
├── package-lock.json
└── README.md
```

### Slide Layout Templates

Each scene type has a slide template:

**1. Title Slide**
```html
<section class="slide slide-title">
  <div class="background" style="background-image: url(...)"></div>
  <h1>{{ title }}</h1>
  <p class="tagline">{{ tagline }}</p>
</section>
```

**2. Feature Slide**
```html
<section class="slide slide-feature">
  <img src="{{ visual }}" alt="{{ caption }}">
  <div class="caption">{{ caption }}</div>
  <details class="narration">
    <summary>Learn more</summary>
    <p>{{ narration }}</p>
  </details>
</section>
```

**3. Callout Slide**
```html
<section class="slide slide-callout">
  <div class="image-container">
    <img src="{{ visual }}" alt="{{ caption }}">
    <div class="hotspot" style="left: {{ x }}px; top: {{ y }}px"
         @click="showCallout({{ index }})">
      <span class="marker">{{ index + 1 }}</span>
    </div>
    <!-- Repeat for each callout -->
  </div>
  <div class="caption">{{ caption }}</div>
  <div x-show="activeCallout === {{ index }}" class="callout-label">
    {{ callout.label }}
  </div>
</section>
```

**4. Code Slide**
```html
<section class="slide slide-code">
  <div class="caption">{{ caption }}</div>
  <pre><code class="language-{{ language }}">{{ snippet }}</code></pre>
  <details class="narration">
    <summary>About this code</summary>
    <p>{{ narration }}</p>
  </details>
</section>
```

**5. Outro Slide**
```html
<section class="slide slide-outro">
  <div class="background" style="background-image: url(...)"></div>
  <div class="caption">{{ caption }}</div>
</section>
```

### Navigation Component

```html
<nav class="slide-nav">
  <button @click="prevSlide" :disabled="currentSlide === 0">← Prev</button>
  
  <div class="progress">
    <template x-for="(scene, i) in scenes" :key="i">
      <button class="dot" 
              :class="{ active: i === currentSlide }"
              @click="goToSlide(i)">
      </button>
    </template>
  </div>
  
  <button @click="nextSlide" :disabled="currentSlide === scenes.length - 1">Next →</button>
</nav>
```

### State Management (Alpine.js)

```javascript
Alpine.data('slideshow', () => ({
  scenes: [], // Loaded from storyboard.json
  currentSlide: 0,
  activeCallout: null,
  
  init() {
    this.loadStoryboard();
    this.setupKeyboard();
  },
  
  nextSlide() {
    if (this.currentSlide < this.scenes.length - 1) {
      this.currentSlide++;
    }
  },
  
  prevSlide() {
    if (this.currentSlide > 0) {
      this.currentSlide--;
    }
  },
  
  goToSlide(index) {
    this.currentSlide = index;
  },
  
  showCallout(index) {
    this.activeCallout = this.activeCallout === index ? null : index;
  },
  
  setupKeyboard() {
    document.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowRight' || e.key === ' ') this.nextSlide();
      if (e.key === 'ArrowLeft') this.prevSlide();
      if (e.key === 'Escape') this.currentSlide = 0;
    });
  }
}));
```

### Build Process

```javascript
// build.js
const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');

function build(storyboardPath) {
  // 1. Parse storyboard
  const storyboard = yaml.load(fs.readFileSync(storyboardPath, 'utf8'));
  
  // 2. Create dist/ directory
  const distDir = path.join(__dirname, 'dist');
  fs.mkdirSync(distDir, { recursive: true });
  
  // 3. Copy assets
  const storyboardDir = path.dirname(storyboardPath);
  const assetsDir = path.join(distDir, 'assets');
  fs.mkdirSync(assetsDir, { recursive: true });
  
  // Copy each asset referenced in scenes
  storyboard.scenes.forEach(scene => {
    if (scene.visual) {
      const src = path.join(storyboardDir, scene.visual);
      const dest = path.join(assetsDir, path.basename(scene.visual));
      fs.copyFileSync(src, dest);
    }
    // Handle background, etc.
  });
  
  // 4. Embed storyboard as JSON
  fs.writeFileSync(
    path.join(distDir, 'storyboard.json'),
    JSON.stringify(storyboard, null, 2)
  );
  
  // 5. Copy templates
  fs.copyFileSync(
    path.join(__dirname, 'templates/index.html'),
    path.join(distDir, 'index.html')
  );
  fs.copyFileSync(
    path.join(__dirname, 'templates/styles.css'),
    path.join(distDir, 'styles.css')
  );
  fs.copyFileSync(
    path.join(__dirname, 'templates/script.js'),
    path.join(distDir, 'script.js')
  );
  
  console.log(`✅ Built slide walkthrough in ${distDir}`);
}

// CLI
const storyboardPath = process.argv[2];
if (!storyboardPath) {
  console.error('Usage: node build.js <storyboard.yml>');
  process.exit(1);
}
build(storyboardPath);
```

### Styling Strategy

- **Layout:** CSS Grid or Flexbox for slide layout
- **Transitions:** CSS transitions for slide changes (fade or slide animation)
- **Typography:** System font stack for fast loading
- **Colors:** Neutral palette (dark mode friendly)
- **Hotspots:** Pulsing circle markers with tooltips

## Implementation Tasks

### Task 1: Project Setup
- [ ] Create `apps/slide-walkthrough/` structure
- [ ] Initialize npm (`package.json` with js-yaml, alpinejs)
- [ ] Create `dist/` directory (add to .gitignore)
- [ ] Create `templates/` directory

### Task 2: Build Script
- [ ] Implement `build.js` (parse YAML, copy assets, generate dist/)
- [ ] CLI interface (accept storyboard path)
- [ ] Asset copying logic
- [ ] Embed storyboard as JSON

### Task 3: HTML Templates
- [ ] Create `templates/index.html` (main structure)
- [ ] Add Alpine.js integration
- [ ] Add navigation component
- [ ] Add slide container with x-show for current slide

### Task 4: Styling
- [ ] Create `templates/styles.css`
- [ ] Layout for each slide type (title, feature, callout, code, outro)
- [ ] Navigation styling (buttons, progress dots)
- [ ] Hotspot styling (callout markers)
- [ ] Responsive breakpoints

### Task 5: Interactivity
- [ ] Create `templates/script.js`
- [ ] Load storyboard.json
- [ ] Slide navigation logic
- [ ] Keyboard controls
- [ ] Callout click handlers
- [ ] Syntax highlighting (Prism.js)

### Task 6: Integration & Testing
- [ ] Build with `skeleton/examples/sample-project.yml`
- [ ] Open `dist/index.html` in browser
- [ ] Test all navigation methods (buttons, keyboard, dots)
- [ ] Test callout interactivity
- [ ] Test on mobile (responsive layout)

### Task 7: Documentation
- [ ] Write `apps/slide-walkthrough/README.md`
- [ ] Installation instructions
- [ ] Build commands
- [ ] Deployment guide (GitHub Pages, Netlify)

## Acceptance Criteria

- [ ] `node apps/slide-walkthrough/build.js skeleton/examples/sample-project.yml` produces a working site in `dist/`
- [ ] Opening `dist/index.html` displays the interactive slideshow
- [ ] All 5 scene types render correctly
- [ ] Navigation works (buttons, keyboard, progress dots)
- [ ] Callout scenes have clickable hotspots
- [ ] Code scenes have syntax highlighting
- [ ] Narration text displays when present
- [ ] Site works offline (no external requests)
- [ ] Responsive layout works on mobile
- [ ] README explains how to build and deploy

## Open Questions

1. **Alpine.js vs. Vanilla JS?**
   - **Decision:** Alpine.js — cleaner code, reactive, minimal footprint

2. **CDN or bundled dependencies?**
   - **Proposal:** CDN for Alpine.js and Prism.js (simpler build, faster for users with cache)

3. **Slide transition style?**
   - **Proposal:** Simple fade (300ms) — smooth, not distracting

4. **Hotspot reveal animation?**
   - **Proposal:** Slide-down tooltip (CSS transition)

5. **Mobile navigation?**
   - **Proposal:** Swipe gestures via touch events (optional enhancement)

## Dependencies

```json
{
  "name": "skeleteller-slide-walkthrough",
  "version": "1.0.0",
  "dependencies": {
    "js-yaml": "^4.1.0"
  },
  "devDependencies": {}
}
```

External (CDN):
- Alpine.js: `<script src="https://cdn.jsdelivr.net/npm/alpinejs@3.x.x/dist/cdn.min.js"></script>`
- Prism.js: `<script src="https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/prism.min.js"></script>`

## Success Metrics

- [ ] Build completes in under 5 seconds
- [ ] Output size under 5MB (for sample storyboard)
- [ ] Page loads instantly (static assets)
- [ ] 60 fps animations
- [ ] No browser console errors

## Scope Boundaries

**In Scope:**
- Static site generation from storyboard
- Slide navigation (next/prev, keyboard, progress)
- Callout interactivity (clickable hotspots)
- Code syntax highlighting
- Responsive layout

**Out of Scope (per AGENTS.md scope caps):**
- Live embedding of target project (NOT a live demo)
- Video playback (stills only)
- Backend/server (static site only)
- User accounts or saved progress
- Advanced animations beyond simple transitions
- Full-featured IDE-like code viewer

## Risks & Mitigations

**Risk 1: Asset path resolution complexity**
- Mitigation: Normalize paths during build, copy all assets to dist/assets/

**Risk 2: Browser compatibility issues**
- Mitigation: Test on major browsers, use CSS prefixes, progressive enhancement

**Risk 3: Large storyboards = large page size**
- Mitigation: Lazy-load images, compress assets during build

**Risk 4: Syntax highlighting library size**
- Mitigation: Use Prism.js with selective language support (load only needed languages)

## Timeline Estimate

- **Task 1-2 (Setup + Build):** ~100 credits
- **Task 3-4 (Templates + Styles):** ~150 credits
- **Task 5 (Interactivity):** ~100 credits
- **Task 6 (Testing):** ~50 credits
- **Task 7 (Docs):** ~50 credits

**Total: ~450 credits** (aligns with Phase 3 budget, reduced to ~400 if optimizations are made)

## References

- Core Spec: `.kiro/specs/skeleteller-core.md`
- Demo Video Spec: `.kiro/specs/demo-video-app.md`
- Storyboard Schema: `skeleton/schema/storyboard.schema.json`
- Scene Types Reference: `skeleton/scene-types/README.md`
- Sample Storyboard: `skeleton/examples/sample-project.yml`

## Notes

- This spec follows spec-first discipline: committed before implementation
- Stack choices match core spec decisions (static HTML/CSS/JS)
- Design emphasizes simplicity: storybook-style interactivity, NOT a live project demo
- All paths remain repo-relative (no absolute paths)
- The slide walkthrough is a presentation of the storyboard, not a simulation of the target project

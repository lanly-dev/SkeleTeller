# Slide Walkthrough App

**Status:** Not yet implemented (Phase 3)

This app builds an interactive, storybook-style slide walkthrough from a storyboard.

## Architecture (Planned)

**Stack:** Static HTML/CSS/JS (vanilla or Alpine.js)

**Features:**
- Page/slide navigation (next/back, progress indicator)
- Keyboard controls (arrow keys, space)
- Clickable hotspots for callouts
- Optional page-flip animation
- Responsive layout

**Output:** Static web app deployable to GitHub Pages, Netlify, or Vercel

## Usage (Planned)

```bash
cd apps/slide-walkthrough
npm install
npm run build ../../path/to/storyboard.yml
```

Output will be in `dist/` or `build/`, ready to deploy.

## Interactivity (Planned)

- **Navigation:** Next/previous buttons, progress dots, keyboard shortcuts
- **Callouts:** Clickable hotspots reveal explanations
- **Code scenes:** Syntax highlighting with Prism.js
- **Narration:** Expandable detail sections for longer text

## Scene Rendering (Planned)

Each scene becomes an HTML slide:

- **Title:** Hero section with title + tagline
- **Feature:** Full-width image + caption
- **Callout:** Image with clickable hotspot markers
- **Code:** Syntax-highlighted code block
- **Outro:** Call-to-action with link

## Dependencies (Planned)

```bash
npm install js-yaml prismjs
```

No build framework required (or use Vite for minimal bundling).

---

This will be implemented in Phase 3 after demo-video app is complete.

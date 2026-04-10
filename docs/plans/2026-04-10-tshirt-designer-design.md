# T-shirt Design Tool — Design Document

## Overview

A client-facing web tool for customizing Arabic text designs on t-shirts. The client selects from pre-vectorized SVG fonts, applies transforms and effects, draws freehand, adds stamps, and exports a 1080x1080 PNG.

**Stack**: SvelteKit + Cloudflare Pages. Fully client-side — no backend required.

**Architecture**: Hybrid SVG + Canvas. SVG for text design/transforms/effects. Canvas for freehand drawing. Composite renderer for t-shirt preview and export.

---

## Layout

```
┌─────────────────────────────┬──────────────────────┐
│                             │   T-shirt Preview    │
│   Design / Draw Canvas      │   (mockup + design)  │
│                             │   Color selectors    │
│   [Draw] [Design] tabs      │   (shirt + text)     │
│                             ├──────────────────────┤
│                             │   Toolbar            │
│                             │   (controls, export) │
└─────────────────────────────┴──────────────────────┘
```

- **Left panel (~60%)**: Dark rounded canvas with Draw/Design tab toggle
- **Top right (~40%, ~50% height)**: T-shirt mockup with live design preview
- **Bottom right (~40%, ~50% height)**: Scrollable toolbar with all controls

---

## Design Tab (SVG Text Editor)

### Font Picker
- 11 pre-vectorized SVG files bundled as static assets
- Horizontal scrollable row of thumbnail previews in the toolbar
- Clicking swaps the active SVG in the design canvas

### Text Transforms (sliders in toolbar)
- **Bend**: Deform SVG paths along circular arc. Range: -100 (down) to +100 (up), 0 = flat
- **Inflate**: Scale paths outward from center. Range: 0–100
- **Stretch**: Scale along Y axis. Range: 0–100

Implementation: SVG path data manipulation — arc mapping (bend), radial distortion (inflate), scaleY (stretch).

### Stroke
- Toggle on/off
- Stroke weight slider
- Rendered via SVG `<use>` with `stroke-linejoin="round"` and `paint-order="stroke"` for outside-only stroke with round edges

### Stroke Effects (visible when stroke is on)
- **Blur**: `<feGaussianBlur>` on stroke layer. Slider for radius.
- **Gradient**: `<linearGradient>` on stroke. Color picker for start/end.
- **Rough edges**: `<feTurbulence>` + `<feDisplacementMap>` on stroke. Slider for intensity.
- **Pixelized edges**: Downscale/upscale mosaic filter chain. Slider for pixel size.

### Text Rough Edges
- `<feTurbulence>` + `<feDisplacementMap>` applied to entire text design
- Slider for distressed/grunge intensity

### Colors
- Text fill color picker
- Shirt color picker (or dot selectors near t-shirt preview)

---

## Draw Tab (Freehand Canvas)

- HTML5 Canvas with pointer events (mouse + touch)
- Smooth lines via quadratic curve interpolation
- Brush size slider
- Brush color picker
- Clear canvas button
- Drawing stored as image layer for compositing

---

## T-shirt Preview

### Mockup
- Pre-made t-shirt mockup images for each color (black, white, grey, red)
- Design composited as overlay layer in chest area by default

### Interaction
- Drag to reposition design on shirt
- Resize handles (corners) to scale design
- Left panel canvas unchanged — only shirt placement affected

### Stamps
- Upload button for SVG/PNG stamp assets
- Each stamp is a separate draggable, resizable layer on the shirt
- Multiple stamps supported
- Delete button on selected stamp

### Live Updates
- All toolbar changes immediately re-render on shirt via Svelte reactivity

---

## Export

- Download button in toolbar
- Renders to offscreen `<canvas>` at 1080x1080
- Compositing order: shirt base → text design → freehand drawing → stamps
- Export as PNG via `canvas.toBlob()` → browser download

---

## Assets

### SVG Fonts (11 files)
Source: `/Users/macbookpro/Dropbox (Personal)/(Personal)/Clients/Balok/fonts/`
- الاسطوانة ثقافة.svg (through الاسطوانة ثقافة-10.svg)
- Will be copied into project static assets

### T-shirt Mockups
- Need mockup images for: black, white, grey, red shirts
- Front-facing flat lay or ghost mannequin style

# T-shirt Designer Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build a client-facing t-shirt design customization tool with SVG text editing, freehand drawing, stamps, and 1080x1080 PNG export.

**Architecture:** Hybrid SVG + Canvas. SvelteKit app deployed to Cloudflare Pages. SVG handles text design/transforms/effects in the Design tab. Canvas handles freehand drawing in the Draw tab. Composite renderer for t-shirt preview and export. All client-side, no backend.

**Tech Stack:** SvelteKit 2, Svelte 5, TypeScript, Cloudflare Pages adapter, SVG filters, HTML5 Canvas

---

### Task 1: Project Scaffold

**Files:**
- Create: `package.json`, `svelte.config.js`, `vite.config.ts`, `tsconfig.json`, `src/app.html`, `src/routes/+page.svelte`, `src/routes/+layout.svelte`, `src/app.css`

**Step 1: Initialize SvelteKit project**

```bash
cd /Users/macbookpro/code/tshirt_mimo
npm create svelte@latest . -- --template skeleton --types typescript
```

Select: Skeleton project, TypeScript, no additional options.

**Step 2: Install Cloudflare Pages adapter**

```bash
npm install -D @sveltejs/adapter-cloudflare
```

**Step 3: Configure adapter in svelte.config.js**

```js
import adapter from '@sveltejs/adapter-cloudflare';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

export default {
  preprocess: vitePreprocess(),
  kit: {
    adapter: adapter()
  }
};
```

**Step 4: Copy SVG font files into static assets**

```bash
mkdir -p static/fonts
cp "/Users/macbookpro/Dropbox (Personal)/(Personal)/Clients/Balok/fonts/"*.svg static/fonts/
```

Rename files to URL-safe names:
- `font-default.svg` (الاسطوانة ثقافة.svg)
- `font-1.svg` through `font-10.svg`

**Step 5: Set up global styles in src/app.css**

```css
:root {
  --bg: #f5f5f5;
  --panel-dark: #1a1a1a;
  --panel-toolbar: #2a2a2a;
  --radius: 20px;
  --text-primary: #ffffff;
}

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

html, body {
  height: 100%;
  width: 100%;
  overflow: hidden;
  font-family: system-ui, sans-serif;
  background: var(--bg);
}
```

**Step 6: Verify dev server starts**

```bash
npm run dev
```

Expected: SvelteKit dev server at localhost:5173

**Step 7: Commit**

```bash
git init && git add -A && git commit -m "feat: scaffold SvelteKit project with Cloudflare adapter and SVG font assets"
```

---

### Task 2: App Layout (3-Panel Grid)

**Files:**
- Create: `src/lib/stores/designer.ts`
- Modify: `src/routes/+page.svelte`

**Step 1: Create the designer store**

```ts
// src/lib/stores/designer.ts
import { writable } from 'svelte/store';

export type ActiveTab = 'design' | 'draw';

export const activeTab = writable<ActiveTab>('design');

export const designState = writable({
  fontIndex: 0,
  textColor: '#ffffff',
  shirtColor: '#1a1a1a',
  bend: 0,
  inflate: 0,
  stretch: 0,
  roughEdges: 0,
  strokeEnabled: false,
  strokeWeight: 2,
  strokeColor: '#ffffff',
  strokeBlur: 0,
  strokeGradientStart: '#ffffff',
  strokeGradientEnd: '#000000',
  strokeGradientEnabled: false,
  strokeRoughEdges: 0,
  strokePixelized: 0,
  designX: 50, // percent position on shirt
  designY: 35,
  designScale: 1,
});

export const drawState = writable({
  brushSize: 4,
  brushColor: '#ffffff',
});

export interface Stamp {
  id: string;
  src: string;
  x: number;
  y: number;
  scale: number;
}

export const stamps = writable<Stamp[]>([]);
```

**Step 2: Build the 3-panel layout in +page.svelte**

```svelte
<!-- src/routes/+page.svelte -->
<script lang="ts">
  import { activeTab } from '$lib/stores/designer';
</script>

<div class="app">
  <div class="panel-left">
    <div class="tab-toggle">
      <button
        class:active={$activeTab === 'draw'}
        on:click={() => $activeTab = 'draw'}
      >Draw</button>
      <button
        class:active={$activeTab === 'design'}
        on:click={() => $activeTab = 'design'}
      >Design</button>
    </div>
    <div class="canvas-area">
      <!-- Design or Draw canvas goes here -->
      <p style="color: white; text-align: center;">Canvas placeholder</p>
    </div>
  </div>

  <div class="panel-right">
    <div class="preview-area">
      <!-- T-shirt preview goes here -->
      <p style="color: white; text-align: center;">T-shirt preview</p>
    </div>
    <div class="toolbar-area">
      <!-- Toolbar goes here -->
      <p style="color: white; text-align: center;">Toolbar</p>
    </div>
  </div>
</div>

<style>
  .app {
    display: grid;
    grid-template-columns: 3fr 2fr;
    height: 100vh;
    padding: 16px;
    gap: 16px;
  }

  .panel-left {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .tab-toggle {
    display: flex;
    justify-content: center;
    gap: 0;
    background: var(--panel-dark);
    border-radius: 20px;
    padding: 4px;
    width: fit-content;
    align-self: center;
  }

  .tab-toggle button {
    padding: 6px 20px;
    border: none;
    background: transparent;
    color: #888;
    cursor: pointer;
    border-radius: 16px;
    font-size: 14px;
    transition: all 0.2s;
  }

  .tab-toggle button.active {
    background: #fff;
    color: #000;
  }

  .canvas-area {
    flex: 1;
    background: var(--panel-dark);
    border-radius: var(--radius);
    display: flex;
    align-items: center;
    justify-content: center;
    overflow: hidden;
  }

  .panel-right {
    display: flex;
    flex-direction: column;
    gap: 16px;
  }

  .preview-area {
    flex: 1;
    background: #e8e8e8;
    border-radius: var(--radius);
    display: flex;
    align-items: center;
    justify-content: center;
    position: relative;
    overflow: hidden;
  }

  .toolbar-area {
    flex: 1;
    background: var(--panel-toolbar);
    border-radius: var(--radius);
    padding: 16px;
    overflow-y: auto;
  }
</style>
```

**Step 3: Verify layout matches Figma**

Run dev server, compare against Figma screenshot: 3-panel grid, dark left panel with Draw/Design toggle, light top-right preview, dark bottom-right toolbar.

**Step 4: Commit**

```bash
git add -A && git commit -m "feat: implement 3-panel layout with tab toggle and designer store"
```

---

### Task 3: Design Canvas — SVG Font Rendering

**Files:**
- Create: `src/lib/components/DesignCanvas.svelte`, `src/lib/data/fonts.ts`
- Modify: `src/routes/+page.svelte`

**Step 1: Create fonts data module**

```ts
// src/lib/data/fonts.ts
export const FONTS = [
  { id: 'default', label: 'Font 1', src: '/fonts/font-default.svg' },
  { id: '1', label: 'Font 2', src: '/fonts/font-1.svg' },
  { id: '2', label: 'Font 3', src: '/fonts/font-2.svg' },
  { id: '3', label: 'Font 4', src: '/fonts/font-3.svg' },
  { id: '4', label: 'Font 5', src: '/fonts/font-4.svg' },
  { id: '5', label: 'Font 6', src: '/fonts/font-5.svg' },
  { id: '6', label: 'Font 7', src: '/fonts/font-6.svg' },
  { id: '7', label: 'Font 8', src: '/fonts/font-7.svg' },
  { id: '8', label: 'Font 9', src: '/fonts/font-8.svg' },
  { id: '9', label: 'Font 10', src: '/fonts/font-9.svg' },
  { id: '10', label: 'Font 11', src: '/fonts/font-10.svg' },
];
```

**Step 2: Create DesignCanvas component**

Loads the selected SVG font file, parses its paths, and renders them in an inline SVG element. Applies the text fill color from the store.

The component:
1. Fetches the SVG file content
2. Parses path `d` attributes and viewBox
3. Renders paths inside an `<svg>` with proper scaling
4. Applies fill color from `designState.textColor`

**Step 3: Wire into +page.svelte**

Show `<DesignCanvas />` when `activeTab === 'design'`.

**Step 4: Verify SVG renders on dark background**

Confirm Arabic text appears white on dark canvas, matching Figma.

**Step 5: Commit**

```bash
git add -A && git commit -m "feat: add DesignCanvas component with SVG font rendering"
```

---

### Task 4: Font Picker in Toolbar

**Files:**
- Create: `src/lib/components/FontPicker.svelte`
- Modify: `src/routes/+page.svelte` (toolbar area)

**Step 1: Create FontPicker component**

Horizontal scrollable row of thumbnail previews. Each thumbnail renders the SVG at small scale. Clicking updates `designState.fontIndex`. Active font has a highlight border.

**Step 2: Add to toolbar area in +page.svelte**

**Step 3: Verify clicking font updates the design canvas**

**Step 4: Commit**

```bash
git add -A && git commit -m "feat: add font picker with thumbnail previews in toolbar"
```

---

### Task 5: Text Transforms — Bend, Inflate, Stretch

**Files:**
- Create: `src/lib/utils/svg-transforms.ts`, `src/lib/components/TransformSliders.svelte`
- Modify: `src/lib/components/DesignCanvas.svelte`

**Step 1: Implement SVG path transform utilities**

```ts
// src/lib/utils/svg-transforms.ts

// Parse SVG path d attribute into commands
export function parsePath(d: string): PathCommand[] { ... }

// Serialize commands back to d string
export function serializePath(commands: PathCommand[]): string { ... }

// Bend: map x coordinates along a circular arc
// amount: -100 to +100 (negative = downward arc)
export function bendPath(commands: PathCommand[], amount: number, bounds: BBox): PathCommand[] { ... }

// Inflate: radial distortion from center
// amount: 0 to 100
export function inflatePath(commands: PathCommand[], amount: number, bounds: BBox): PathCommand[] { ... }

// Stretch: scale Y axis
// amount: 0 to 100 (0 = no change, 100 = 2x height)
export function stretchPath(commands: PathCommand[], amount: number, bounds: BBox): PathCommand[] { ... }
```

The bend transform maps each point (x, y) onto a circular arc. The arc radius is derived from the amount slider. Points are repositioned by calculating their angle along the arc based on their x position, and adjusting their y based on distance from the arc center.

The inflate transform calculates each point's distance from the bounding box center, then applies a radial push proportional to distance and amount.

The stretch transform applies a scaleY multiplier of `1 + amount/100` relative to the vertical center.

**Step 2: Create TransformSliders component**

Three labeled sliders (Bend, Inflate, Stretch) bound to `designState`.

**Step 3: Apply transforms in DesignCanvas**

When `bend`, `inflate`, or `stretch` values change, run the parsed paths through the transform pipeline and re-render.

**Step 4: Add TransformSliders to toolbar**

**Step 5: Verify each slider visually deforms the text**

**Step 6: Commit**

```bash
git add -A && git commit -m "feat: add text transforms — bend, inflate, stretch with SVG path manipulation"
```

---

### Task 6: Stroke — Outside Stroke with Round Edges

**Files:**
- Create: `src/lib/components/StrokeControls.svelte`
- Modify: `src/lib/components/DesignCanvas.svelte`

**Step 1: Add stroke rendering to DesignCanvas**

When `strokeEnabled` is true, render the text paths twice:
1. Background layer: stroke with `stroke-linejoin="round"`, `stroke-linecap="round"`, `paint-order="stroke"`, stroke width from slider
2. Foreground layer: fill only (covers inner stroke, making stroke appear outside-only)

```svelte
{#if $designState.strokeEnabled}
  <g paint-order="stroke" stroke={$designState.strokeColor}
     stroke-width={$designState.strokeWeight}
     stroke-linejoin="round" stroke-linecap="round">
    <!-- paths here -->
  </g>
{/if}
<g fill={$designState.textColor}>
  <!-- paths here (fill covers inner stroke) -->
</g>
```

**Step 2: Create StrokeControls component**

Toggle switch, weight slider, color picker. Only visible in toolbar when in Design tab.

**Step 3: Verify stroke appears outside text with round edges**

**Step 4: Commit**

```bash
git add -A && git commit -m "feat: add outside stroke with weight slider and round edges"
```

---

### Task 7: Stroke Effects — Blur, Gradient, Rough Edges, Pixelized

**Files:**
- Create: `src/lib/components/StrokeEffects.svelte`
- Modify: `src/lib/components/DesignCanvas.svelte`

**Step 1: Add SVG filter definitions to DesignCanvas**

```svelte
<defs>
  <!-- Blur filter -->
  <filter id="stroke-blur">
    <feGaussianBlur stdDeviation={$designState.strokeBlur} />
  </filter>

  <!-- Rough edges filter -->
  <filter id="stroke-rough">
    <feTurbulence type="turbulence" baseFrequency="0.05"
      numOctaves="2" seed="1" />
    <feDisplacementMap in="SourceGraphic" scale={$designState.strokeRoughEdges} />
  </filter>

  <!-- Pixelized filter -->
  <filter id="stroke-pixel">
    <feFlood />
    <feComposite in="SourceGraphic" />
    <feMorphology operator="dilate" radius={$designState.strokePixelized * 0.5} />
    <feGaussianBlur stdDeviation={0.5} />
    <feComposite in="SourceGraphic" operator="in" />
  </filter>

  <!-- Gradient -->
  {#if $designState.strokeGradientEnabled}
    <linearGradient id="stroke-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color={$designState.strokeGradientStart} />
      <stop offset="100%" stop-color={$designState.strokeGradientEnd} />
    </linearGradient>
  {/if}
</defs>
```

Apply the appropriate filter to the stroke `<g>` element. If gradient is enabled, use `url(#stroke-gradient)` as stroke color.

**Step 2: Create StrokeEffects component**

Sliders for blur, rough edges, pixelized. Toggle + color pickers for gradient. Only visible when stroke is enabled.

**Step 3: Verify each effect visually on the stroke**

**Step 4: Commit**

```bash
git add -A && git commit -m "feat: add stroke effects — blur, gradient, rough edges, pixelized"
```

---

### Task 8: Text Rough Edges (Distressed/Grunge)

**Files:**
- Modify: `src/lib/components/DesignCanvas.svelte`, toolbar area

**Step 1: Add distress filter to DesignCanvas defs**

```svelte
<filter id="text-distress">
  <feTurbulence type="turbulence" baseFrequency="0.04"
    numOctaves="4" seed="2" />
  <feDisplacementMap in="SourceGraphic" scale={$designState.roughEdges} />
</filter>
```

Apply to the entire text group when `roughEdges > 0`.

**Step 2: Add slider to toolbar (in TransformSliders or its own section)**

**Step 3: Verify grunge look at various intensity levels**

**Step 4: Commit**

```bash
git add -A && git commit -m "feat: add distressed/grunge rough edges effect on text"
```

---

### Task 9: Color Pickers — Text Color & Shirt Color

**Files:**
- Create: `src/lib/components/ColorControls.svelte`
- Modify: `src/routes/+page.svelte`

**Step 1: Create ColorControls component**

- Text fill color: `<input type="color">` bound to `designState.textColor`
- Shirt color: preset dot selectors (matching Figma — red, dark, grey, white) + optional custom color picker. Bound to `designState.shirtColor`.

The shirt color dots should be positioned near the t-shirt preview, matching the Figma layout (vertical column of colored circles with active state indicator).

**Step 2: Wire shirt color to preview panel background/mockup**

**Step 3: Verify color changes update design and preview in real-time**

**Step 4: Commit**

```bash
git add -A && git commit -m "feat: add text and shirt color pickers"
```

---

### Task 10: Draw Tab — Freehand Canvas

**Files:**
- Create: `src/lib/components/DrawCanvas.svelte`
- Modify: `src/routes/+page.svelte`

**Step 1: Create DrawCanvas component**

HTML5 Canvas with:
- `pointerdown` / `pointermove` / `pointerup` event handlers
- Smooth lines using quadratic bezier curves between consecutive points
- Brush size and color from `drawState`
- Clear button
- Exports canvas content as data URL for compositing

```svelte
<script lang="ts">
  import { drawState } from '$lib/stores/designer';

  let canvas: HTMLCanvasElement;
  let ctx: CanvasRenderingContext2D;
  let drawing = false;
  let lastX = 0;
  let lastY = 0;

  function startDraw(e: PointerEvent) {
    drawing = true;
    [lastX, lastY] = getPos(e);
    ctx.beginPath();
    ctx.moveTo(lastX, lastY);
  }

  function draw(e: PointerEvent) {
    if (!drawing) return;
    const [x, y] = getPos(e);
    const midX = (lastX + x) / 2;
    const midY = (lastY + y) / 2;
    ctx.quadraticCurveTo(lastX, lastY, midX, midY);
    ctx.strokeStyle = $drawState.brushColor;
    ctx.lineWidth = $drawState.brushSize;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.stroke();
    [lastX, lastY] = [x, y];
  }

  function endDraw() {
    drawing = false;
  }

  function getPos(e: PointerEvent): [number, number] {
    const rect = canvas.getBoundingClientRect();
    return [e.clientX - rect.left, e.clientY - rect.top];
  }

  function clear() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  }
</script>

<canvas
  bind:this={canvas}
  on:pointerdown={startDraw}
  on:pointermove={draw}
  on:pointerup={endDraw}
  on:pointerleave={endDraw}
/>
```

**Step 2: Add brush size/color controls to toolbar when Draw tab is active**

**Step 3: Show DrawCanvas when activeTab === 'draw', DesignCanvas when 'design'**

**Step 4: Verify freehand drawing works with smooth lines**

**Step 5: Commit**

```bash
git add -A && git commit -m "feat: add freehand drawing canvas with brush controls"
```

---

### Task 11: T-shirt Preview with Live Design Composite

**Files:**
- Create: `src/lib/components/TshirtPreview.svelte`
- Modify: `src/routes/+page.svelte`

**Step 1: Create TshirtPreview component**

Renders a t-shirt mockup image with the design overlaid. For the mockup, we'll use a simple t-shirt SVG silhouette that can be color-filled (avoiding the need for multiple PNG mockups initially — can be swapped for photos later).

The design overlay:
- Positioned at `designX`, `designY` (percentage of shirt area)
- Scaled by `designScale`
- Contains the rendered SVG text design (re-rendered at small scale with all effects)
- Contains the canvas drawing as an `<img>` from data URL

**Step 2: Wire into preview-area of +page.svelte**

**Step 3: Verify design appears on shirt and updates live when toolbar changes**

**Step 4: Commit**

```bash
git add -A && git commit -m "feat: add t-shirt preview with live design composite"
```

---

### Task 12: Drag & Drop — Reposition and Resize Design on Shirt

**Files:**
- Modify: `src/lib/components/TshirtPreview.svelte`

**Step 1: Implement drag to reposition**

Pointer events on the design overlay layer:
- `pointerdown`: start drag, capture offset
- `pointermove`: update `designX`, `designY` in store
- `pointerup`: end drag

**Step 2: Implement resize handles**

Four corner handles on the design overlay. Dragging a handle adjusts `designScale` based on pointer distance from center.

**Step 3: Verify drag and resize work smoothly**

**Step 4: Commit**

```bash
git add -A && git commit -m "feat: add drag-to-reposition and resize handles for design on shirt"
```

---

### Task 13: Stamps — Upload, Place, Resize, Delete

**Files:**
- Create: `src/lib/components/StampManager.svelte`
- Modify: `src/lib/components/TshirtPreview.svelte`

**Step 1: Create StampManager component (toolbar section)**

- Upload button accepting SVG/PNG files
- On upload: read file as data URL, create new `Stamp` entry in store with default position/scale
- List of active stamps with delete button per stamp

**Step 2: Render stamps in TshirtPreview**

Each stamp rendered as a draggable, resizable image layer on the shirt. Same drag/resize pattern as the design layer but independent per stamp.

**Step 3: Verify stamps can be uploaded, placed, moved, resized, and deleted**

**Step 4: Commit**

```bash
git add -A && git commit -m "feat: add stamp upload, placement, resize, and delete"
```

---

### Task 14: Export — Download as 1080x1080 PNG

**Files:**
- Create: `src/lib/utils/export.ts`, `src/lib/components/ExportButton.svelte`
- Modify: toolbar area

**Step 1: Implement export utility**

```ts
// src/lib/utils/export.ts
export async function exportDesign(
  shirtColor: string,
  designSvgElement: SVGSVGElement,
  drawingCanvas: HTMLCanvasElement | null,
  stamps: Stamp[],
  designX: number,
  designY: number,
  designScale: number,
): Promise<Blob> {
  const canvas = document.createElement('canvas');
  canvas.width = 1080;
  canvas.height = 1080;
  const ctx = canvas.getContext('2d')!;

  // 1. Draw shirt background
  // Render shirt SVG silhouette with shirtColor fill to canvas

  // 2. Draw text design
  // Serialize the SVG design element to string, create image, draw at position/scale

  // 3. Draw freehand drawing
  // Draw the canvas layer at position/scale

  // 4. Draw stamps
  // Load each stamp image, draw at its position/scale

  return new Promise((resolve) => {
    canvas.toBlob((blob) => resolve(blob!), 'image/png');
  });
}
```

**Step 2: Create ExportButton component**

Button in toolbar that calls `exportDesign()` and triggers download via `<a>` element with `download` attribute.

**Step 3: Verify exported PNG is 1080x1080, contains shirt + all design layers**

**Step 4: Commit**

```bash
git add -A && git commit -m "feat: add PNG export at 1080x1080 with all design layers"
```

---

### Task 15: Visual Polish — Match Figma Design

**Files:**
- Modify: `src/routes/+page.svelte`, `src/app.css`, various components

**Step 1: Reference Figma design (node 3:168 in file GTdmey8y2YJB6hgFNruN6n)**

Compare the running app against the Figma screenshot and adjust:
- Panel proportions and border radii
- Tab toggle pill styling (white active tab on dark background)
- Color dot selectors near t-shirt (vertical stack, matching sizes)
- Toolbar section grouping and spacing
- Typography and spacing

**Step 2: Add the download/like button icon (bottom right of preview, matching Figma)**

**Step 3: Final responsive checks**

**Step 4: Commit**

```bash
git add -A && git commit -m "feat: polish UI to match Figma design"
```

---

### Task 16: Cloudflare Pages Deployment

**Files:**
- Modify: `svelte.config.js` (already configured in Task 1)

**Step 1: Build the project**

```bash
npm run build
```

Expected: successful build with Cloudflare Pages adapter

**Step 2: Deploy to Cloudflare Pages**

```bash
npx wrangler pages deploy .svelte-kit/cloudflare
```

Or connect the GitHub repo to Cloudflare Pages dashboard for automatic deploys.

**Step 3: Verify the deployed site works**

**Step 4: Commit any deployment config changes**

```bash
git add -A && git commit -m "feat: configure Cloudflare Pages deployment"
```

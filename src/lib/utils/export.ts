import type { Stamp } from '$lib/stores/designer';

const SHIRT_PATH =
  'M 100,0 L 0,80 L 50,130 L 80,110 L 80,460 C 80,475 90,480 100,480 L 300,480 C 310,480 320,475 320,460 L 320,110 L 350,130 L 400,80 L 300,0 C 290,30 260,50 200,50 C 140,50 110,30 100,0 Z';

const SHIRT_VIEWBOX = '0 0 400 480';

export interface ExportOptions {
  shirtColor: string;
  designSvgHtml: string;
  designX: number;
  designY: number;
  designScale: number;
  stamps: Stamp[];
  drawingDataUrl: string | null;
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

function svgToDataUrl(svgString: string): string {
  const blob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
  return URL.createObjectURL(blob);
}

async function drawShirt(
  ctx: CanvasRenderingContext2D,
  color: string,
  size: number
): Promise<void> {
  const svgString = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${SHIRT_VIEWBOX}" width="${size}" height="${size}" preserveAspectRatio="xMidYMid meet">
    <path d="${SHIRT_PATH}" fill="${color}" />
  </svg>`;
  const url = svgToDataUrl(svgString);
  try {
    const img = await loadImage(url);
    // Center the shirt in the canvas
    // The viewBox is 400x480, so when fit into 1080x1080 with "meet",
    // the rendered area is letterboxed. We replicate that centering.
    const vbW = 400;
    const vbH = 480;
    const scale = Math.min(size / vbW, size / vbH);
    const w = vbW * scale;
    const h = vbH * scale;
    const x = (size - w) / 2;
    const y = (size - h) / 2;
    ctx.drawImage(img, x, y, w, h);
  } finally {
    URL.revokeObjectURL(url);
  }
}

async function drawSvgOnCanvas(
  ctx: CanvasRenderingContext2D,
  svgHtml: string,
  xPercent: number,
  yPercent: number,
  scale: number,
  size: number
): Promise<void> {
  // Parse the SVG to get its viewBox dimensions for proper sizing
  const parser = new DOMParser();
  const doc = parser.parseFromString(svgHtml, 'image/svg+xml');
  const svgEl = doc.querySelector('svg');

  // Ensure the SVG has explicit width/height for rasterization
  // The design overlay in preview is 40% of the container width
  const designBaseWidth = size * 0.4;
  const designWidth = designBaseWidth * scale;

  // Clone and set dimensions on the SVG
  let modifiedSvg = svgHtml;
  if (svgEl) {
    svgEl.setAttribute('width', String(designWidth));
    svgEl.removeAttribute('height'); // Let it auto-scale via viewBox
    svgEl.setAttribute('height', String(designWidth)); // Square-ish fallback
    modifiedSvg = new XMLSerializer().serializeToString(svgEl);
  }

  const url = svgToDataUrl(modifiedSvg);
  try {
    const img = await loadImage(url);
    const drawW = designWidth;
    const drawH = (img.naturalHeight / img.naturalWidth) * drawW;
    const cx = (xPercent / 100) * size;
    const cy = (yPercent / 100) * size;
    ctx.drawImage(img, cx - drawW / 2, cy - drawH / 2, drawW, drawH);
  } finally {
    URL.revokeObjectURL(url);
  }
}

async function drawImageOnCanvas(
  ctx: CanvasRenderingContext2D,
  src: string,
  xPercent: number,
  yPercent: number,
  scale: number,
  size: number
): Promise<void> {
  const img = await loadImage(src);
  const baseSize = size * 0.15;
  const drawW = baseSize * scale;
  const drawH = (img.naturalHeight / img.naturalWidth) * drawW;
  const cx = (xPercent / 100) * size;
  const cy = (yPercent / 100) * size;
  ctx.drawImage(img, cx - drawW / 2, cy - drawH / 2, drawW, drawH);
}

export async function exportDesign(options: ExportOptions): Promise<Blob> {
  const size = 1080;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d')!;

  // 1. Fill background (light gray like the preview area)
  ctx.fillStyle = '#e8e8e8';
  ctx.fillRect(0, 0, size, size);

  // 2. Draw shirt
  await drawShirt(ctx, options.shirtColor, size);

  // 3. Draw text design at position/scale
  if (options.designSvgHtml) {
    await drawSvgOnCanvas(
      ctx,
      options.designSvgHtml,
      options.designX,
      options.designY,
      options.designScale,
      size
    );
  }

  // 4. Draw freehand drawing if any
  if (options.drawingDataUrl) {
    // The drawing is a full-canvas capture, draw it stretched to fill
    const img = await loadImage(options.drawingDataUrl);
    ctx.drawImage(img, 0, 0, size, size);
  }

  // 5. Draw stamps
  for (const stamp of options.stamps) {
    await drawImageOnCanvas(ctx, stamp.src, stamp.x, stamp.y, stamp.scale, size);
  }

  return new Promise((resolve) => {
    canvas.toBlob((blob) => resolve(blob!), 'image/png');
  });
}

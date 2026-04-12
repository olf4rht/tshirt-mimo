import type { Stamp } from '$lib/stores/designer';

const SHIRT_MOCKUPS: Record<string, string> = {
  dark: '/mockups/black.png',
  light: '/mockups/white.png',
};

function getShirtMockupUrl(shirtColor: string): string {
  if (shirtColor === '#f0f0f0' || shirtColor === '#ffffff') {
    return SHIRT_MOCKUPS.light;
  }
  return SHIRT_MOCKUPS.dark;
}

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
  const mockupUrl = getShirtMockupUrl(color);
  const img = await loadImage(mockupUrl);
  // Fit the mockup image centered in the canvas (80% like the preview)
  const scale = Math.min(size / img.naturalWidth, size / img.naturalHeight) * 0.8;
  const w = img.naturalWidth * scale;
  const h = img.naturalHeight * scale;
  const x = (size - w) / 2;
  const y = (size - h) / 2;
  ctx.drawImage(img, x, y, w, h);
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

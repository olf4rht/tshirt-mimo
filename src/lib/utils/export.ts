import type { PlacedStamp } from '$lib/stores/designer';

export interface ExportOptions {
  shirtColor: string;
  shirtSide: 'front' | 'back';
  designSvgHtml: string;
  designX: number;
  designY: number;
  designScale: number;
  designVisible: boolean;
  stamps: PlacedStamp[];
  drawingDataUrl: string | null;
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

function svgToDataUrl(svgString: string): string {
  const blob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
  return URL.createObjectURL(blob);
}

export async function exportDesign(options: ExportOptions): Promise<Blob> {
  // Use a high-res square canvas
  const size = 2048;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d')!;

  // 1. White background
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, size, size);

  // 2. Get the actual preview element to measure exact layout
  const previewEl = document.querySelector('.tshirt-preview') as HTMLElement;
  const shirtImg = previewEl?.querySelector('.shirt-img') as HTMLImageElement;

  if (!previewEl || !shirtImg) {
    throw new Error('Preview element not found');
  }

  const previewRect = previewEl.getBoundingClientRect();
  const shirtRect = shirtImg.getBoundingClientRect();

  // Calculate the shirt's position relative to preview, normalized
  const shirtRelX = (shirtRect.left - previewRect.left) / previewRect.width;
  const shirtRelY = (shirtRect.top - previewRect.top) / previewRect.height;
  const shirtRelW = shirtRect.width / previewRect.width;
  const shirtRelH = shirtRect.height / previewRect.height;

  // Scale factor from viewport to canvas (based on the larger dimension to maintain 1:1 square)
  const viewportAspect = previewRect.width / previewRect.height;
  let canvasScale: number;
  let offsetX: number;
  let offsetY: number;

  if (viewportAspect > 1) {
    // Wider than tall — fit height, center horizontally
    canvasScale = size / previewRect.height;
    offsetX = (size - previewRect.width * canvasScale) / 2;
    offsetY = 0;
  } else {
    // Taller than wide — fit width, center vertically
    canvasScale = size / previewRect.width;
    offsetX = 0;
    offsetY = (size - previewRect.height * canvasScale) / 2;
  }

  // 3. Draw the t-shirt mockup
  const isWhite = options.shirtColor === '#f0f0f0' || options.shirtColor === '#ffffff';
  const mockupUrl = `/mockups/${isWhite ? 'white' : 'black'}_${options.shirtSide}.png`;
  const mockupImg = await loadImage(mockupUrl);

  const drawShirtX = offsetX + (shirtRect.left - previewRect.left) * canvasScale;
  const drawShirtY = offsetY + (shirtRect.top - previewRect.top) * canvasScale;
  const drawShirtW = shirtRect.width * canvasScale;
  const drawShirtH = shirtRect.height * canvasScale;

  ctx.drawImage(mockupImg, drawShirtX, drawShirtY, drawShirtW, drawShirtH);

  // 4. Draw design SVG at exact viewport position
  if (options.designVisible && options.designSvgHtml) {
    const designOverlay = previewEl.querySelector('.design-overlay') as HTMLElement;
    if (designOverlay) {
      const designRect = designOverlay.getBoundingClientRect();
      const dX = offsetX + (designRect.left - previewRect.left) * canvasScale;
      const dY = offsetY + (designRect.top - previewRect.top) * canvasScale;
      const dW = designRect.width * canvasScale;
      const dH = designRect.height * canvasScale;

      // Parse SVG and set explicit dimensions for rasterization
      const parser = new DOMParser();
      const doc = parser.parseFromString(options.designSvgHtml, 'image/svg+xml');
      const svgEl = doc.querySelector('svg');
      if (svgEl) {
        // Use high resolution for crisp text
        const renderScale = 4;
        svgEl.setAttribute('width', String(dW * renderScale));
        svgEl.setAttribute('height', String(dH * renderScale));
        const modifiedSvg = new XMLSerializer().serializeToString(svgEl);
        const url = svgToDataUrl(modifiedSvg);
        try {
          const img = await loadImage(url);
          ctx.drawImage(img, dX, dY, dW, dH);
        } finally {
          URL.revokeObjectURL(url);
        }
      }
    }
  }

  // 5. Draw freehand drawing
  if (options.drawingDataUrl) {
    const img = await loadImage(options.drawingDataUrl);
    // Drawing canvas covers the full preview area
    ctx.drawImage(img, offsetX, offsetY, previewRect.width * canvasScale, previewRect.height * canvasScale);
  }

  // 6. Draw placed stamps at exact viewport positions
  for (const stamp of options.stamps) {
    const stampEls = previewEl.querySelectorAll('.stamp-overlay');
    // Find the matching stamp element by checking data or position
    // Alternatively, calculate from percentage position like the viewport does
    const img = await loadImage(stamp.src);
    const stampBaseW = previewRect.width * 0.15;
    const stampW = stampBaseW * stamp.scale * canvasScale;
    const stampH = (img.naturalHeight / img.naturalWidth) * stampW;
    const cx = offsetX + (stamp.x / 100) * previewRect.width * canvasScale;
    const cy = offsetY + (stamp.y / 100) * previewRect.height * canvasScale;
    ctx.drawImage(img, cx - stampW / 2, cy - stampH / 2, stampW, stampH);
  }

  return new Promise((resolve) => {
    canvas.toBlob((blob) => resolve(blob!), 'image/png');
  });
}

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

async function renderSvgElementToCanvas(
  ctx: CanvasRenderingContext2D,
  svgEl: SVGSVGElement,
  dX: number,
  dY: number,
  dW: number,
  dH: number
) {
  const renderScale = 4;
  const clone = svgEl.cloneNode(true) as SVGSVGElement;
  clone.setAttribute('width', String(dW * renderScale));
  clone.setAttribute('height', String(dH * renderScale));
  const modifiedSvg = new XMLSerializer().serializeToString(clone);
  const url = svgToDataUrl(modifiedSvg);
  try {
    const img = await loadImage(url);
    ctx.drawImage(img, dX, dY, dW, dH);
  } finally {
    URL.revokeObjectURL(url);
  }
}

export async function exportDesign(options: ExportOptions): Promise<Blob> {
  const size = 2048;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d')!;

  // 1. Background
  ctx.fillStyle = '#F3F3F3';
  ctx.fillRect(0, 0, size, size);

  // 2. Get the actual preview element to measure exact layout
  const previewEl = document.querySelector('.tshirt-preview') as HTMLElement;
  const shirtImg = previewEl?.querySelector('.shirt-img') as HTMLImageElement;

  if (!previewEl || !shirtImg) {
    throw new Error('Preview element not found');
  }

  const previewRect = previewEl.getBoundingClientRect();
  const shirtRect = shirtImg.getBoundingClientRect();

  const viewportAspect = previewRect.width / previewRect.height;
  let canvasScale: number;
  let offsetX: number;
  let offsetY: number;

  if (viewportAspect > 1) {
    canvasScale = size / previewRect.height;
    offsetX = (size - previewRect.width * canvasScale) / 2;
    offsetY = 0;
  } else {
    canvasScale = size / previewRect.width;
    offsetX = 0;
    offsetY = (size - previewRect.height * canvasScale) / 2;
  }

  // 3. Draw the t-shirt mockup
  const isWhite = options.shirtColor === '#f0f0f0' || options.shirtColor === '#ffffff';
  const isYellow = options.shirtColor === '#faf6d6';
  let mockupColor = 'black';
  if (isWhite) mockupColor = 'white';
  else if (isYellow) mockupColor = 'yellow';
  const mockupUrl = `/mockups/${mockupColor}_${options.shirtSide}.png`;
  const mockupImg = await loadImage(mockupUrl);

  const drawShirtX = offsetX + (shirtRect.left - previewRect.left) * canvasScale;
  const drawShirtY = offsetY + (shirtRect.top - previewRect.top) * canvasScale;
  const drawShirtW = shirtRect.width * canvasScale;
  const drawShirtH = shirtRect.height * canvasScale;

  ctx.drawImage(mockupImg, drawShirtX, drawShirtY, drawShirtW, drawShirtH);

  // 4. Draw design — capture all SVG layers (extrude + front face) at their rendered positions
  if (options.designVisible) {
    const designOverlay = previewEl.querySelector('.design-overlay') as HTMLElement;
    if (designOverlay) {
      // Collect all SVG elements within the design overlay (extrude layers, inflate layers, front face)
      const allSvgs = designOverlay.querySelectorAll('svg.font-svg');
      for (const svg of allSvgs) {
        const svgRect = svg.getBoundingClientRect();
        const dX = offsetX + (svgRect.left - previewRect.left) * canvasScale;
        const dY = offsetY + (svgRect.top - previewRect.top) * canvasScale;
        const dW = svgRect.width * canvasScale;
        const dH = svgRect.height * canvasScale;

        if (dW > 0 && dH > 0) {
          await renderSvgElementToCanvas(ctx, svg as SVGSVGElement, dX, dY, dW, dH);
        }
      }
    }
  }

  // 5. Draw freehand drawing
  if (options.drawingDataUrl) {
    const img = await loadImage(options.drawingDataUrl);
    ctx.drawImage(img, offsetX, offsetY, previewRect.width * canvasScale, previewRect.height * canvasScale);
  }

  // 6. Draw placed stamps at exact viewport positions
  for (const stamp of options.stamps) {
    const img = await loadImage(stamp.src);
    const stampBaseW = previewRect.width * 0.15;
    const stampW = stampBaseW * stamp.scale * canvasScale;
    const stampH = (img.naturalHeight / img.naturalWidth) * stampW;
    const cx = offsetX + (stamp.x / 100) * previewRect.width * canvasScale;
    const cy = offsetY + (stamp.y / 100) * previewRect.height * canvasScale;

    if (stamp.rotation) {
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate((stamp.rotation * Math.PI) / 180);
      ctx.drawImage(img, -stampW / 2, -stampH / 2, stampW, stampH);
      ctx.restore();
    } else {
      ctx.drawImage(img, cx - stampW / 2, cy - stampH / 2, stampW, stampH);
    }
  }

  return new Promise((resolve) => {
    canvas.toBlob((blob) => resolve(blob!), 'image/png');
  });
}

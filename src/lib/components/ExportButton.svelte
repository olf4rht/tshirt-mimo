<script lang="ts">
  import { designState, stamps } from '$lib/stores/designer';
  import { exportDesign } from '$lib/utils/export';

  let exporting = $state(false);

  async function handleExport() {
    exporting = true;
    try {
      // Get the design SVG from the DOM
      const designSvg = document.querySelector('.design-overlay svg') as SVGSVGElement | null;
      const designSvgHtml = designSvg ? new XMLSerializer().serializeToString(designSvg) : '';

      // Try to get drawing data from the draw canvas
      const drawCanvas = document.querySelector('canvas') as HTMLCanvasElement | null;
      let drawingDataUrl: string | null = null;
      if (drawCanvas) {
        const tempCtx = drawCanvas.getContext('2d');
        if (tempCtx) {
          // Check if the canvas has any content (non-transparent pixels)
          const imageData = tempCtx.getImageData(0, 0, drawCanvas.width, drawCanvas.height);
          const hasContent = imageData.data.some((v, i) => i % 4 === 3 && v > 0);
          if (hasContent) {
            drawingDataUrl = drawCanvas.toDataURL('image/png');
          }
        }
      }

      const blob = await exportDesign({
        shirtColor: $designState.shirtColor,
        designSvgHtml,
        designX: $designState.designX,
        designY: $designState.designY,
        designScale: $designState.designScale,
        stamps: $stamps,
        drawingDataUrl,
      });

      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'tshirt-design.png';
      a.click();
      URL.revokeObjectURL(url);
    } finally {
      exporting = false;
    }
  }
</script>

<button class="export-btn" onclick={handleExport} disabled={exporting}>
  {exporting ? 'Exporting...' : 'Download PNG'}
</button>

<style>
  .export-btn {
    width: 100%;
    padding: 12px 16px;
    border: none;
    border-radius: 12px;
    background: #ffffff;
    color: #000000;
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s ease;
    margin-top: 8px;
  }

  .export-btn:hover:not(:disabled) {
    background: #e0e0e0;
    transform: translateY(-1px);
  }

  .export-btn:active:not(:disabled) {
    transform: translateY(0);
  }

  .export-btn:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
</style>

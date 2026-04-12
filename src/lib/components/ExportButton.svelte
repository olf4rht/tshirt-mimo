<script lang="ts">
  import { designState, stamps } from '$lib/stores/designer';
  import { exportDesign } from '$lib/utils/export';

  let exporting = $state(false);

  async function handleExport() {
    exporting = true;
    try {
      const designSvg = document.querySelector('.design-overlay svg') as SVGSVGElement | null;
      const designSvgHtml = designSvg ? new XMLSerializer().serializeToString(designSvg) : '';

      const drawCanvas = document.querySelector('canvas') as HTMLCanvasElement | null;
      let drawingDataUrl: string | null = null;
      if (drawCanvas) {
        const tempCtx = drawCanvas.getContext('2d');
        if (tempCtx) {
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

<button class="export-btn" onclick={handleExport} disabled={exporting} title="Download PNG">
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
    <polyline points="7 10 12 15 17 10" />
    <line x1="12" y1="15" x2="12" y2="3" />
  </svg>
</button>

<style>
  .export-btn {
    width: 28px;
    height: 28px;
    border: 1px solid rgba(176, 176, 176, 0.3);
    border-radius: 100px;
    background: #F4F4F4;
    color: #B0B0AA;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.2s ease;
    flex-shrink: 0;
  }

  .export-btn:hover:not(:disabled) {
    background: rgba(0,0,0,0.15);
    color: #333;
  }

  .export-btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
</style>

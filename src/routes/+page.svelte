<script lang="ts">
  import { activeTab, designState, shirtSide, switchSide } from '$lib/stores/designer';
  import DrawCanvas from '$lib/components/DrawCanvas.svelte';
  import DrawControls from '$lib/components/DrawControls.svelte';
  import FontPicker from '$lib/components/FontPicker.svelte';
  import TransformSliders from '$lib/components/TransformSliders.svelte';
  import StrokeControls from '$lib/components/StrokeControls.svelte';
  import StampManager from '$lib/components/StampManager.svelte';
  import TshirtPreview from '$lib/components/TshirtPreview.svelte';
  import ExportButton from '$lib/components/ExportButton.svelte';
  import DesignSvgRenderer from '$lib/components/DesignSvgRenderer.svelte';

  const shirtPresets = [
    { label: 'Black', value: '#1a1a1a' },
    { label: 'White', value: '#f0f0f0' },
  ];

  const sizeOptions = [
    { label: 'XS', scale: 0.12 },
    { label: 'S', scale: 0.18 },
    { label: 'M', scale: 0.25 },
    { label: 'L', scale: 0.35 },
    { label: 'XL', scale: 0.5 },
  ];

  let currentSizeLabel = $derived(
    sizeOptions.find(s => s.scale === $designState.designScale)?.label ?? 'M'
  );

  // Positions map to the chest printable area (blue rectangle zone)
  const positionGrid = [
    { x: 45, y: 28 }, { x: 50, y: 28 }, { x: 55, y: 28 },
    { x: 45, y: 36 }, { x: 50, y: 36 }, { x: 55, y: 36 },
    { x: 45, y: 44 }, { x: 50, y: 44 }, { x: 55, y: 44 },
  ];

  let currentPosIndex = $derived(
    positionGrid.findIndex(p => p.x === $designState.designX && p.y === $designState.designY)
  );

  let previewExpanded = $state(false);

  let isWhiteShirt = $derived(
    $designState.shirtColor === '#f0f0f0' || $designState.shirtColor === '#ffffff'
  );

  let previewBg = $derived(isWhiteShirt ? '#ffffff' : $designState.shirtColor);

  let previewZoom = $state(1);
  let previewPanX = $state(0);
  let previewPanY = $state(0);
  let previewDragging = $state(false);
  let previewLastX = $state(0);
  let previewLastY = $state(0);

  function onPreviewWheel(e: WheelEvent) {
    e.preventDefault();
    const delta = e.deltaY > 0 ? 0.9 : 1.1;
    previewZoom = Math.max(0.5, Math.min(5, previewZoom * delta));
  }

  function onPreviewPointerDown(e: PointerEvent) {
    e.preventDefault();
    previewDragging = true;
    previewLastX = e.clientX;
    previewLastY = e.clientY;
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  }

  function onPreviewPointerMove(e: PointerEvent) {
    if (!previewDragging) return;
    previewPanX += e.clientX - previewLastX;
    previewPanY += e.clientY - previewLastY;
    previewLastX = e.clientX;
    previewLastY = e.clientY;
  }

  function onPreviewPointerUp(e: PointerEvent) {
    previewDragging = false;
    (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
  }

  $effect(() => {
    if (isWhiteShirt) {
      $designState.textColor = '#1a1a1a';
    } else {
      $designState.textColor = '#ffffff';
    }
  });
</script>

<div class="app">
  <!-- Toolbox (overlaid on left) -->
  <div class="toolbox">
    <div class="toolbox-header">
      <div class="tab-bar">
        <button
          class="tab-btn"
          class:active={$activeTab === 'design'}
          onclick={() => $activeTab = 'design'}
        >Manual Editor</button>
        <button
          class="tab-btn"
          class:active={$activeTab === 'stamps'}
          onclick={() => $activeTab = 'stamps'}
        >Stamps</button>
        <button
          class="tab-btn"
          class:active={$activeTab === 'draw'}
          onclick={() => $activeTab = 'draw'}
        >Draw</button>
      </div>
      <ExportButton />
    </div>

    <div class="inner-panel">
      {#if $activeTab === 'design'}
        <FontPicker />
        <TransformSliders />

        <!-- Position selector -->
        <div class="control-row">
          <div class="label-col">
            <span class="control-label">Position</span>
          </div>
          <div class="position-grid">
            {#each positionGrid as pos, i}
              <button
                class="pos-dot"
                class:pos-active={currentPosIndex === i}
                onclick={() => {
                  $designState.designX = pos.x;
                  $designState.designY = pos.y;
                }}
                aria-label="Position {i + 1}"
              ></button>
            {/each}
          </div>
        </div>

        <!-- Size selector -->
        <div class="control-row">
          <div class="label-col-size">
            <span class="control-label">Size</span>
          </div>
          <div class="pill-group">
            {#each sizeOptions as opt}
              <button
                class="pill-btn"
                class:pill-active={currentSizeLabel === opt.label}
                onclick={() => $designState.designScale = opt.scale}
              >{opt.label}</button>
            {/each}
          </div>
        </div>

        <StrokeControls />
      {:else if $activeTab === 'stamps'}
        <StampManager />
      {:else}
        <DrawControls />
      {/if}
    </div>
  </div>

  <!-- T-shirt preview (centered on full viewport) -->
  <div class="shirt-preview-area">
    {#if $activeTab === 'draw'}
      <div class="draw-overlay">
        <DrawCanvas />
      </div>
    {/if}
    <TshirtPreview />
  </div>

  <!-- Branding -->
  <div class="bottom-bar-left">
    <span class="branding">balok x cheb mimo</span>
  </div>

  <!-- Center controls (move to top when expanded) -->
  <div class="bar-controls" class:bar-top={previewExpanded}>
    <div class="bar-pill">
      <span class="bar-pill-label">T-shirt color</span>
      <div class="color-dots">
        {#each shirtPresets as preset}
          <button
            class="shirt-color-dot"
            class:dot-active={$designState.shirtColor === preset.value}
            style="background-color: {preset.value};"
            title={preset.label}
            onclick={() => { $designState.shirtColor = preset.value; }}
          ></button>
        {/each}
      </div>
    </div>

    <div class="bar-pill bar-pill-toggle">
      <button
        class="side-btn"
        class:side-active={$shirtSide === 'front'}
        onclick={() => switchSide('front')}
      >Front</button>
      <button
        class="side-btn"
        class:side-active={$shirtSide === 'back'}
        onclick={() => switchSide('back')}
      >Back</button>
    </div>
  </div>

  <!-- Preview card (bottom-right, expandable) -->
  <div class="preview-card" class:preview-expanded={previewExpanded}>
    <button
      class="preview-card-toggle"
      aria-label={previewExpanded ? 'Minimize preview' : 'Expand preview'}
      onclick={() => previewExpanded = !previewExpanded}
    >
      {#if previewExpanded}
        <svg width="12" height="2" viewBox="0 0 12 2" fill="none">
          <path d="M1 1h10" stroke="#666" stroke-width="1.5" stroke-linecap="round"/>
        </svg>
      {:else}
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
          <path d="M6 1v10M1 6h10" stroke="#666" stroke-width="1.5" stroke-linecap="round"/>
        </svg>
      {/if}
    </button>
    <!-- svelte-ignore a11y_no_static_element_interactions -->
    <div
      class="preview-card-inner"
      class:preview-inner-expanded={previewExpanded}
      style="background: {previewBg}; cursor: {previewDragging ? 'grabbing' : 'grab'}"
      onwheel={onPreviewWheel}
      onpointerdown={onPreviewPointerDown}
      onpointermove={onPreviewPointerMove}
      onpointerup={onPreviewPointerUp}
    >
      <div style="transform: translate({previewPanX}px, {previewPanY}px) scale({previewZoom}); pointer-events: none">
        <DesignSvgRenderer filterId="minipreview" />
      </div>
    </div>
  </div>
</div>

<style>
  :global(body) {
    margin: 0;
    background: #F3F3F3;
    font-family: 'SF Pro Text', 'SF Pro Display', -apple-system, BlinkMacSystemFont, system-ui, sans-serif;
  }

  .app {
    position: relative;
    width: 100vw;
    height: 100vh;
    overflow: hidden;
  }

  /* ===== TOOLBOX (overlaid left) ===== */
  .toolbox {
    position: absolute;
    top: 10px;
    left: 9px;
    width: 417px;
    background: #EBEAE7;
    border-radius: 20px;
    padding: 0;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    z-index: 20;
  }

  .toolbox-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 13px 13px 0 11px;
  }

  .tab-bar {
    display: flex;
    gap: 55px;
    align-items: center;
  }

  .tab-btn {
    border: none;
    outline: none;
    cursor: pointer;
    padding: 0;
    background: transparent;
    font-family: 'SF Pro Text', 'SF Pro Display', -apple-system, BlinkMacSystemFont, system-ui, sans-serif;
    font-size: 12px;
    font-weight: 700;
    color: #000;
    letter-spacing: -0.43px;
    line-height: 12px;
    transition: opacity 0.15s ease;
  }

  .tab-btn.active {
    color: #000;
    opacity: 1;
  }

  .tab-btn:not(.active) {
    color: #B0B0B0;
    opacity: 0.5;
  }

  .inner-panel {
    margin: 12px 16px 16px;
    flex: 1;
    background: #F4F4F4;
    border-radius: 30px;
    padding: 22px 18px 26px;
    display: flex;
    flex-direction: column;
    gap: 22px;
    overflow-y: auto;
    min-height: 0;
    scrollbar-width: thin;
    scrollbar-color: #ccc transparent;
  }

  .inner-panel::-webkit-scrollbar {
    width: 4px;
  }

  .inner-panel::-webkit-scrollbar-track {
    background: transparent;
  }

  .inner-panel::-webkit-scrollbar-thumb {
    background: #ccc;
    border-radius: 2px;
  }

  /* ===== CONTROL ROW ===== */
  .control-row {
    display: flex;
    align-items: center;
    width: 100%;
  }

  .label-col {
    width: 118px;
    flex-shrink: 0;
  }

  .label-col-size {
    width: 74px;
    flex-shrink: 0;
  }

  .control-label {
    background: #EDEDEB;
    color: #B0B0B0;
    font-family: 'SF Pro Text', 'SF Pro Display', -apple-system, BlinkMacSystemFont, system-ui, sans-serif;
    font-size: 12px;
    font-weight: 700;
    padding: 0 10px;
    border-radius: 4px;
    white-space: nowrap;
    flex-shrink: 0;
    letter-spacing: -0.43px;
    line-height: 17px;
    height: 17px;
  }

  /* Position 3x3 grid */
  .position-grid {
    display: grid;
    grid-template-columns: repeat(3, auto);
    gap: 12px 24px;
    background: #FDFDFD;
    border-radius: 7px;
    padding: 11px 13px 11px 12px;
    width: 79px;
  }

  .pos-dot {
    width: 2px;
    height: 2px;
    border-radius: 50%;
    background: #B0B0B0;
    border: none;
    cursor: pointer;
    padding: 0;
    transition: all 0.15s;
  }

  .pos-dot.pos-active {
    background: #7DC4F8;
    width: 3px;
    height: 3px;
    margin: -0.5px;
    box-shadow: 0 0 0 1px #7DC4F8;
  }

  .pos-dot:hover:not(.pos-active) {
    background: #666;
  }

  /* Pill group (Size) */
  .pill-group {
    display: flex;
    gap: 3px;
    flex-wrap: wrap;
  }

  .pill-btn {
    padding: 0 5px;
    border-radius: 26px;
    font-family: 'SF Pro Text', 'SF Pro Display', -apple-system, BlinkMacSystemFont, system-ui, sans-serif;
    font-size: 10px;
    font-weight: 590;
    text-transform: uppercase;
    letter-spacing: -0.43px;
    line-height: 18px;
    height: 18px;
    cursor: pointer;
    transition: all 0.15s;
    border: 1px solid #CECDCC;
    background: transparent;
    color: #CECDCC;
    opacity: 0.6;
  }

  .pill-btn.pill-active {
    background: rgba(255,255,255,0.85);
    border-color: transparent;
    color: #B0B0B0;
    opacity: 1;
  }

  .pill-btn:hover:not(.pill-active) {
    opacity: 0.8;
  }

  /* ===== T-SHIRT PREVIEW (centered on full viewport) ===== */
  .shirt-preview-area {
    position: absolute;
    inset: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1;
  }

  .draw-overlay {
    position: absolute;
    inset: 0;
    z-index: 10;
  }

  /* ===== BRANDING (bottom-left) ===== */
  .bottom-bar-left {
    position: absolute;
    left: 24px;
    bottom: 14px;
    z-index: 20;
  }

  .branding {
    font-family: 'SF Pro Text', 'SF Pro Display', -apple-system, BlinkMacSystemFont, system-ui, sans-serif;
    font-size: 12px;
    font-weight: 860;
    color: #000;
    white-space: nowrap;
    letter-spacing: -0.43px;
    line-height: 22px;
  }

  /* ===== CENTER CONTROLS ===== */
  .bar-controls {
    position: absolute;
    bottom: 10px;
    left: 50%;
    transform: translateX(-50%);
    display: flex;
    gap: 8px;
    align-items: center;
    z-index: 20;
    transition: all 0.3s ease;
  }

  .bar-controls.bar-top {
    bottom: auto;
    top: 10px;
  }

  .bar-pill {
    display: flex;
    align-items: center;
    gap: 8px;
    background: #EBEAE7;
    border-radius: 23.5px;
    padding: 6px 14px;
    height: 43px;
  }

  .bar-pill-toggle {
    padding: 4px;
    gap: 0;
  }

  .bar-pill-label {
    font-family: 'SF Pro Text', 'SF Pro Display', -apple-system, BlinkMacSystemFont, system-ui, sans-serif;
    font-size: 12px;
    font-weight: 700;
    color: #000;
    white-space: nowrap;
    letter-spacing: -0.43px;
    line-height: 12px;
  }

  .color-dots {
    display: flex;
    gap: 6px;
    align-items: center;
  }

  .shirt-color-dot {
    width: 22px;
    height: 22px;
    border-radius: 50%;
    border: 2px solid transparent;
    cursor: pointer;
    padding: 0;
    outline: none;
    transition: border-color 0.15s;
  }

  .shirt-color-dot[style*="f0f0f0"],
  .shirt-color-dot[style*="ffffff"] {
    border-color: #ccc;
  }

  .shirt-color-dot.dot-active {
    border-color: #333;
    box-shadow: 0 0 0 2px #3B82F6;
  }

  .side-btn {
    border: none;
    outline: none;
    cursor: pointer;
    padding: 0 14px;
    height: 36px;
    border-radius: 100px;
    font-family: 'SF Pro Text', 'SF Pro Display', -apple-system, BlinkMacSystemFont, system-ui, sans-serif;
    font-size: 12px;
    font-weight: 700;
    background: transparent;
    color: #000;
    opacity: 0.2;
    letter-spacing: -0.43px;
    line-height: 12px;
    transition: all 0.15s;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .side-btn.side-active {
    background: #fff;
    opacity: 1;
    width: 47px;
  }

  /* ===== PREVIEW CARD (bottom-right, expandable) ===== */
  .preview-card {
    position: absolute;
    bottom: 10px;
    right: 10px;
    background: #EBEAE7;
    border-radius: 20px;
    width: 319px;
    height: 207px;
    display: flex;
    flex-direction: column;
    padding: 9px;
    overflow: hidden;
    z-index: 20;
    transition: all 0.3s ease;
  }

  .preview-card.preview-expanded {
    width: 730px;
    height: 428px;
    padding: 9px 13px 13px;
  }

  .preview-card-toggle {
    position: absolute;
    top: 9px;
    right: 10px;
    width: 28px;
    height: 28px;
    border-radius: 50%;
    border: none;
    background: rgba(0,0,0,0.06);
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1;
    transition: background 0.15s;
  }

  .preview-card-toggle:hover {
    background: rgba(0,0,0,0.12);
  }

  .preview-card-inner {
    flex: 1;
    background: #000;
    border-radius: 20px;
    display: flex;
    align-items: center;
    justify-content: center;
    overflow: hidden;
    padding: 16px;
    margin-top: 40px;
    transition: border-radius 0.3s ease;
  }

  .preview-card-inner.preview-inner-expanded {
    border-radius: 62px;
    margin-top: 38px;
  }

  .preview-card-inner :global(.font-svg) {
    width: 100%;
    height: auto;
    max-height: 100%;
  }
</style>

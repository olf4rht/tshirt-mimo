<script lang="ts">
  import { activeTab, designState, shirtSide } from '$lib/stores/designer';
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
    { label: 'XS', scale: 0.5 },
    { label: 'S', scale: 0.75 },
    { label: 'M', scale: 1 },
    { label: 'L', scale: 1.5 },
    { label: 'XL', scale: 2 },
  ];

  let currentSizeLabel = $derived(
    sizeOptions.find(s => s.scale === $designState.designScale)?.label ?? 'M'
  );

  const positionGrid = [
    { x: 25, y: 20 }, { x: 50, y: 20 }, { x: 75, y: 20 },
    { x: 25, y: 45 }, { x: 50, y: 45 }, { x: 75, y: 45 },
    { x: 25, y: 70 }, { x: 50, y: 70 }, { x: 75, y: 70 },
  ];

  let currentPosIndex = $derived(
    positionGrid.findIndex(p => p.x === $designState.designX && p.y === $designState.designY)
  );

  let isWhiteShirt = $derived(
    $designState.shirtColor === '#f0f0f0' || $designState.shirtColor === '#ffffff'
  );

  $effect(() => {
    if (isWhiteShirt) {
      $designState.textColor = '#1a1a1a';
    } else {
      $designState.textColor = '#ffffff';
    }
  });
</script>

<div class="app">
  <!-- LEFT: Toolbox -->
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
          <span class="control-label">Position</span>
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
          <span class="control-label">Size</span>
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

  <!-- MAIN: T-shirt preview area -->
  <div class="main-area">
    <div class="shirt-preview-area">
      {#if $activeTab === 'draw'}
        <div class="draw-overlay">
          <DrawCanvas />
        </div>
      {/if}
      <TshirtPreview />
    </div>

    <!-- Bottom bar -->
    <div class="bottom-bar">
      <div class="bottom-bar-left">
        <span class="branding">balok x cheb mimo</span>
      </div>

      <div class="bottom-bar-center">
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
            onclick={() => $shirtSide = 'front'}
          >Front</button>
          <button
            class="side-btn"
            class:side-active={$shirtSide === 'back'}
            onclick={() => $shirtSide = 'back'}
          >Back</button>
        </div>
      </div>

      <!-- Bottom-right preview card -->
      <div class="preview-card">
        <button class="preview-card-add" aria-label="Add design variant">
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
            <path d="M6 1v10M1 6h10" stroke="#666" stroke-width="1.5" stroke-linecap="round"/>
          </svg>
        </button>
        <div class="preview-card-inner">
          <DesignSvgRenderer filterId="minipreview" />
        </div>
      </div>
    </div>
  </div>
</div>

<style>
  :global(body) {
    margin: 0;
    background: #F3F3F3;
    font-family: 'SF Pro Display', -apple-system, BlinkMacSystemFont, system-ui, sans-serif;
  }

  .app {
    display: grid;
    grid-template-columns: 417px 1fr;
    height: 100vh;
    padding: 10px 0 0 9px;
    box-sizing: border-box;
  }

  /* ===== TOOLBOX (left) ===== */
  .toolbox {
    background: #EBEAE7;
    border-radius: 20px;
    padding: 0;
    display: flex;
    flex-direction: column;
    min-height: 0;
    overflow: hidden;
    position: relative;
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
    font-family: 'SF Pro Display', -apple-system, BlinkMacSystemFont, system-ui, sans-serif;
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
    padding: 22px 18px 18px;
    display: flex;
    flex-direction: column;
    gap: 16px;
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
    gap: 12px;
    width: 100%;
  }

  .control-label {
    background: #EDEDEB;
    color: #B0B0B0;
    font-family: 'SF Pro Display', -apple-system, BlinkMacSystemFont, system-ui, sans-serif;
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
    gap: 14px 26px;
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
    border-radius: 9px;
    font-family: 'SF Pro Display', -apple-system, BlinkMacSystemFont, system-ui, sans-serif;
    font-size: 10px;
    font-weight: 600;
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

  /* ===== MAIN AREA ===== */
  .main-area {
    display: flex;
    flex-direction: column;
    min-height: 0;
    position: relative;
  }

  .shirt-preview-area {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    position: relative;
    min-height: 0;
    overflow: hidden;
  }

  .draw-overlay {
    position: absolute;
    inset: 0;
    z-index: 10;
  }

  /* ===== BOTTOM BAR ===== */
  .bottom-bar {
    display: flex;
    align-items: flex-end;
    justify-content: space-between;
    padding: 0 16px 10px 16px;
    gap: 12px;
    flex-shrink: 0;
  }

  .bottom-bar-left {
    display: flex;
    align-items: flex-end;
    min-width: 120px;
  }

  .branding {
    font-family: 'SF Pro Display', -apple-system, BlinkMacSystemFont, system-ui, sans-serif;
    font-size: 12px;
    font-weight: 860;
    color: #000;
    white-space: nowrap;
    letter-spacing: -0.43px;
    line-height: 22px;
  }

  .bottom-bar-center {
    display: flex;
    gap: 8px;
    align-items: center;
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
    font-family: 'SF Pro Display', -apple-system, BlinkMacSystemFont, system-ui, sans-serif;
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
    padding: 8px 14px;
    border-radius: 100px;
    font-family: 'SF Pro Display', -apple-system, BlinkMacSystemFont, system-ui, sans-serif;
    font-size: 12px;
    font-weight: 700;
    background: transparent;
    color: #000;
    opacity: 0.2;
    letter-spacing: -0.43px;
    line-height: 12px;
    transition: all 0.15s;
  }

  .side-btn.side-active {
    background: #fff;
    opacity: 1;
  }

  /* ===== PREVIEW CARD (bottom-right) ===== */
  .preview-card {
    background: #EBEAE7;
    border-radius: 20px;
    width: 319px;
    height: 207px;
    flex-shrink: 0;
    display: flex;
    flex-direction: column;
    padding: 9px;
    position: relative;
    overflow: hidden;
  }

  .preview-card-add {
    position: absolute;
    top: 11px;
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

  .preview-card-add:hover {
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
  }

  .preview-card-inner :global(.font-svg) {
    width: 100%;
    height: auto;
    max-height: 100%;
  }
</style>

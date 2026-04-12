<script lang="ts">
  import { activeTab, designState } from '$lib/stores/designer';
  import DesignCanvas from '$lib/components/DesignCanvas.svelte';
  import DrawCanvas from '$lib/components/DrawCanvas.svelte';
  import DrawControls from '$lib/components/DrawControls.svelte';
  import FontPicker from '$lib/components/FontPicker.svelte';
  import TransformSliders from '$lib/components/TransformSliders.svelte';
  import StrokeControls from '$lib/components/StrokeControls.svelte';
  import StrokeEffects from '$lib/components/StrokeEffects.svelte';
  import ColorControls from '$lib/components/ColorControls.svelte';
  import StampManager from '$lib/components/StampManager.svelte';
  import TshirtPreview from '$lib/components/TshirtPreview.svelte';
  import ExportButton from '$lib/components/ExportButton.svelte';

  const shirtPresets = [
    { label: 'Black', value: '#1a1a1a' },
    { label: 'White', value: '#f0f0f0' },
  ];

  let isWhiteShirt = $derived(
    $designState.shirtColor === '#f0f0f0' || $designState.shirtColor === '#ffffff'
  );

  // Auto-swap text color when shirt color changes
  $effect(() => {
    if (isWhiteShirt) {
      $designState.textColor = '#1a1a1a';
    } else {
      $designState.textColor = '#ffffff';
    }
  });
</script>

<div class="app">
  <div class="panel-left" style="background: {isWhiteShirt ? '#f0f0f0' : '#1a1a1a'}">
    <div class="tab-toggle" style="background: {isWhiteShirt ? '#ddd' : '#111'}">
      <button
        class:active={$activeTab === 'draw'}
        onclick={() => $activeTab = 'draw'}
        style={$activeTab === 'draw'
          ? `background: ${isWhiteShirt ? '#1a1a1a' : '#fff'}; color: ${isWhiteShirt ? '#fff' : '#000'}`
          : `color: ${isWhiteShirt ? '#888' : '#666'}`}
      >Draw</button>
      <button
        class:active={$activeTab === 'design'}
        onclick={() => $activeTab = 'design'}
        style={$activeTab === 'design'
          ? `background: ${isWhiteShirt ? '#1a1a1a' : '#fff'}; color: ${isWhiteShirt ? '#fff' : '#000'}`
          : `color: ${isWhiteShirt ? '#888' : '#666'}`}
      >Design</button>
    </div>
    <div class="canvas-area">
      {#if $activeTab === 'design'}
        <DesignCanvas />
      {:else}
        <DrawCanvas />
      {/if}
    </div>
  </div>

  <div class="panel-right">
    <div class="preview-area">
      <div class="shirt-color-dots">
        {#each shirtPresets as preset}
          <button
            class="color-dot"
            class:active={$designState.shirtColor === preset.value}
            style="background-color: {preset.value};"
            title={preset.label}
            onclick={() => { $designState.shirtColor = preset.value; }}
          ></button>
        {/each}
      </div>
      <div class="preview-content">
        <TshirtPreview />
      </div>
      <button class="like-btn" title="Like this design">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3" />
        </svg>
      </button>
    </div>
    <div class="toolbar-area">
      {#if $activeTab === 'design'}
        <FontPicker />
        <TransformSliders />
        <StrokeControls />
        <StrokeEffects />
        <ColorControls />
      {:else}
        <DrawControls />
      {/if}
      <StampManager />
      <ExportButton />
    </div>
  </div>
</div>

<style>
  :global(body) {
    margin: 0;
    background: #f5f5f5;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  }

  .app {
    display: grid;
    grid-template-columns: 3fr 2fr;
    height: 100vh;
    padding: 16px;
    gap: 16px;
    box-sizing: border-box;
  }

  .panel-left {
    display: flex;
    flex-direction: column;
    background: #1a1a1a;
    border-radius: 20px;
    padding: 16px;
    gap: 12px;
    min-height: 0;
  }

  .tab-toggle {
    display: flex;
    align-self: center;
    background: #111;
    border-radius: 999px;
    padding: 4px;
    gap: 4px;
  }

  .tab-toggle button {
    border: none;
    outline: none;
    cursor: pointer;
    padding: 8px 24px;
    border-radius: 999px;
    font-size: 13px;
    font-weight: 600;
    background: transparent;
    color: #666;
    transition: all 0.2s ease;
  }

  .tab-toggle button.active {
    background: #ffffff;
    color: #000000;
  }

  .canvas-area {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 12px;
    min-height: 0;
  }

  .panel-right {
    display: flex;
    flex-direction: column;
    gap: 16px;
    min-height: 0;
  }

  .preview-area {
    flex: 1;
    background: #F6F4F5;
    border-radius: 20px;
    display: flex;
    align-items: center;
    justify-content: center;
    position: relative;
    padding: 4px;
    min-height: 0;
    overflow: hidden;
  }

  .preview-content {
    flex: 1;
    height: 100%;
    min-height: 0;
    padding: 0;
  }

  .shirt-color-dots {
    display: flex;
    flex-direction: column;
    gap: 10px;
    padding: 4px;
    z-index: 2;
    flex-shrink: 0;
  }

  .color-dot {
    width: 32px;
    height: 32px;
    border-radius: 50%;
    border: 2.5px solid transparent;
    cursor: pointer;
    padding: 0;
    outline: none;
    transition: border-color 0.15s ease, box-shadow 0.15s ease;
    flex-shrink: 0;
  }

  .color-dot:hover {
    border-color: #aaa;
  }

  .color-dot.active {
    border-color: #333;
    box-shadow: 0 0 0 2.5px #4a9eff;
  }

  .like-btn {
    position: absolute;
    bottom: 12px;
    right: 12px;
    width: 36px;
    height: 36px;
    border-radius: 50%;
    border: none;
    background: #fff;
    color: #888;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 1px 4px rgba(0,0,0,0.1);
    transition: all 0.15s ease;
    z-index: 2;
  }

  .like-btn:hover {
    color: #333;
    box-shadow: 0 2px 8px rgba(0,0,0,0.15);
  }

  .toolbar-area {
    flex: 1;
    background: #222;
    border-radius: 20px;
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    justify-content: flex-start;
    padding: 20px;
    gap: 16px;
    overflow-y: auto;
    min-height: 0;
    scrollbar-width: thin;
    scrollbar-color: #444 transparent;
  }

  .toolbar-area::-webkit-scrollbar {
    width: 6px;
  }

  .toolbar-area::-webkit-scrollbar-track {
    background: transparent;
  }

  .toolbar-area::-webkit-scrollbar-thumb {
    background: #444;
    border-radius: 3px;
  }
</style>

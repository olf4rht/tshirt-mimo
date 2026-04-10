<script lang="ts">
  import { activeTab } from '$lib/stores/designer';
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
</script>

<div class="app">
  <div class="panel-left">
    <div class="tab-toggle">
      <button
        class:active={$activeTab === 'draw'}
        onclick={() => $activeTab = 'draw'}
      >Draw</button>
      <button
        class:active={$activeTab === 'design'}
        onclick={() => $activeTab = 'design'}
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
      <TshirtPreview />
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
    background: #111;
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
    padding: 8px 20px;
    border-radius: 999px;
    font-size: 14px;
    font-weight: 500;
    background: transparent;
    color: #888;
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
  }

  .panel-right {
    display: flex;
    flex-direction: column;
    gap: 16px;
  }

  .preview-area {
    flex: 1;
    background: #e8e8e8;
    border-radius: 20px;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .toolbar-area {
    flex: 1;
    background: #2a2a2a;
    border-radius: 20px;
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    justify-content: flex-start;
    padding: 16px;
    overflow-y: auto;
  }
</style>

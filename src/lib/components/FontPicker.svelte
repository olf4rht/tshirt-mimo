<script lang="ts">
  import { FONTS } from '$lib/data/fonts';
  import { designState } from '$lib/stores/designer';
</script>

<div class="font-picker">
  <div class="font-header">
    <span class="control-label">Font</span>
    <input
      type="color"
      class="text-color-dot"
      value={$designState.textColor}
      oninput={(e: Event) => {
        $designState.textColor = (e.target as HTMLInputElement).value;
      }}
    />
  </div>
  <div class="thumbnails">
    {#each FONTS as font, i}
      <button
        class="thumb"
        class:active={$designState.fontIndex === i}
        onclick={() => $designState.fontIndex = i}
        title={font.label}
      >
        <img src={font.src} alt={font.label} />
      </button>
    {/each}
  </div>
</div>

<style>
  .font-picker {
    display: flex;
    flex-direction: column;
    gap: 8px;
    width: 100%;
  }

  .font-header {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .control-label {
    background: #EDEDEB;
    color: #B0B0B0;
    font-size: 12px;
    font-weight: 700;
    padding: 4px 8px;
    border-radius: 4px;
  }

  .text-color-dot {
    -webkit-appearance: none;
    appearance: none;
    width: 20px;
    height: 20px;
    border: none;
    border-radius: 50%;
    background: none;
    cursor: pointer;
    padding: 0;
  }

  .text-color-dot::-webkit-color-swatch-wrapper {
    padding: 0;
  }

  .text-color-dot::-webkit-color-swatch {
    border: none;
    border-radius: 50%;
  }

  .thumbnails {
    display: flex;
    flex-direction: row;
    gap: 6px;
    overflow-x: auto;
    scrollbar-width: none;
    -ms-overflow-style: none;
  }

  .thumbnails::-webkit-scrollbar {
    display: none;
  }

  .thumb {
    flex-shrink: 0;
    width: 56px;
    height: 38px;
    background: #fff;
    border-radius: 8px;
    padding: 4px;
    cursor: pointer;
    border: 2px solid transparent;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: border-color 0.15s ease;
  }

  .thumb:hover {
    border-color: #CECDCC;
  }

  .thumb.active {
    border-color: #333;
  }

  .thumb img {
    width: 100%;
    height: 100%;
    object-fit: contain;
  }
</style>

<script lang="ts">
  import { FONTS } from '$lib/data/fonts';
  import { designState } from '$lib/stores/designer';
</script>

<div class="font-picker">
  <span class="label">Font</span>
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

  .label {
    color: #999;
    font-size: 12px;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }

  .thumbnails {
    display: flex;
    flex-direction: row;
    gap: 8px;
    overflow-x: auto;
    scrollbar-width: none;
    -ms-overflow-style: none;
  }

  .thumbnails::-webkit-scrollbar {
    display: none;
  }

  .thumb {
    flex-shrink: 0;
    width: 60px;
    height: 40px;
    background: #1a1a1a;
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
    border-color: #555;
  }

  .thumb.active {
    border-color: #fff;
  }

  .thumb img {
    width: 100%;
    height: 100%;
    object-fit: contain;
    filter: brightness(1);
  }
</style>

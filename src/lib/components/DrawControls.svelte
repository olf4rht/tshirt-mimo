<script lang="ts">
  import { drawState } from '$lib/stores/designer';

  function handleSizeChange(e: Event) {
    const val = parseInt((e.target as HTMLInputElement).value);
    $drawState.brushSize = val;
  }

  function handleColorChange(e: Event) {
    $drawState.brushColor = (e.target as HTMLInputElement).value;
  }

  function clearCanvas() {
    $drawState.clearTrigger += 1;
  }
</script>

<div class="draw-controls">
  <div class="slider-row">
    <span class="control-label">Brush Size</span>
    <input
      type="range"
      min="1"
      max="50"
      value={$drawState.brushSize}
      oninput={handleSizeChange}
    />
  </div>

  <div class="color-row">
    <span class="control-label">Brush Color</span>
    <input
      type="color"
      class="color-dot-input"
      value={$drawState.brushColor}
      oninput={handleColorChange}
    />
  </div>

  <button class="clear-btn" onclick={clearCanvas}>
    Clear Canvas
  </button>
</div>

<style>
  .draw-controls {
    width: 100%;
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .slider-row {
    display: flex;
    align-items: center;
    gap: 12px;
  }

  .control-label {
    background: #EDEDEB;
    color: #B0B0B0;
    font-size: 12px;
    font-weight: 700;
    padding: 4px 8px;
    border-radius: 4px;
    white-space: nowrap;
    flex-shrink: 0;
    min-width: 80px;
  }

  .color-row {
    display: flex;
    align-items: center;
    gap: 12px;
  }

  .color-dot-input {
    -webkit-appearance: none;
    appearance: none;
    width: 22px;
    height: 22px;
    border: none;
    border-radius: 50%;
    background: none;
    cursor: pointer;
    padding: 0;
  }

  .color-dot-input::-webkit-color-swatch-wrapper {
    padding: 0;
  }

  .color-dot-input::-webkit-color-swatch {
    border: none;
    border-radius: 50%;
  }

  input[type='range'] {
    -webkit-appearance: none;
    appearance: none;
    flex: 1;
    height: 2px;
    background: #D4D4D4;
    border-radius: 1px;
    outline: none;
    cursor: pointer;
  }

  input[type='range']::-webkit-slider-thumb {
    -webkit-appearance: none;
    appearance: none;
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: #666;
    cursor: pointer;
  }

  input[type='range']::-moz-range-thumb {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: #666;
    border: none;
    cursor: pointer;
  }

  .clear-btn {
    padding: 8px 16px;
    border: 1px solid #CECDCC;
    border-radius: 26px;
    background: transparent;
    color: #B0B0B0;
    font-size: 12px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s ease;
    align-self: flex-start;
  }

  .clear-btn:hover {
    background: rgba(255,255,255,0.85);
    color: #666;
  }
</style>

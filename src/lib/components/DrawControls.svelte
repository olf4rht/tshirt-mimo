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
    <label>
      <span class="label-text">Brush Size</span>
      <span class="label-value">{$drawState.brushSize}px</span>
    </label>
    <input
      type="range"
      min="1"
      max="50"
      value={$drawState.brushSize}
      oninput={handleSizeChange}
    />
  </div>

  <div class="color-row">
    <span class="label-text">Brush Color</span>
    <input
      type="color"
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
    flex-direction: column;
    gap: 4px;
  }

  label {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .label-text {
    color: #ccc;
    font-size: 13px;
    font-weight: 500;
  }

  .label-value {
    color: #888;
    font-size: 12px;
    font-variant-numeric: tabular-nums;
  }

  .color-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  input[type='range'] {
    -webkit-appearance: none;
    appearance: none;
    width: 100%;
    height: 4px;
    background: #444;
    border-radius: 2px;
    outline: none;
    cursor: pointer;
  }

  input[type='range']::-webkit-slider-thumb {
    -webkit-appearance: none;
    appearance: none;
    width: 14px;
    height: 14px;
    border-radius: 50%;
    background: #fff;
    cursor: pointer;
  }

  input[type='range']::-moz-range-thumb {
    width: 14px;
    height: 14px;
    border-radius: 50%;
    background: #fff;
    border: none;
    cursor: pointer;
  }

  input[type='color'] {
    -webkit-appearance: none;
    appearance: none;
    width: 28px;
    height: 28px;
    border: 2px solid #555;
    border-radius: 50%;
    background: none;
    cursor: pointer;
    padding: 0;
  }

  input[type='color']::-webkit-color-swatch-wrapper {
    padding: 2px;
  }

  input[type='color']::-webkit-color-swatch {
    border: none;
    border-radius: 50%;
  }

  .clear-btn {
    margin-top: 4px;
    padding: 8px 16px;
    border: 1px solid #555;
    border-radius: 8px;
    background: transparent;
    color: #ccc;
    font-size: 13px;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .clear-btn:hover {
    background: #333;
    border-color: #888;
    color: #fff;
  }
</style>

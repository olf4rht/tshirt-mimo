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
    <div class="slider-track-wrapper">
      <input
        type="range"
        min="1"
        max="50"
        value={$drawState.brushSize}
        oninput={handleSizeChange}
      />
    </div>
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

  .slider-track-wrapper {
    flex: 1;
    max-width: 190px;
  }

  .color-row {
    display: flex;
    align-items: center;
    gap: 12px;
  }

  .color-dot-input {
    -webkit-appearance: none;
    appearance: none;
    width: 16px;
    height: 16px;
    border: 1px solid #CECDCC;
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
    width: 100%;
    height: 11px;
    background: #fff;
    border-radius: 5.5px;
    outline: none;
    cursor: pointer;
  }

  input[type='range']::-webkit-slider-thumb {
    -webkit-appearance: none;
    appearance: none;
    width: 11px;
    height: 11px;
    border-radius: 50%;
    background: #B0B0B0;
    cursor: pointer;
  }

  input[type='range']::-moz-range-thumb {
    width: 11px;
    height: 11px;
    border-radius: 50%;
    background: #B0B0B0;
    border: none;
    cursor: pointer;
  }

  input[type='range']::-moz-range-track {
    height: 11px;
    background: #fff;
    border-radius: 5.5px;
  }

  .clear-btn {
    padding: 0 10px;
    height: 18px;
    border: 1px solid #CECDCC;
    border-radius: 26px;
    background: transparent;
    color: #CECDCC;
    font-family: 'SF Pro Text', 'SF Pro Display', -apple-system, BlinkMacSystemFont, system-ui, sans-serif;
    font-size: 10px;
    font-weight: 590;
    letter-spacing: -0.43px;
    text-transform: uppercase;
    cursor: pointer;
    transition: all 0.15s;
    align-self: flex-start;
    opacity: 0.6;
  }

  .clear-btn:hover {
    background: rgba(255,255,255,0.85);
    color: #B0B0B0;
    opacity: 1;
  }
</style>

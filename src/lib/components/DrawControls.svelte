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
  <label class="control-row">
    <span class="label">Brush Size</span>
    <input
      type="range"
      min="1"
      max="50"
      value={$drawState.brushSize}
      oninput={handleSizeChange}
    />
    <span class="value">{$drawState.brushSize}px</span>
  </label>

  <label class="control-row">
    <span class="label">Brush Color</span>
    <input
      type="color"
      value={$drawState.brushColor}
      oninput={handleColorChange}
    />
  </label>

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

  .control-row {
    display: flex;
    align-items: center;
    gap: 10px;
    color: #ccc;
    font-size: 13px;
  }

  .label {
    min-width: 80px;
    color: #999;
  }

  .value {
    min-width: 40px;
    text-align: right;
    color: #ccc;
    font-size: 12px;
  }

  input[type='range'] {
    flex: 1;
    accent-color: #fff;
  }

  input[type='color'] {
    border: none;
    background: none;
    width: 32px;
    height: 32px;
    padding: 0;
    cursor: pointer;
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

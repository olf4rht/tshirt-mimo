<script lang="ts">
  import { designState } from '$lib/stores/designer';
</script>

<div class="stroke-controls">
  <div class="toggle-row">
    <span class="label-text">Stroke</span>
    <label class="toggle">
      <input
        type="checkbox"
        checked={$designState.strokeEnabled}
        onchange={(e: Event) => {
          $designState.strokeEnabled = (e.target as HTMLInputElement).checked;
        }}
      />
      <span class="toggle-slider"></span>
    </label>
  </div>

  {#if $designState.strokeEnabled}
    <div class="slider-row">
      <label>
        <span class="label-text">Weight</span>
        <span class="label-value">{$designState.strokeWeight}</span>
      </label>
      <input
        type="range"
        min="0"
        max="20"
        step="0.5"
        value={$designState.strokeWeight}
        oninput={(e: Event) => {
          $designState.strokeWeight = Number((e.target as HTMLInputElement).value);
        }}
      />
    </div>

    <div class="color-row">
      <span class="label-text">Stroke Color</span>
      <input
        type="color"
        value={$designState.strokeColor}
        oninput={(e: Event) => {
          $designState.strokeColor = (e.target as HTMLInputElement).value;
        }}
      />
    </div>
  {/if}
</div>

<style>
  .stroke-controls {
    width: 100%;
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .toggle-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .slider-row {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  .color-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
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
    width: 32px;
    height: 24px;
    border: 1px solid #555;
    border-radius: 4px;
    background: none;
    cursor: pointer;
    padding: 0;
  }

  input[type='color']::-webkit-color-swatch-wrapper {
    padding: 2px;
  }

  input[type='color']::-webkit-color-swatch {
    border: none;
    border-radius: 2px;
  }

  .toggle {
    position: relative;
    display: inline-block;
    width: 40px;
    height: 22px;
  }

  .toggle input {
    opacity: 0;
    width: 0;
    height: 0;
  }

  .toggle-slider {
    position: absolute;
    cursor: pointer;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: #444;
    border-radius: 22px;
    transition: 0.2s;
  }

  .toggle-slider::before {
    content: '';
    position: absolute;
    height: 16px;
    width: 16px;
    left: 3px;
    bottom: 3px;
    background-color: #fff;
    border-radius: 50%;
    transition: 0.2s;
  }

  .toggle input:checked + .toggle-slider {
    background-color: #4a9eff;
  }

  .toggle input:checked + .toggle-slider::before {
    transform: translateX(18px);
  }
</style>

<script lang="ts">
  import { designState } from '$lib/stores/designer';

  type StrokeTab = 'weight' | 'pixelized' | 'blur' | 'opacity';
  let strokeTab: StrokeTab = $state('weight');
</script>

<div class="stroke-controls">
  <div class="stroke-header">
    <span class="control-label">Stroke</span>
    <div class="stroke-tabs">
      <button
        class="pill-btn"
        class:pill-active={strokeTab === 'weight'}
        onclick={() => strokeTab = 'weight'}
      >WEIGHT</button>
      <button
        class="pill-btn"
        class:pill-active={strokeTab === 'pixelized'}
        onclick={() => strokeTab = 'pixelized'}
      >PIXELIZED</button>
      <button
        class="pill-btn"
        class:pill-active={strokeTab === 'blur'}
        onclick={() => strokeTab = 'blur'}
      >BLUR</button>
      <button
        class="pill-btn"
        class:pill-active={strokeTab === 'opacity'}
        onclick={() => strokeTab = 'opacity'}
      >OPACITY</button>
    </div>
  </div>

  <div class="stroke-content">
    <div class="slider-row">
      <input
        type="color"
        class="color-dot-input"
        value={$designState.strokeColor}
        oninput={(e: Event) => {
          $designState.strokeColor = (e.target as HTMLInputElement).value;
        }}
      />
      {#if strokeTab === 'weight'}
        <div class="stroke-slider-wrapper">
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
      {:else if strokeTab === 'pixelized'}
        <label class="toggle toggle-small">
          <input
            type="checkbox"
            checked={$designState.strokePixelized > 0}
            onchange={(e: Event) => {
              $designState.strokePixelized = (e.target as HTMLInputElement).checked ? 1 : 0;
            }}
          />
          <span class="toggle-slider"></span>
        </label>
      {:else if strokeTab === 'blur'}
        <div class="stroke-slider-wrapper">
          <input
            type="range"
            min="0"
            max="20"
            step="0.5"
            value={$designState.strokeBlur}
            oninput={(e: Event) => {
              $designState.strokeBlur = Number((e.target as HTMLInputElement).value);
            }}
          />
        </div>
      {:else if strokeTab === 'opacity'}
        <div class="stroke-slider-wrapper">
          <input
            type="range"
            min="0"
            max="100"
            step="1"
            value={$designState.strokeOpacity}
            oninput={(e: Event) => {
              $designState.strokeOpacity = Number((e.target as HTMLInputElement).value);
            }}
          />
        </div>
      {/if}
    </div>
  </div>
</div>

<style>
  .stroke-controls {
    width: 100%;
    display: flex;
    flex-direction: column;
    gap: 10px;
  }

  .stroke-header {
    display: flex;
    align-items: center;
    gap: 28px;
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

  .stroke-tabs {
    display: flex;
    gap: 3px;
    flex-wrap: wrap;
  }

  .pill-btn {
    padding: 0 5px;
    border-radius: 26px;
    font-family: 'SF Pro Text', 'SF Pro Display', -apple-system, BlinkMacSystemFont, system-ui, sans-serif;
    font-size: 10px;
    font-weight: 590;
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

  .stroke-content {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .slider-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 10px;
    width: 100%;
  }

  .stroke-slider-wrapper {
    max-width: 190px;
    flex: 1;
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
    flex-shrink: 0;
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
    height: 13px;
    background: rgba(255,255,255,0.1);
    border: 1px solid #CECDCC;
    border-radius: 6.5px;
    outline: none;
    cursor: pointer;
  }

  input[type='range']::-webkit-slider-thumb {
    -webkit-appearance: none;
    appearance: none;
    width: 10px;
    height: 10px;
    border-radius: 50%;
    background: #fff;
    border: 1px solid #CECDCC;
    cursor: pointer;
  }

  input[type='range']::-moz-range-thumb {
    width: 10px;
    height: 10px;
    border-radius: 50%;
    background: #fff;
    border: 1px solid #CECDCC;
    cursor: pointer;
  }

  input[type='range']::-moz-range-track {
    height: 13px;
    background: rgba(255,255,255,0.1);
    border: 1px solid #CECDCC;
    border-radius: 6.5px;
  }

  .toggle {
    position: relative;
    display: inline-block;
    width: 30px;
    height: 16px;
  }

  .toggle-small {
    width: 30px;
    height: 16px;
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
    background-color: #D4D4D4;
    border-radius: 20px;
    transition: 0.2s;
  }

  .toggle-slider::before {
    content: '';
    position: absolute;
    height: 12px;
    width: 12px;
    left: 2px;
    bottom: 2px;
    background-color: #fff;
    border-radius: 50%;
    transition: 0.2s;
  }

  .toggle input:checked + .toggle-slider {
    background-color: #4a9eff;
  }

  .toggle input:checked + .toggle-slider::before {
    transform: translateX(14px);
  }
</style>

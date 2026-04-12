<script lang="ts">
  import { designState } from '$lib/stores/designer';

  type StrokeTab = 'weight' | 'pixelized' | 'blur' | 'gradient';
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
        class:pill-active={strokeTab === 'gradient'}
        onclick={() => strokeTab = 'gradient'}
      >GRADIENT</button>
    </div>
  </div>

  <div class="stroke-content">
    {#if strokeTab === 'weight'}
      <div class="slider-row">
        <input
          type="color"
          class="color-dot-input"
          value={$designState.strokeColor}
          oninput={(e: Event) => {
            $designState.strokeColor = (e.target as HTMLInputElement).value;
          }}
        />
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
      <div class="slider-row">
        <input
          type="range"
          min="0"
          max="100"
          value={$designState.strokePixelized}
          oninput={(e: Event) => {
            $designState.strokePixelized = Number((e.target as HTMLInputElement).value);
          }}
        />
      </div>
    {:else if strokeTab === 'blur'}
      <div class="slider-row">
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
    {:else if strokeTab === 'gradient'}
      <div class="gradient-row">
        <input
          type="color"
          class="color-dot-input"
          value={$designState.strokeGradientStart}
          oninput={(e: Event) => {
            $designState.strokeGradientStart = (e.target as HTMLInputElement).value;
          }}
        />
        <input
          type="color"
          class="color-dot-input"
          value={$designState.strokeGradientEnd}
          oninput={(e: Event) => {
            $designState.strokeGradientEnd = (e.target as HTMLInputElement).value;
          }}
        />
        <label class="toggle toggle-small">
          <input
            type="checkbox"
            checked={$designState.strokeGradientEnabled}
            onchange={(e: Event) => {
              $designState.strokeGradientEnabled = (e.target as HTMLInputElement).checked;
            }}
          />
          <span class="toggle-slider"></span>
        </label>
      </div>
    {/if}
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
    gap: 8px;
  }

  .control-label {
    background: #EDEDEB;
    color: #B0B0B0;
    font-size: 12px;
    font-weight: 700;
    padding: 4px 10px;
    border-radius: 4px;
    white-space: nowrap;
    flex-shrink: 0;
    letter-spacing: -0.43px;
  }

  .stroke-tabs {
    display: flex;
    gap: 3px;
    flex-wrap: wrap;
  }

  .pill-btn {
    padding: 4px 10px;
    border-radius: 26px;
    font-size: 10px;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: -0.43px;
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
    gap: 10px;
  }

  .gradient-row {
    display: flex;
    align-items: center;
    gap: 10px;
  }

  .color-dot-input {
    -webkit-appearance: none;
    appearance: none;
    width: 16px;
    height: 16px;
    border: none;
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

  .toggle {
    position: relative;
    display: inline-block;
    width: 36px;
    height: 20px;
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

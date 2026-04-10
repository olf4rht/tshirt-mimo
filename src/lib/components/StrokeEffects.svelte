<script lang="ts">
  import { designState } from '$lib/stores/designer';
</script>

{#if $designState.strokeEnabled}
  <div class="stroke-effects">
    <div class="section-title">Stroke Effects</div>

    <div class="slider-row">
      <label>
        <span class="label-text">Blur</span>
        <span class="label-value">{$designState.strokeBlur}</span>
      </label>
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

    <div class="toggle-row">
      <span class="label-text">Gradient</span>
      <label class="toggle">
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

    {#if $designState.strokeGradientEnabled}
      <div class="color-row">
        <span class="label-text">Start</span>
        <input
          type="color"
          value={$designState.strokeGradientStart}
          oninput={(e: Event) => {
            $designState.strokeGradientStart = (e.target as HTMLInputElement).value;
          }}
        />
      </div>
      <div class="color-row">
        <span class="label-text">End</span>
        <input
          type="color"
          value={$designState.strokeGradientEnd}
          oninput={(e: Event) => {
            $designState.strokeGradientEnd = (e.target as HTMLInputElement).value;
          }}
        />
      </div>
    {/if}

    <div class="slider-row">
      <label>
        <span class="label-text">Rough Edges</span>
        <span class="label-value">{$designState.strokeRoughEdges}</span>
      </label>
      <input
        type="range"
        min="0"
        max="100"
        value={$designState.strokeRoughEdges}
        oninput={(e: Event) => {
          $designState.strokeRoughEdges = Number((e.target as HTMLInputElement).value);
        }}
      />
    </div>

    <div class="slider-row">
      <label>
        <span class="label-text">Pixelized</span>
        <span class="label-value">{$designState.strokePixelized}</span>
      </label>
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
  </div>
{/if}

<style>
  .stroke-effects {
    width: 100%;
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .section-title {
    color: #999;
    font-size: 11px;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.5px;
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

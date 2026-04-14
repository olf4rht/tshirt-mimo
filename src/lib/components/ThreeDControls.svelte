<script lang="ts">
  import { designState } from '$lib/stores/designer';

  type ThreeDTab = 'extrude' | 'inflate' | 'x' | 'y' | 'z';
  let tab: ThreeDTab = $state('extrude');

  // Default extrude color: darker shade of text color
  let effectiveExtrudeColor = $derived(
    $designState.extrudeColor || darken($designState.textColor, 0.4)
  );

  function darken(hex: string, amount: number): string {
    const h = hex.replace('#', '');
    const r = Math.max(0, Math.round(parseInt(h.substring(0, 2), 16) * (1 - amount)));
    const g = Math.max(0, Math.round(parseInt(h.substring(2, 4), 16) * (1 - amount)));
    const b = Math.max(0, Math.round(parseInt(h.substring(4, 6), 16) * (1 - amount)));
    return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
  }
</script>

<div class="three-d-controls">
  <div class="three-d-header">
    <span class="control-label">3D</span>
    <div class="three-d-tabs">
      <button
        class="pill-btn"
        class:pill-active={tab === 'extrude'}
        onclick={() => tab = 'extrude'}
      >EXTRUDE</button>
      <button
        class="pill-btn"
        class:pill-active={tab === 'inflate'}
        onclick={() => tab = 'inflate'}
      >INFLATE</button>
      <button
        class="pill-btn"
        class:pill-active={tab === 'x'}
        onclick={() => tab = 'x'}
      >X</button>
      <button
        class="pill-btn"
        class:pill-active={tab === 'y'}
        onclick={() => tab = 'y'}
      >Y</button>
      <button
        class="pill-btn"
        class:pill-active={tab === 'z'}
        onclick={() => tab = 'z'}
      >Z</button>
    </div>
  </div>

  <div class="three-d-content">
    <div class="slider-row">
      <input
        type="color"
        class="color-dot-input"
        value={effectiveExtrudeColor}
        oninput={(e: Event) => {
          $designState.extrudeColor = (e.target as HTMLInputElement).value;
        }}
      />

      {#if tab === 'extrude'}
        <div class="slider-wrapper">
          <input
            type="range"
            min="0"
            max="100"
            step="1"
            value={$designState.extrudeDepth}
            oninput={(e: Event) => {
              $designState.extrudeDepth = Number((e.target as HTMLInputElement).value);
            }}
          />
        </div>
      {:else if tab === 'inflate'}
        <div class="slider-wrapper">
          <input
            type="range"
            min="0"
            max="100"
            step="1"
            value={$designState.inflateDepth}
            oninput={(e: Event) => {
              $designState.inflateDepth = Number((e.target as HTMLInputElement).value);
            }}
          />
        </div>
      {:else if tab === 'x'}
        <div class="slider-wrapper">
          <input
            type="range"
            min="-180"
            max="180"
            step="1"
            value={$designState.rotateX}
            oninput={(e: Event) => {
              $designState.rotateX = Number((e.target as HTMLInputElement).value);
            }}
          />
        </div>
      {:else if tab === 'y'}
        <div class="slider-wrapper">
          <input
            type="range"
            min="-180"
            max="180"
            step="1"
            value={$designState.rotateY}
            oninput={(e: Event) => {
              $designState.rotateY = Number((e.target as HTMLInputElement).value);
            }}
          />
        </div>
      {:else if tab === 'z'}
        <div class="slider-wrapper">
          <input
            type="range"
            min="-180"
            max="180"
            step="1"
            value={$designState.rotateZ}
            oninput={(e: Event) => {
              $designState.rotateZ = Number((e.target as HTMLInputElement).value);
            }}
          />
        </div>
      {/if}

      <label class="toggle">
        <input
          type="checkbox"
          checked={$designState.threeDEnabled}
          onchange={(e: Event) => {
            $designState.threeDEnabled = (e.target as HTMLInputElement).checked;
          }}
        />
        <span class="toggle-slider"></span>
      </label>
    </div>
  </div>
</div>

<style>
  .three-d-controls {
    width: 100%;
    display: flex;
    flex-direction: column;
    gap: 10px;
  }

  .three-d-header {
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

  .three-d-tabs {
    display: flex;
    gap: 4px;
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

  .three-d-content {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .slider-row {
    display: flex;
    align-items: center;
    gap: 10px;
    width: 100%;
  }

  .slider-wrapper {
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
    width: 32px;
    height: 16px;
    flex-shrink: 0;
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
    background-color: #B0B0B0;
    border-radius: 20px;
    transition: 0.2s;
  }

  .toggle-slider::before {
    content: '';
    position: absolute;
    height: 14px;
    width: 14px;
    left: 1px;
    bottom: 1px;
    background-color: #fff;
    border-radius: 50%;
    transition: 0.2s;
  }

  .toggle input:checked + .toggle-slider {
    background-color: #4a9eff;
  }

  .toggle input:checked + .toggle-slider::before {
    transform: translateX(16px);
  }
</style>

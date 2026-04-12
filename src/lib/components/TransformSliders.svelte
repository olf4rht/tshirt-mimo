<script lang="ts">
  import { designState } from '$lib/stores/designer';
</script>

<div class="transform-sliders">
  <div class="slider-row">
    <span class="control-label">Bend</span>
    <div class="slider-track-wrapper">
      <input
        type="range"
        min="-100"
        max="100"
        value={$designState.bend}
        oninput={(e: Event) => {
          $designState.bend = Number((e.target as HTMLInputElement).value);
        }}
      />
    </div>
  </div>

  <div class="slider-row">
    <span class="control-label">Inflate</span>
    <div class="slider-track-wrapper">
      <input
        type="range"
        min="0"
        max="100"
        value={$designState.inflate}
        oninput={(e: Event) => {
          $designState.inflate = Number((e.target as HTMLInputElement).value);
        }}
      />
    </div>
  </div>

  <div class="slider-row">
    <span class="control-label">Rough Edges</span>
    <div class="slider-track-wrapper">
      <input
        type="range"
        min="0"
        max="100"
        value={$designState.roughEdges}
        oninput={(e: Event) => {
          $designState.roughEdges = Number((e.target as HTMLInputElement).value);
        }}
      />
    </div>
  </div>

  <div class="slider-row">
    <span class="control-label">Stretch</span>
    <div class="slider-track-wrapper">
      <input
        type="range"
        min="0"
        max="100"
        value={$designState.stretch}
        oninput={(e: Event) => {
          $designState.stretch = Number((e.target as HTMLInputElement).value);
        }}
      />
    </div>
  </div>
</div>

<style>
  .transform-sliders {
    width: 100%;
    display: flex;
    flex-direction: column;
    gap: 16px;
  }

  .slider-row {
    display: flex;
    align-items: center;
    gap: 12px;
  }

  .control-label {
    background: #EDEDEB;
    color: #B0B0B0;
    font-family: 'SF Pro Display', -apple-system, BlinkMacSystemFont, system-ui, sans-serif;
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
    display: flex;
    align-items: center;
    max-width: 190px;
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
</style>

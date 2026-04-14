<script lang="ts">
  import { designState } from '$lib/stores/designer';
</script>

<div class="transform-sliders">
  <div class="slider-row">
    <div class="label-col">
      <span class="control-label">Weight</span>
    </div>
    <div class="slider-col">
      <input
        type="range"
        min="0"
        max="20"
        step="0.5"
        value={$designState.fillWeight}
        oninput={(e: Event) => {
          $designState.fillWeight = Number((e.target as HTMLInputElement).value);
        }}
      />
    </div>
  </div>

  <div class="slider-row">
    <div class="label-col">
      <span class="control-label">Bend</span>
    </div>
    <div class="slider-col">
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
    <div class="label-col">
      <span class="control-label">Inflate</span>
    </div>
    <div class="slider-col">
      <input
        type="range"
        min="-100"
        max="100"
        value={$designState.inflate}
        oninput={(e: Event) => {
          $designState.inflate = Number((e.target as HTMLInputElement).value);
        }}
      />
    </div>
  </div>

  <div class="slider-row">
    <div class="label-col">
      <span class="control-label">Rough Edges</span>
    </div>
    <div class="slider-col">
      <input
        type="range"
        min="0"
        max="8"
        step="0.5"
        value={$designState.roughEdges}
        oninput={(e: Event) => {
          $designState.roughEdges = Number((e.target as HTMLInputElement).value);
        }}
      />
    </div>
    <span class="debug-value">{$designState.roughEdges} → {($designState.roughEdges * 0.5).toFixed(1)}</span>
  </div>

  <div class="slider-row">
    <div class="label-col">
      <span class="control-label">Stretch</span>
    </div>
    <div class="slider-col">
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
  }

  .label-col {
    width: 118px;
    flex-shrink: 0;
  }

  .slider-col {
    width: 190px;
    flex-shrink: 0;
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
    letter-spacing: -0.43px;
    line-height: 17px;
    height: 17px;
    display: inline-flex;
    align-items: center;
  }

  input[type='range'] {
    -webkit-appearance: none;
    appearance: none;
    width: 190px;
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

  .debug-value {
    font-size: 9px;
    color: #999;
    margin-left: 6px;
    white-space: nowrap;
    font-family: monospace;
  }
</style>

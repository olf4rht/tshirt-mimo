<script lang="ts">
  import { designState } from '$lib/stores/designer';
</script>

<div class="transform-sliders">
  <div class="slider-row">
    <span class="control-label">Bend</span>
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

  <div class="slider-row">
    <span class="control-label">Inflate</span>
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

  <div class="slider-row">
    <span class="control-label">Rough Edges</span>
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

  <div class="slider-row">
    <span class="control-label">Stretch</span>
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

<style>
  .transform-sliders {
    width: 100%;
    display: flex;
    flex-direction: column;
    gap: 10px;
  }

  .slider-row {
    display: flex;
    align-items: center;
    gap: 12px;
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
</style>

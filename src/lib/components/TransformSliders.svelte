<script lang="ts">
  import { designState } from '$lib/stores/designer';
</script>

<div class="transform-sliders">
  <div class="slider-row">
    <label>
      <span class="label-text">Bend</span>
      <span class="label-value">{$designState.bend}</span>
    </label>
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
    <label>
      <span class="label-text">Inflate</span>
      <span class="label-value">{$designState.inflate}</span>
    </label>
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
    <label>
      <span class="label-text">Stretch</span>
      <span class="label-value">{$designState.stretch}</span>
    </label>
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
    gap: 12px;
  }

  .slider-row {
    display: flex;
    flex-direction: column;
    gap: 4px;
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
</style>

<script lang="ts">
  import { designState } from '$lib/stores/designer';

  const shirtPresets = [
    { label: 'Red', value: '#cc0000' },
    { label: 'Black', value: '#1a1a1a' },
    { label: 'Grey', value: '#808080' },
    { label: 'White', value: '#f0f0f0' },
  ];
</script>

<div class="color-controls">
  <div class="section">
    <div class="section-title">Text Color</div>
    <div class="color-row">
      <span class="label-text">Color</span>
      <input
        type="color"
        value={$designState.textColor}
        oninput={(e: Event) => {
          $designState.textColor = (e.target as HTMLInputElement).value;
        }}
      />
    </div>
  </div>

  <div class="section">
    <div class="section-title">Shirt Color</div>
    <div class="preset-row">
      {#each shirtPresets as preset}
        <button
          class="color-dot"
          class:active={$designState.shirtColor === preset.value}
          style="background-color: {preset.value};"
          title={preset.label}
          onclick={() => { $designState.shirtColor = preset.value; }}
        ></button>
      {/each}
      <input
        type="color"
        class="custom-shirt-color"
        value={$designState.shirtColor}
        oninput={(e: Event) => {
          $designState.shirtColor = (e.target as HTMLInputElement).value;
        }}
      />
    </div>
  </div>
</div>

<style>
  .color-controls {
    width: 100%;
    display: flex;
    flex-direction: column;
    gap: 14px;
  }

  .section {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .section-title {
    color: #999;
    font-size: 11px;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }

  .color-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .label-text {
    color: #ccc;
    font-size: 13px;
    font-weight: 500;
  }

  input[type='color'] {
    -webkit-appearance: none;
    appearance: none;
    width: 28px;
    height: 28px;
    border: 2px solid #555;
    border-radius: 50%;
    background: none;
    cursor: pointer;
    padding: 0;
  }

  input[type='color']::-webkit-color-swatch-wrapper {
    padding: 2px;
  }

  input[type='color']::-webkit-color-swatch {
    border: none;
    border-radius: 50%;
  }

  .preset-row {
    display: flex;
    align-items: center;
    gap: 10px;
  }

  .color-dot {
    width: 28px;
    height: 28px;
    border-radius: 50%;
    border: 2px solid transparent;
    cursor: pointer;
    padding: 0;
    outline: none;
    transition: border-color 0.15s ease, box-shadow 0.15s ease;
  }

  .color-dot:hover {
    border-color: #888;
  }

  .color-dot.active {
    border-color: #fff;
    box-shadow: 0 0 0 2px #4a9eff;
  }

  .custom-shirt-color {
    margin-left: 4px;
  }
</style>

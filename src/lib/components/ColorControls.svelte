<script lang="ts">
  import { designState } from '$lib/stores/designer';
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
    color: #888;
    font-size: 11px;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 1px;
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
</style>

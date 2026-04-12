<script lang="ts">
  import { designState } from '$lib/stores/designer';
</script>

<div class="color-controls">
  <div class="color-row">
    <span class="control-label">Text Color</span>
    <input
      type="color"
      class="color-dot-input"
      value={$designState.textColor}
      oninput={(e: Event) => {
        $designState.textColor = (e.target as HTMLInputElement).value;
      }}
    />
  </div>
</div>

<style>
  .color-controls {
    width: 100%;
    display: flex;
    flex-direction: column;
    gap: 10px;
  }

  .color-row {
    display: flex;
    align-items: center;
    gap: 12px;
  }

  .control-label {
    background: #EDEDEB;
    color: #B0B0B0;
    font-size: 12px;
    font-weight: 700;
    padding: 4px 8px;
    border-radius: 4px;
    white-space: nowrap;
  }

  .color-dot-input {
    -webkit-appearance: none;
    appearance: none;
    width: 22px;
    height: 22px;
    border: none;
    border-radius: 50%;
    background: none;
    cursor: pointer;
    padding: 0;
  }

  .color-dot-input::-webkit-color-swatch-wrapper {
    padding: 0;
  }

  .color-dot-input::-webkit-color-swatch {
    border: none;
    border-radius: 50%;
  }
</style>

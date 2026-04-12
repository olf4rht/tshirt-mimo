<script lang="ts">
  import { designState } from '$lib/stores/designer';
</script>

{#if $designState.strokeEnabled}
  <div class="stroke-effects">
    <div class="slider-row">
      <span class="control-label">Rough Edges</span>
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
  </div>
{/if}

<style>
  .stroke-effects {
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
    padding: 4px 8px;
    border-radius: 4px;
    white-space: nowrap;
    flex-shrink: 0;
    min-width: 80px;
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

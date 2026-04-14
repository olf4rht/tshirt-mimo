<script lang="ts">
  import { stampLibrary, activeStampId, stampSize } from '$lib/stores/designer';

  function onFileChange(e: Event) {
    const input = e.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const src = reader.result as string;
      const id = Date.now().toString();
      stampLibrary.update((list) => [...list, { id, src }]);
      // Auto-select the newly added stamp
      $activeStampId = id;
    };
    reader.readAsDataURL(file);
    input.value = '';
  }

  function removeAsset(id: string) {
    stampLibrary.update((list) => list.filter((s) => s.id !== id));
    if ($activeStampId === id) {
      $activeStampId = null;
    }
  }

  function selectStamp(id: string) {
    $activeStampId = $activeStampId === id ? null : id;
  }
</script>

<div class="stamp-manager">
  <!-- Stamp size row -->
  <div class="size-row">
    <span class="size-label">Stamp size</span>
    <div class="slider-track-wrap">
      <input
        type="range"
        min="10"
        max="100"
        bind:value={$stampSize}
        class="size-slider"
      />
    </div>
  </div>

  <!-- Stamp grid -->
  <div class="stamp-grid">
    {#each $stampLibrary as asset (asset.id)}
      <!-- svelte-ignore a11y_click_events_have_key_events -->
      <!-- svelte-ignore a11y_no_static_element_interactions -->
      <div
        class="stamp-cell"
        class:stamp-active={$activeStampId === asset.id}
        onclick={() => selectStamp(asset.id)}
      >
        <img src={asset.src} alt="stamp" class="stamp-thumb" />
        <button
          class="delete-btn"
          onclick={(e) => { e.stopPropagation(); removeAsset(asset.id); }}
        >×</button>
      </div>
    {/each}

    <!-- Add stamp button -->
    <label class="stamp-cell add-cell">
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <path d="M10 4v12M4 10h12" stroke="#b0b0b0" stroke-width="1.5" stroke-linecap="round"/>
      </svg>
      <input
        type="file"
        accept=".svg,.png,image/svg+xml,image/png"
        onchange={onFileChange}
        hidden
      />
    </label>
  </div>
</div>

<style>
  .stamp-manager {
    width: 100%;
    display: flex;
    flex-direction: column;
    gap: 16px;
  }

  /* ===== SIZE ROW ===== */
  .size-row {
    display: flex;
    align-items: center;
    gap: 10px;
  }

  .size-label {
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

  .slider-track-wrap {
    flex: 1;
    display: flex;
    align-items: center;
  }

  .size-slider {
    -webkit-appearance: none;
    appearance: none;
    width: 100%;
    height: 3px;
    background: #CECDCC;
    border-radius: 2px;
    outline: none;
  }

  .size-slider::-webkit-slider-thumb {
    -webkit-appearance: none;
    appearance: none;
    width: 11px;
    height: 11px;
    border-radius: 50%;
    background: #CECDCC;
    cursor: pointer;
    border: none;
  }

  .size-slider::-moz-range-thumb {
    width: 11px;
    height: 11px;
    border-radius: 50%;
    background: #CECDCC;
    cursor: pointer;
    border: none;
  }

  /* ===== STAMP GRID ===== */
  .stamp-grid {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
  }

  .stamp-cell {
    position: relative;
    width: 91px;
    height: 92px;
    background: #fff;
    border-radius: 20px;
    display: flex;
    align-items: center;
    justify-content: center;
    overflow: hidden;
    border: 2px solid transparent;
    padding: 0;
    cursor: pointer;
    transition: border-color 0.15s;
  }

  .stamp-cell.stamp-active {
    border-color: #7DC4F8;
  }

  .stamp-thumb {
    max-width: 80%;
    max-height: 80%;
    object-fit: contain;
  }

  .add-cell {
    background: white;
    opacity: 0.4;
    cursor: pointer;
    transition: opacity 0.15s;
  }

  .add-cell:hover {
    opacity: 0.6;
  }

  .delete-btn {
    position: absolute;
    top: 4px;
    right: 4px;
    width: 18px;
    height: 18px;
    border: none;
    border-radius: 50%;
    background: rgba(0,0,0,0.3);
    color: white;
    font-family: 'SF Pro Text', 'SF Pro Display', -apple-system, BlinkMacSystemFont, system-ui, sans-serif;
    font-size: 11px;
    font-weight: 590;
    letter-spacing: -0.43px;
    line-height: 1;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 0;
    opacity: 0;
    transition: opacity 0.15s;
  }

  .stamp-cell:hover .delete-btn {
    opacity: 1;
  }

  .delete-btn:hover {
    background: rgba(200,0,0,0.6);
  }
</style>

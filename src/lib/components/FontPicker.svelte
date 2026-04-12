<script lang="ts">
  import { FONTS } from '$lib/data/fonts';
  import { designState } from '$lib/stores/designer';

  let dropdownOpen = $state(false);

  let currentFont = $derived(FONTS[$designState.fontIndex] ?? FONTS[0]);
</script>

<div class="font-row">
  <span class="control-label">Font</span>

  <div class="dropdown-wrapper">
    <button class="dropdown-pill" onclick={() => dropdownOpen = !dropdownOpen}>
      <span class="dropdown-text">{currentFont.label}</span>
      <svg class="chevron" width="5" height="4" viewBox="0 0 5 4" fill="none">
        <path d="M2.5 4L0 0h5L2.5 4z" fill="#B0B0B0"/>
      </svg>
    </button>

    {#if dropdownOpen}
      <!-- svelte-ignore a11y_no_static_element_interactions -->
      <div class="dropdown-backdrop" onclick={() => dropdownOpen = false}></div>
      <div class="dropdown-menu">
        {#each FONTS as font, i}
          <button
            class="dropdown-item"
            class:dropdown-active={$designState.fontIndex === i}
            onclick={() => { $designState.fontIndex = i; dropdownOpen = false; }}
          >{font.label}</button>
        {/each}
      </div>
    {/if}
  </div>

  <input
    type="color"
    class="color-dot"
    value={$designState.textColor}
    oninput={(e: Event) => {
      $designState.textColor = (e.target as HTMLInputElement).value;
    }}
  />
</div>

<style>
  .font-row {
    display: flex;
    align-items: center;
    gap: 8px;
    width: 100%;
  }

  .control-label {
    background: #EDEDEB;
    color: #B0B0B0;
    font-family: 'SF Pro Display', -apple-system, BlinkMacSystemFont, system-ui, sans-serif;
    font-size: 12px;
    font-weight: 700;
    padding: 2px 10px;
    border-radius: 4px;
    white-space: nowrap;
    flex-shrink: 0;
    letter-spacing: -0.43px;
    line-height: 12px;
    height: 17px;
    display: flex;
    align-items: center;
  }

  .dropdown-wrapper {
    position: relative;
    flex: 1;
    min-width: 0;
  }

  .dropdown-pill {
    display: flex;
    align-items: center;
    gap: 6px;
    width: 100%;
    background: #EDEDEB;
    border: none;
    border-radius: 26px;
    padding: 5px 10px;
    cursor: pointer;
    outline: none;
  }

  .dropdown-text {
    font-family: 'SF Pro Display', -apple-system, BlinkMacSystemFont, system-ui, sans-serif;
    font-size: 10px;
    font-weight: 600;
    color: #B0B0B0;
    text-transform: uppercase;
    letter-spacing: -0.43px;
    line-height: 22px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    flex: 1;
    text-align: left;
  }

  .chevron {
    flex-shrink: 0;
  }

  .dropdown-backdrop {
    position: fixed;
    inset: 0;
    z-index: 99;
  }

  .dropdown-menu {
    position: absolute;
    top: calc(100% + 4px);
    left: 0;
    right: 0;
    background: #fff;
    border-radius: 12px;
    box-shadow: 0 4px 16px rgba(0,0,0,0.12);
    z-index: 100;
    padding: 4px;
    max-height: 200px;
    overflow-y: auto;
  }

  .dropdown-item {
    display: block;
    width: 100%;
    text-align: left;
    border: none;
    background: transparent;
    padding: 6px 10px;
    font-family: 'SF Pro Display', -apple-system, BlinkMacSystemFont, system-ui, sans-serif;
    font-size: 10px;
    font-weight: 600;
    color: #666;
    text-transform: uppercase;
    letter-spacing: -0.43px;
    cursor: pointer;
    border-radius: 8px;
    transition: background 0.1s;
  }

  .dropdown-item:hover {
    background: #F4F4F4;
  }

  .dropdown-item.dropdown-active {
    background: #EDEDEB;
    color: #333;
  }

  .color-dot {
    -webkit-appearance: none;
    appearance: none;
    width: 16px;
    height: 16px;
    border: none;
    border-radius: 50%;
    background: none;
    cursor: pointer;
    padding: 0;
    flex-shrink: 0;
  }

  .color-dot::-webkit-color-swatch-wrapper {
    padding: 0;
  }

  .color-dot::-webkit-color-swatch {
    border: none;
    border-radius: 50%;
  }
</style>

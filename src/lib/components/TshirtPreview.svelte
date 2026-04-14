<script lang="ts">
  import { designState, shirtSide, placedStamps, activeStampId, stampLibrary, stampSize, activeTab } from '$lib/stores/designer';
  import DesignSvgRenderer from './DesignSvgRenderer.svelte';

  let container: HTMLDivElement | undefined = $state();
  let dragging = $state(false);
  let resizing = $state(false);
  let selected = $state(false);
  let resizeStartDist = $state(0);
  let resizeStartScale = $state(1);

  // Stamp interaction state
  let selectedStampId: string | null = $state(null);
  let draggingStampId: string | null = $state(null);
  let resizingStampId: string | null = $state(null);
  let stampResizeStartDist = $state(0);
  let stampResizeStartScale = $state(1);
  let rotatingStampId: string | null = $state(null);
  let rotateStartAngle = $state(0);
  let rotateStartRotation = $state(0);

  // Cursor stamp preview
  let cursorX = $state(0);
  let cursorY = $state(0);
  let showCursorStamp = $state(false);
  let cursorBaseWidth = $state(80);

  // Get scale from stampSize slider (10-100 → 0.15-0.8)
  let stampScale = $derived(0.15 + ($stampSize / 100) * 0.65);

  // Get the active stamp asset
  let activeAsset = $derived($stampLibrary.find(a => a.id === $activeStampId));

  function getContainerRect() {
    if (!container) return null;
    return container.getBoundingClientRect();
  }

  function toPercent(clientX: number, clientY: number) {
    const rect = getContainerRect();
    if (!rect) return { px: 50, py: 35 };
    const px = ((clientX - rect.left) / rect.width) * 100;
    const py = ((clientY - rect.top) / rect.height) * 100;
    return { px, py };
  }

  // --- Design overlay handlers ---
  function onDesignPointerDown(e: PointerEvent) {
    if (resizing) return;
    e.preventDefault();
    e.stopPropagation();
    dragging = true;
    selected = true;
    selectedStampId = null;
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  }

  function onDesignPointerMove(e: PointerEvent) {
    if (!dragging) return;
    e.preventDefault();
    const { px, py } = toPercent(e.clientX, e.clientY);
    $designState.designX = Math.max(15, Math.min(85, px));
    $designState.designY = Math.max(10, Math.min(85, py));
  }

  function onDesignPointerUp(e: PointerEvent) {
    dragging = false;
    (e.target as HTMLElement).releasePointerCapture(e.pointerId);
  }

  function getDesignCenter() {
    const rect = getContainerRect();
    if (!rect) return { cx: 0, cy: 0 };
    return {
      cx: rect.left + (rect.width * $designState.designX) / 100,
      cy: rect.top + (rect.height * $designState.designY) / 100
    };
  }

  function onHandlePointerDown(e: PointerEvent) {
    e.preventDefault();
    e.stopPropagation();
    resizing = true;
    selected = true;
    const center = getDesignCenter();
    const dx = e.clientX - center.cx;
    const dy = e.clientY - center.cy;
    resizeStartDist = Math.sqrt(dx * dx + dy * dy);
    resizeStartScale = $designState.designScale;
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  }

  function onHandlePointerMove(e: PointerEvent) {
    if (!resizing) return;
    e.preventDefault();
    const center = getDesignCenter();
    const dx = e.clientX - center.cx;
    const dy = e.clientY - center.cy;
    const dist = Math.sqrt(dx * dx + dy * dy);
    if (resizeStartDist > 0) {
      const newScale = resizeStartScale * (dist / resizeStartDist);
      $designState.designScale = Math.max(0.2, Math.min(3, newScale));
    }
  }

  function onHandlePointerUp(e: PointerEvent) {
    resizing = false;
    (e.target as HTMLElement).releasePointerCapture(e.pointerId);
  }

  // --- Placed stamp handlers ---
  function onStampPointerDown(e: PointerEvent, stampId: string) {
    if ($activeStampId) return; // Don't drag when in stamp placement mode
    if (resizingStampId) return;
    e.preventDefault();
    e.stopPropagation();
    draggingStampId = stampId;
    selectedStampId = stampId;
    selected = false;
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  }

  function onStampPointerMove(e: PointerEvent) {
    if (!draggingStampId) return;
    e.preventDefault();
    const { px, py } = toPercent(e.clientX, e.clientY);
    placedStamps.update((list) =>
      list.map((s) =>
        s.id === draggingStampId
          ? { ...s, x: Math.max(5, Math.min(95, px)), y: Math.max(5, Math.min(95, py)) }
          : s
      )
    );
  }

  function onStampPointerUp(e: PointerEvent) {
    draggingStampId = null;
    (e.target as HTMLElement).releasePointerCapture(e.pointerId);
  }

  function getStampCenter(stamp: { x: number; y: number }) {
    const rect = getContainerRect();
    if (!rect) return { cx: 0, cy: 0 };
    return {
      cx: rect.left + (rect.width * stamp.x) / 100,
      cy: rect.top + (rect.height * stamp.y) / 100
    };
  }

  function onStampHandlePointerDown(e: PointerEvent, stampId: string) {
    e.preventDefault();
    e.stopPropagation();
    resizingStampId = stampId;
    selectedStampId = stampId;
    const stamp = $placedStamps.find((s) => s.id === stampId);
    if (!stamp) return;
    const center = getStampCenter(stamp);
    const dx = e.clientX - center.cx;
    const dy = e.clientY - center.cy;
    stampResizeStartDist = Math.sqrt(dx * dx + dy * dy);
    stampResizeStartScale = stamp.scale;
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  }

  function onStampHandlePointerMove(e: PointerEvent) {
    if (!resizingStampId) return;
    e.preventDefault();
    const stamp = $placedStamps.find((s) => s.id === resizingStampId);
    if (!stamp) return;
    const center = getStampCenter(stamp);
    const dx = e.clientX - center.cx;
    const dy = e.clientY - center.cy;
    const dist = Math.sqrt(dx * dx + dy * dy);
    if (stampResizeStartDist > 0) {
      const newScale = stampResizeStartScale * (dist / stampResizeStartDist);
      placedStamps.update((list) =>
        list.map((s) =>
          s.id === resizingStampId
            ? { ...s, scale: Math.max(0.2, Math.min(3, newScale)) }
            : s
        )
      );
    }
  }

  function onStampHandlePointerUp(e: PointerEvent) {
    resizingStampId = null;
    (e.target as HTMLElement).releasePointerCapture(e.pointerId);
  }

  // --- Stamp rotation handlers ---
  function onRotatePointerDown(e: PointerEvent, stampId: string) {
    e.preventDefault();
    e.stopPropagation();
    rotatingStampId = stampId;
    selectedStampId = stampId;
    const stamp = $placedStamps.find((s) => s.id === stampId);
    if (!stamp) return;
    const center = getStampCenter(stamp);
    rotateStartAngle = Math.atan2(e.clientY - center.cy, e.clientX - center.cx);
    rotateStartRotation = stamp.rotation;
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  }

  function onRotatePointerMove(e: PointerEvent) {
    if (!rotatingStampId) return;
    e.preventDefault();
    const stamp = $placedStamps.find((s) => s.id === rotatingStampId);
    if (!stamp) return;
    const center = getStampCenter(stamp);
    const angle = Math.atan2(e.clientY - center.cy, e.clientX - center.cx);
    const delta = (angle - rotateStartAngle) * (180 / Math.PI);
    placedStamps.update((list) =>
      list.map((s) =>
        s.id === rotatingStampId
          ? { ...s, rotation: rotateStartRotation + delta }
          : s
      )
    );
  }

  function onRotatePointerUp(e: PointerEvent) {
    rotatingStampId = null;
    (e.target as HTMLElement).releasePointerCapture(e.pointerId);
  }

  // --- Background click: place stamp or deselect ---
  function onBackgroundClick(e: MouseEvent) {
    if ($activeStampId && activeAsset) {
      // Place a stamp instance on the shirt
      const { px, py } = toPercent(e.clientX, e.clientY);
      placedStamps.update((list) => [
        ...list,
        {
          id: Date.now().toString(),
          assetId: $activeStampId!,
          src: activeAsset!.src,
          x: Math.max(5, Math.min(95, px)),
          y: Math.max(5, Math.min(95, py)),
          scale: stampScale,
          rotation: 0,
          side: $shirtSide,
        },
      ]);
      return;
    }
    selected = false;
    selectedStampId = null;
  }

  // --- Cursor tracking for stamp preview ---
  function onContainerPointerMove(e: PointerEvent) {
    if ($activeStampId && activeAsset) {
      cursorX = e.clientX;
      cursorY = e.clientY;
      showCursorStamp = true;
      // Match cursor preview size to the actual placed stamp size (15% of container)
      const rect = getContainerRect();
      if (rect) {
        cursorBaseWidth = rect.width * 0.15;
      }
    } else {
      showCursorStamp = false;
    }
  }

  function onContainerPointerLeave() {
    showCursorStamp = false;
  }

  function onKeyDown(e: KeyboardEvent) {
    if (e.key === 'Escape' && $activeStampId) {
      $activeStampId = null;
      showCursorStamp = false;
      return;
    }
    if (e.key === 'Backspace' || e.key === 'Delete') {
      if (selectedStampId) {
        placedStamps.update((list) => list.filter((s) => s.id !== selectedStampId));
        selectedStampId = null;
      } else if (selected) {
        $designState.designVisible = false;
        selected = false;
      }
    }
  }

  $effect(() => {
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  });
</script>

<!-- svelte-ignore a11y_click_events_have_key_events -->
<!-- svelte-ignore a11y_no_static_element_interactions -->
<div
  class="tshirt-preview"
  class:stamp-cursor={$activeStampId && activeAsset}
  bind:this={container}
  onclick={onBackgroundClick}
  onpointermove={onContainerPointerMove}
  onpointerleave={onContainerPointerLeave}
>
  {#if $designState.shirtColor === '#faf6d6'}
    <img class="shirt-img" src="/mockups/yellow_{$shirtSide}.png" alt="Yellow t-shirt {$shirtSide}" draggable="false" />
  {:else if $designState.shirtColor === '#f0f0f0' || $designState.shirtColor === '#ffffff'}
    <img class="shirt-img" src="/mockups/white_{$shirtSide}.png" alt="White t-shirt {$shirtSide}" draggable="false" />
  {:else}
    <img class="shirt-img" src="/mockups/black_{$shirtSide}.png" alt="Black t-shirt {$shirtSide}" draggable="false" />
  {/if}

  {#if $designState.designVisible}
  <!-- svelte-ignore a11y_no_static_element_interactions -->
  <div
    class="design-overlay"
    class:selected
    class:dragging
    style="left: {$designState.designX}%; top: {$designState.designY}%; transform: translate(-50%, -50%) scale({$designState.designScale})"
    onpointerdown={onDesignPointerDown}
    onpointermove={onDesignPointerMove}
    onpointerup={onDesignPointerUp}
    onclick={(e) => e.stopPropagation()}
  >
    {#if $designState.threeDEnabled}
      <div class="three-d-perspective" style="perspective: 800px;">
      <div
        class="three-d-wrapper"
        style="transform: rotateX({$designState.rotateX}deg) rotateY({$designState.rotateY}deg) rotateZ({$designState.rotateZ}deg);"
      >
        <!-- Extrusion layers (behind the front face) -->
        {#if $designState.extrudeDepth > 0}
          {@const layers = Math.min($designState.extrudeDepth, 50)}
          {@const step = $designState.extrudeDepth / layers}
          {#each Array(layers) as _, i}
            <div
              class="extrude-layer"
              style="transform: translateZ({-(i + 1) * step}px);"
            >
              <DesignSvgRenderer filterId="extrude{i}" extrudeColor={$designState.extrudeColor || ''} />
            </div>
          {/each}
        {/if}
        <!-- Inflate layers (in front, expanding outward) -->
        {#if $designState.inflateDepth > 0}
          {@const inflateLayers = Math.min($designState.inflateDepth, 30)}
          {@const inflateStep = $designState.inflateDepth / inflateLayers}
          {#each Array(inflateLayers) as _, i}
            <div
              class="extrude-layer"
              style="transform: translateZ({(i + 1) * inflateStep}px);"
            >
              <DesignSvgRenderer filterId="inflate{i}" extrudeColor={$designState.extrudeColor || ''} />
            </div>
          {/each}
        {/if}
        <!-- Front face -->
        <div class="front-face" style="transform: translateZ(0px);">
          <DesignSvgRenderer filterId="preview" />
        </div>
      </div>
      </div>
    {:else}
      <DesignSvgRenderer filterId="preview" />
    {/if}

    {#if selected}
      <!-- svelte-ignore a11y_no_static_element_interactions -->
      <div
        class="resize-handle top-left"
        onpointerdown={onHandlePointerDown}
        onpointermove={onHandlePointerMove}
        onpointerup={onHandlePointerUp}
      ></div>
      <!-- svelte-ignore a11y_no_static_element_interactions -->
      <div
        class="resize-handle top-right"
        onpointerdown={onHandlePointerDown}
        onpointermove={onHandlePointerMove}
        onpointerup={onHandlePointerUp}
      ></div>
      <!-- svelte-ignore a11y_no_static_element_interactions -->
      <div
        class="resize-handle bottom-left"
        onpointerdown={onHandlePointerDown}
        onpointermove={onHandlePointerMove}
        onpointerup={onHandlePointerUp}
      ></div>
      <!-- svelte-ignore a11y_no_static_element_interactions -->
      <div
        class="resize-handle bottom-right"
        onpointerdown={onHandlePointerDown}
        onpointermove={onHandlePointerMove}
        onpointerup={onHandlePointerUp}
      ></div>
    {/if}
  </div>
  {/if}

  <!-- Placed stamps layer -->
  {#each $placedStamps as stamp (stamp.id)}
    <!-- svelte-ignore a11y_no_static_element_interactions -->
    <div
      class="stamp-overlay"
      class:stamp-selected={selectedStampId === stamp.id}
      class:stamp-dragging={draggingStampId === stamp.id}
      style="left: {stamp.x}%; top: {stamp.y}%; transform: translate(-50%, -50%) scale({stamp.scale}) rotate({stamp.rotation}deg)"
      onpointerdown={(e) => onStampPointerDown(e, stamp.id)}
      onpointermove={onStampPointerMove}
      onpointerup={onStampPointerUp}
      onclick={(e) => e.stopPropagation()}
    >
      <img src={stamp.src} alt="stamp" class="stamp-img" draggable="false" />

      {#if selectedStampId === stamp.id}
        <!-- svelte-ignore a11y_no_static_element_interactions -->
        <div
          class="resize-handle top-left"
          onpointerdown={(e) => onStampHandlePointerDown(e, stamp.id)}
          onpointermove={onStampHandlePointerMove}
          onpointerup={onStampHandlePointerUp}
        ></div>
        <!-- svelte-ignore a11y_no_static_element_interactions -->
        <div
          class="resize-handle top-right"
          onpointerdown={(e) => onStampHandlePointerDown(e, stamp.id)}
          onpointermove={onStampHandlePointerMove}
          onpointerup={onStampHandlePointerUp}
        ></div>
        <!-- svelte-ignore a11y_no_static_element_interactions -->
        <div
          class="resize-handle bottom-left"
          onpointerdown={(e) => onStampHandlePointerDown(e, stamp.id)}
          onpointermove={onStampHandlePointerMove}
          onpointerup={onStampHandlePointerUp}
        ></div>
        <!-- svelte-ignore a11y_no_static_element_interactions -->
        <div
          class="resize-handle bottom-right"
          onpointerdown={(e) => onStampHandlePointerDown(e, stamp.id)}
          onpointermove={onStampHandlePointerMove}
          onpointerup={onStampHandlePointerUp}
        ></div>
        <!-- svelte-ignore a11y_no_static_element_interactions -->
        <div
          class="rotate-handle"
          onpointerdown={(e) => onRotatePointerDown(e, stamp.id)}
          onpointermove={onRotatePointerMove}
          onpointerup={onRotatePointerUp}
        >
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
            <path d="M6 1a5 5 0 1 1-3.5 1.5" stroke="#0078ff" stroke-width="1.5" stroke-linecap="round"/>
            <path d="M2 1v2h2" stroke="#0078ff" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </div>
      {/if}
    </div>
  {/each}

  <!-- Cursor stamp preview (follows mouse when stamp tool is active) -->
  {#if showCursorStamp && activeAsset}
    <div
      class="cursor-stamp-preview"
      style="left: {cursorX}px; top: {cursorY}px; width: {cursorBaseWidth}px; transform: translate(-50%, -50%) scale({stampScale})"
    >
      <img src={activeAsset.src} alt="stamp preview" draggable="false" />
    </div>
  {/if}
</div>

<style>
  .tshirt-preview {
    position: relative;
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .tshirt-preview.stamp-cursor {
    cursor: none;
  }

  .shirt-img {
    max-width: 90%;
    max-height: 85vh;
    width: auto;
    height: 85vh;
    object-fit: contain;
    pointer-events: none;
    user-select: none;
  }

  .design-overlay {
    position: absolute;
    width: 40%;
    cursor: grab;
    pointer-events: auto;
    touch-action: none;
    user-select: none;
    z-index: 1;
  }

  .design-overlay.dragging {
    cursor: grabbing;
  }

  .design-overlay.selected {
    outline: 1px dashed rgba(0, 120, 255, 0.6);
    outline-offset: 4px;
  }

  .design-overlay :global(.font-svg) {
    width: 100%;
    height: auto;
    pointer-events: none;
  }

  .three-d-perspective {
    width: 100%;
  }

  .three-d-wrapper {
    position: relative;
    transform-style: preserve-3d;
    width: 100%;
  }

  .extrude-layer {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    backface-visibility: hidden;
  }

  .extrude-layer :global(.font-svg) {
    width: 100%;
    height: auto;
    pointer-events: none;
  }

  .front-face {
    position: relative;
    backface-visibility: hidden;
  }

  .front-face :global(.font-svg) {
    width: 100%;
    height: auto;
    pointer-events: none;
  }

  /* Stamp overlay */
  .stamp-overlay {
    position: absolute;
    width: 15%;
    cursor: grab;
    pointer-events: auto;
    touch-action: none;
    user-select: none;
    z-index: 2;
  }

  .stamp-overlay.stamp-dragging {
    cursor: grabbing;
  }

  .stamp-overlay.stamp-selected {
    outline: 1px dashed rgba(0, 120, 255, 0.6);
    outline-offset: 4px;
  }

  .stamp-img {
    width: 100%;
    height: auto;
    pointer-events: none;
    display: block;
  }

  /* Cursor stamp preview */
  .cursor-stamp-preview {
    position: fixed;
    pointer-events: none;
    z-index: 100;
    opacity: 0.6;
  }

  .cursor-stamp-preview img {
    width: 100%;
    height: auto;
    display: block;
  }

  .resize-handle {
    position: absolute;
    width: 10px;
    height: 10px;
    background: white;
    border: 2px solid #0078ff;
    border-radius: 2px;
    cursor: nwse-resize;
    touch-action: none;
  }

  .resize-handle.top-left {
    top: -5px;
    left: -5px;
    cursor: nwse-resize;
  }

  .resize-handle.top-right {
    top: -5px;
    right: -5px;
    cursor: nesw-resize;
  }

  .resize-handle.bottom-left {
    bottom: -5px;
    left: -5px;
    cursor: nesw-resize;
  }

  .resize-handle.bottom-right {
    bottom: -5px;
    right: -5px;
    cursor: nwse-resize;
  }

  .rotate-handle {
    position: absolute;
    top: -28px;
    left: 50%;
    transform: translateX(-50%);
    width: 20px;
    height: 20px;
    background: white;
    border: 2px solid #0078ff;
    border-radius: 50%;
    cursor: grab;
    touch-action: none;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .rotate-handle:active {
    cursor: grabbing;
  }
</style>

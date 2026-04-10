<script lang="ts">
  import { designState, stamps } from '$lib/stores/designer';
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

  // --- Stamp handlers ---
  function onStampPointerDown(e: PointerEvent, stampId: string) {
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
    stamps.update((list) =>
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
    const stamp = $stamps.find((s) => s.id === stampId);
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
    const stamp = $stamps.find((s) => s.id === resizingStampId);
    if (!stamp) return;
    const center = getStampCenter(stamp);
    const dx = e.clientX - center.cx;
    const dy = e.clientY - center.cy;
    const dist = Math.sqrt(dx * dx + dy * dy);
    if (stampResizeStartDist > 0) {
      const newScale = stampResizeStartScale * (dist / stampResizeStartDist);
      stamps.update((list) =>
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

  function onBackgroundClick() {
    selected = false;
    selectedStampId = null;
  }
</script>

<!-- svelte-ignore a11y_click_events_have_key_events -->
<!-- svelte-ignore a11y_no_static_element_interactions -->
<div class="tshirt-preview" bind:this={container} onclick={onBackgroundClick}>
  <svg
    class="shirt-svg"
    viewBox="0 0 400 480"
    xmlns="http://www.w3.org/2000/svg"
    preserveAspectRatio="xMidYMid meet"
  >
    <path
      d="M 100,0 L 0,80 L 50,130 L 80,110 L 80,460 C 80,475 90,480 100,480 L 300,480 C 310,480 320,475 320,460 L 320,110 L 350,130 L 400,80 L 300,0 C 290,30 260,50 200,50 C 140,50 110,30 100,0 Z"
      fill={$designState.shirtColor}
    />
  </svg>

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
    <DesignSvgRenderer filterId="preview" />

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

  <!-- Stamps layer (on top of design overlay) -->
  {#each $stamps as stamp (stamp.id)}
    <!-- svelte-ignore a11y_no_static_element_interactions -->
    <div
      class="stamp-overlay"
      class:stamp-selected={selectedStampId === stamp.id}
      class:stamp-dragging={draggingStampId === stamp.id}
      style="left: {stamp.x}%; top: {stamp.y}%; transform: translate(-50%, -50%) scale({stamp.scale})"
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
      {/if}
    </div>
  {/each}
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

  .shirt-svg {
    width: 80%;
    height: 80%;
    filter: drop-shadow(0 4px 12px rgba(0, 0, 0, 0.15));
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
</style>

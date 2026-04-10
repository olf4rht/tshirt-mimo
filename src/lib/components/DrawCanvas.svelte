<script lang="ts">
  import { drawState } from '$lib/stores/designer';
  import { onMount } from 'svelte';

  let canvas: HTMLCanvasElement;
  let ctx: CanvasRenderingContext2D;
  let drawing = $state(false);
  let lastX = $state(0);
  let lastY = $state(0);
  let lastClearTrigger = $state(0);

  onMount(() => {
    ctx = canvas.getContext('2d')!;
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    return () => window.removeEventListener('resize', resizeCanvas);
  });

  function resizeCanvas() {
    if (!canvas || !canvas.parentElement) return;
    const rect = canvas.parentElement.getBoundingClientRect();
    const imageData = ctx ? ctx.getImageData(0, 0, canvas.width, canvas.height) : null;
    canvas.width = rect.width;
    canvas.height = rect.height;
    if (ctx && imageData) {
      ctx.putImageData(imageData, 0, 0);
    }
  }

  function getPos(e: PointerEvent): [number, number] {
    const rect = canvas.getBoundingClientRect();
    return [e.clientX - rect.left, e.clientY - rect.top];
  }

  function startDraw(e: PointerEvent) {
    drawing = true;
    [lastX, lastY] = getPos(e);
    ctx.beginPath();
    ctx.moveTo(lastX, lastY);
  }

  function draw(e: PointerEvent) {
    if (!drawing) return;
    const [x, y] = getPos(e);
    const midX = (lastX + x) / 2;
    const midY = (lastY + y) / 2;
    ctx.quadraticCurveTo(lastX, lastY, midX, midY);
    ctx.strokeStyle = $drawState.brushColor;
    ctx.lineWidth = $drawState.brushSize;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(midX, midY);
    [lastX, lastY] = [x, y];
  }

  function endDraw() {
    drawing = false;
  }

  export function clear() {
    if (ctx && canvas) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
  }

  export function getDataURL(): string {
    return canvas?.toDataURL('image/png') ?? '';
  }

  $effect(() => {
    const trigger = $drawState.clearTrigger;
    if (trigger > lastClearTrigger) {
      clear();
    }
    lastClearTrigger = trigger;
  });
</script>

<canvas
  bind:this={canvas}
  onpointerdown={startDraw}
  onpointermove={draw}
  onpointerup={endDraw}
  onpointerleave={endDraw}
  style="width: 100%; height: 100%; cursor: crosshair; display: block;"
/>

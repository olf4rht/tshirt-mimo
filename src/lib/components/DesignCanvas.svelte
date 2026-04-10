<script lang="ts">
  import { designState } from '$lib/stores/designer';
  import { FONTS } from '$lib/data/fonts';
  import { applyTransforms } from '$lib/utils/svg-transforms';

  let paths: string[] = $state([]);
  let viewBox: string = $state('0 0 100 20');

  $effect(() => {
    const font = FONTS[$designState.fontIndex] ?? FONTS[0];
    fetch(font.src)
      .then((res) => res.text())
      .then((svgText) => {
        const parser = new DOMParser();
        const doc = parser.parseFromString(svgText, 'image/svg+xml');
        const svg = doc.querySelector('svg');
        if (svg) {
          viewBox = svg.getAttribute('viewBox') ?? '0 0 100 20';
        }
        const pathEls = doc.querySelectorAll('path');
        paths = Array.from(pathEls).map((p) => p.getAttribute('d') ?? '');
      });
  });

  let transformedPaths = $derived(
    applyTransforms(paths, $designState.bend, $designState.inflate, $designState.stretch)
  );
</script>

<div class="design-canvas">
  <svg
    {viewBox}
    xmlns="http://www.w3.org/2000/svg"
    preserveAspectRatio="xMidYMid meet"
    class="font-svg"
  >
    {#each transformedPaths as d}
      <path {d} fill={$designState.textColor} />
    {/each}
  </svg>
</div>

<style>
  .design-canvas {
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .font-svg {
    max-width: 80%;
    max-height: 50%;
  }
</style>

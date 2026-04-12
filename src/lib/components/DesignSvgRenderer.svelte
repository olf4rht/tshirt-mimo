<script lang="ts">
  import { designState } from '$lib/stores/designer';
  import { FONTS } from '$lib/data/fonts';
  import { applyTransforms, parsePath, getBBox, toAbsolute } from '$lib/utils/svg-transforms';

  interface Props {
    filterId?: string;
  }

  let { filterId = '' }: Props = $props();

  let paths: string[] = $state([]);
  let viewBox: string = $state('0 0 100 20');

  // Use filterId to namespace filter IDs so multiple instances don't clash
  let prefix = $derived(filterId ? `${filterId}-` : '');

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

  let computedViewBox = $derived.by(() => {
    if (transformedPaths.length === 0) return viewBox;
    // Compute bounding box across all transformed paths
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    for (const d of transformedPaths) {
      const cmds = toAbsolute(parsePath(d));
      const bbox = getBBox(cmds);
      if (bbox.minX < minX) minX = bbox.minX;
      if (bbox.minY < minY) minY = bbox.minY;
      if (bbox.maxX > maxX) maxX = bbox.maxX;
      if (bbox.maxY > maxY) maxY = bbox.maxY;
    }
    if (!isFinite(minX)) return viewBox;
    // Add padding (10% of dimensions)
    const w = maxX - minX;
    const h = maxY - minY;
    const pad = Math.max(w, h) * 0.1;
    return `${minX - pad} ${minY - pad} ${w + pad * 2} ${h + pad * 2}`;
  });

  let hasStrokeEffects = $derived(
    $designState.strokeBlur > 0 ||
    $designState.strokeRoughEdges > 0 ||
    $designState.strokePixelized > 0
  );

  let strokeColorValue = $derived(
    $designState.strokeGradientEnabled ? `url(#${prefix}stroke-gradient)` : $designState.strokeColor
  );
</script>

<svg
  viewBox={computedViewBox}
  xmlns="http://www.w3.org/2000/svg"
  preserveAspectRatio="xMidYMid meet"
  class="font-svg"
  overflow="visible"
>
  <defs>
    <filter id="{prefix}stroke-effects" x="-50%" y="-50%" width="200%" height="200%">
      <feGaussianBlur
        stdDeviation={$designState.strokeBlur > 0 ? $designState.strokeBlur * 0.5 : 0}
        result="blurred"
      />
      <feTurbulence
        type="turbulence"
        baseFrequency="0.05"
        numOctaves="2"
        seed="1"
        result="noise"
      />
      <feDisplacementMap
        in="blurred"
        in2="noise"
        scale={$designState.strokeRoughEdges > 0 ? $designState.strokeRoughEdges * 0.3 : 0}
        result="roughened"
      />
      <feMorphology
        in="roughened"
        operator="erode"
        radius={$designState.strokePixelized > 0 ? $designState.strokePixelized * 0.1 : 0}
        result="eroded"
      />
      <feMorphology
        in="eroded"
        operator="dilate"
        radius={$designState.strokePixelized > 0 ? $designState.strokePixelized * 0.1 : 0}
      />
    </filter>

    {#if $designState.strokeGradientEnabled}
      <linearGradient id="{prefix}stroke-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stop-color={$designState.strokeGradientStart} />
        <stop offset="100%" stop-color={$designState.strokeGradientEnd} />
      </linearGradient>
    {/if}

    <filter id="{prefix}text-distress" x="-20%" y="-20%" width="140%" height="140%">
      <feTurbulence
        type="turbulence"
        baseFrequency="0.04"
        numOctaves="4"
        seed="2"
        result="noise"
      />
      <feDisplacementMap
        in="SourceGraphic"
        in2="noise"
        scale={$designState.roughEdges > 0 ? $designState.roughEdges * 0.5 : 0}
      />
    </filter>
  </defs>

  <g filter={$designState.roughEdges > 0 ? `url(#${prefix}text-distress)` : undefined}>
    {#if $designState.strokeEnabled}
      <g
        fill={$designState.textColor}
        stroke={strokeColorValue}
        stroke-width={$designState.strokeWeight}
        stroke-linejoin="round"
        stroke-linecap="round"
        paint-order="stroke"
        filter={hasStrokeEffects ? `url(#${prefix}stroke-effects)` : undefined}
      >
        {#each transformedPaths as d}
          <path {d} />
        {/each}
      </g>
    {:else}
      {#each transformedPaths as d}
        <path {d} fill={$designState.textColor} />
      {/each}
    {/if}
  </g>
</svg>

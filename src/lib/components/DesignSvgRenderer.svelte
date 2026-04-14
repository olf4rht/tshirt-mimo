<script lang="ts">
  import { designState } from '$lib/stores/designer';
  import { FONTS } from '$lib/data/fonts';
  import { applyTransforms, parsePath, getBBox, toAbsolute } from '$lib/utils/svg-transforms';

  interface Props {
    filterId?: string;
    extrudeColor?: string;
  }

  let { filterId = '', extrudeColor }: Props = $props();

  function darken(hex: string, amount: number): string {
    const h = hex.replace('#', '');
    const r = Math.max(0, Math.round(parseInt(h.substring(0, 2), 16) * (1 - amount)));
    const g = Math.max(0, Math.round(parseInt(h.substring(2, 4), 16) * (1 - amount)));
    const b = Math.max(0, Math.round(parseInt(h.substring(4, 6), 16) * (1 - amount)));
    return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
  }

  // Extrude layers pass extrudeColor (even as empty string); front face passes undefined
  let isExtrudeLayer = $derived(extrudeColor !== undefined);
  let layerFillColor = $derived(
    isExtrudeLayer
      ? (extrudeColor !== '' ? extrudeColor : darken($designState.textColor, 0.4))
      : undefined
  );

  let paths: string[] = $state([]);
  let viewBox: string = $state('0 0 100 20');

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
    const w = maxX - minX;
    const h = maxY - minY;
    const pad = Math.max(w, h) * 0.15;
    return `${minX - pad} ${minY - pad} ${w + pad * 2} ${h + pad * 2}`;
  });

  let hasStrokeBlur = $derived($designState.strokeBlur > 0);
  let hasStrokePixelized = $derived($designState.strokePixelized > 0);
  let hasStrokeRoughEdges = $derived($designState.strokeRoughEdges > 0);

  let strokeColorValue = $derived(
    $designState.strokeGradientEnabled ? `url(#${prefix}stroke-gradient)` : $designState.strokeColor
  );

  // Halftone: small fixed dots
  const DOT_SPACING = 1.2;
  const DOT_RADIUS = 0.35;

  // Pixelized halo: wide stroke + heavy blur creates smooth gradient from solid → dots → nothing
  let outerStrokeWidth = $derived($designState.strokeWeight * 3);
  let haloBlur = $derived(Math.max($designState.strokeWeight * 1.2, 3));

</script>

<svg
  viewBox={computedViewBox}
  xmlns="http://www.w3.org/2000/svg"
  preserveAspectRatio="xMidYMid meet"
  class="font-svg"
  overflow="visible"
>
  <defs>
    <!-- Blur filter (stroke only) -->
    {#if hasStrokeBlur}
      <filter id="{prefix}stroke-blur" x="-200%" y="-200%" width="500%" height="500%">
        <feGaussianBlur stdDeviation={$designState.strokeBlur * 0.5} />
      </filter>
    {/if}

    <!-- Stroke rough edges filter -->
    {#if hasStrokeRoughEdges}
      <filter id="{prefix}stroke-rough" x="-200%" y="-200%" width="500%" height="500%">
        <feTurbulence
          type="turbulence"
          baseFrequency="0.05"
          numOctaves="2"
          seed="1"
          result="noise"
        />
        <feDisplacementMap
          in="SourceGraphic"
          in2="noise"
          scale={$designState.strokeRoughEdges * 0.3}
        />
      </filter>
    {/if}

    <!-- Pixelized: heavy blur for smooth fade-out halo -->
    {#if hasStrokePixelized}
      <filter id="{prefix}stroke-halo-blur" x="-200%" y="-200%" width="500%" height="500%">
        <feGaussianBlur stdDeviation={haloBlur} />
      </filter>
      <pattern
        id="{prefix}dots-pattern"
        x="0" y="0"
        width={DOT_SPACING}
        height={DOT_SPACING}
        patternUnits="userSpaceOnUse"
      >
        <circle cx={DOT_SPACING / 2} cy={DOT_SPACING / 2} r={DOT_RADIUS} fill="white" />
      </pattern>
      <mask id="{prefix}halftone-mask" maskUnits="userSpaceOnUse" x="-99999" y="-99999" width="199998" height="199998">
        <rect x="-99999" y="-99999" width="199998" height="199998" fill="url(#{prefix}dots-pattern)" />
      </mask>
    {/if}

    <!-- Radial gradient for stroke -->
    {#if $designState.strokeGradientEnabled}
      <radialGradient id="{prefix}stroke-gradient" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stop-color={$designState.strokeGradientStart} />
        <stop offset="100%" stop-color={$designState.strokeGradientEnd} />
      </radialGradient>
    {/if}

    <!-- Text distress filter -->
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

  <g filter={$designState.roughEdges > 0 && !isExtrudeLayer ? `url(#${prefix}text-distress)` : undefined}>
    {#if $designState.strokeWeight > 0 && !isExtrudeLayer}
      <g opacity={$designState.strokeOpacity / 100}>
      {#if hasStrokePixelized}
        <!-- LAYER 1: Wide blurred stroke + halftone dots = dotted halo fading at edges -->
        <g
          fill="none"
          stroke={strokeColorValue}
          stroke-width={outerStrokeWidth}
          stroke-linejoin="round"
          stroke-linecap="round"
          filter={`url(#${prefix}stroke-halo-blur)`}
          mask={`url(#${prefix}halftone-mask)`}
        >
          {#each transformedPaths as d}
            <path {d} />
          {/each}
        </g>

        <!-- LAYER 2: Solid stroke at normal weight (with optional blur on top) -->
        <g
          fill="none"
          stroke={strokeColorValue}
          stroke-width={$designState.strokeWeight}
          stroke-linejoin="round"
          stroke-linecap="round"
          filter={hasStrokeBlur ? `url(#${prefix}stroke-blur)` : undefined}
        >
          {#each transformedPaths as d}
            <path {d} />
          {/each}
        </g>
      {:else}
        <!-- Normal stroke (no pixelized) -->
        <g
          fill="none"
          stroke={strokeColorValue}
          stroke-width={$designState.strokeWeight}
          stroke-linejoin="round"
          stroke-linecap="round"
          filter={hasStrokeBlur ? `url(#${prefix}stroke-blur)` : hasStrokeRoughEdges ? `url(#${prefix}stroke-rough)` : undefined}
        >
          {#each transformedPaths as d}
            <path {d} />
          {/each}
        </g>
      {/if}
      </g>
    {/if}

    <!-- Fill layer (on top) -->
    {#each transformedPaths as d}
      <path
        {d}
        fill={layerFillColor ?? $designState.textColor}
        stroke={!isExtrudeLayer && $designState.fillWeight > 0 ? (layerFillColor ?? $designState.textColor) : 'none'}
        stroke-width={isExtrudeLayer ? 0 : $designState.fillWeight}
        stroke-linejoin="round"
        stroke-linecap="round"
        paint-order="stroke fill"
      />
    {/each}
  </g>
</svg>

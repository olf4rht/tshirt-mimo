import { writable, get } from 'svelte/store';

export type ActiveTab = 'design' | 'stamps' | 'draw';

export const activeTab = writable<ActiveTab>('design');

export const shirtSide = writable<'front' | 'back'>('front');

const defaultDesign = {
  fontIndex: 0,
  textColor: '#ffffff',
  shirtColor: '#1a1a1a',
  bend: 0,
  inflate: 0,
  stretch: 0,
  roughEdges: 0,
  strokeEnabled: true,
  strokeWeight: 0,
  strokeColor: '#ffffff',
  strokeBlur: 0,
  strokeGradientStart: '#ffffff',
  strokeGradientEnd: '#000000',
  strokeGradientEnabled: false,
  strokeRoughEdges: 0,
  strokePixelized: 0,
  strokeOpacity: 100,
  fillWeight: 0,
  designX: 50,
  designY: 36,
  designScale: 0.12,
  designVisible: true,
  // 3D
  threeDEnabled: false,
  extrudeDepth: 50,
  inflateDepth: 0,
  rotateX: 0,
  rotateY: 0,
  rotateZ: 0,
  extrudeColor: '',
  designZIndex: 1,
};

type DesignState = typeof defaultDesign;

// Stored snapshots for each side
let frontState: DesignState = { ...defaultDesign };
let backState: DesignState = { ...defaultDesign };

export const designState = writable<DesignState>({ ...frontState });

export function switchSide(side: 'front' | 'back') {
  const current = get(shirtSide);
  if (current === side) return;

  // Save current state to the side we're leaving
  const snapshot = get(designState);
  if (current === 'front') {
    frontState = { ...snapshot };
  } else {
    backState = { ...snapshot };
  }

  // Restore the side we're switching to, but keep shirtColor in sync
  const restored = side === 'front' ? { ...frontState } : { ...backState };
  restored.shirtColor = snapshot.shirtColor;
  // Also sync textColor based on shirt color
  restored.textColor = snapshot.textColor;

  designState.set(restored);
  shirtSide.set(side);
}

// Keep shirtColor in sync: when it changes on one side, update the other
designState.subscribe((state) => {
  const side = get(shirtSide);
  if (side === 'front') {
    frontState.shirtColor = state.shirtColor;
    backState.shirtColor = state.shirtColor;
  } else {
    frontState.shirtColor = state.shirtColor;
    backState.shirtColor = state.shirtColor;
  }
});

export const drawState = writable({
  brushSize: 4,
  brushColor: '#ffffff',
  clearTrigger: 0,
});

// Stamp library: reusable stamp assets uploaded by user
export interface StampAsset {
  id: string;
  src: string;
}

export const stampLibrary = writable<StampAsset[]>([
  { id: 'default-shakshouka', src: '/stamps/shakshouka_stamp.png' },
  { id: 'default-stamp-02', src: '/stamps/stamp_02.svg' },
]);

// Placed stamps: instances on the t-shirt (per side)
export interface PlacedStamp {
  id: string;
  assetId: string;
  src: string;
  x: number;
  y: number;
  scale: number;
  rotation: number;
  zIndex: number;
  side: 'front' | 'back';
}

export const allPlacedStamps = writable<PlacedStamp[]>([]);

// Derived-like: only stamps for the current side
// Components should use this for display, but write to allPlacedStamps
export const placedStamps = {
  subscribe: (fn: (value: PlacedStamp[]) => void) => {
    let unsub1: () => void;
    let unsub2: () => void;
    let currentSide = get(shirtSide);

    unsub2 = shirtSide.subscribe((s) => { currentSide = s; });

    unsub1 = allPlacedStamps.subscribe((all) => {
      fn(all.filter((s) => s.side === currentSide));
    });

    // Also re-filter when side changes
    const unsub3 = shirtSide.subscribe(() => {
      fn(get(allPlacedStamps).filter((s) => s.side === get(shirtSide)));
    });

    return () => { unsub1(); unsub2(); unsub3(); };
  },
  update: (fn: (list: PlacedStamp[]) => PlacedStamp[]) => {
    const side = get(shirtSide);
    allPlacedStamps.update((all) => {
      const otherSide = all.filter((s) => s.side !== side);
      const thisSide = all.filter((s) => s.side === side);
      return [...otherSide, ...fn(thisSide)];
    });
  },
  set: (value: PlacedStamp[]) => {
    const side = get(shirtSide);
    allPlacedStamps.update((all) => {
      const otherSide = all.filter((s) => s.side !== side);
      return [...otherSide, ...value];
    });
  },
};

// Currently selected stamp tool (asset id from library, null = no stamp active)
export const activeStampId = writable<string | null>(null);

// Stamp size slider value (maps to scale when placing)
export const stampSize = writable(50);

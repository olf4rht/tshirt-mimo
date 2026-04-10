import { writable } from 'svelte/store';

export type ActiveTab = 'design' | 'draw';

export const activeTab = writable<ActiveTab>('design');

export const designState = writable({
  fontIndex: 0,
  textColor: '#ffffff',
  shirtColor: '#1a1a1a',
  bend: 0,
  inflate: 0,
  stretch: 0,
  roughEdges: 0,
  strokeEnabled: false,
  strokeWeight: 2,
  strokeColor: '#ffffff',
  strokeBlur: 0,
  strokeGradientStart: '#ffffff',
  strokeGradientEnd: '#000000',
  strokeGradientEnabled: false,
  strokeRoughEdges: 0,
  strokePixelized: 0,
  designX: 50,
  designY: 35,
  designScale: 1,
});

export const drawState = writable({
  brushSize: 4,
  brushColor: '#ffffff',
});

export interface Stamp {
  id: string;
  src: string;
  x: number;
  y: number;
  scale: number;
}

export const stamps = writable<Stamp[]>([]);

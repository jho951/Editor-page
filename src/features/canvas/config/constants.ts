export const OVERLAY = Object.freeze({
  focusStroke: 'rgba(0, 0, 0, 0.1)',
  focusFill: '#ffffff',
  dash: [6, 4] as const,
  lineWidth: 1,
  handleSize: 8,
});

export function idToRGB(id: number): { r: number; g: number; b: number } {
  const i = id >>> 0;
  return {
    r: (i >> 16) & 255,
    g: (i >> 8) & 255,
    b: i & 255,
  };
}

export function rgbToId(r: number, g: number, b: number): number {
  return ((r << 16) | (g << 8) | b) >>> 0;
}

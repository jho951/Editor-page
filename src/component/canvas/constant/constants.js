const MIN_CSS = 16;
const RETRY_FRAMES = 30;
const DPR = () =>
    (typeof window !== 'undefined' && window.devicePixelRatio) || 1;
const MIN_SCALE = 0.2;
const MAX_SCALE = 8;

const idToRGB = (id) => ({
    r: (id >> 16) & 255,
    g: (id >> 8) & 255,
    b: id & 255,
});
const rgbToId = (r, g, b) => ((r << 16) | (g << 8) | b) >>> 0;

export { MAX_SCALE, MIN_CSS, MIN_SCALE, RETRY_FRAMES, DPR, idToRGB, rgbToId };

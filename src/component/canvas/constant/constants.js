const MIN_CSS = 16;
const RETRY_FRAMES = 30;
const DPR = () =>
    (typeof window !== 'undefined' && window.devicePixelRatio) || 1();
const MIN_SCALE = 0.2;
const MAX_SCALE = 8;

const idToRGB = (id) => ({
    r: (id >> 16) & 255,
    g: (id >> 8) & 255,
    b: id & 255,
});
const rgbToId = (r, g, b) => ((r << 16) | (g << 8) | b) >>> 0;

/**
 * Overlay 렌더링 상수: 스타일과 핸들 박스 크기 등을 한 군데에서 관리
 */
const OVERLAY = Object.freeze({
    focusStroke: 'rgba(0, 0, 0, 0.1)',
    focusFill: '#ffffff',
    dash: [6, 4],
    lineWidth: 1,
    handleSize: 8, // CSS 픽셀 기준(뷰 스케일 적용 전 좌표계)
});

export {
    MAX_SCALE,
    MIN_CSS,
    MIN_SCALE,
    RETRY_FRAMES,
    DPR,
    idToRGB,
    rgbToId,
    OVERLAY,
};

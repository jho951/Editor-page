import { MIN_CSS, DPR } from '../constant/constants';

/**
 * 캔버스 초기 설정
 * @param {*} canvas 3개의 캔버스 중 해당하는 캔버스 ref
 * @param {*} cssW   canvas의 css 너비
 * @param {*} cssH   canvas의 css 높이
 * @param {*} param3
 * @returns
 */
function setCanvasSize(
    canvas,
    cssW,
    cssH,
    { alpha = true, willRead = false } = {}
) {
    const dpr = DPR();
    const prevW = Number(canvas?.dataset?.cssw) || 0;
    const prevH = Number(canvas?.dataset?.cssh) || 0;
    let w = cssW,
        h = cssH;
    if (
        !Number.isFinite(w) ||
        !Number.isFinite(h) ||
        w < MIN_CSS ||
        h < MIN_CSS
    ) {
        if (prevW >= MIN_CSS && prevH >= MIN_CSS) {
            w = prevW;
            h = prevH;
        } else {
            w = Math.max(cssW || 0, MIN_CSS);
            h = Math.max(cssH || 0, MIN_CSS);
        }
    }
    canvas.width = Math.round(w * dpr);
    canvas.height = Math.round(h * dpr);
    canvas.style.width = w + 'px';
    canvas.style.height = h + 'px';
    canvas.dataset.cssw = String(w);
    canvas.dataset.cssh = String(h);
    const ctx = canvas.getContext('2d', {
        alpha,
        willReadFrequently: willRead,
    });
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    return { ctx, w, h, dpr };
}

export { setCanvasSize };

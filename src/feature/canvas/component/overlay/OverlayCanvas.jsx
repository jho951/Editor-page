import { forwardRef, useEffect } from 'react';

/** 안전한 canvas 사이즈 세터 (DPR 대응 + dataset 기록) */
function setCanvasSize(canvas, cssW, cssH, { alpha = true } = {}) {
    const dpr = (typeof window !== 'undefined' && window.devicePixelRatio) || 1;
    const w = Math.max(1, Math.floor(cssW * dpr));
    const h = Math.max(1, Math.floor(cssH * dpr));
    if (canvas.width !== w || canvas.height !== h) {
        canvas.width = w;
        canvas.height = h;
    }
    canvas.style.width = `${Math.max(1, Math.floor(cssW))}px`;
    canvas.style.height = `${Math.max(1, Math.floor(cssH))}px`;
    canvas.dataset.cssw = String(cssW);
    canvas.dataset.cssh = String(cssH);
    return canvas.getContext('2d', { alpha });
}

/**
 * 오버레이 레이어: 포커스 박스/핸들/가이드 등 인터랙션 전용
 * props:
 *  - width, height: CSS px
 *  - focusedShape: 현재 포커스된 도형 (없으면 null)
 *  - view: { scale, tx, ty }
 *  - renderOverlay: (ctx, focusedShape, view) => void  ← 프로젝트 기존 렌더러 주입
 */
const OverlayCanvas = forwardRef(function OverlayCanvas(
    { width, height, focusedShape, view, renderOverlay },
    ref
) {
    useEffect(() => {
        if (!ref?.current || width <= 0 || height <= 0) return;
        const ctx = setCanvasSize(ref.current, width, height, { alpha: true });
        // 클리어 + 렌더
        ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
        renderOverlay?.(ctx, focusedShape, view);
    }, [width, height, focusedShape, view, renderOverlay, ref]);

    return <canvas ref={ref} className="layer-overlay" />;
});

export { OverlayCanvas };

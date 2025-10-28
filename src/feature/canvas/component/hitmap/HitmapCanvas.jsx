import { forwardRef, useEffect } from 'react';
import { setCanvasSize } from '../../util/setup';
import { renderHitmap } from '../../service/render-hitmap';

/**
 * 히트맵 레이어: RGB pick-buffer 렌더 전용 (비가시, pointer-events: none)
 * props:
 *  - width, height: CSS px 단위
 *  - shapes: 렌더 대상 도형 배열
 *  - view: { scale, tx, ty }
 *  - renderHitmap: (ctx, shapes, view) => void   ← 프로젝트 기존 렌더러 주입
 */
const HitmapCanvas = forwardRef(function HitmapCanvas(
    { width, height, shapes, view },
    ref
) {
    useEffect(() => {
        if (!ref?.current || width <= 0 || height <= 0) return;
        setCanvasSize(ref.current, width, height, {
            alpha: false,
            willRead: true,
        });
        const ctx = ref.current.getContext('2d');
        ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
        renderHitmap?.(ctx, shapes, view);
    }, [width, height, shapes, view, ref]);

    return <canvas ref={ref} className="layer-hitmap" />;
});

export default HitmapCanvas;

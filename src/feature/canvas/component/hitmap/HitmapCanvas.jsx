import { forwardRef, useEffect } from 'react';
import { setCanvasSize } from '@/feature/canvas/util/setup';
import { renderHitmap } from '../../service/render-hitmap';

const HitmapCanvas = forwardRef(function HitmapCanvas(
    { width, height, shapes, view },
    ref
) {
    useEffect(() => {
        if (!ref?.current || width <= 0 || height <= 0) return;
        setCanvasSize(ref.current, width, height, {
            alpha: true,
            willRead: true,
        });
        const ctx = ref.current.getContext('2d');
        renderHitmap(ctx, shapes, view);
    }, [width, height, shapes, view, ref]);

    return <canvas ref={ref} className="layer-hitmap" aria-hidden />;
});

export default HitmapCanvas;

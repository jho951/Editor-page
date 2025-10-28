import { forwardRef, useEffect } from 'react';
import { setCanvasSize } from '@/feature/canvas/util/setup';
import { renderVector } from '../../service/render-vector';

const VectorCanvas = forwardRef(function VectorCanvas(
    { width, height, shapes, view, editingId },
    ref
) {
    useEffect(() => {
        if (!ref?.current || width <= 0 || height <= 0) return;
        setCanvasSize(ref.current, width, height, { alpha: true });

        const ctx = ref.current.getContext('2d');
        renderVector(ctx, shapes, view, { editingId });
    }, [width, height, shapes, view, editingId, ref]);

    return <canvas ref={ref} className="layer-vector" />;
});

export { VectorCanvas };

/**
 * @file useOverlay.js
 * @description 오버레이(가벼운 프리뷰/가이드) 훅 - Redux(uiSlice/styleSlice) 직접 사용
 */
import { useRef, useState, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { ShapeMap } from '@/feature';
import { add as addShape } from '@/redux/slice/shapeSlice';
import { getCanvasPosition } from '@/util/canvas-helper';
import { getOverlayDesign } from '@/util/overlay-helper';
import { selectTool } from '@/redux/slice/uiSlice';
import { selectEffectiveStyle } from '@/redux/slice/styleSlice';

function useOverlay(canvasRef, overlayCtxRef) {
    const dispatch = useDispatch();
    const toolKey = useSelector(selectTool);
    const style = useSelector(selectEffectiveStyle);

    const [isPreview, setIsPreview] = useState(false);
    const stateRef = useRef({ key: null, shape: null });

    const getStyle = () => ({
        strokeColor: style?.stroke?.color ?? '#000',
        strokeWidth: Number(style?.stroke?.width ?? 2),
        strokeOpacity: Number(style?.stroke?.opacity ?? 1),
        fillColor:
            (style?.fill?.opacity ?? 0) > 0 ? style?.fill?.color : undefined,
        fillOpacity: Number(style?.fill?.opacity ?? 0),
        spikes: style?.star?.spikes ?? 5,
        innerRatio: style?.star?.innerRatio ?? 0.5,
        sides: style?.polygon?.sides ?? 6,
    });

    const beginShape = useCallback(
        (p) => {
            const Impl = ShapeMap[toolKey];
            if (!Impl) return;
            stateRef.current.key = toolKey;
            stateRef.current.shape = {};
            Impl.begin(stateRef.current.shape, p, getStyle());
            setIsPreview(true);
        },
        [toolKey, style]
    );

    const onPointerDown = useCallback(
        (e) => {
            const canvas = canvasRef.current;
            const ctx = overlayCtxRef.current;
            if (!canvas || !ctx) return;
            if (e.pointerType === 'mouse' && e.button !== 0) return;
            if (e.cancelable) e.preventDefault();
            e.currentTarget.setPointerCapture?.(e.pointerId);

            const p = getCanvasPosition(canvas, e);
            beginShape(p);
        },
        [beginShape, canvasRef, overlayCtxRef]
    );

    const onPointerMove = useCallback(
        (e) => {
            const canvas = canvasRef.current;
            const ctx = overlayCtxRef.current;
            if (!canvas || !ctx || !stateRef.current.key) return;
            if (e.cancelable) e.preventDefault();

            const Impl = ShapeMap[stateRef.current.key];
            if (!Impl?.update || !Impl?.preview) return;

            const p = getCanvasPosition(canvas, e);
            Impl.update(stateRef.current.shape, p);

            // 점선 프리뷰
            ctx.save();
            ctx.setTransform(1, 0, 0, 1, 0, 0);
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.restore();

            getOverlayDesign(overlayCtxRef, () => {
                Impl.preview(ctx, stateRef.current.shape);
            });
        },
        [canvasRef, overlayCtxRef]
    );

    const onPointerUp = useCallback(
        (e) => {
            const canvas = canvasRef.current;
            const ctx = overlayCtxRef.current;
            if (!canvas || !ctx || !stateRef.current.key) return;
            if (e.cancelable) e.preventDefault();
            e.currentTarget.releasePointerCapture?.(e.pointerId);

            const Impl = ShapeMap[stateRef.current.key];
            if (!Impl?.end) return;

            const item = Impl.end(stateRef.current.shape);
            if (item) dispatch(addShape(item));

            ctx.save();
            ctx.setTransform(1, 0, 0, 1, 0, 0);
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.restore();

            setIsPreview(false);
            stateRef.current.key = null;
            stateRef.current.shape = null;
        },
        [dispatch, canvasRef, overlayCtxRef]
    );

    return { onPointerDown, onPointerMove, onPointerUp, isPreview };
}

export { useOverlay };

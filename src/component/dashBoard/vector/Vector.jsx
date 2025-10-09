/**
 * @file Vector.jsx
 * @description 벡터 캔버스 (상태 기반 재그리기 전용)
 */
import { useLayoutEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import { setupCanvas } from '../../../util/canvas-helper';
import { selectVectorItems } from '../../../redux/slice/shapeSlice';
import { renderScene } from '../../../util/vector-helper';

export default function Vector({ canvasRef, onReady }) {
    const teardownRef = useRef(null);
    const ctxRef = useRef(null);
    const items = useSelector(selectVectorItems);
    const itemsRef = useRef(items);

    // 최신 items 보관 + 재그리기
    useLayoutEffect(() => {
        itemsRef.current = items;
        const ctx = ctxRef.current;
        if (ctx) renderScene(ctx, itemsRef.current);
    }, [items]);

    useLayoutEffect(() => {
        if (!canvasRef?.current) return;
        const canvas = canvasRef.current;
        const host = canvas.parentElement;

        const { ctx, teardown } = setupCanvas(canvas, {
            smoothing: true,
            preserve: false,
            maxDpr: 3,
            observeTarget: host,
            onResize: (ctx2d) => {
                requestAnimationFrame(() =>
                    renderScene(ctx2d, itemsRef.current)
                );
            },
        });

        ctxRef.current = ctx;
        teardownRef.current = teardown;
        onReady?.(ctx);

        // 첫 렌더
        renderScene(ctx, itemsRef.current);

        return () => teardownRef.current?.();
    }, [canvasRef, onReady]);

    return <canvas className="vector" ref={canvasRef} />;
}

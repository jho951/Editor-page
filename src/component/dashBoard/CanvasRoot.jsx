import { useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import {
    drawCanvasResizeKnob,
    drawCanvasResizeHitbox,
} from '../../util/resize';
import CanvasResizeOverlay from './/Overlay';

export default function CanvasRoot() {
    const canvasRef = useRef(null);
    const hitmapRef = useRef(null);
    const { width, height, grid } = useSelector((s) => s.canvas);

    useEffect(() => {
        // DPR 세팅 (예시)
        const dpr = window.devicePixelRatio || 1;

        // view
        {
            const c = canvasRef.current,
                ctx = c.getContext('2d');
            c.width = Math.round(width * dpr);
            c.height = Math.round(height * dpr);
            c.style.width = width + 'px';
            c.style.height = height + 'px';
            ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
            // 1) 당신의 기존 도형/레이어 렌더 호출
            // drawShapes(ctx, ...);

            // 2) 우하단 리사이즈 핸들(보이는 것)
            drawCanvasResizeKnob(ctx, width, height);
        }

        // hitmap
        {
            const c = hitmapRef.current,
                hctx = c.getContext('2d');
            c.width = Math.round(width * dpr);
            c.height = Math.round(height * dpr);
            c.style.width = width + 'px';
            c.style.height = height + 'px';
            hctx.setTransform(dpr, 0, 0, dpr, 0, 0);
            hctx.imageSmoothingEnabled = false;

            // 1) 당신의 기존 히트맵 렌더 호출
            // drawShapesHit(hctx, ...);

            // 2) 우하단 리사이즈 핸들(히트맵용)
            drawCanvasResizeHitbox(hctx, width, height);
        }
    }, [width, height /*, shapes 등*/]);

    return (
        <div style={{ position: 'relative', width, height }}>
            <canvas ref={canvasRef} />
            <canvas ref={hitmapRef} style={{ display: 'none' }} />
            {/* 드래그 중 점선 프리뷰 전용 오버레이 */}
            <CanvasResizeOverlay
                width={width}
                height={height}
                grid={grid}
                hitmapCanvasRef={hitmapRef}
            />
        </div>
    );
}

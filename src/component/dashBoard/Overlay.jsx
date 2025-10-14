import { useEffect, useRef } from 'react';
import { useDispatch } from 'react-redux';
import { CANVAS_RESIZE as CR } from '../../constant/resize';
import { drawResizePreview } from '../../util/resize';
import { setSize as setCanvasSize } from '../../redux/slice/canvasSlice';

export default function CanvasResizeOverlay({
    width,
    height,
    hitmapCanvasRef, // 히트맵 캔버스 ref (1px 샘플을 위해)
    grid, // { enabled, size } from canvasSlice
}) {
    const overlayRef = useRef(null);
    const dispatch = useDispatch();
    const stateRef = useRef({
        mode: null,
        start: null,
        startSize: { w: width, h: height },
        nextSize: { w: width, h: height },
    });

    // DPR 세팅
    useEffect(() => {
        const canvas = overlayRef.current;
        const dpr = window.devicePixelRatio || 1;
        canvas.width = Math.round(width * dpr);
        canvas.height = Math.round(height * dpr);
        canvas.style.width = width + 'px';
        canvas.style.height = height + 'px';
        const ctx = canvas.getContext('2d');
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        // 사이즈 바뀌면 프리뷰 초기화
        ctx.clearRect(0, 0, width, height);
    }, [width, height]);

    function localXY(evt) {
        const r = overlayRef.current.getBoundingClientRect();
        return { x: evt.clientX - r.left, y: evt.clientY - r.top };
    }

    function isOnResizeHandle(evt) {
        const { x, y } = localXY(evt);
        // 히트맵 1픽셀 읽기
        const hctx = hitmapCanvasRef.current.getContext('2d');
        const px = hctx.getImageData(Math.floor(x), Math.floor(y), 1, 1).data;
        const [r, g, b] = CR.COLOR;
        return px[0] === r && px[1] === g && px[2] === b;
    }

    function snapSize(w, h) {
        let W = Math.max(CR.MIN_W, Math.floor(w));
        let H = Math.max(CR.MIN_H, Math.floor(h));
        if (grid?.enabled && grid?.size > 1) {
            const gs = Math.max(2, Number(grid.size));
            W = Math.max(CR.MIN_W, Math.round(W / gs) * gs);
            H = Math.max(CR.MIN_H, Math.round(H / gs) * gs);
        }
        return { w: W, h: H };
    }

    function onPointerDown(evt) {
        if (!isOnResizeHandle(evt)) return;
        const st = stateRef.current;
        st.mode = 'canvas-resize';
        st.start = localXY(evt);
        st.startSize = { w: width, h: height };
        st.nextSize = { w: width, h: height };
        overlayRef.current.setPointerCapture(evt.pointerId);
        evt.preventDefault();
        evt.stopPropagation();
    }

    function onPointerMove(evt) {
        const st = stateRef.current;
        if (st.mode !== 'canvas-resize') return;
        const cur = localXY(evt);
        const dx = cur.x - st.start.x;
        const dy = cur.y - st.start.y;
        const next = snapSize(st.startSize.w + dx, st.startSize.h + dy);
        st.nextSize = next;

        // 점선 프리뷰
        const octx = overlayRef.current.getContext('2d');
        drawResizePreview(octx, next.w, next.h);
        evt.preventDefault();
        evt.stopPropagation();
    }

    function onPointerUp(evt) {
        const st = stateRef.current;
        if (st.mode !== 'canvas-resize') return;
        overlayRef.current.releasePointerCapture(evt.pointerId);

        // 프리뷰 지우기
        const octx = overlayRef.current.getContext('2d');
        octx.clearRect(0, 0, octx.canvas.width, octx.canvas.height);

        // 실제 반영 (내용은 스케일하지 않고 "캔버스"만 키움/줄임)
        dispatch(
            setCanvasSize({ width: st.nextSize.w, height: st.nextSize.h })
        ); // :contentReference[oaicite:4]{index=4}

        st.mode = null;
        evt.preventDefault();
        evt.stopPropagation();
    }

    return (
        <canvas
            ref={overlayRef}
            style={{ position: 'absolute', inset: 0, pointerEvents: 'auto' }}
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={onPointerUp}
        />
    );
}

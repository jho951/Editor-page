import { useEffect, useRef, useState } from 'react';
import { setup } from './util/setup';

export default function CanvasStage() {
    const wrapRef = useRef(null);
    const vectorRef = useRef(null);
    const hitmapRef = useRef(null);
    const overlayRef = useRef(null);

    const [size, setSize] = useState({ w: 16, h: 16 });

    // 안정 사이즈 관찰: 1px/0px 측정값 무시하고 마지막 정상값 유지
    useEffect(() => {
        const el = wrapRef.current;
        if (!el) return;
        const last = { w: 16, h: 16 };
        const measure = () => {
            const r = el.getBoundingClientRect();
            const w = Math.round(r.width);
            const h = Math.round(r.height);
            if (w >= 16 && h >= 16) {
                last.w = w;
                last.h = h;
                setSize({ w, h });
            } else {
                setSize({ w: last.w, h: last.h });
            }
        };
        measure();
        const ro = new ResizeObserver(measure);
        ro.observe(el);
        const onVis = () => measure();
        document.addEventListener('visibilitychange', onVis);
        return () => {
            ro.disconnect();
            document.removeEventListener('visibilitychange', onVis);
        };
    }, []);

    // 각 레이어 DPR 세팅
    useEffect(() => {
        if (vectorRef.current)
            setup(vectorRef.current, size.w, size.h, { alpha: true });
        if (hitmapRef.current)
            setup(hitmapRef.current, size.w, size.h, {
                alpha: false,
                willReadFrequently: true,
            });
        if (overlayRef.current)
            setup(overlayRef.current, size.w, size.h, { alpha: true });
        const v = vectorRef.current?.getContext('2d');
        v &&
            v.clearRect(
                0,
                0,
                vectorRef.current.width,
                vectorRef.current.height
            );
        const h = hitmapRef.current?.getContext('2d');
        h &&
            h.clearRect(
                0,
                0,
                hitmapRef.current.width,
                hitmapRef.current.height
            );
        const o = overlayRef.current?.getContext('2d');
        o &&
            o.clearRect(
                0,
                0,
                overlayRef.current.width,
                overlayRef.current.height
            );
    }, [size.w, size.h]);

    // ── 여기부터 너가 실제 로직/훅을 붙이면 됨 ──
    // 예: renderVector(ctx, shapes), drawPickBuffer(ctx, shapes),
    //     overlay 이벤트(onDoubleClick, onMouseDown/Move/Up) 등.

    return (
        <div className="canvas-stage-wrap" ref={wrapRef}>
            <canvas ref={vectorRef} className="layer-vector" />
            <canvas ref={hitmapRef} className="layer-hitmap" />
            <canvas ref={overlayRef} className="layer-overlay" />
        </div>
    );
}

import { useCallback, useEffect, useRef, useState } from 'react';
import { useSelector } from 'react-redux';

import { VectorCanvas } from '@/feature/canvas/component/vector/VectorCanvas';
import HitmapCanvas from '@/feature/canvas/component/hitmap/HitmapCanvas';
import OverlayCanvas from '@/feature/canvas/component/overlay/OverlayCanvas';

import { pickIdAt } from '@/feature/canvas/util/picking';
import styles from './Canvas.module.css';
import { selectViewport } from '@/feature/viewport/state/viewport.selector';

function CanvasStage() {
    const shapes = useSelector((s) => s.canvas.items);
    const focusId = useSelector((s) => s.canvas.focusId);
    const tool = useSelector((s) => s.canvas.tool);

    const rawView = useSelector(selectViewport);
    const view = rawView ?? { scale: 1, tx: 0, ty: 0 };

    const wrapRef = useRef(null);
    const vecRef = useRef(null);
    const hitRef = useRef(null);
    const ovRef = useRef(null);

    const [size, setSize] = useState({ w: 0, h: 0 });

    const measure = useCallback(() => {
        const el = wrapRef.current;
        if (!el) return;
        const rect = el.getBoundingClientRect();
        const w = Math.max(1, Math.floor(rect.width));
        const h = Math.max(1, Math.floor(rect.height));
        setSize((prev) => (prev.w === w && prev.h === h ? prev : { w, h }));
    }, []);

    useEffect(() => {
        const ro = new ResizeObserver(measure);
        if (wrapRef.current) ro.observe(wrapRef.current);
        measure();
        return () => ro.disconnect();
    }, [measure]);

    const getPickId = useCallback((clientX, clientY) => {
        return pickIdAt(hitRef.current, clientX, clientY);
    }, []);

    return (
        <main className={styles.stage} tabIndex={0}>
            <div className={styles.wrap} ref={wrapRef}>
                <VectorCanvas
                    ref={vecRef}
                    width={size.w}
                    height={size.h}
                    shapes={shapes}
                    view={view}
                />
                <HitmapCanvas
                    ref={hitRef}
                    width={size.w}
                    height={size.h}
                    shapes={shapes}
                    view={view}
                />
                <OverlayCanvas
                    ref={ovRef}
                    width={size.w}
                    height={size.h}
                    view={view}
                    getPickId={getPickId}
                    tool={tool}
                    focusedId={focusId}
                />
            </div>
        </main>
    );
}

export { CanvasStage };

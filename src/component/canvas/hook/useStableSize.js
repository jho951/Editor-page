import { useEffect, useRef, useState } from 'react';
import { MIN_CSS, RETRY_FRAMES } from '../constant/constants';

function useStableSize(wrapRef, init = { w: 640, h: 420 }) {
    const lastGood = useRef(init);
    const [size, setSize] = useState(init);

    useEffect(() => {
        const el = wrapRef.current;
        if (!el) return;
        let raf = null,
            frames = 0;

        const measure = () => {
            const r = el.getBoundingClientRect();
            const w = Math.round(r.width),
                h = Math.round(r.height);
            if (w >= MIN_CSS && h >= MIN_CSS) {
                lastGood.current = { w, h };
                setSize({ w, h });
                return true;
            }
            setSize({ ...lastGood.current });
            return false;
        };

        const tick = () => {
            frames += 1;
            measure();
            if (frames < RETRY_FRAMES) raf = requestAnimationFrame(tick);
        };
        tick();

        const ro = new ResizeObserver(() => measure());
        ro.observe(el);
        let io = null;
        if ('IntersectionObserver' in window) {
            io = new IntersectionObserver(() => measure(), {
                threshold: [0, 0.01, 1],
            });
            io.observe(el);
        }
        const onVis = () => measure();
        document.addEventListener('visibilitychange', onVis);

        return () => {
            cancelAnimationFrame(raf);
            ro.disconnect();
            io && io.disconnect();
            document.removeEventListener('visibilitychange', onVis);
        };
    }, [wrapRef]);

    return { size, lastGood };
}

export { useStableSize };

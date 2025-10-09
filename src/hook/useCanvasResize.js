/**
 * @file useCanvasReszie.js
 * @author YJH
 */
import { useEffect, useRef, useState } from 'react';

function useCanvasResize(initialSize) {
    const [size, setSize] = useState(initialSize);
    const containerRef = useRef(null);

    const isResizingRef = useRef(false);
    const startXRef = useRef(0);
    const startYRef = useRef(0);
    const startWRef = useRef(0);
    const startHRef = useRef(0);

    useEffect(() => {
        const container = containerRef.current;
        if (!container) return;

        const handle = container.querySelector('.resize-handle');
        if (!handle) return;

        const onMouseDown = (e) => {
            isResizingRef.current = true;
            startXRef.current = e.clientX;
            startYRef.current = e.clientY;
            startWRef.current = container.clientWidth;
            startHRef.current = container.clientHeight;

            window.addEventListener('mousemove', onMouseMove);
            window.addEventListener('mouseup', onMouseUp);
        };

        const onMouseMove = (e) => {
            if (!isResizingRef.current) return;
            const newWidth = Math.max(
                100,
                startWRef.current + (e.clientX - startXRef.current)
            );
            const newHeight = Math.max(
                100,
                startHRef.current + (e.clientY - startYRef.current)
            );
            setSize({ width: newWidth, height: newHeight });
        };

        const onMouseUp = () => {
            isResizingRef.current = false;
            window.removeEventListener('mousemove', onMouseMove);
            window.removeEventListener('mouseup', onMouseUp);
        };

        handle.addEventListener('mousedown', onMouseDown);

        return () => {
            handle.removeEventListener('mousedown', onMouseDown);
            window.removeEventListener('mousemove', onMouseMove);
            window.removeEventListener('mouseup', onMouseUp);
        };
    }, []);

    return { size, containerRef };
}

export default useCanvasResize;

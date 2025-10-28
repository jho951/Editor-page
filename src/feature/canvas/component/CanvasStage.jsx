import { useCallback, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { VectorCanvas } from '@/feature/canvas/component/vector/VectorCanvas';
import { HitmapCanvas } from '@/feature/canvas/component/hitmap/HitmapCanvas';
import { OverlayCanvas } from '@/feature/canvas/component/overlay/OverlayCanvas';

import { renderVector } from '@/feature/canvas/service/render-vector';
import { renderHitmap } from '@/feature/canvas/service/render-hitmap';
import { renderOverlay } from '@/feature/canvas/service/render-overlay';

import { pickIdAt } from '@/feature/canvas/util/picking';
import { setCanvasSize } from '@/feature/canvas/util/setup';

import {
    setFocus,
    clearFocus,
    moveShape,
    resizeShape,
    updateText,
    addShape,
    deleteFocused,
    undo,
    redo,
} from '@/feature/canvas/state/canvas.slice';

import styles from './Canvas.module.css';
import { selectViewport } from '@/feature/viewport/state/viewport.selector';

/**
 * 3-레이어 구조:
 * 1) Vector: 완성 도형 렌더 (pointer-events:none)
 * 2) Hitmap: RGB 픽 버퍼 (비가시, pointer-events:none)
 * 3) Overlay: 핸들/마키/가이드 및 모든 상호작용 (pointer-events:auto)
 */
function CanvasStage() {
    const dispatch = useDispatch();

    // Store states
    const shapes = useSelector((s) => s.canvas.items);
    const focusId = useSelector((s) => s.canvas.focusId);
    const tool = useSelector((s) => s.canvas.tool);
    const rawView = useSelector(selectViewport);
    const view = rawView ?? { scale: 1, tx: 0, ty: 0 };

    // DOM refs
    const wrapRef = useRef(null);
    const vecRef = useRef(null);
    const hitRef = useRef(null);
    const ovRef = useRef(null);

    // Resize (DPR + CSS size 동기화)
    const doResize = useCallback(() => {
        const wrap = wrapRef.current;
        if (!wrap) return;
        const rect = wrap.getBoundingClientRect();

        setCanvasSize(vecRef.current, rect.width, rect.height);
        setCanvasSize(hitRef.current, rect.width, rect.height);
        setCanvasSize(ovRef.current, rect.width, rect.height);

        const ctxV = vecRef.current?.getContext('2d');
        const ctxH = hitRef.current?.getContext('2d');
        const ctxO = ovRef.current?.getContext('2d');

        if (ctxV) renderVector(ctxV, shapes, view);
        if (ctxH) renderHitmap(ctxH, shapes, view);
        if (ctxO) {
            const focused = Array.isArray(shapes)
                ? shapes.find((s) => s.id === focusId) || null
                : null;
            renderOverlay(ctxO, focused, view);
        }
    }, [shapes, view, focusId]);

    useEffect(() => {
        const ro = new ResizeObserver(doResize);
        if (wrapRef.current) ro.observe(wrapRef.current);
        doResize();
        return () => ro.disconnect();
    }, [doResize]);

    // Rerender on state change
    useEffect(() => {
        const ctx = vecRef.current?.getContext('2d');
        if (ctx) renderVector(ctx, shapes, view);
    }, [shapes, view]);

    useEffect(() => {
        const ctx = hitRef.current?.getContext('2d');
        if (ctx) renderHitmap(ctx, shapes, view);
    }, [shapes, view]);

    useEffect(() => {
        const ctx = ovRef.current?.getContext('2d');
        if (!ctx) return;
        const focused = Array.isArray(shapes)
            ? shapes.find((s) => s.id === focusId) || null
            : null;
        renderOverlay(ctx, focused, view);
    }, [focusId, shapes, view]);

    // Pointer events (Overlay에서만 처리)
    const onPointerDown = useCallback(
        (evt) => {
            const id = pickIdAt(hitRef.current, evt.clientX, evt.clientY);
            if (tool === 'select') {
                if (id) dispatch(setFocus(id));
                else dispatch(clearFocus());
            }
            // 드래그/리사이즈/팬/프리드로우 등은 필요 시 여기서 상태 세팅
        },
        [dispatch, tool]
    );

    const onPointerMove = useCallback(
        (evt) => {
            // 드래그/리사이즈/가이드 업데이트 로직 연결 지점
            // 예시)
            // if (dragging) dispatch(moveShape({ id: focusId, dx, dy }));
        },
        [dispatch]
    );

    const onPointerUp = useCallback(() => {
        // 드래그 종료/커밋 처리
    }, []);

    // 키보드 단축키 예시(undo/redo)
    const onKeyDown = useCallback(
        (evt) => {
            if ((evt.metaKey || evt.ctrlKey) && evt.key.toLowerCase() === 'z') {
                evt.preventDefault();
                if (evt.shiftKey) dispatch(redo());
                else dispatch(undo());
            }
        },
        [dispatch]
    );

    return (
        <main className={styles.stage} onKeyDown={onKeyDown} tabIndex={0}>
            <div className={styles.wrap} ref={wrapRef}>
                <VectorCanvas
                    ref={vecRef}
                    className="layer-vector"
                    aria-hidden
                />
                <HitmapCanvas
                    ref={hitRef}
                    className="layer-hitmap"
                    aria-hidden
                />
                <OverlayCanvas
                    ref={ovRef}
                    className="layer-overlay"
                    onPointerDown={onPointerDown}
                    onPointerMove={onPointerMove}
                    onPointerUp={onPointerUp}
                />
            </div>
        </main>
    );
}

export { CanvasStage };

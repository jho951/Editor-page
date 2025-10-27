import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
    setFocus,
    clearFocus,
    addShape,
    moveShape,
    resizeShape,
    deleteFocused,
    updateText,
    historyStart,
    redo,
    undo,
} from '../../../lib/redux/slice/canvasSlice';
import { setTool, setView } from '../../../lib/redux/slice/uiSlice';

import { TextEditorOverlay } from './TextEditorOverlay';
import { useStableSize } from '../hook/useStableSize';
import { setCanvasSize } from '../../../features/canvas/util/setup';
import { DPR } from '../constant/constants';
import { renderVector } from '../util/vector';
import { renderHitmap } from '../util/hitmap';
import { renderOverlay } from '../util/overlay';
import { useCanvasHotkeys } from '../hook/useCanvasHotkeys';
import { useStageInteractions } from '../hook/useStageInteractions';
import styles from '../style/Canvas.module.css';
import PolygonTool from '../../../Polygon';

let __pick = 1000;
const nextPickId = () => ++__pick;

function Canvas() {
    const dispatch = useDispatch();

    const view = useSelector((s) => s.ui.view);
    const tool = useSelector((s) => s.ui.tool);
    const shapes = useSelector((s) => s.canvas.shapes);
    const focusId = useSelector((s) => s.canvas.focusId);
    const canvasBg = useSelector((s) => s.ui.canvasBg);

    const starPoints = useSelector((s) => s.ui.starPoints);
    const polygonSides = useSelector((s) => s.ui.polygonSides);
    const starInnerRatio = useSelector((s) => s.ui.starInnerRatio);

    const ovRef = useRef(null);
    const vecRef = useRef(null);
    const hitRef = useRef(null);
    const textRef = useRef(null);
    const wrapRef = useRef(null);

    const viewRef = useRef({ scale: 1, tx: 0, ty: 0 });
    const toolRef = useRef(tool);
    const focusRef = useRef(focusId);
    const shapesRef = useRef(shapes);
    const editingRef = useRef(false);
    const editingIdRef = useRef(null);

    const [editingId, setEditingId] = useState(null);
    const { size } = useStableSize(wrapRef, { w: 640, h: 420 });

    useEffect(() => {
        shapesRef.current = shapes;
    }, [shapes]);

    useEffect(() => {
        focusRef.current = focusId;
    }, [focusId]);

    useEffect(() => {
        toolRef.current = tool;
    }, [tool, polygonSides, starPoints, starInnerRatio]);

    useEffect(() => {
        if (!view) return;
        viewRef.current = { ...viewRef.current, ...view };
        requestAnimationFrame(renderAllOnce);
    }, [view]);

    function renderAllOnce() {
        try {
            const vctx = vecRef.current?.getContext('2d');
            const hctx = hitRef.current?.getContext('2d');
            const octx = ovRef.current?.getContext('2d');

            if (vctx)
                renderVector(vctx, shapesRef.current, viewRef.current, {
                    editingId: editingIdRef.current,
                });
            if (hctx) renderHitmap(hctx, shapesRef.current, viewRef.current);
            if (octx) {
                const fid = focusRef.current;
                const f = shapesRef.current.find((s) => s.id === fid);
                renderOverlay(octx, f, viewRef.current);
            }
        } catch (e) {
            console.error(e);
        }
    }

    useEffect(() => {
        renderAllOnce();
    }, [shapes, focusId]);

    useCanvasHotkeys({
        dispatch,
        focusRef,
        editingRef,
        actions: { historyStart, deleteFocused, undo, redo },
    });

    const beginTextEdit = useCallback((shape) => {
        setEditingId(shape.id);
        editingRef.current = true;
        requestAnimationFrame(renderAllOnce);
    }, []);

    const endTextEdit = useCallback(
        (commit = true) => {
            const id = editingIdRef.current ?? editingId;
            const val = textRef.current?.value ?? '';
            if (commit && id != null) {
                dispatch(historyStart());
                dispatch(updateText({ id, text: val }));
            }
            editingRef.current = false;
            editingIdRef.current = null;
            setEditingId(null);
            requestAnimationFrame(() => requestAnimationFrame(renderAllOnce));
        },
        [dispatch, editingId]
    );

    useEffect(() => {
        if (editingId != null && focusId !== editingId) {
            endTextEdit(true);
        }
    }, [editingId, focusId, endTextEdit]);

    useEffect(() => {
        editingIdRef.current = editingId;
    }, [editingId]);

    const editingShape = useMemo(
        () => shapes.find((v) => v.id === editingId) || null,
        [shapes, editingId]
    );

    useStageInteractions({
        ovRef,
        hitRef,
        viewRef,
        toolRef,
        shapesRef,
        focusRef,
        polygonSides,
        starPoints,
        starInnerRatio,
        dispatch,
        actions: {
            setView,
            setTool,
            setFocus,
            clearFocus,
            historyStart,
            addShape,
            moveShape,
            resizeShape,
        },
        beginTextEdit,
    });

    useEffect(() => {
        const { w, h } = size;
        if (!vecRef.current || !hitRef.current || !ovRef.current) return;
        setCanvasSize(vecRef.current, w, h, { alpha: true });
        setCanvasSize(hitRef.current, w, h, {
            alpha: false,
            willRead: true,
        });
        setCanvasSize(ovRef.current, w, h, { alpha: true });
        requestAnimationFrame(renderAllOnce);
    }, [size.w, size.h, size]);

    return (
        <div className={styles.wrap}>
            <div
                className="canvas-stage-wrap fill-viewport"
                ref={wrapRef}
                style={{ background: canvasBg }}
            >
                <canvas ref={vecRef} className="layer-vector" />
                <canvas ref={hitRef} className="layer-hitmap" />
                <canvas ref={ovRef} className="layer-overlay" />

                {editingId != null && editingShape && (
                    <TextEditorOverlay
                        shape={editingShape}
                        view={viewRef.current}
                        textareaRef={textRef}
                        onCommit={(text) => {
                            dispatch(historyStart());
                            dispatch(updateText({ id: editingId, text }));
                            endTextEdit(false);
                        }}
                        onCancel={() => endTextEdit(false)}
                    />
                )}

                {/* 자유다각형: tool === 'polygon'일 때만 최상단 오버레이로 활성화 */}
                {tool === 'polygon' && size.w > 0 && size.h > 0 && (
                    <PolygonTool
                        width={size.w}
                        height={size.h}
                        view={viewRef.current}
                        onCommit={(pts) => {
                            const id =
                                (crypto.randomUUID && crypto.randomUUID()) ||
                                String(Date.now());
                            const pickId = nextPickId(); // ← 당신의 pickId 할당 유틸로 교체 가능
                            dispatch(historyStart());
                            dispatch(
                                addShape({
                                    id,
                                    type: 'polygon',
                                    points: pts, // 자유다각형 좌표
                                    stroke: '#333',
                                    strokeWidth: 2,
                                    fill: '#fff',
                                    pickId,
                                })
                            );

                            dispatch(setFocus(id));

                            // dispatch(setTool('select'));
                        }}
                        onCancel={() => {
                            dispatch(setTool('select'));
                        }}
                    />
                )}
            </div>
        </div>
    );
}

export { Canvas };

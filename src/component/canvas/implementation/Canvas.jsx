import { useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
    selectShapes,
    selectFocusId,
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
import {
    selectTool,
    selectPoly,
    selectStarPts,
    selectStarRatio,
    setTool,
    selectView,
    setView,
    selectCanvasBg,
} from '../../../lib/redux/slice/uiSlice';

import { TextEditorOverlay } from './TextEditorOverlay';
import { useStableSize } from '../hook/useStableSize';
import { setCanvasSize } from '../util/setup';
import { DPR } from '../constant/constants';
import { renderVector } from '../util/vector';
import { renderHitmap } from '../util/hitmap';
import { renderOverlay } from '../util/overlay';
import { useCanvasHotkeys } from '../hook/useCanvasHotkeys';
import { useStageInteractions } from '../hook/useStageInteractions';

function Canvas() {
    const dispatch = useDispatch();
    const view = useSelector((s) => s.ui.view);
    const tool = useSelector((st) => st.ui.tool);
    const shapes = useSelector((s) => s.canvas.shapes);
    const focusId = useSelector((s) => s.canvas.focusId);
    const canvasBg = useSelector((st) => st.ui.starPoints);
    const starPoints = useSelector((st) => st.ui.starPoints);
    const polygonSides = useSelector((s) => s.ui.polygonSides);
    const starInnerRatio = useSelector(selectStarRatio);

    const ovRef = useRef(null);
    const vecRef = useRef(null);
    const hitRef = useRef(null);
    const textRef = useRef(null);
    const wrapRef = useRef(null);
    const toolRef = useRef(tool);
    const focusRef = useRef(focusId);
    const shapesRef = useRef(shapes);
    const editingIdRef = useRef(null);
    const viewRef = useRef({ scale: 1, tx: 0, ty: 0 });

    const [editingId, setEditingId] = useState(null);

    const { size } = useStableSize(wrapRef, { w: 640, h: 420 });

    useEffect(() => {
        shapesRef.current = shapes;
    }, [shapes]);

    useEffect(() => {
        focusRef.current = focusId;
    }, [focusId]);

    useEffect(() => {
        if (!view) return;
        viewRef.current = { ...viewRef.current, ...view };
        requestAnimationFrame(renderAllOnce);
    }, [view]);

    useEffect(() => {
        toolRef.current = tool;
    }, [tool, polygonSides, starPoints, starInnerRatio]);
    const editingRef = useRef(false);

    useEffect(() => {
        editingIdRef.current = editingId;
    }, [editingId]);

    useEffect(() => {
        if (editingId != null && focusId !== editingId) endTextEdit(true);
    }, [editingId, endTextEdit, focusId]);

    useEffect(() => {
        const { w, h } = size;
        if (!vecRef.current || !hitRef.current || !ovRef.current) return;
        setCanvasSize(vecRef.current, w, h, { dpr: DPR(), alpha: true });
        setCanvasSize(hitRef.current, w, h, {
            dpr: DPR(),
            alpha: false,
            willRead: true,
        });
        setCanvasSize(ovRef.current, w, h, { dpr: DPR(), alpha: true });
        requestAnimationFrame(renderAllOnce);
    }, [size.w, size.h, size]);

    function renderAllOnce() {
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

    function beginTextEdit(shape) {
        setEditingId(shape.id);
        editingRef.current = true;
        requestAnimationFrame(renderAllOnce);
    }

    function endTextEdit(commit = true) {
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
    }

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

    return (
        <div
            className="canvas-outer"
            style={{
                position: 'relative',
                overflow: 'auto',
                width: '100%',
                height: '100%',
            }}
        >
            <div
                className="canvas-stage-wrap fill-viewport"
                ref={wrapRef}
                style={{ background: canvasBg }}
            >
                <canvas ref={vecRef} className="layer-vector" />
                <canvas ref={hitRef} className="layer-hitmap" />
                <canvas ref={ovRef} className="layer-overlay" />
                {editingId != null && (
                    <TextEditorOverlay
                        shape={shapes.find((v) => v.id === editingId)}
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
            </div>
        </div>
    );
}

export { Canvas };

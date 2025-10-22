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
import {
    setTool,
    setView,
    selectCanvasBg, // ✅ 배경은 여기서 가져온다
    selectStarRatio,
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

    // --- Redux 상태
    const view = useSelector((s) => s.ui.view);
    const tool = useSelector((s) => s.ui.tool);
    const shapes = useSelector((s) => s.canvas.shapes);
    const focusId = useSelector((s) => s.canvas.focusId);
    const canvasBg = useSelector(selectCanvasBg); // ✅ 오타 수정

    // (사용 중이면 유지)
    const starPoints = useSelector((s) => s.ui.starPoints);
    const polygonSides = useSelector((s) => s.ui.polygonSides);
    const starInnerRatio = useSelector(selectStarRatio);

    // --- refs
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
    const editingRef = useRef(false);

    // --- local state
    const [editingId, setEditingId] = useState(null);
    const { size } = useStableSize(wrapRef, { w: 640, h: 420 });

    // 최신 값 유지
    useEffect(() => {
        shapesRef.current = shapes;
    }, [shapes]);
    useEffect(() => {
        focusRef.current = focusId;
    }, [focusId]);
    useEffect(() => {
        toolRef.current = tool;
    }, [tool, polygonSides, starPoints, starInnerRatio]);

    // view 변경 시 리렌더
    useEffect(() => {
        if (!view) return;
        viewRef.current = { ...viewRef.current, ...view };
        requestAnimationFrame(renderAllOnce);
    }, [view]);

    // 캔버스 크기 세팅
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
    }, [size.w, size.h]); // ✅ width/height만 의존

    // 한 번 렌더
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
            // ✅ 실제 원인 로그 (여기 찍힌 첫 줄이 핵심)
            console.error('[Canvas] renderAllOnce error:', e);
        }
    }

    // shapes/focusId 바뀌면 재렌더
    useEffect(() => {
        renderAllOnce();
    }, [shapes, focusId]);

    // 키보드 단축키
    useCanvasHotkeys({
        dispatch,
        focusRef,
        editingRef,
        actions: { historyStart, deleteFocused, undo, redo },
    });

    // 텍스트 편집 시작/끝 (useCallback으로 안정화)
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

    // 포커스 변경으로 편집 종료되는 경우
    useEffect(() => {
        if (editingId != null && focusId !== editingId) {
            endTextEdit(true);
        }
    }, [editingId, focusId, endTextEdit]);

    // editingId 최신값 ref 유지
    useEffect(() => {
        editingIdRef.current = editingId;
    }, [editingId]);

    // ✅ 편집 중 shape가 없어져도 안전하게
    const editingShape = useMemo(
        () => shapes.find((v) => v.id === editingId) || null,
        [shapes, editingId]
    );

    // 스테이지 인터랙션(마우스) – 사용 중이라면 유지
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
            </div>
        </div>
    );
}

export { Canvas };

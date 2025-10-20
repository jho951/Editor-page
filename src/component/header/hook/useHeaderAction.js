import { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import {
    setTool,
    setCanvasBg,
    setView,
} from '../../../lib/redux/slice/uiSlice';

import {
    historyStart,
    undo,
    redo,
    updateShapeStyle,
} from '../../../lib/redux/slice/canvasSlice';

import {
    markDirty,
    openLoadModal,
    openSaveModal,
} from '../../../lib/redux/slice/docSlice';
import { saveCurrentDrawing } from '../../../lib/redux/util/async';

/**
 * ToolHeader 컴포넌트에서 사용되는 모든 Redux 기반 로직과 액션 핸들러를 캡슐화하는 커스텀 훅입니다.
 */
function useHeaderAction() {
    const dispatch = useDispatch();

    const tool = useSelector((st) => st.ui.tool);
    const view = useSelector((s) => s.ui.view);
    const canvasBg = useSelector((s) => s.ui.canvasBg);
    const focusId = useSelector((s) => s.canvas.focusId);
    const docMeta = useSelector((s) => s.doc.current);
    // --- 줌 액션 ---
    const setZoom = useCallback(
        (next) => {
            // 줌 레벨을 0.125 (12.5%) 와 8 (800%) 사이로 제한합니다.
            const clamped = Math.min(8, Math.max(0.125, next));
            dispatch(setView({ ...view, scale: clamped }));
        },
        [dispatch, view]
    );

    const nudgeZoom = useCallback(
        (mul) => setZoom(view.scale * mul),
        [view.scale, setZoom]
    );

    // --- 파일 액션 ---
    const handleOpen = useCallback(() => {
        dispatch(openLoadModal());
    }, [dispatch]);

    const handleSave = useCallback(() => {
        // 이미 저장된 문서(ID가 있는 경우)는 바로 저장하고, 아니면 SaveModal을 엽니다.
        if (!docMeta?.id) {
            dispatch(openSaveModal());
        } else {
            dispatch(saveCurrentDrawing());
        }
    }, [dispatch, docMeta?.id]);

    // --- Undo/Redo 액션 ---
    const handleUndo = useCallback(() => dispatch(undo()), [dispatch]);
    const handleRedo = useCallback(() => dispatch(redo()), [dispatch]);

    // --- 툴 선택 액션 ---
    const handleSetTool = useCallback(
        (name) => dispatch(setTool(name)),
        [dispatch]
    );

    // --- 도형 스타일 변경 액션 (선색, 배경색, 선굵기) ---
    const onPickStroke = useCallback(
        (e) => {
            if (!focusId) return;
            const val = e.target.value;
            dispatch(historyStart());
            dispatch(updateShapeStyle({ id: focusId, patch: { stroke: val } }));
            dispatch(markDirty());
        },
        [dispatch, focusId]
    );

    const onPickFill = useCallback(
        (e) => {
            if (!focusId) return;
            const val = e.target.value;
            dispatch(historyStart());
            dispatch(updateShapeStyle({ id: focusId, patch: { fill: val } }));
            dispatch(markDirty());
        },
        [dispatch, focusId]
    );

    const onStrokeWidth = useCallback(
        (e) => {
            if (!focusId) return;
            const n = Number(e.target.value) || 1;
            dispatch(historyStart());
            dispatch(
                updateShapeStyle({ id: focusId, patch: { strokeWidth: n } })
            );
            dispatch(markDirty());
        },
        [dispatch, focusId]
    );

    // --- 캔버스 배경색 변경 액션 ---
    const onPickCanvasBg = useCallback(
        (e) => {
            const val = e.target.value;
            dispatch(setCanvasBg(val));
            dispatch(markDirty());
        },
        [dispatch]
    );

    return {
        // State
        tool,
        view,
        canvasBg,
        focusId,
        docMeta,
        // Actions
        setZoom,
        nudgeZoom,
        handleOpen,
        handleSave,
        handleUndo,
        handleRedo,
        handleSetTool,
        onPickStroke,
        onPickFill,
        onStrokeWidth,
        onPickCanvasBg,
    };
}

export { useHeaderAction };

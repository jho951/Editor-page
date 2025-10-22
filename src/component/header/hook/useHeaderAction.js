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
import { saveDrawingById } from '../../../lib/redux/util/async';

/**
 * ToolHeader 컴포넌트에서 사용되는 모든 Redux 기반 로직과 액션 핸들러를 캡슐화하는 커스텀 훅입니다.
 */
function useHeaderAction() {
    const dispatch = useDispatch();

    const view = useSelector((s) => s.ui.view);
    const tool = useSelector((st) => st.ui.tool);
    const meta = useSelector((s) => s.doc?.current);
    const canvasBg = useSelector((s) => s.ui.canvasBg);
    const focusId = useSelector((s) => s.canvas.focusId);

    const setZoom = useCallback(
        (next, view) => {
            dispatch(
                setView({ ...view, scale: Math.min(8, Math.max(0.125, next)) })
            );
        },
        [dispatch]
    );

    const nudgeZoom = useCallback(
        (mul) => setZoom(view.scale * mul),
        [view.scale, setZoom]
    );

    const handleOpen = useCallback(() => {
        dispatch(openLoadModal());
    }, [dispatch]);

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

    const handleSave = async (opts = {}) => {
        // Shift+Cmd+S 등으로 'quick: false'가 들어오면 Save As로 강제
        if (opts.quick === false) {
            return dispatch(openSaveModal()); // 새 문서로 저장
        }

        if (meta?.id) {
            try {
                await dispatch(saveDrawingById(meta.id)).unwrap();
            } catch (e) {
                alert('저장 실패: ' + (e?.message || String(e)));
            }
        } else {
            // 신규 문서 → Save As 모달
            dispatch(openSaveModal());
        }
    };

    return {
        tool,
        view,
        canvasBg,
        focusId,
        meta,
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

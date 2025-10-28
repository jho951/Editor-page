import { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { saveDrawingById } from '../../document/api/async';
import { setCanvasBg, setTool, setView } from '../state/header.slice';
import {
    markDirty,
    openLoadModal,
    openRestoreModal,
    openSaveModal,
} from '@/feature/document/state/document.slice';
import {
    historyStart,
    redo,
    undo,
    updateShapeStyle,
} from '@/feature/canvas/state/canvas.slice';

/**
 * ToolHeader 컴포넌트에서 사용되는 모든 Redux 기반 로직과 액션 핸들러를 캡슐화하는 커스텀 훅입니다.
 */
function useHeaderAction() {
    const dispatch = useDispatch();

    const view = useSelector((s) => s.header.view);
    const tool = useSelector((st) => st.header.tool);
    const meta = useSelector((s) => s.document?.current);
    const canvasBg = useSelector((s) => s.header.canvasBg);
    const focusId = useSelector((s) => s.canvas.focusId);
    const polygonSides = useSelector((s) => s.header.polygonSides);

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

    const handleRestore = useCallback(() => {
        dispatch(openRestoreModal());
    }, [dispatch]);

    // --- Undo/Redo 액션 ---
    const handleUndo = useCallback(() => dispatch(undo()), [dispatch]);
    const handleRedo = useCallback(() => dispatch(redo()), [dispatch]);

    // --- 툴 선택 액션 ---
    const handleSetTool = useCallback(
        (name) => dispatch(setTool(name)),
        [dispatch]
    );

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

    const onPickCanvasBg = useCallback(
        (e) => {
            const val = e.target.value;
            dispatch(setCanvasBg(val));
            dispatch(markDirty());
        },
        [dispatch]
    );

    const handleSave = async (opts = {}) => {
        if (opts.quick === false) {
            return dispatch(openSaveModal());
        }

        if (meta?.id) {
            try {
                await dispatch(saveDrawingById(meta.id)).unwrap();
            } catch (e) {
                alert('저장 실패: ' + (e?.message || String(e)));
            }
        } else {
            dispatch(openSaveModal());
        }
    };

    return {
        dispatch,
        tool,
        view,
        canvasBg,
        focusId,
        meta,
        polygonSides,
        setZoom,
        nudgeZoom,
        handleOpen,
        handleSave,
        handleRestore,
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

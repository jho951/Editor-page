import { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { saveDrawingById } from '../../document/api/async';

import { markDirty, setModal } from '@/feature/document/state/document.slice';
import {
    historyStart,
    redo,
    undo,
    updateShapeStyle,
} from '@/feature/canvas/state/canvas.slice';

import {
    selectBackground,
    selectSidebarOpen,
    selectTool,
    selectView,
} from '../state/toolbar.selector';

import { selectCurrent } from '@/feature/document/state/document.selector';
import { selectFocusId } from '@/feature/canvas/state/canvas.selector';

import { clamp } from '@/shared/util/clamp';
import { selectViewport } from '@/feature/viewport/state/viewport.selector';

function useHeaderAction() {
    const dispatch = useDispatch();
    const view = useSelector(selectView);
    const meta = useSelector(selectCurrent);
    const focusId = useSelector(selectFocusId);
    const sidebarOpen = useSelector(selectSidebarOpen);

    const setZoom = useCallback(
        (next) => {
            const clamped = clamp(0.125, next, 8);
            dispatch(selectViewport({ ...view, scale: clamped }));
        },
        [dispatch, view]
    );

    const nudgeZoom = useCallback(
        (mul) => {
            setZoom(view.scale * (mul || 1));
        },
        [view.scale, setZoom]
    );

    // ── Modals (헬퍼 없이 직접 dispatch)
    const handleOpen = useCallback(() => {
        dispatch(setModal({ key: 'load', open: true }));
    }, [dispatch]);

    const handleRestore = useCallback(() => {
        dispatch(setModal({ key: 'restore', open: true }));
    }, [dispatch]);

    // ── Undo/Redo
    const handleUndo = useCallback(() => dispatch(undo()), [dispatch]);
    const handleRedo = useCallback(() => dispatch(redo()), [dispatch]);

    // ── Tool
    const handleSetTool = useCallback(
        (name) => dispatch(selectTool(name)),
        [dispatch]
    );

    // ── Style patch 공통
    const patchFocusedStyle = useCallback(
        (patch) => {
            if (!focusId) return;
            dispatch(historyStart());
            dispatch(updateShapeStyle({ id: focusId, patch }));
            dispatch(markDirty());
        },
        [dispatch, focusId]
    );

    const onPickStroke = useCallback(
        (e) => {
            patchFocusedStyle({ stroke: e.target.value });
        },
        [patchFocusedStyle]
    );

    const onPickFill = useCallback(
        (e) => {
            patchFocusedStyle({ fill: e.target.value });
        },
        [patchFocusedStyle]
    );

    const onStrokeWidth = useCallback(
        (e) => {
            const n = Number(e.target.value) || 1;
            patchFocusedStyle({ strokeWidth: n });
        },
        [patchFocusedStyle]
    );

    // ── Canvas BG
    const onPickCanvasBg = useCallback(
        (e) => {
            const val = e.target.value;
            dispatch(selectBackground(val));
            dispatch(markDirty());
        },
        [dispatch]
    );

    // ── Save
    const handleSave = useCallback(
        async (opts = {}) => {
            if (opts.quick === false) {
                dispatch(setModal({ key: 'save', open: true }));
                return;
            }
            if (meta?.id) {
                try {
                    await dispatch(saveDrawingById(meta.id)).unwrap();
                } catch (e) {
                    alert('저장 실패: ' + (e?.message || String(e)));
                }
            } else {
                dispatch(setModal({ key: 'save', open: true }));
            }
        },
        [dispatch, meta?.id]
    );

    return {
        sidebarOpen,
        dispatch,
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

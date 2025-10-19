import React, { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import {
    setTool,
    setCanvasBg,
    selectTool,
    selectView,
    setView,
    selectCanvasBg,
} from '../../../lib/redux/slice/uiSlice';

import {
    selectFocusId,
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
import { OpenModal } from '../../modal/implementation/OpenModal';
import { SaveModal } from '../../modal/implementation/SaveModal';

export default function ToolHeader({ title, onTitleChange }) {
    const dispatch = useDispatch();

    const tool = useSelector(selectTool);
    const view = useSelector(selectView);
    const canvasBg = useSelector(selectCanvasBg);
    const focusId = useSelector(selectFocusId);
    const docMeta = useSelector((s) => s.doc.current);

    const setZoom = useCallback(
        (next) => {
            const clamped = Math.min(8, Math.max(0.125, next));
            dispatch(setView({ ...view, scale: clamped }));
        },
        [dispatch, view]
    );

    const nudgeZoom = (mul) => setZoom(view.scale * mul);

    const onPickStroke = (e) => {
        if (!focusId) return;
        const val = e.target.value;
        dispatch(historyStart());
        dispatch(updateShapeStyle({ id: focusId, patch: { stroke: val } }));
        dispatch(markDirty());
    };
    const onPickFill = (e) => {
        if (!focusId) return;
        const val = e.target.value;
        dispatch(historyStart());
        dispatch(updateShapeStyle({ id: focusId, patch: { fill: val } }));
        dispatch(markDirty());
    };
    const onStrokeWidth = (e) => {
        if (!focusId) return;
        const n = Number(e.target.value) || 1;
        dispatch(historyStart());
        dispatch(updateShapeStyle({ id: focusId, patch: { strokeWidth: n } }));
        dispatch(markDirty());
    };
    const onPickCanvasBg = (e) => {
        const val = e.target.value;
        dispatch(setCanvasBg(val));
        dispatch(markDirty());
    };

    return (
        <header
            style={{
                display: 'flex',
                gap: 12,
                alignItems: 'center',
                padding: '8px 12px',
                borderBottom: '1px solid var(--border-color)',
                background: 'var(--background-color)',
            }}
        >
            {/* 문서 제목 */}
            <input
                value={title || ''}
                onChange={(e) => onTitleChange?.(e.target.value)}
                placeholder="Untitled"
                style={{
                    width: 240,
                    padding: '6px 8px',
                    border: '1px solid var(--border-color)',
                    borderRadius: 6,
                }}
            />

            {/* 파일 */}
            <div style={{ display: 'flex', gap: 6 }}>
                <button onClick={() => dispatch(openLoadModal())}>열기</button>
                <button
                    onClick={() => {
                        if (!docMeta?.id) dispatch(openSaveModal());
                        else dispatch(saveCurrentDrawing());
                    }}
                >
                    저장
                </button>
            </div>

            {/* Undo / Redo */}
            <div style={{ display: 'flex', gap: 6, marginLeft: 8 }}>
                <button onClick={() => dispatch(undo())}>Undo</button>
                <button onClick={() => dispatch(redo())}>Redo</button>
            </div>

            {/* 툴 선택 */}
            <div style={{ display: 'flex', gap: 6, marginLeft: 12 }}>
                {[
                    ['select', '선택'],
                    ['rect', '사각형'],
                    ['ellipse', '원'],
                    ['line', '직선'],
                    ['polygon', '다각형'],
                    ['star', '별'],
                    ['freedraw', '프리드로우'],
                    ['text', '텍스트'],
                ].map(([name, label]) => (
                    <button
                        key={name}
                        onClick={() => dispatch(setTool(name))}
                        style={{
                            fontWeight: tool === name ? 700 : 400,
                            borderColor:
                                tool === name
                                    ? 'var(--active-color)'
                                    : 'var(--border-color)',
                        }}
                    >
                        {label}
                    </button>
                ))}
            </div>

            {/* 스타일(선택된 도형에 적용) */}
            <div style={{ display: 'flex', gap: 6, marginLeft: 12 }}>
                <label
                    style={{ display: 'flex', alignItems: 'center', gap: 4 }}
                >
                    선색
                    <input type="color" onChange={onPickStroke} />
                </label>
                <label
                    style={{ display: 'flex', alignItems: 'center', gap: 4 }}
                >
                    배경
                    <input type="color" onChange={onPickFill} />
                </label>
                <label
                    style={{ display: 'flex', alignItems: 'center', gap: 4 }}
                >
                    선굵기
                    <input
                        type="number"
                        min="1"
                        max="64"
                        defaultValue={2}
                        onChange={onStrokeWidth}
                        style={{ width: 64 }}
                    />
                </label>
            </div>

            {/* 캔버스 배경 */}
            <div style={{ display: 'flex', gap: 6, marginLeft: 12 }}>
                <label
                    style={{ display: 'flex', alignItems: 'center', gap: 4 }}
                >
                    캔버스
                    <input
                        type="color"
                        value={canvasBg}
                        onChange={onPickCanvasBg}
                    />
                </label>
            </div>

            {/* 줌 */}
            <div style={{ display: 'flex', gap: 6, marginLeft: 'auto' }}>
                <button onClick={() => nudgeZoom(1 / 1.25)}>-</button>
                <span style={{ minWidth: 72, textAlign: 'center' }}>
                    {(view.scale * 100).toFixed(0)}%
                </span>
                <button onClick={() => nudgeZoom(1.25)}>+</button>
                <button onClick={() => setZoom(1)}>100%</button>
                <button onClick={() => setZoom(0.5)}>50%</button>
                <button onClick={() => setZoom(2)}>200%</button>
            </div>
            <OpenModal />
            <SaveModal />
        </header>
    );
}

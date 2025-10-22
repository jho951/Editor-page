import { OpenModal } from '../../modal/implementation/OpenModal';
import { SaveModal } from '../../modal/implementation/SaveModal';
import { useHeaderAction } from '../hook/useHeaderAction';
import { useHeaderShortcuts } from '../hook/useHeaderShortcuts';

import { useDispatch, useSelector } from 'react-redux';
import {
    historyStart,
    setTextStyle,
    selectFocusId,
} from '../../../lib/redux/slice/canvasSlice';
import { useEffect, useMemo, useState } from 'react';

import { setPolygonSides, selectPoly } from '../../../lib/redux/slice/uiSlice';

function Header() {
    const {
        tool,
        view,
        canvasBg,
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
    } = useHeaderAction();

    const dispatch = useDispatch();

    const focusId = useSelector(selectFocusId);
    const polygonSides = useSelector(selectPoly);
    const [sidesDraft, setSidesDraft] = useState(String(polygonSides));
    const textShape = useSelector((s) =>
        s.canvas.shapes.find((v) => v.id === focusId && v.type === 'text')
    );

    useEffect(() => {
        setSidesDraft(String(polygonSides));
    }, [polygonSides]);

    const clampSides = (n) => Math.max(3, Math.min(64, Math.floor(n || 3)));
    const changeSides = (n) => dispatch(setPolygonSides(clampSides(n)));
    const stepSides = (delta) => changeSides(polygonSides + delta);
    const commitSidesDraft = () => {
        const n = parseInt(sidesDraft, 10);
        if (Number.isFinite(n)) changeSides(n);
        else setSidesDraft(String(polygonSides));
    };

    // ── 텍스트 스타일 ──
    const textColor = textShape?.color ?? '#000000';
    const fontPx = useMemo(() => {
        const m = /(\d+(?:\.\d+)?)px/.exec(textShape?.font || '');
        return m ? Number(m[1]) : 12;
    }, [textShape?.font]);

    const setColor = (color) => {
        if (!textShape) return;
        dispatch(historyStart());
        dispatch(setTextStyle({ id: textShape.id, color }));
    };

    const setFontPx = (px) => {
        if (!textShape) return;
        const safe = Math.max(1, Math.min(128, Math.round(px)));
        const prev = textShape.font || '';
        const replaced = prev
            ? prev.replace(/(\d+(?:\.\d+)?)px/, `${safe}px`)
            : `${safe}px sans-serif`;
        const nextFont = replaced === prev ? `${safe}px sans-serif` : replaced;
        dispatch(historyStart());
        dispatch(setTextStyle({ id: textShape.id, font: nextFont }));
    };

    const stepFont = (delta) => setFontPx(fontPx + delta);

    // ── 단축키 디스패치 ──
    const dispatchCommand = (command) => {
        switch (command) {
            case 'new':
                return handleOpen?.({ createNew: true });
            case 'open':
                return handleOpen?.();
            case 'save':
                return handleSave?.({ quick: true });
            case 'quick-save':
                return handleSave?.({ quick: false });
            case 'undo':
                return handleUndo?.();
            case 'redo':
                return handleRedo?.();

            case 'select':
            case 'rect':
            case 'ellipse':
            case 'line':
            case 'polygon':
            case 'star':
            case 'text':
                return handleSetTool?.(command);
            case 'path':
                return handleSetTool?.('freedraw');

            case 'in':
                return nudgeZoom?.(1.25);
            case 'out':
                return nudgeZoom?.(1 / 1.25);
            case 'fit':
                return setZoom?.(1);
            default:
                return;
        }
    };

    useHeaderShortcuts({ dispatchCommand });

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
            {/* 파일 */}
            <div style={{ display: 'flex', gap: 6 }}>
                <button onClick={handleOpen}>열기</button>
                <button onClick={() => handleSave({ quick: true })}>
                    저장
                </button>
                <button onClick={() => handleSave({ quick: false })}>
                    다른 이름으로 저장
                </button>
                <button onClick={() => handleSave({ quick: false })}>
                    복원
                </button>
            </div>

            {/* Undo / Redo */}
            <div style={{ display: 'flex', gap: 6, marginLeft: 8 }}>
                <button onClick={handleUndo}>Undo</button>
                <button onClick={handleRedo}>Redo</button>
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
                        onClick={() => handleSetTool(name)}
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

            {/* 스타일(도형 공통) */}
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
                    />
                </label>
            </div>

            {/* ───────── 다각형 sides 컨트롤 ───────── */}
            <div
                style={{
                    display: 'flex',
                    gap: 8,
                    marginLeft: 12,
                    alignItems: 'center',
                }}
            >
                <label
                    style={{ display: 'flex', alignItems: 'center', gap: 6 }}
                >
                    변 개수
                    <button
                        type="button"
                        onClick={() => stepSides(-1)}
                        disabled={polygonSides <= 3}
                    >
                        -
                    </button>
                    <input
                        type="number"
                        min="3"
                        max="64"
                        value={sidesDraft}
                        onChange={(e) => setSidesDraft(e.target.value)}
                        onBlur={commitSidesDraft}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter') e.currentTarget.blur();
                        }}
                        style={{ width: 64, textAlign: 'center' }}
                        inputMode="numeric"
                    />
                    <button
                        type="button"
                        onClick={() => stepSides(+1)}
                        disabled={polygonSides >= 64}
                    >
                        +
                    </button>
                </label>
            </div>

            {/* ───────── 텍스트 전용 스타일 ───────── */}
            <div
                style={{
                    display: 'flex',
                    gap: 8,
                    marginLeft: 12,
                    alignItems: 'center',
                }}
            >
                <label
                    style={{ display: 'flex', alignItems: 'center', gap: 6 }}
                >
                    글자 크기
                    <button
                        type="button"
                        onClick={() => stepFont(-1)}
                        disabled={!textShape}
                    >
                        -
                    </button>
                    <input
                        type="number"
                        min="1"
                        max="128"
                        value={fontPx}
                        onChange={(e) =>
                            setFontPx(Number(e.target.value || 12))
                        }
                        style={{ width: 64 }}
                        disabled={!textShape}
                    />
                    <button
                        type="button"
                        onClick={() => stepFont(+1)}
                        disabled={!textShape}
                    >
                        +
                    </button>
                </label>

                <label
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 6,
                        marginLeft: 10,
                    }}
                >
                    글자 색
                    <input
                        type="color"
                        value={textColor}
                        onChange={(e) => setColor(e.target.value)}
                        disabled={!textShape}
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

export { Header };

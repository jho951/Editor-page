import { useEffect, useMemo, useRef } from 'react';
import { useSelector } from 'react-redux';

import { OpenModal } from '@/feature/document/component/OpenModal';
import { SaveModal } from '@/feature/document/component/SaveModal';
import { useHeaderAction } from '../hook/useHeaderAction';
import { useHeaderShortcuts } from '../hook/useHeaderShortcuts';

import RestoreModal from '../../document/component/RestoreModal';

import {
    historyStart,
    setTextStyle,
} from '@/feature/canvas/state/canvas.slice';

import styles from './Header.module.css';

function Header() {
    const {
        dispatch,
        tool,
        view,
        canvasBg,
        focusId,
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
    } = useHeaderAction();

    const textShape = useSelector((s) =>
        s.canvas.shapes.find((v) => v.id === focusId && v.type === 'text')
    );
    const polygonSidesRef = useRef(polygonSides);

    useEffect(() => {
        polygonSidesRef.current = String(polygonSides);
    }, [polygonSides]);

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
        const prev = textShape.font;
        const replaced = prev
            ? prev.replace(/(\d+(?:\.\d+)?)px/, `${safe}px`)
            : `${safe}px sans-serif`;
        const nextFont = replaced === prev ? `${safe}px sans-serif` : replaced;
        dispatch(historyStart());
        dispatch(setTextStyle({ id: textShape.id, font: nextFont }));
    };

    const setAlign = (align) => {
        if (!textShape) return;
        dispatch(historyStart());
        dispatch(setTextStyle({ id: textShape.id, align }));
    };

    const setInnerHeight = (lineHeight) => {
        if (!textShape) return;
        dispatch(historyStart());
        dispatch(setTextStyle({ id: textShape.id, lineHeight }));
    };

    const stepFont = (delta) => setFontPx(fontPx + delta);

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
        <header className={styles.wrap}>
            {/* 파일 */}
            <div>
                <button onClick={handleOpen}>열기</button>
                <button onClick={() => handleSave({ quick: true })}>
                    저장
                </button>
                <button onClick={() => handleSave({ quick: false })}>
                    다른 이름으로 저장
                </button>
                <button onClick={handleRestore}>복원</button>
            </div>

            {/* Undo / Redo */}
            <div>
                <button onClick={handleUndo}>Undo</button>
                <button onClick={handleRedo}>Redo</button>
            </div>

            {/* 툴 선택 */}
            <div>
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
            <div>
                <label>
                    선색
                    <input type="color" onChange={onPickStroke} />
                </label>
                <label>
                    색넣기
                    <input type="color" onChange={onPickFill} />
                </label>
                <label>
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

            {/* ───────── 텍스트 전용 스타일 ───────── */}
            <div>
                <label>
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

                <label>
                    글자 색
                    <input
                        type="color"
                        value={textColor}
                        onChange={(e) => setColor(e.target.value)}
                        disabled={!textShape}
                    />
                </label>
                <button onClick={() => setAlign('left')}>왼쪽</button>
                <button onClick={() => setAlign('center')}>가운데</button>
                <button onClick={() => setAlign('right')}>오른쪽</button>

                <button onClick={() => setInnerHeight(1)}>100%</button>
                <button onClick={() => setInnerHeight(1.5)}>150%</button>
                <button onClick={() => setInnerHeight()}>200%</button>
            </div>

            {/* 캔버스 배경 */}
            <div>
                <label>
                    배경
                    <input
                        type="color"
                        value={canvasBg}
                        onChange={onPickCanvasBg}
                    />
                </label>
            </div>

            {/* 줌 */}
            <div>
                <button onClick={() => nudgeZoom(1 / 1.25)}>-</button>
                <span>{(view.scale * 100).toFixed(0)}%</span>
                <button onClick={() => nudgeZoom(1.25)}>+</button>
                <button onClick={() => setZoom(1)}>100%</button>
                <button onClick={() => setZoom(0.5)}>50%</button>
                <button onClick={() => setZoom(2)}>200%</button>
            </div>

            <OpenModal />
            <SaveModal />
            <RestoreModal />
        </header>
    );
}

export { Header };

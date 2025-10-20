import { OpenModal } from '../../modal/implementation/OpenModal';
import { SaveModal } from '../../modal/implementation/SaveModal';
import { useHeaderAction } from '../hook/useHeaderAction';

export default function ToolHeader({ title, onTitleChange }) {
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
                <button onClick={handleOpen}>열기</button>
                <button onClick={handleSave}>저장</button>
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

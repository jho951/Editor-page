import { OpenModal } from '../../modal/implementation/OpenModal';
import { SaveModal } from '../../modal/implementation/SaveModal';
import { useHeaderAction } from '../hook/useHeaderAction';
import { useHeaderShortcuts } from '../hook/useHeaderShortcuts';

export default function ToolHeader({ title, onTitleChange }) {
    const {
        tool,
        view,
        canvasBg,
        setZoom,
        nudgeZoom,
        handleOpen,
        handleSave, // ✅ handleSave({ quick: true }) = 덮어쓰기, handleSave({ quick: false }) = 다른 이름으로 저장
        handleUndo,
        handleRedo,
        handleSetTool,
        onPickStroke,
        onPickFill,
        onStrokeWidth,
        onPickCanvasBg,
    } = useHeaderAction();

    // 단축키 -> 명령 라우팅
    const dispatchCommand = (command) => {
        switch (command) {
            // 파일
            case 'new':
                return handleOpen?.({ createNew: true });
            case 'open':
                return handleOpen?.();
            case 'save':
                // ✅ Mod+S -> 덮어쓰기
                return handleSave?.({ quick: true });
            case 'quick-save':
                // ✅ Mod+Shift+S -> 다른 이름으로 저장
                return handleSave?.({ quick: false });

            // 히스토리
            case 'undo':
                return handleUndo?.();
            case 'redo':
                return handleRedo?.();

            // 도구 (주의: P는 'path' 이지만 실제 버튼 키는 'freedraw')
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

            // 줌
            case 'in':
                return nudgeZoom?.(1.25);
            case 'out':
                return nudgeZoom?.(1 / 1.25);
            case 'fit':
                return setZoom?.(1);

            // 그 외(핸들/넛지/편집모드)는 캔버스 쪽에서 처리
            default:
                return;
        }
    };

    // 전역 단축키 연결
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
                {/* ✅ 저장 = 덮어쓰기 */}
                <button onClick={() => handleSave({ quick: true })}>
                    저장
                </button>
                {/* ✅ 다른 이름으로 저장 = 새로 저장 */}
                <button onClick={() => handleSave({ quick: false })}>
                    다른 이름으로 저장
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

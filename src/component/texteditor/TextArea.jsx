/**
 * @file TextArea.jsx
 * @description 오버레이 위에 포털로 띄우는 텍스트 에디터
 * props:
 *  - rect: { x, y, w, h }  // 캔버스 부모 기준 좌표/크기
 *  - initialText: string
 *  - stylePreset: { font, color, align }  // styleSlice.text 형식 권장
 *  - onClose: () => void
 *  - onCommit: (payload: { text, rect, style }) => void
 */

import { useEffect, useMemo, useRef, useState, useCallback } from 'react';

const MIN_W = 120;
const MIN_H = 40;

export default function TextArea({
    rect,
    initialText = '',
    stylePreset = {
        font: '14px/1.4 Inter, system-ui, sans-serif',
        color: '#222',
        align: 'left',
    },
    onClose,
    onCommit,
}) {
    const [value, setValue] = useState(initialText);
    const hostRef = useRef(null);
    const inputRef = useRef(null);

    // rect 보정
    const box = useMemo(() => {
        const w = Math.max(MIN_W, Math.round(rect?.w ?? 0));
        const h = Math.max(MIN_H, Math.round(rect?.h ?? 0));
        const x = Math.round(rect?.x ?? 0);
        const y = Math.round(rect?.y ?? 0);
        return { x, y, w, h };
    }, [rect]);

    // 스타일 매핑
    const textStyle = useMemo(() => {
        const font =
            stylePreset?.font ?? '14px/1.4 Inter, system-ui, sans-serif';
        const color = stylePreset?.color ?? '#222';
        const align = stylePreset?.align ?? 'left';
        return { font, color, align };
    }, [stylePreset]);

    // 포커스 & 선택
    useEffect(() => {
        inputRef.current?.focus();
        // 새 텍스트면 전체 선택, 기존이면 캐럿 끝으로
        if (initialText?.length) {
            const el = inputRef.current;
            const len = el.value.length;
            el.setSelectionRange?.(len, len);
        } else {
            inputRef.current?.select?.();
        }
    }, [initialText]);

    const commit = useCallback(() => {
        onCommit?.({
            text: value,
            rect: { ...box },
            style: { ...textStyle },
        });
    }, [value, box, textStyle, onCommit]);

    const cancel = useCallback(() => {
        onClose?.();
    }, [onClose]);

    // 키 처리: Esc 취소, Ctrl/Cmd+Enter 커밋, Enter만 입력은 그대로 허용
    const onKeyDown = (e) => {
        if (e.key === 'Escape') {
            e.preventDefault();
            cancel();
        } else if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
            e.preventDefault();
            commit();
        }
    };

    // 포커스 아웃 시에도 커밋하고 싶으면 아래 주석 해제
    // const onBlur = () => commit();

    // 편집 박스 컨테이너 스타일(오버레이 부모가 position:relative여야 정확)
    const containerStyle = {
        position: 'absolute',
        left: `${box.x}px`,
        top: `${box.y}px`,
        width: `${box.w}px`,
        height: `${box.h}px`,
        pointerEvents: 'auto',
        zIndex: 9999,
        // 시각적 도움(편집 중 테두리):
        outline: '1px dashed rgba(0,0,0,0.3)',
        borderRadius: 4,
        background: 'transparent',
    };

    // textarea 스타일
    const textareaStyle = {
        boxSizing: 'border-box',
        width: '100%',
        height: '100%',
        border: 'none',
        outline: 'none',
        resize: 'none',
        background: 'transparent',
        color: textStyle.color,
        font: textStyle.font, // 'size/line-height family'
        textAlign: textStyle.align,
        padding: '8px 10px',
        // 크롬 자동완성 등 비활성화 효과
        WebkitTextFillColor: textStyle.color,
    };

    return (
        <div
            ref={hostRef}
            style={containerStyle}
            onWheel={(e) => e.stopPropagation()}
        >
            <textarea
                ref={inputRef}
                value={value}
                onChange={(e) => setValue(e.target.value)}
                onKeyDown={onKeyDown}
                // onBlur={onBlur}
                style={textareaStyle}
                spellCheck={false}
                placeholder=""
                aria-label="Text editor"
            />
            {/* 퀵 액션 (선택): 커밋/취소 버튼을 원하면 아래 주석 해제 */}
            {/* <div style={{ position: 'absolute', right: 6, bottom: 6, display: 'flex', gap: 6 }}>
        <button type="button" className="tb-btn" onClick={commit}>확인</button>
        <button type="button" className="tb-btn" onClick={cancel}>취소</button>
      </div> */}
        </div>
    );
}

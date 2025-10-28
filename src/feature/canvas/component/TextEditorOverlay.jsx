import { useEffect } from 'react';
import { worldToScreen } from '../util/view';
import styles from './TextEditorOverlay.module.css';

function TextEditorOverlay({ shape, view, textareaRef, onCommit, onCancel }) {
    useEffect(() => {
        if (textareaRef?.current) textareaRef.current.focus();
    }, [textareaRef]);

    if (!shape) return null;

    const { x: left, y: top } = worldToScreen(view, shape.x, shape.y);
    const { x: right, y: bottom } = worldToScreen(
        view,
        shape.x + shape.w,
        shape.y + shape.h
    );

    const width = Math.max(1, right - left);
    const height = Math.max(1, bottom - top);

    const dynamicStyle = {
        left,
        top,
        width,
        height,
        color: shape.color || 'var(--color-fg, #111)',
        font:
            shape.font ||
            '16px/1.3 system-ui, -apple-system, "Segoe UI", Roboto, sans-serif',
        lineHeight: shape.lineHeight || 1.3,
    };

    const onKeyDown = (e) => {
        if (e.key === 'Escape') {
            e.preventDefault();
            onCancel?.();
            return;
        }
        if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
            e.preventDefault();
            onCommit?.(textareaRef.current?.value || '');
        }
    };

    return (
        <textarea
            ref={textareaRef}
            className={styles.overlay}
            defaultValue={shape.text || ''}
            style={dynamicStyle}
            placeholder={shape.placeholder || '텍스트를 입력하세요…'}
            onBlur={() => onCommit?.(textareaRef.current?.value || '')}
            onKeyDown={onKeyDown}
            onMouseDown={(e) => e.stopPropagation()}
        />
    );
}

export { TextEditorOverlay };

import { forwardRef } from 'react';
import styles from '../style/ToolBtn.module.css';

/**
 * variant:
 *  - "tool" (default): 툴바 버튼 스타일 사용 (styles.toolBtn / styles.active)
 *  - "menu": 드롭다운 항목으로 사용 (내부 스타일 없음, className만 사용)
 */
const ToolBtn = forwardRef(function ToolBtn(
    {
        variant = 'tool',
        active,
        title,
        shortcut,
        onClick,
        className = '',
        children,
        ...rest
    },
    ref
) {
    const label = shortcut ? `${title} (${shortcut})` : title;

    const baseCls = variant === 'tool' ? styles.toolBtn : '';
    const activeCls = variant === 'tool' && active ? styles.active : '';

    return (
        <button
            ref={ref}
            type="button"
            className={`${baseCls} ${activeCls} ${className}`.trim()}
            onClick={onClick}
            aria-pressed={variant === 'tool' ? !!active : undefined}
            title={label}
            {...rest}
        >
            {children}
        </button>
    );
});

export { ToolBtn };

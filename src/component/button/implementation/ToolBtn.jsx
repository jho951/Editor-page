import { forwardRef } from 'react';
import css from '../style/ToolBtn.module.css';

export const ToolBtn = forwardRef(function ToolBtn(
    { active, icon, children, variant = 'tool', className, ...rest },
    ref
) {
    const cls =
        variant === 'menu'
            ? css.menuBtn
            : `${css.toolBtn} ${active ? css.active : ''} ${className || ''}`;
    return (
        <button ref={ref} type="button" className={cls} {...rest}>
            {icon ? <span className={css.icon}>{icon}</span> : null}
            {children ? <span className={css.text}>{children}</span> : null}
        </button>
    );
});

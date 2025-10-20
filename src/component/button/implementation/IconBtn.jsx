import { forwardRef } from 'react';
import style from '../style/IconBtn.module.css';

const IconBtn = forwardRef(function ToolBtn(
    { active, icon, children, className, ...rest },
    ref
) {
    return (
        <button
            className={`${style.wrap} ${className || ''}`}
            type="button"
            {...rest}
            ref={ref}
        >
            {icon && <span className={active ? style.active : ''}>{icon}</span>}
            {children}
        </button>
    );
});
export { IconBtn };

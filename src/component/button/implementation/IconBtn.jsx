import { forwardRef } from 'react';
import style from '../style/IconBtn.module.css';

const IconBtn = forwardRef(function ToolBtn(
    { active, icon, children, className, ...rest },
    ref
) {
    return (
        <button
            ref={ref}
            type="button"
            className={`${style.wrap} ${className || ''}`}
            {...rest}
        >
            {icon ? (
                <span
                    className={`${style.btnIcon} ${active ? style.active : ''}`}
                >
                    {icon}
                </span>
            ) : null}
            {children}
        </button>
    );
});
export { IconBtn };

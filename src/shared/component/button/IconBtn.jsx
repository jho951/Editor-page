import { forwardRef } from 'react';
import style from './IconBtn.module.css';
import { Icon } from '../icon/Icon';

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
            {icon && (
                <span className={active ? style.active : ''}>
                    <Icon name={icon} />
                </span>
            )}
            {children}
        </button>
    );
});
export { IconBtn };

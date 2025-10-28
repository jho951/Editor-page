// src/shared/component/button/IconBtn.jsx
import React, { forwardRef, isValidElement, cloneElement } from 'react';
import styles from './IconBtn.module.css';
import { Icon } from '../icon/Icon';

const IconBtn = forwardRef(function IconBtn(
    {
        icon,
        active = false,
        size = 20,
        className = '',
        title,
        children,
        ...rest
    },
    ref
) {
    const cls = [
        styles.wrap,
        active ? styles.active : '',
        rest.disabled ? styles.disabled : '',
        className || '',
    ]
        .filter(Boolean)
        .join(' ');

    let iconNode = null;
    if (typeof icon === 'string') {
        iconNode = <Icon name={icon} size={size} title={title} />;
    } else if (isValidElement(icon)) {
        const nextProps = {};
        if (icon.props?.size == null) nextProps.size = size;
        if (title && icon.props?.title == null) nextProps.title = title;
        iconNode = Object.keys(nextProps).length
            ? cloneElement(icon, nextProps)
            : icon;
    }

    return (
        <button
            type="button"
            {...rest}
            ref={ref}
            className={cls}
            aria-pressed={active || undefined}
            title={title}
        >
            {iconNode ? <span className={styles.icon}>{iconNode}</span> : null}
            {children}
        </button>
    );
});

export { IconBtn };

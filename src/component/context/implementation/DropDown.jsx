import { useRef, useEffect, useState } from 'react';
import { ToolBtn } from '../../button/implementation/ToolBtn';
import { SafeTrigger } from '../util/variant';

import styles from '../style/DropDown.module.css';

export function DropDown({
    Trigger = ToolBtn,
    triggerProps = {},
    items = [],
    selectedKey = null,
    onSelect,
    classNames = {},
}) {
    const [open, setOpen] = useState(false);
    const wrapRef = useRef(null);
    const triggerRef = useRef(null);

    useEffect(() => {
        const onDoc = (e) => {
            if (!wrapRef.current) return;
            if (!wrapRef.current.contains(e.target)) setOpen(false);
        };
        document.addEventListener('mousedown', onDoc);
        return () => document.removeEventListener('mousedown', onDoc);
    }, []);

    const mergedTriggerProps = {
        ...triggerProps,
        onClick: (e) => {
            triggerProps?.onClick?.(e);
            setOpen((v) => !v);
        },
    };

    const handleSelect = (key) => {
        onSelect?.(key);
        setOpen(false);
    };

    return (
        <div className={classNames.wrap || styles.wrap} ref={wrapRef}>
            <SafeTrigger
                ref={triggerRef}
                Trigger={Trigger}
                triggerProps={mergedTriggerProps}
                className={mergedTriggerProps.className}
            />

            {open && (
                <div className={classNames.panel || styles.panel}>
                    {items.map((it) => {
                        const active = selectedKey === it.key;
                        return (
                            <button
                                key={it.key}
                                type="button"
                                className={`${classNames.item || styles.item} ${
                                    active
                                        ? classNames.checked || styles.checked
                                        : ''
                                }`}
                                onClick={() => handleSelect(it.key)}
                                title={
                                    it.shortcutLabel
                                        ? `${it.label} (${it.shortcutLabel})`
                                        : it.label
                                }
                            >
                                {!!it.icon && (
                                    <span
                                        className={
                                            classNames.icon || styles.icon
                                        }
                                    >
                                        {it.icon}
                                    </span>
                                )}
                                <span className={styles.label}>{it.label}</span>
                                {it.shortcutLabel && (
                                    <span className={styles.kbd}>
                                        {it.shortcutLabel}
                                    </span>
                                )}
                            </button>
                        );
                    })}
                </div>
            )}
        </div>
    );
}

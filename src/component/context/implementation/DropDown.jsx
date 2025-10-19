import { useRef } from 'react';
import { IconBtn } from '../../button/implementation/IconBtn';
import styles from '../style/DropDown.module.css';

function DropDown({
    items = [],
    onSelect,
    selectedKey = null,
    open,
    side = 'right',
    anchorRect,
    content = null,
}) {
    const positionStyle = {};
    const menuRef = useRef(null);
    if (!open) return null;

    if (anchorRect) {
        if (side === 'right') {
            positionStyle.left = anchorRect.right + 4;
            positionStyle.top = anchorRect.top;
        } else if (side === 'bottom') {
            positionStyle.top = anchorRect.bottom + 4;
            positionStyle.left = anchorRect.left;
        }
    }

    return (
        <div
            ref={menuRef}
            role="menu"
            className={styles.menu}
            style={positionStyle}
        >
            {content ||
                items.map((it) => {
                    const checked = selectedKey && selectedKey === it.key;

                    return (
                        <IconBtn
                            key={it.key}
                            className={`${styles.item || ''} ${checked ? styles.checked || '' : ''}`}
                            onClick={() => onSelect?.(it.key)}
                        >
                            {it.icon}
                            <span>{it.label}</span>
                            {it.shortcutLabel && <kbd>{it.shortcutLabel}</kbd>}
                        </IconBtn>
                    );
                })}
        </div>
    );
}

export { DropDown };

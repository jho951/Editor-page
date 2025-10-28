import { IconBtn } from '@/shared/component/button/IconBtn';
import { useScrollLock } from '@/shared/hook';

import styles from './DropDown.module.css';

function DropDown({ items = [], onSelect, active, open, side = 'right' }) {
    useScrollLock(!!open);
    if (!open || !items) return null;

    return (
        <aside className={`${styles.menu} ${styles[side]}`} role="menu">
            {items.map((it) => {
                return (
                    <IconBtn
                        key={it.key}
                        className={styles.item}
                        onClick={() => onSelect?.(it.key)}
                        icon={it.icon}
                        active={active}
                    >
                        <span>{it.label}</span>
                    </IconBtn>
                );
            })}
        </aside>
    );
}

export { DropDown };

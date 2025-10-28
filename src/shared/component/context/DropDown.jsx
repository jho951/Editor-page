import { IconBtn } from '@/shared/component/button/IconBtn';
import styles from './DropDown.module.css';

function DropDown({ items = [], onSelect, active, open, side = 'right' }) {
    if (!open) return null;
    return (
        <aside className={`${styles.menu} ${styles[side]}`} role="menu">
            {items &&
                items.map((it) => {
                    return (
                        <IconBtn
                            key={it.key}
                            className={`${styles.item} ${active ? styles.active : ''}`}
                            onClick={() => onSelect?.(it.key)}
                            icon={it.icon}
                        >
                            <span>{it.label}</span>
                            {it.shortcutLabel && <kbd>{it.shortcutLabel}</kbd>}
                        </IconBtn>
                    );
                })}
        </aside>
    );
}

export { DropDown };

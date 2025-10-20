import { IconBtn } from '../../button/implementation/IconBtn';
import styles from '../style/DropDown.module.css';

function DropDown({ items = [], onSelect, active, open, side = 'right' }) {
    return (
        open && (
            <div role="menu" className={`${styles.menu} ${styles[side]}`}>
                {items &&
                    items.map((it) => {
                        return (
                            <IconBtn
                                key={it.key}
                                className={`${styles.item} ${active ? styles.active : ''}`}
                                onClick={() => onSelect?.(it.key)}
                            >
                                {it.icon}
                                <span>{it.label}</span>
                                {it.shortcutLabel && (
                                    <kbd>{it.shortcutLabel}</kbd>
                                )}
                            </IconBtn>
                        );
                    })}
            </div>
        )
    );
}

export { DropDown };

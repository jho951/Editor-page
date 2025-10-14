import styles from './Button.module.css';

function ToolButton({ active, title, shortcut, onClick, children }) {
    return (
        <button
            className={`${styles.toolBtn} ${active ? styles.active : ''}`}
            onClick={onClick}
            aria-pressed={active}
            title={shortcut ? `${title} (${shortcut})` : title}
            type="button"
        >
            {children}
        </button>
    );
}

export { ToolButton };

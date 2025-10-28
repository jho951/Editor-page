import styles from './Spinner.module.css';

/**
 * 접근성 고려된 로더
 * @param {object} props
 * @param {number} [props.size=28] - 원형 스피너 지름(px)
 * @param {string} [props.label]   - 스크린리더/텍스트 라벨
 * @param {string} [props.className]
 */
function Spinner({ size = 28, label = 'loading…', className }) {
    return (
        <span className={`${styles.root} ${className || ''}`} role="status">
            <span
                className={styles.spinner}
                style={{ '--size': `${size}px` }}
            />
            {label && <span className={styles.label}>{label}</span>}
        </span>
    );
}

export { Spinner };

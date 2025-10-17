import {
    setStroke,
    setFill,
    setStrokeWidth,
} from '../../../lib/redux/slice/toolSlice';

function StylePanel({ styles, draft, dispatch }) {
    const stroke =
        typeof draft.stroke === 'string' && draft.stroke
            ? draft.stroke
            : '#333333';
    const fill =
        typeof draft.fill === 'string'
            ? draft.fill
            : draft.fill == null
              ? ''
              : String(draft.fill);
    const strokeWidth = Number.isFinite(draft.strokeWidth)
        ? draft.strokeWidth
        : 1;
    return (
        <div className={styles.colorGroup}>
            <label className={styles.colorItem} title="윤곽선 색">
                <span
                    className={styles.colorSwatch}
                    style={{ background: draft?.stroke }}
                />
                <input
                    type="color"
                    value={stroke}
                    onChange={(e) => dispatch(setStroke(e.target.value))}
                />
            </label>
            <label className={styles.colorItem} title="채우기 색">
                <span
                    className={styles.colorSwatch}
                    style={{ background: draft?.fill }}
                />
                <input
                    type="color"
                    value={fill}
                    onChange={(e) => dispatch(setFill(e.target.value))}
                />
            </label>
            <label className={styles.strokeWidth} title="선 두께">
                <input
                    type="range"
                    min="1"
                    max="24"
                    step="1"
                    value={strokeWidth}
                    onChange={(e) => dispatch(setStrokeWidth(e.target.value))}
                />
                <span className={styles.strokeBadge}>{strokeWidth}px</span>
            </label>
        </div>
    );
}

export { StylePanel };

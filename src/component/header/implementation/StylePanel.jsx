import React from 'react';
import {
    setStroke,
    setFill,
    setStrokeWidth,
} from '../../../lib/redux/slice/toolSlice';

function StylePanel({ styles, draft, dispatch }) {
    return (
        <div className={styles.colorGroup}>
            <label className={styles.colorItem} title="윤곽선 색">
                <span
                    className={styles.colorSwatch}
                    style={{ background: draft?.stroke }}
                />
                <input
                    type="color"
                    value={draft?.stroke}
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
                    value={draft?.fill}
                    onChange={(e) => dispatch(setFill(e.target.value))}
                />
            </label>
            <label className={styles.strokeWidth} title="선 두께">
                <input
                    type="range"
                    min="1"
                    max="24"
                    step="1"
                    value={draft?.strokeWidth || 2}
                    onChange={(e) => dispatch(setStrokeWidth(e.target.value))}
                />
                <span className={styles.strokeBadge}>
                    {draft?.strokeWidth || 2}px
                </span>
            </label>
        </div>
    );
}

export { StylePanel };

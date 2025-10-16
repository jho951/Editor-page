import { Icon } from '../../icon/implementation/Icon';
import {
    zoomIn,
    zoomOut,
    setZoom,
    resetZoom,
} from '../../../lib/redux/slice/viewportSlice';

import styles from '../style/ZoomPanel.module.css';

function ZoomPanel({ zoom, dispatch }) {
    return (
        <div className={styles.zoomGroup}>
            <button
                className={styles.iconBtn}
                onClick={() => dispatch(zoomOut())}
                title="축소 (-) — ⌘/Ctrl + -"
                type="button"
            >
                <Icon name="minus" />
            </button>
            <input
                className={styles.zoomInput}
                type="number"
                step="0.1"
                min="0.1"
                value={Number(zoom || 1).toFixed(2)}
                onChange={(e) => {
                    const v = Number(e.target.value);
                    if (Number.isFinite(v) && v > 0) dispatch(setZoom(v));
                }}
                aria-label="현재 줌"
            />
            <span className={styles.zoomUnit}>×</span>
            <button
                className={styles.iconBtn}
                onClick={() => dispatch(zoomIn())}
                title="확대 (+) — ⌘/Ctrl + ="
                type="button"
            >
                <Icon name="plus" />
            </button>
            <button
                className={styles.iconBtn}
                onClick={() => dispatch(resetZoom())}
                title="100%로 리셋 (0) — ⌘/Ctrl + 0"
                type="button"
            >
                <Icon name="reset" />
            </button>
        </div>
    );
}
export { ZoomPanel };

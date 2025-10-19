import { useEffect, useMemo, useState } from 'react';
import { Icon } from '../../icon/implementation/Icon';
import {
    zoomIn,
    zoomOut,
    setZoom,
    reset as resetZoom,
} from '../../../lib/redux/slice/viewportSlice';

import styles from '../style/ZoomPanel.module.css';
import { clamp } from '../../../lib/redux/util/guide';

const MIN_ZOOM = 0.1;
const MAX_ZOOM = 8;

function formatZoom(z) {
    const n = Number(z || 1);
    return n.toFixed(2);
}

function ZoomPanel({ zoom, dispatch }) {
    const z = useMemo(() => Number(zoom || 1), [zoom]);
    const [text, setText] = useState(formatZoom(z));

    useEffect(() => {
        setText(formatZoom(z));
    }, [z]);

    const canZoomOut = z > MIN_ZOOM + 1e-6;
    const canZoomIn = z < MAX_ZOOM - 1e-6;

    const applyText = () => {
        const v = Number(text);
        if (Number.isFinite(v) && v > 0) {
            dispatch(setZoom(clamp(v, MIN_ZOOM, MAX_ZOOM)));
        } else {
            setText(formatZoom(z));
        }
    };

    const onInputKey = (e) => {
        if (e.key === 'Enter') {
            e.currentTarget.blur();
            applyText();
        } else if (e.key === 'Escape') {
            setText(formatZoom(z));
            e.currentTarget.blur();
        }
    };

    const onZoomOut = (e) => {
        e.preventDefault();
        if (!canZoomOut) return;
        dispatch(zoomOut({ coarse: e.shiftKey }));
    };
    const onZoomIn = (e) => {
        e.preventDefault();
        if (!canZoomIn) return;
        dispatch(zoomIn({ coarse: e.shiftKey }));
    };

    return (
        <div className={styles.zoomGroup} role="group" aria-label="확대/축소">
            <button
                className={styles.iconBtn}
                onClick={onZoomOut}
                title="축소 (–) — ⌘/Ctrl + -"
                type="button"
                disabled={!canZoomOut}
                aria-label="축소"
            >
                <Icon name="minus" />
            </button>

            <div className={styles.inputWrap}>
                <input
                    className={styles.zoomInput}
                    type="text"
                    inputMode="decimal"
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    onBlur={applyText}
                    onKeyDown={onInputKey}
                    aria-label="현재 줌 배율"
                    placeholder="1.00"
                />
                <span className={styles.zoomUnit} aria-hidden>
                    ×
                </span>
            </div>

            <button
                className={styles.iconBtn}
                onClick={onZoomIn}
                title="확대 (+) — ⌘/Ctrl + ="
                type="button"
                disabled={!canZoomIn}
                aria-label="확대"
            >
                <Icon name="plus" />
            </button>

            <button
                className={styles.iconBtn}
                onClick={() => dispatch(resetZoom())}
                title="100%로 리셋 (0) — ⌘/Ctrl + 0"
                type="button"
                aria-label="100%로 리셋"
            >
                <Icon name="reset" />
            </button>
        </div>
    );
}
export { ZoomPanel };

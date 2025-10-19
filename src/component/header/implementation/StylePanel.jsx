import { useMemo } from 'react';
import {
    setStroke,
    setFill,
    setStrokeWidth,
} from '../../../lib/redux/slice/toolSlice';
import styles from '../style/StylePanel.module.css';

const clamp = (n, a, b) => Math.max(a, Math.min(b, n));
const toNumber = (v, d = 1) => {
    const n = Number(v);
    return Number.isFinite(n) ? n : d;
};

function StylePanel({ draft, dispatch }) {
    const stroke = useMemo(() => {
        return typeof draft?.stroke === 'string' && draft.stroke
            ? draft.stroke
            : '#333333';
    }, [draft]);

    // 빈 문자열('')은 "없음/투명"
    const fill = useMemo(() => {
        if (draft?.fill == null) return '';
        return typeof draft.fill === 'string' ? draft.fill : String(draft.fill);
    }, [draft]);

    const strokeWidth = useMemo(() => {
        return Number.isFinite(draft?.strokeWidth) ? draft.strokeWidth : 1;
    }, [draft]);

    const toggleFillNone = () => {
        const next = fill === '' ? '#cccccc' : '';
        dispatch(setFill(next));
    };

    return (
        <div className={styles.panel} role="group" aria-label="스타일">
            <div className={styles.colorItem}>
                <label className={styles.label}>윤곽선</label>
                <div className={styles.swatchWrap} title="윤곽선 색상">
                    <span
                        className={`${styles.swatch} ${styles.strokeSwatch}`}
                        style={{ background: stroke }}
                        aria-hidden
                    />
                    <input
                        className={styles.colorInput}
                        type="color"
                        value={stroke}
                        onChange={(e) => dispatch(setStroke(e.target.value))}
                        aria-label="윤곽선 색상 선택"
                    />
                </div>
            </div>

            <div className={styles.colorItem}>
                <label className={styles.label}>채우기</label>
                <div
                    className={styles.swatchWrap}
                    title={fill === '' ? '채우기 없음' : '채우기 색상'}
                >
                    <span
                        className={`${styles.swatch} ${styles.fillSwatch} ${fill === '' ? styles.none : ''}`}
                        style={fill !== '' ? { background: fill } : undefined}
                        aria-hidden
                    />
                    <input
                        className={styles.colorInput}
                        type="color"
                        value={fill === '' ? '#cccccc' : fill}
                        onChange={(e) => dispatch(setFill(e.target.value))}
                        disabled={fill === ''} /* 없음일 땐 입력 잠금 */
                        aria-label="채우기 색상 선택"
                    />
                    <button
                        type="button"
                        className={`${styles.noneBtn} ${fill === '' ? styles.noneBtnActive : ''}`}
                        onClick={toggleFillNone}
                        aria-pressed={fill === ''}
                        aria-label={
                            fill === '' ? '채우기 사용' : '채우기 없음으로 설정'
                        }
                        title={
                            fill === '' ? '채우기 사용' : '채우기 없음(투명)'
                        }
                    >
                        ∅
                    </button>
                </div>
            </div>

            {/* Stroke Width */}
            <div className={styles.widthItem}>
                <label className={styles.label}>두께</label>
                <div className={styles.widthControls}>
                    <input
                        className={styles.range}
                        type="range"
                        min="1"
                        max="24"
                        step="1"
                        value={strokeWidth}
                        onChange={(e) =>
                            dispatch(
                                setStrokeWidth(toNumber(e.target.value, 1))
                            )
                        }
                        aria-label="선 두께"
                    />
                    <input
                        className={styles.number}
                        type="number"
                        min="1"
                        max="24"
                        step="1"
                        inputMode="numeric"
                        value={strokeWidth}
                        onChange={(e) => {
                            const n = clamp(
                                toNumber(e.target.value, strokeWidth),
                                1,
                                24
                            );
                            dispatch(setStrokeWidth(n));
                        }}
                        aria-label="선 두께 숫자 입력"
                    />
                    <span className={styles.badge} aria-hidden>
                        px
                    </span>
                </div>
            </div>
        </div>
    );
}

export { StylePanel };

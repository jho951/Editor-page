/**
 * @file RotationControl.jsx
 * @description 회전 컨트롤 (프레젠테이셔널)
 */
export default function RotationControl({ value = 0, onStep, onSet }) {
    return (
        <div className="toolbar-row">
            <div className="toolbar-field-label">회전</div>
            <div className="toolbar-items rotation-group">
                <button
                    type="button"
                    className="tb-btn"
                    onClick={() => onStep?.(-15)}
                    title="회전 -15°"
                >
                    ↺
                </button>
                <input
                    className="tb-number"
                    type="number"
                    min={0}
                    max={359}
                    step={1}
                    value={Math.round(value)}
                    onChange={(e) => onSet?.(e.target.value)}
                />
                <button
                    type="button"
                    className="tb-btn"
                    onClick={() => onStep?.(+15)}
                    title="회전 +15°"
                >
                    ↻
                </button>
            </div>
        </div>
    );
}

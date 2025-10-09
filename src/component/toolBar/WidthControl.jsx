/**
 * @file WidthControl.jsx
 * @description 선 굵기 선택. 프레젠테이셔널 컴포넌트 (Redux 의존 없음)
 */
export default function WidthControl({ widths = [], value = 3, onChange }) {
    const v = Number(value);
    return (
        <div className="toolbar-row">
            <div className="toolbar-field-label">굵기</div>
            <div
                className="toolbar-items width-chip-list"
                role="listbox"
                aria-label="stroke width"
            >
                {widths.map((w) => (
                    <button
                        key={w}
                        type="button"
                        className={`tb-width ${v === w ? 'active' : ''}`}
                        data-width={w}
                        title={`${w}px`}
                        aria-label={`width ${w}px${v === w ? ' (selected)' : ''}`}
                        onClick={() => onChange?.(w)}
                    />
                ))}
            </div>
        </div>
    );
}

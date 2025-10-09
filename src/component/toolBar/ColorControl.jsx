/**
 * @file ColorControl.jsx
 * @description 색상 선택. 프레젠테이셔널 컴포넌트 (Redux 의존 없음)
 */
export default function ColorControl({
    colors = [],
    value = '#000000',
    onChange,
}) {
    return (
        <div className="toolbar-row">
            <div className="toolbar-field-label">색상</div>
            <div
                className="toolbar-items color-swatch-list"
                role="listbox"
                aria-label="stroke color"
            >
                {colors.map((c) => (
                    <button
                        key={c}
                        type="button"
                        className={`tb-swatch ${value === c ? 'active' : ''}`}
                        style={{ background: c }}
                        title={c}
                        aria-label={`color ${c}${value === c ? ' (selected)' : ''}`}
                        onClick={() => onChange?.(c)}
                    />
                ))}
            </div>
        </div>
    );
}

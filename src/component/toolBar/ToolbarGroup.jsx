/**
 * @file ToolbarGroup.jsx
 * @description 카탈로그 그룹(도형/텍스트) 버튼 렌더
 */
function ToolbarGroup({ title, items, isItemActive, onItemClick }) {
    return (
        <div className="toolbar-group" aria-label={title}>
            <div className="toolbar-title">{title}</div>
            <div className="toolbar-items">
                {items.map((item) => (
                    <button
                        key={item.id || `${title}-${item.payload}`}
                        type="button"
                        className={`tb-btn ${isItemActive?.(item) ? 'active' : ''}`}
                        title={
                            item.name +
                            (item.shortcut ? ` (${item.shortcut})` : '')
                        }
                        aria-pressed={!!isItemActive?.(item)}
                        onClick={() => onItemClick?.(item)}
                    >
                        <span className="tb-label">
                            {item.name || String(item.payload)}
                        </span>
                    </button>
                ))}
            </div>
        </div>
    );
}

export default ToolbarGroup;

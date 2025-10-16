import { useDispatch, useSelector } from 'react-redux';

import {
    setTool,
    setStroke,
    setFill,
    setStrokeWidth,
} from '../../../lib/redux/slice/toolSlice';
import {
    zoomIn,
    zoomOut,
    setZoom,
    resetZoom,
} from '../../../lib/redux/slice/viewportSlice';
import {
    historyUndo,
    historyRedo,
} from '../../../lib/redux/middleware/historyDocMiddleware';
import { fetchDrawings } from '../../../lib/redux/thunks/docThunks';

import { ToolBtn } from '../../button/implementation/ToolBtn';
import { Icon } from '../../icon/implementation/Icon';
import { DropDown } from '../../select/implementation/DropDown';

import { HEADER_ELEMENTS } from '../constant/element';
import styles from '../style/Header.module.css';
import { DROPDOWN_SECTION } from '../constant/section';

function Header() {
    const dispatch = useDispatch();

    const { tool, draft } = useSelector((s) => s.tools || {});
    const { zoom } = useSelector((s) => s.viewport);
    const { past = [], future = [] } = useSelector((s) => s.historyDoc);

    const canUndo = past.length > 0;
    const canRedo = future.length > 0;

    // ───────────────────────── 핸들러(공통)
    const handleFile = (key) => {
        switch (key) {
            case 'new':
                /* TODO: 새 문서 */ break;
            case 'save':
                /* TODO: 저장 */ break;
            case 'export':
                dispatch(fetchDrawings());
                break; // 불러오기 목록 갱신
            default:
                break;
        }
    };

    const handleSelect = (key) => {
        // 파일
        if (key === 'new' || key === 'save' || key === 'export')
            return handleFile(key);

        // 도형(프리픽스 제거)
        if (key.startsWith('shape-'))
            return dispatch(setTool(key.replace('shape-', '')));

        // 도구 단일 버튼
        if (key === 'path' || key === 'text') return dispatch(setTool(key));

        // 히스토리
        if (key === 'undo') return dispatch(historyUndo());
        if (key === 'redo') return dispatch(historyRedo());

        // 줌
        if (key === 'in') return dispatch(zoomIn());
        if (key === 'out') return dispatch(zoomOut());
        if (key === 'fit') return dispatch(resetZoom()); // 필요하면 fit-to-screen 로직으로 교체

        // 변형 (자리표시자; 실제 액션으로 교체)
        if (key === 'flipH') return console.info('[flipH] TODO: implement');
        if (key === 'flipV') return console.info('[flipV] TODO: implement');
        if (key === 'rotate') return console.info('[rotate] TODO: implement');
        if (key === 'skew') return console.info('[skew] TODO: implement');
    };

    // 드롭다운 선택 상태(모양만 표시)
    const selectedKeyFor = (sectionId) => {
        if (sectionId !== 'shape') return null;
        const shapeKeys = ['rect', 'ellipse', 'line', 'polygon', 'star'];
        return shapeKeys.includes(tool) ? `shape-${tool}` : null;
    };

    // ───────────────────────── 단일 버튼(객체들만)
    const singleButtons = [
        HEADER_ELEMENTS.FREE_DRAW_ITEM,
        HEADER_ELEMENTS.TEXT_ITEM,
        { ...HEADER_ELEMENTS.UNDO_ITEM, disabled: !canUndo },
        { ...HEADER_ELEMENTS.REDO_ITEM, disabled: !canRedo },
    ].filter(Boolean);

    // 공통 클래스 묶음
    const cls = {
        wrap: styles.dropdownWrap,
        panel: styles.dropdown,
        item: styles.menuItem,
        checked: styles.checked,
        icon: styles.menuIcon,
    };

    return (
        <header
            className={styles.toolbar}
            role="menubar"
            aria-label="상단 헤더"
        >
            {DROPDOWN_SECTION.map((sec) => (
                <DropDown
                    key={sec.id}
                    Trigger={(p) => (
                        <ToolBtn {...p} title={sec.title}>
                            <Icon name={sec.icon} />
                        </ToolBtn>
                    )}
                    items={(sec.items || []).filter(Boolean)}
                    selectedKey={selectedKeyFor(sec.id)}
                    onSelect={handleSelect}
                    ariaLabel={sec.title}
                    classNames={cls}
                />
            ))}

            {/* 단일 객체 → 버튼 */}
            {singleButtons.map((btn) => (
                <ToolBtn
                    key={btn.key}
                    title={
                        btn.shortcutLabel
                            ? `${btn.label} (${btn.shortcutLabel})`
                            : btn.label
                    }
                    disabled={btn.disabled}
                    onClick={() => handleSelect(btn.key)}
                >
                    {btn.icon}
                </ToolBtn>
            ))}
        </header>
    );
}

export { Header };

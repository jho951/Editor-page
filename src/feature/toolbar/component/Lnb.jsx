/**
 * @file Lnb.jsx
 * @description 좌측 도구 선택 바 (Redux 툴바 슬라이스 직접 사용)
 */
import { useCallback, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { IconBtn } from '@/shared/component/button/IconBtn';
import { DropDown } from '@/shared/component/context/DropDown';
import { toArray } from '@/shared/util/to-array';

import styles from './Lnb.module.css';

import { toolbarActions } from '@/feature/toolbar/state/toolbar.slice';
import { HEADER_ELEMENTS } from '@/feature/toolbar/constant/item';
import { DROPDOWN_SECTION } from '@/feature/toolbar/constant/section';
import {
    selectSectionActive,
    selectSidebarOpen,
} from '@/feature/toolbar/state/toolbar.selector';

function Lnb() {
    const dispatch = useDispatch();

    const { toggleSidebar, setTool } = toolbarActions;

    const openKey = useSelector(selectSidebarOpen);
    const sectionActive = useSelector(selectSectionActive);

    const toggle = useCallback(
        (key, hasItems) => {
            const has = Array.isArray(hasItems)
                ? hasItems.length > 0
                : !!hasItems;

            // 드롭다운 항목이 없는 경우: 즉시 도구 선택 실행
            if (!has) {
                // 💡 Redux: onCommand 대신 setTool 액션 사용
                dispatch(setTool(key));
                return;
            }

            // 드롭다운 항목이 있는 경우: 사이드바 열기/닫기 토글
            dispatch(toggleSidebar(key));
        },
        [dispatch, toggleSidebar, setTool] // setTool 추가
    );

    const getSectionIcon = useCallback(
        (sec) => {
            if (sec.key === 'shape') {
                const activeKey = sectionActive?.shape;
                if (activeKey) {
                    const candidates = [
                        ...HEADER_ELEMENTS.DEFAULT_ITEM,
                        ...HEADER_ELEMENTS.SHAPE_ITEM,
                    ];
                    const it = candidates.find((x) => x.key === activeKey);
                    // 💡 activeKey는 toolState의 'tool' 값과 동일하므로, 해당 도구의 아이콘을 가져옴
                    if (it?.icon) return it.icon;
                }
                return sec.icon;
            }
            return sec.icon;
        },
        [sectionActive]
    );

    const isActiveRow = useCallback(
        (sec) => {
            if (sec.key === 'shape') {
                // openKey는 sidebarOpen 상태, sectionActive.shape는 tool 상태
                return openKey === 'shape' || Boolean(sectionActive?.shape);
            }
            if (sec.key === 'file') {
                return openKey === 'file';
            }

            return false;
        },
        [openKey, sectionActive]
    );

    const onSelectItem = useCallback(
        (itemKey) => {
            // 💡 Redux: onCommand 대신 setTool 액션 사용
            // onCommand 대신 setTool 액션을 디스패치하고, 사이드바를 닫음
            dispatch(setTool(itemKey));
            dispatch(toggleSidebar(null)); // 사이드바 닫기 (toggleSidebar(null) 또는 setSidebarOpen(null))
        },
        [dispatch, setTool, toggleSidebar]
    );

    const sections = useMemo(() => DROPDOWN_SECTION, []);

    return (
        <nav className={styles.wrap} aria-label="Toolbar">
            {sections.map((sec) => {
                return (
                    <div className={styles.row} key={sec.key}>
                        <IconBtn
                            className={`${styles.btn} ${isActiveRow(sec) ? styles.btnActive : ''}`}
                            title={sec.label}
                            icon={getSectionIcon(sec)}
                            // 💡 toggle 함수 내에서 Redux 액션을 직접 디스패치
                            onClick={() => toggle(sec.key, toArray(sec.items))}
                        />

                        {openKey === sec.key &&
                            toArray(sec.items).length > 0 && (
                                <DropDown
                                    items={toArray(sec.items)}
                                    onSelect={onSelectItem}
                                    active={sectionActive?.[sec.key]}
                                    open
                                    side="right"
                                />
                            )}
                    </div>
                );
            })}
        </nav>
    );
}

export { Lnb };

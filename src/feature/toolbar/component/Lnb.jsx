// src/feature/header/component/Lnb.jsx
import { useCallback, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { IconBtn } from '@/shared/component/button/IconBtn';

import { DropDown } from '@/shared/component/context/DropDown';

import { toArray } from '@/shared/util/to-array';

import styles from './Lnb.module.css';
import {
    selectSectionActive,
    selectSidebarOpen,
} from '@/feature/header/state/header.selector';
import { setSidebarOpen } from '@/feature/header/state/header.slice';
import { HEADER_ELEMENTS } from '@/feature/header/constant/item';
import { DROPDOWN_SECTION } from '@/feature/header/constant/section';

function Lnb({ onCommand }) {
    const dispatch = useDispatch();
    const openKey = useSelector(selectSidebarOpen);
    const sectionActive = useSelector(selectSectionActive);

    const toggle = useCallback(
        (key, hasItems) => {
            const has = Array.isArray(hasItems)
                ? hasItems.length > 0
                : !!hasItems;
            if (!has) {
                onCommand?.(key); // 아이템 없는 섹션은 즉시 실행
                return;
            }
            dispatch(setSidebarOpen(openKey === key ? null : key));
        },
        [dispatch, onCommand, openKey]
    );

    // tool fallback 제거: 'shape' 아이콘/active는 sectionActive.shape 있을 때만
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
                    if (it?.icon) return it.icon;
                }
                return sec.icon; // 아무 것도 선택 안 됐으면 기본 섹션 아이콘
            }
            // file/transform/history 등은 고정 아이콘
            return sec.icon;
        },
        [sectionActive]
    );

    const isActiveRow = useCallback(
        (sec) => {
            if (sec.key === 'shape') {
                return openKey === 'shape' || Boolean(sectionActive?.shape);
            }
            if (sec.key === 'file') {
                return openKey === 'file'; // 파일은 열렸을 때만 active
            }
            // transform/history는 active 없음
            return false;
        },
        [openKey, sectionActive]
    );

    const onSelectItem = useCallback(
        (itemKey) => {
            onCommand?.(itemKey);
            dispatch(setSidebarOpen(null)); // 선택 후 닫기
        },
        [onCommand, dispatch]
    );

    const sections = useMemo(() => DROPDOWN_SECTION, []);

    return (
        <nav className={styles.wrap} aria-label="Toolbar">
            {sections.map((sec) => {
                const active = isActiveRow(sec);
                const icon = getSectionIcon(sec);
                const items = toArray(sec.items);

                return (
                    <div className={styles.row} key={sec.key}>
                        <IconBtn
                            className={`${styles.btn} ${active ? styles.btnActive : ''}`}
                            title={sec.label}
                            icon={icon}
                            onClick={() => toggle(sec.key, items)}
                        />

                        {openKey === sec.key && items.length > 0 && (
                            <DropDown
                                items={items}
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

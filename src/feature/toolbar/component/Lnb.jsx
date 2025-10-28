import { useCallback, useMemo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { IconBtn } from '@/shared/component/button/IconBtn';
import { DropDown } from '@/shared/component/context/DropDown';
import { toArray } from '@/shared/util/to-array';
import styles from './Lnb.module.css';

import { useHeaderAction } from '../hook/useHeaderAction';
import { toolbarActions } from '@/feature/toolbar/state/toolbar.slice';

import {
    selectSectionActive,
    selectSidebarOpen,
} from '@/feature/toolbar/state/toolbar.selector';

import { HEADER_ELEMENTS } from '@/feature/toolbar/constant/item';
import { DROPDOWN_SECTION } from '@/feature/toolbar/constant/section';

function Lnb() {
    const dispatch = useDispatch();
    const { onCommand } = useHeaderAction();

    const openKey = useSelector(selectSidebarOpen);
    const sectionActive = useSelector(selectSectionActive);

    const toggle = useCallback(
        (sec, hasItems) => {
            const key = typeof sec === 'string' ? sec : sec?.key;

            const has = Array.isArray(hasItems)
                ? hasItems.length > 0
                : !!hasItems;

            // 도형 섹션 클릭 시, 먼저 select로 전환
            if (key === 'shape') {
                dispatch(toolbarActions.setTool('select')); // toolbarSlice 리듀서:contentReference[oaicite:2]{index=2}
            }

            if (!has) {
                onCommand(key);
                return;
            }

            // 열려있으면 닫고, 닫혀있으면 연다
            dispatch(toolbarActions.toggleSidebar(key)); // :contentReference[oaicite:3]{index=3}
        },
        [dispatch, onCommand]
    );

    const getSectionIcon = useCallback(
        (sec) => {
            if (sec.key === 'shape') {
                const activeKey = sectionActive?.shape;
                if (activeKey) {
                    const candidates = [
                        ...HEADER_ELEMENTS.DEFAULT_ITEM, // select 아이콘 포함
                        ...HEADER_ELEMENTS.SHAPE_ITEM,
                    ];
                    const it = candidates.find((x) => x.key === activeKey);
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
                return openKey === 'shape' || Boolean(sectionActive?.shape);
            }
            if (sec.key === 'file') return openKey === 'file';
            if (sec.key === 'transform') return openKey === 'transform';
            return false;
        },
        [openKey, sectionActive]
    );

    const onSelectItem = useCallback(
        (itemKey) => {
            onCommand(itemKey);
            // 드롭다운 닫기: 현재 열려있는 key를 토글
            if (openKey) dispatch(toolbarActions.toggleSidebar(openKey)); // :contentReference[oaicite:4]{index=4}
        },
        [onCommand, dispatch, openKey]
    );

    const sections = useMemo(() => DROPDOWN_SECTION, []);

    return (
        <nav className={styles.wrap} aria-label="Toolbar">
            {sections.map((sec) => (
                <div className={styles.row} key={sec.key}>
                    <IconBtn
                        className={`${styles.btn} ${isActiveRow(sec) ? styles.btnActive : ''}`}
                        title={sec.label}
                        icon={getSectionIcon(sec)}
                        onClick={() => toggle(sec, toArray(sec.items))}
                    />
                    {openKey === sec.key && toArray(sec.items).length > 0 && (
                        <DropDown
                            items={toArray(sec.items)}
                            onSelect={onSelectItem}
                            active={sectionActive?.[sec.key]}
                            open
                            side="right"
                        />
                    )}
                </div>
            ))}
        </nav>
    );
}

export { Lnb };

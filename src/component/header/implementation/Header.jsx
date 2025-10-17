// src/component/header/implementation/Header.jsx
import { useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { DROPDOWN_SECTION } from '../constant/section';
import {
    buildItemIndex,
    makeDispatchCommand,
    TOOL_FROM_KEY,
} from '../util/command';

import { MenuSection } from './MenuSection';
import { StylePanel } from './StylePanel';
import { ZoomPanel } from './ZoomPanel';

import { SaveModal } from '../../modal/implementation/SaveModal';
import { OpenModal } from '../../modal/implementation/OpenModal';

import styles from '../style/Header.module.css';

const SECTION_ICON_NAME = {
    file: 'open',
    shape: 'shape',
    transform: 'transform',
    zoom: 'zoom',
};

const ITEM_ICON_NAME = {
    path: 'freeDraw',
    text: 'text',
    undo: 'undo',
    redo: 'redo',
};

function Header() {
    const dispatch = useDispatch();
    const zoom = useSelector((s) => s.viewport?.zoom ?? 1);
    const draft = useSelector((s) => s.tools?.draft) || {};
    const tool = useSelector((s) => s.tools?.tool) || 'select';

    console.log(tool);

    const ITEM_INDEX = useMemo(() => buildItemIndex(DROPDOWN_SECTION), []);
    const dispatchCommand = useMemo(
        () =>
            makeDispatchCommand(
                ITEM_INDEX,
                dispatch,
                () => window.__REDUX_STORE__?.getState?.() || {}
            ),
        [ITEM_INDEX, dispatch]
    );

    const [openId, setOpenId] = useState(null);
    const openDropdown = (id) => setOpenId(id);
    const closeDropdown = () => setOpenId(null);
    const toggleDropdown = (id) => setOpenId((p) => (p === id ? null : id));

    const selectedShapeKey = useMemo(() => {
        return TOOL_FROM_KEY[tool] ?? null;
    }, [tool]);

    return (
        <>
            <header className={styles.header}>
                <nav className={styles.left}>
                    {DROPDOWN_SECTION.map((entry) => {
                        const isDropdown = Array.isArray(entry?.items);

                        if (isDropdown) {
                            const active = openId === entry.id;
                            return (
                                <div
                                    key={entry.id}
                                    className={styles.navItem}
                                    onMouseEnter={() => openDropdown(entry.id)}
                                    onMouseLeave={closeDropdown}
                                >
                                    <MenuSection
                                        title={entry.title}
                                        icon={
                                            SECTION_ICON_NAME[entry.id] ||
                                            'menu'
                                        }
                                        items={entry.items}
                                        selectedKey={
                                            entry.id === 'shape'
                                                ? selectedShapeKey
                                                : null
                                        }
                                        onSelect={(key) => {
                                            dispatchCommand(key);
                                            closeDropdown();
                                        }}
                                        ariaLabel={entry.title}
                                        classNames={{
                                            wrap: styles.dropdownWrap,
                                            menu: styles.dropdownRight,
                                            item: styles.menuItem,
                                            checked: styles.checked,
                                        }}
                                        TriggerProps={{
                                            onClick: () =>
                                                toggleDropdown(entry.id),
                                            title: entry.title,
                                            'aria-expanded': active,
                                        }}
                                    />
                                </div>
                            );
                        }

                        const it = entry;
                        return (
                            <div key={it.key} className={styles.navItem}>
                                <button
                                    type="button"
                                    className={styles.navButton}
                                    onClick={() => dispatchCommand(it)}
                                    title={
                                        it.shortcutLabel
                                            ? `${it.label} (${it.shortcutLabel})`
                                            : it.label
                                    }
                                >
                                    {it.icon}
                                    <span>{it.label}</span>
                                </button>
                            </div>
                        );
                    })}
                </nav>

                {/* 가운데: 스타일 패널 */}
                <section className={styles.center}>
                    <StylePanel
                        styles={styles}
                        draft={draft}
                        dispatch={dispatch}
                    />
                </section>

                {/* 우: 줌 패널 */}
                <section className={styles.right}>
                    <ZoomPanel zoom={zoom} dispatch={dispatch} />
                </section>
            </header>
            {/* 모달 */}
            <SaveModal />
            <OpenModal />
        </>
    );
}

export { Header };

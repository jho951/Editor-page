import { useMemo, useRef, useState, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { DROPDOWN_SECTION } from '../constant/section';
import {
    buildItemIndex,
    makeDispatchCommand,
    TOOL_FROM_KEY,
} from '../util/command';
import { useHeaderShortcuts } from '../hook/useHeaderShortcuts';

import { DropDown } from '../../context/implementation/DropDown';
import { Icon } from '../../icon/implementation/Icon';
import { StylePanel } from './StylePanel';
import { ZoomPanel } from './ZoomPanel';

import { SaveModal } from '../../modal/implementation/SaveModal';
import { OpenModal } from '../../modal/implementation/OpenModal';

import { IconBtn } from '../../button/implementation/IconBtn';

import styles from '../style/Header.module.css';

function Header() {
    const dispatch = useDispatch();
    const zoom = useSelector((s) => s.viewport?.zoom);

    const tool = useSelector((s) => s.tool);

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

    useHeaderShortcuts({ dispatchCommand });

    const [open, setOpen] = useState(false);

    const [openId, setOpenId] = useState(null);

    const [anchorRect, setAnchorRect] = useState(null);

    const buttonRefs = useRef({});

    const onClickSection = useCallback(
        (id) => (e) => {
            const rect = e.currentTarget.getBoundingClientRect();
            setOpenId((prev) => (prev === id && open ? null : id));
            setOpen((prev) => (openId !== id ? true : !prev));
            setAnchorRect(rect);
        },
        [open, openId]
    );

    const closeMenu = useCallback(() => {
        setOpen(false);
        setOpenId(null);
        setAnchorRect(null);
    }, []);

    const closeDropdownOnly = useCallback(() => {
        setOpen(false);
        setAnchorRect(null);
    }, []);

    const selectedShapeKey = useMemo(() => {
        for (const [k, v] of Object.entries(TOOL_FROM_KEY))
            if (v === tool.tool) return k;
        return null;
    }, [tool]);

    const currentSection = useMemo(
        () => DROPDOWN_SECTION.find((s) => s?.key === openId),
        [openId]
    );

    const customContent = useMemo(() => {
        if (openId === 'style') {
            return <StylePanel draft={tool.draft} dispatch={dispatch} />;
        }
        if (openId === 'zoom') {
            return <ZoomPanel zoom={zoom} dispatch={dispatch} />;
        }
        return null;
    }, [openId, tool, dispatch, zoom]);

    return (
        <>
            <header className={styles.header}>
                <div className={styles.leftRail}>
                    {DROPDOWN_SECTION.map((section) => {
                        if (!section.key) return null;

                        const active = open && openId === section.key;
                        const title = section.title || section.label;

                        const isHistoryItem =
                            section.key === 'undo' || section.key === 'redo';

                        const onClickHandler = isHistoryItem
                            ? () => dispatchCommand(section.key)
                            : onClickSection(section.key);

                        return (
                            <IconBtn
                                key={section.key}
                                ref={(r) =>
                                    (buttonRefs.current[section.key] = r)
                                }
                                type="button"
                                active={active}
                                icon={<Icon name={section.key} size={26} />}
                                title={title}
                                onClick={onClickHandler}
                            />
                        );
                    })}
                </div>
            </header>

            <DropDown
                open={open}
                onClose={closeMenu}
                anchorRect={anchorRect}
                items={currentSection?.items}
                onSelect={(key) => {
                    dispatchCommand(key);
                    closeDropdownOnly();
                }}
                selectedKey={selectedShapeKey}
                content={customContent}
            />

            <SaveModal />
            <OpenModal />
        </>
    );
}

export { Header };

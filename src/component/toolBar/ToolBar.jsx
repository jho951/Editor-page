/**
 * @file Toolbar.jsx
 * @description 벡터 도형/텍스트 선택 + 스타일 컨트롤 + Undo/Redo 단축키
 * - props 없음: 전부 Redux로 관리
 */
import { useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { SHAPE, STYLE, TEXT } from '../../constant';
import VectorUndoRedoControl from '../historybtn/VectorBtn';
import ToolbarGroup from './ToolbarGroup';
import ColorControl from './ColorControl';
import WidthControl from './WidthControl';

import { selectEffectiveStyle, setStroke } from '../../redux/slice/styleSlice';
import { UNDO_VECTOR, REDO_VECTOR } from '../../redux/middleware/middleware';
import {
    setTool,
    toggleTextMode,
    selectTool,
    selectTextMode,
} from '../../redux/slice/uiSlice';

function Toolbar() {
    const dispatch = useDispatch();

    const currentTool = useSelector(selectTool);
    const textMode = useSelector(selectTextMode);

    const style = useSelector(selectEffectiveStyle);
    const strokeColor =
        typeof style?.stroke?.color === 'object'
            ? style.stroke.color.value || '#000000'
            : style?.stroke?.color || '#000000';
    const strokeWidth = Number(style?.stroke?.width ?? 2);

    const shapeGroup = useMemo(
        () => ({
            key: 'shapes',
            title: 'Shapes',
            items: SHAPE.SHAPES,
        }),
        []
    );

    const textGroup = useMemo(
        () => ({
            key: 'text',
            title: 'Text',
            items: [
                {
                    id: 'tool_text',
                    type: 'shape',
                    payload: 'text',
                    name: '텍스트',
                    icon: 'text',
                    shortcut: 'T',
                    cursor: 'text',
                    meta: TEXT?.default ?? {},
                },
            ],
        }),
        []
    );

    const COLOR_LIST = STYLE.strokeColors;
    const WIDTH_LIST = STYLE.strokeWidths;

    const handleItemClick = (item) => {
        if (item.payload === 'text') {
            dispatch(toggleTextMode());
            return;
        }
        dispatch(setTool(item.payload));
    };

    const isItemActive = (item) => {
        if (item.payload === 'text') return textMode;
        return !textMode && item.payload === currentTool;
    };

    useEffect(() => {
        const onKeyDown = (e) => {
            const tag = (e.target && e.target.tagName) || '';
            if (/INPUT|TEXTAREA|SELECT/.test(tag)) return;

            const ctrl = e.ctrlKey || e.metaKey;

            if (ctrl && !e.shiftKey && e.key.toLowerCase() === 'z') {
                e.preventDefault();
                dispatch({ type: UNDO_VECTOR });
                return;
            }
            if (
                (ctrl && e.shiftKey && e.key.toLowerCase() === 'z') ||
                (ctrl && e.key.toLowerCase() === 'y')
            ) {
                e.preventDefault();
                dispatch({ type: REDO_VECTOR });
                return;
            }

            if (!ctrl && e.key.toUpperCase() === 'T') {
                e.preventDefault();
                dispatch(toggleTextMode());
                return;
            }

            const match = SHAPE.SHAPES.find(
                (it) =>
                    String(it.shortcut || '').toUpperCase() ===
                    e.key.toUpperCase()
            );
            if (match) {
                e.preventDefault();
                dispatch(setTool(match.payload));
            }
        };

        window.addEventListener('keydown', onKeyDown);
        return () => window.removeEventListener('keydown', onKeyDown);
    }, [dispatch]);

    const onChangeColor = (nextColor) =>
        dispatch(setStroke({ color: nextColor }));
    const onChangeWidth = (nextWidth) =>
        dispatch(setStroke({ width: Number(nextWidth) }));

    return (
        <nav className="toolbar-wrap">
            <ToolbarGroup
                key={shapeGroup.key}
                title={shapeGroup.title}
                items={shapeGroup.items}
                isItemActive={isItemActive}
                onItemClick={handleItemClick}
            />
            <ToolbarGroup
                key={textGroup.key}
                title={textGroup.title}
                items={textGroup.items}
                isItemActive={isItemActive}
                onItemClick={handleItemClick}
            />

            <VectorUndoRedoControl />

            <ColorControl
                colors={COLOR_LIST}
                value={strokeColor}
                onChange={onChangeColor}
            />
            <WidthControl
                widths={WIDTH_LIST}
                value={strokeWidth}
                onChange={onChangeWidth}
            />
        </nav>
    );
}

export default Toolbar;

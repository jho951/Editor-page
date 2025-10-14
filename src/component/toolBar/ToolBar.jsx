import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';

import {
    setTool,
    setStroke,
    setFill,
    setStrokeWidth,
} from '../../redux/slice/toolSlice';
import {
    zoomIn,
    zoomOut,
    setZoom,
    resetZoom,
} from '../../redux/slice/viewportSlice';

import {
    historyUndo,
    historyRedo,
} from '../../redux/middleware/historyDocMiddleware';

import {
    fetchDrawings,
    loadDrawing,
    newDrawing,
} from '../../redux/slice/docSlice';

import { ToolButton } from '../button/Button';
import { SHAPE_TOOLS, TRANSFORM_ITEM } from '../../constant/handle';
import { Separator } from '../seperator/Separator';

import {
    IconBucket,
    IconEyedrop,
    IconMagnifier,
    IconMinus,
    IconOpen,
    IconPlus,
    IconRedo,
    IconReset,
    IconSave,
    IconSelect,
    IconShapes,
    IconText,
    IconTransform,
    IconUndo,
} from '../icon/Icon';

import styles from './Toolbar.module.css';
import LoadModal from '../modal/Modal';

export default function Toolbar() {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { past = [], future = [] } = useSelector((s) => s.historyDoc || {});

    const { tool, draft } = useSelector((s) => s.tools || s.tool || {});
    const { zoom } = useSelector((s) => s.viewport || { zoom: 1 });
    const {
        items: docs = [],
        loading: docLoading,
        error: docError,
    } = useSelector((s) => s.doc || {});

    const [openShapes, setOpenShapes] = useState(false);
    const [openTransforms, setOpenTransforms] = useState(false);
    const [openLoad, setOpenLoad] = useState(false);

    const canUndo = past.length > 0;
    const canRedo = future.length > 0;

    const onSelectTool = (key) => {
        dispatch(setTool(key));
        setOpenShapes(false);
        setOpenTransforms(false);
    };

    const onStrokeChange = (e) => dispatch(setStroke(e.target.value));
    const onFillChange = (e) => dispatch(setFill(e.target.value));
    const onStrokeWidthChange = (e) => dispatch(setStrokeWidth(e.target.value));

    const onZoomIn = () => dispatch(zoomIn());
    const onZoomOut = () => dispatch(zoomOut());
    const onZoomReset = () => dispatch(resetZoom());

    const onZoomInput = (e) => {
        const v = Number(e.target.value);
        if (Number.isFinite(v) && v > 0) {
            dispatch(setZoom(v));
        }
    };

    const onNewDrawing = () => {
        dispatch(newDrawing());
    };

    useEffect(() => {
        const onKey = (e) => {
            const isMod = e.ctrlKey || e.metaKey;
            const k = e.key.toLowerCase();
            if (!isMod) return;

            if (k === 'z' && !e.shiftKey) {
                dispatch(historyUndo());
                e.preventDefault();
                return;
            }
            if (k === 'y' || (k === 'z' && e.shiftKey)) {
                dispatch(historyRedo());
                e.preventDefault();
                return;
            }
        };
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, [dispatch]);

    return (
        <>
            <div
                className={styles.toolbar}
                role="toolbar"
                aria-label="Drawing toolbar"
            >
                <div className={styles.zoomGroup}>
                    <button
                        className={styles.iconBtn}
                        onClick={() => setOpenLoad(true)}
                        title="불러오기"
                    >
                        <IconOpen />
                    </button>

                    <button
                        className={styles.iconBtn}
                        onClick={() => setOpenLoad(true)}
                        title="저장하기"
                    >
                        <IconSave />
                    </button>
                </div>
                <Separator />
                <ToolButton
                    active={tool === 'select'}
                    title="선택 도구"
                    shortcut="V"
                    onClick={() => onSelectTool('select')}
                >
                    <IconSelect />
                </ToolButton>

                {/* 색 채우기 */}
                <ToolButton
                    active={tool === 'fill'}
                    title="색 채우기"
                    shortcut="G"
                    onClick={() => onSelectTool('fill')}
                >
                    <IconBucket />
                </ToolButton>

                {/* 텍스트 */}
                <ToolButton
                    active={tool === 'text'}
                    title="텍스트"
                    shortcut="T"
                    onClick={() => onSelectTool('text')}
                >
                    <IconText />
                </ToolButton>

                {/* 스포이드 */}
                <ToolButton
                    active={tool === 'picker'}
                    title="색 선택 도구"
                    shortcut="I"
                    onClick={() => onSelectTool('picker')}
                >
                    <IconEyedrop />
                </ToolButton>

                {/* 돋보기 */}
                <ToolButton
                    active={tool === 'zoom'}
                    title="확대/축소"
                    shortcut="Z"
                    onClick={() => onSelectTool('zoom')}
                >
                    <IconMagnifier />
                </ToolButton>

                <Separator />

                {/* 도형 드롭다운 */}
                <div className={styles.dropdownWrap}>
                    <ToolButton
                        active={tool?.startsWith('shape') || tool === 'path'}
                        title="도형"
                        shortcut="U"
                        onClick={() => setOpenShapes((v) => !v)}
                    >
                        <IconShapes />
                    </ToolButton>
                    {openShapes && (
                        <div
                            className={styles.dropdown}
                            role="menu"
                            aria-label="Shapes"
                        >
                            {SHAPE_TOOLS.map((t) => (
                                <button
                                    key={t.key}
                                    className={`${styles.menuItem} ${tool === t.key ? styles.checked : ''}`}
                                    onClick={() => onSelectTool(t.key)}
                                    type="button"
                                    role="menuitemradio"
                                    aria-checked={tool === t.key}
                                    title={t.label}
                                >
                                    <span className={styles.menuIcon}>
                                        {t.icon}
                                    </span>
                                    <span>{t.label}</span>
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {/* 변형(크기/기울기/회전/뒤집기) */}
                <div className={styles.dropdownWrap}>
                    <ToolButton
                        active={[
                            'resize',
                            'skew',
                            'rotate',
                            'flipH',
                            'flipV',
                        ].includes(tool)}
                        title="크기/기울기/회전/대칭"
                        shortcut="R"
                        onClick={() => setOpenTransforms((v) => !v)}
                    >
                        <IconTransform />
                    </ToolButton>
                    {openTransforms && (
                        <div
                            className={styles.dropdown}
                            role="menu"
                            aria-label="Transforms"
                        >
                            {TRANSFORM_ITEM.map((t) => (
                                <button
                                    key={t.key}
                                    className={`${styles.menuItem} ${tool === t.key ? styles.checked : ''}`}
                                    onClick={() => onSelectTool(t.key)}
                                    type="button"
                                    role="menuitemradio"
                                    aria-checked={tool === t.key}
                                    title={t.label}
                                >
                                    <span className={styles.menuIcon}>
                                        {t.icon}
                                    </span>
                                    <span>{t.label}</span>
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                <Separator />

                <div
                    className={styles.zoomGroup}
                    aria-label="실행 취소/다시 실행"
                >
                    <button
                        className={styles.iconBtn}
                        title="실행 취소 (Ctrl/Cmd+Z)"
                        onClick={() => dispatch(historyUndo())}
                        type="button"
                        disabled={!canUndo}
                    >
                        <IconUndo />
                    </button>
                    <button
                        className={styles.iconBtn}
                        title="다시 실행 (Ctrl+Y 또는 Shift+Ctrl/Cmd+Z)"
                        onClick={() => dispatch(historyRedo())}
                        type="button"
                        disabled={!canRedo}
                    >
                        <IconRedo />
                    </button>
                </div>
                <Separator />

                <Separator />

                {/* 스타일 컨트롤: 선색/채움/두께 */}
                <div className={styles.colorGroup} aria-label="스타일">
                    <label className={styles.colorItem} title="윤곽선 색">
                        <span
                            className={styles.colorSwatch}
                            style={{ background: draft?.stroke }}
                        />
                        <input
                            type="color"
                            value={draft?.stroke}
                            onChange={onStrokeChange}
                        />
                    </label>
                    <label className={styles.colorItem} title="채우기 색">
                        <span
                            className={styles.colorSwatch}
                            style={{ background: draft?.fill }}
                        />
                        <input
                            type="color"
                            value={draft?.fill}
                            onChange={onFillChange}
                        />
                    </label>
                    <label className={styles.strokeWidth} title="선 두께">
                        <input
                            type="range"
                            min="1"
                            max="24"
                            step="1"
                            value={draft?.strokeWidth || 2}
                            onChange={onStrokeWidthChange}
                        />
                        <span className={styles.strokeBadge}>
                            {draft?.strokeWidth || 2}px
                        </span>
                    </label>
                </div>

                <Separator />

                {/* 줌 컨트롤 */}
                <div className={styles.zoomGroup} aria-label="확대/축소">
                    <button
                        className={styles.iconBtn}
                        onClick={onZoomOut}
                        title="축소 (-)"
                        type="button"
                    >
                        <IconMinus />
                    </button>
                    <input
                        className={styles.zoomInput}
                        type="number"
                        step="0.1"
                        min="0.1"
                        value={Number(zoom || 1).toFixed(2)}
                        onChange={onZoomInput}
                        aria-label="현재 줌"
                    />
                    <span className={styles.zoomUnit}>×</span>
                    <button
                        className={styles.iconBtn}
                        onClick={onZoomIn}
                        title="확대 (+)"
                        type="button"
                    >
                        <IconPlus />
                    </button>
                    <button
                        className={styles.iconBtn}
                        onClick={onZoomReset}
                        title="100%로 리셋 (0)"
                        type="button"
                    >
                        <IconReset />
                    </button>
                </div>
            </div>

            <LoadModal open={openLoad} onClose={() => setOpenLoad(false)} />
        </>
    );
}

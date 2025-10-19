import { setTool, setCursor } from '../../../lib/redux/slice/toolSlice';
import {
    zoomIn,
    zoomOut,
    fitIn as fit,
} from '../../../lib/redux/slice/viewportSlice';
import { undo, redo } from '../../../lib/redux/slice/historySlice';
import { fetchDrawings, saveDoc } from '../../../lib/redux/util/async';
import {
    openLoadModal,
    openSaveModal,
} from '../../../lib/redux/slice/docSlice';
import {
    enterPathEdit,
    enterTextEdit,
    exitEdit,
} from '../../../lib/redux/slice/editSlice';
import {
    deletePolylineNode,
    translateShapes,
} from '../../../lib/redux/slice/shapeSlice';

function getSelectedId(state) {
    return state?.selection?.id ?? null;
}

export const buildItemIndex = (sections) => {
    const map = new Map();
    sections.forEach((entry) => {
        if (Array.isArray(entry?.items))
            entry.items.forEach((it) => {
                if (it?.key) map.set(it.key, it);
            });
        else if (entry?.key) map.set(entry.key, entry);
    });
    return map;
};

export const TOOL_FROM_KEY = {
    rect: 'rect',
    ellipse: 'ellipse',
    line: 'line',
    polygon: 'polygon',
    star: 'star',
    path: 'path',
    text: 'text',
};

export const makeDispatchCommand = (
    ITEM_INDEX,
    dispatch,
    getState = () => ({})
) => {
    return (keyOrItem) => {
        const key = typeof keyOrItem === 'string' ? keyOrItem : keyOrItem?.key;
        const item =
            typeof keyOrItem === 'object' && keyOrItem
                ? keyOrItem
                : ITEM_INDEX.get(key);
        const c = item?.cursor || 'default';
        if (!key) return;

        // ───────── 도구 ─────────
        if (TOOL_FROM_KEY[key]) {
            dispatch(setTool(TOOL_FROM_KEY[key]));
            dispatch(setCursor(c));
            return;
        }
        if (key === 'select') {
            dispatch(setTool('select'));
            dispatch(setCursor('default'));
            return;
        }

        // ───────── 편집 모드 ─────────
        if (key === 'edit-enter') {
            const s = getState();
            const id = getSelectedId(s);
            if (!id) return;
            const shape = s?.shape?.list?.find?.((x) => x.id === id);
            if (!shape) return;
            if (shape.type === 'text') dispatch(enterTextEdit({ id }));
            else if (['polyline', 'polygon', 'path'].includes(shape.type))
                dispatch(enterPathEdit({ id }));
            dispatch(setCursor('default'));
            return;
        }
        if (key === 'edit-exit') {
            dispatch(exitEdit());
            dispatch(setCursor('default'));
            return;
        }
        if (key === 'node-delete') {
            const s = getState();
            const id = getSelectedId(s);
            const idx = s?.edit?.hoverNode?.index;
            if (id != null && Number.isFinite(idx))
                dispatch(deletePolylineNode({ id, index: idx }));
            dispatch(setCursor('default'));
            return;
        }

        // ───────── 이동(nudge) ─────────
        if (key.startsWith('nudge')) {
            const s = getState();
            const id = getSelectedId(s);
            if (!id) return;
            const delta = key.includes('10') ? 10 : 1;
            const dx = key.endsWith('left')
                ? -delta
                : key.endsWith('right')
                  ? delta
                  : 0;
            const dy = key.endsWith('up')
                ? -delta
                : key.endsWith('down')
                  ? delta
                  : 0;
            dispatch(translateShapes({ ids: [id], dx, dy }));
            dispatch(setCursor('default'));
            return;
        }

        // ───────── 줌 ─────────
        if (key === 'in' || key === 'zoom-in') {
            dispatch(zoomIn());
            dispatch(setCursor(c));
            return;
        }
        if (key === 'out' || key === 'zoom-out') {
            dispatch(zoomOut());
            dispatch(setCursor(c));
            return;
        }
        if (key === 'fit' || key === 'zoom-fit') {
            dispatch(fit());
            dispatch(setCursor(c));
            return;
        }

        // ───────── 파일 ─────────
        if (key === 'new') {
            window.open('/edit/new', '_blank', 'noopener');
            dispatch(setCursor(c));
            return;
        }
        if (key === 'save') {
            dispatch(openSaveModal());
            dispatch(setCursor(c));
            return;
        }
        if (key === 'quick-save') {
            dispatch(saveDoc());
            dispatch(setCursor(c));
            return;
        }
        if (key === 'open' || key === 'export') {
            dispatch(fetchDrawings()).finally(() => {
                dispatch(openLoadModal());
                dispatch(setCursor(c));
            });
            return;
        }

        // ───────── 히스토리 ─────────
        if (key === 'undo') {
            dispatch(undo());
            dispatch(setCursor(c));
            return;
        }
        if (key === 'redo') {
            dispatch(redo());
            dispatch(setCursor(c));
            return;
        }

        // ───────── 트랜스폼 (미들웨어 해석) ─────────
        if (key === 'rotate-90') {
            dispatch(setTool({ type: 'rotate', deg: 90 }));
            dispatch(setCursor(c));
            return;
        }
        if (key === 'rotate-180') {
            dispatch(setTool({ type: 'rotate', deg: 180 }));
            dispatch(setCursor(c));
            return;
        }
        if (key === 'flipH') {
            dispatch(setTool({ type: 'flipH' }));
            dispatch(setCursor(c));
            return;
        }
        if (key === 'flipV') {
            dispatch(setTool({ type: 'flipV' }));
            dispatch(setCursor(c));
            return;
        }
        if (key === 'skew') {
            dispatch(setTool({ type: 'skew' }));
            dispatch(setCursor(c));
            return;
        }

        // 기본: 커서만 정리
        dispatch(setCursor(c));
    };
};

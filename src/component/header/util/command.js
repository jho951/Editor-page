// src/component/header/util/command.js
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

// 선택 id (단일 선택 가정)
function getSelectedId(state) {
    return state?.selection?.id ?? null;
}

// 섹션 배열 → key→item 맵
export const buildItemIndex = (sections) => {
    const map = new Map();
    sections.forEach((entry) => {
        if (Array.isArray(entry?.items)) {
            entry.items.forEach((it) => {
                if (it?.key) map.set(it.key, it);
            });
        } else if (entry?.key) {
            map.set(entry.key, entry);
        }
    });
    return map;
};

// shape 드롭다운 키 → 실제 tool 값
export const TOOL_FROM_KEY = {
    'shape-rect': 'rect',
    'shape-ellipse': 'ellipse',
    'shape-line': 'line',
    'shape-polygon': 'polygon',
    'shape-star': 'star',
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

        // ───────── 도구 (shape/path/text) ─────────
        if (TOOL_FROM_KEY[key]) {
            dispatch(setTool(TOOL_FROM_KEY[key]));
            dispatch(setCursor(c));
            return;
        }

        // ───────── 편집 모드 진입/종료 ─────────
        if (key === 'edit-enter') {
            const state = getState();
            const id = getSelectedId(state);
            if (!id) return;
            const shape = state?.shape?.list?.find?.((s) => s.id === id);
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
            // TODO: path 편집 중 노드 삭제 액션 연결
            // dispatch(deletePolylineNode({ id: targetId, index: hoverNode.index }));
            return;
        }

        // ───────── 줌 ─────────
        if (key === 'in') {
            dispatch(zoomIn());
            dispatch(setCursor(c));
            return;
        }
        if (key === 'out') {
            dispatch(zoomOut());
            dispatch(setCursor(c));
            return;
        }
        if (key === 'fit') {
            dispatch(fit(/* 필요시 payload */));
            dispatch(setCursor(c));
            return;
        }

        // ───────── 파일 ─────────
        if (key === 'new' || key === 'file-new') {
            // 새 탭 새 문서
            window.open('/edit/new', '_blank', 'noopener');
            dispatch(setCursor(c));
            return;
        }
        if (key === 'save' || key === 'file-save') {
            // 이름 저장 모달
            dispatch(openSaveModal());
            dispatch(setCursor(c));
            return;
        }
        if (key === 'quick-save') {
            // 바로 저장(thunk saveDoc)
            dispatch(saveDoc());
            dispatch(setCursor(c));
            return;
        }
        if (key === 'open' || key === 'export' || key === 'file-open') {
            // 불러오기 모달(리스트 갱신 후 오픈)
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

        // ───────── 트랜스폼 (미들웨어가 setTool payload 해석) ─────────
        if (key === 'rotate') {
            dispatch(setTool({ type: 'rotate', deg: 90 }));
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

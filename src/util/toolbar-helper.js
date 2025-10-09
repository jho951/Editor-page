/**
 * @file toolbar-helpers.js
 * @description Toolbar 관련 공통 유틸 (그룹 빌드, 단축키, 활성 판별, 확대/회전/스타일 안전 처리)
 */

// ───────────────────────── 그룹 빌드 ─────────────────────────
export function buildCatalogGroups({ TOOL, SHAPE, TEXT, IMAGE, SELECT }) {
    return [
        {
            key: 'shape',
            title: '도형',
            items: Array.isArray(SHAPE?.SHAPES) ? SHAPE.SHAPES : [],
        },
        {
            key: 'text',
            title: '텍스트',
            items: Array.isArray(TEXT?.TEXTS) ? TEXT.TEXTS : [],
        },
        {
            key: 'image',
            title: '이미지',
            items: Array.isArray(IMAGE?.IMAGES) ? IMAGE.IMAGES : [],
        },
        {
            key: 'select',
            title: '선택',
            items: Array.isArray(SELECT?.SELECTS) ? SELECT.SELECTS : [],
        },
    ];
}

// ───────────────────────── 활성 상태 판별 ─────────────────────────
export function makeIsItemActive(
    { MODE, SHAPE, TEXT, IMAGE, SELECT },
    getState
) {
    // getState: () => ({ mode, tool, shape })
    return function isItemActive(item) {
        const { mode, shape } = getState();
        if (item.type === SHAPE?.SHAPE_TYPE)
            return mode === MODE.SHAPE && shape === item.payload;
        if (item.type === TEXT?.TEXT_TYPE) return mode === MODE.TEXT;
        if (item.type === IMAGE?.IMAGE_TYPE) return mode === MODE.IMAGE;
        if (item.type === SELECT?.SELECT_TYPE) return mode === MODE.SELECT;
        return false;
    };
}

// ───────────────────────── 단축키 핸들러 ─────────────────────────
export function createShortcutHandler(dispatch, dispatchFromShortcut, groups) {
    // groups: [{items: [...]}, ...]
    return function onKeyDown(e) {
        const t = e.target;
        if (
            t &&
            (t.tagName === 'INPUT' ||
                t.tagName === 'TEXTAREA' ||
                t.isContentEditable)
        )
            return;
        const listOfItems = groups.map((g) => g.items);
        dispatchFromShortcut(dispatch, e.key, listOfItems);
    };
}

// ───────────────────────── 확대/축소, 회전 계산 ─────────────────────────
export const clampZoom = (v) => Math.max(0.1, Math.min(8, v));

export function nextZoom(currentZoom, delta) {
    const now = Number.isFinite(currentZoom) ? Number(currentZoom) : 1;
    return clampZoom(now + delta);
}

export function zoomFromInput(input) {
    const n = Number(input);
    return Number.isFinite(n) ? clampZoom(n) : null;
}

export function nextRotation(currentRotation, delta) {
    let base = Number.isFinite(currentRotation) ? Number(currentRotation) : 0;
    let next = (base + delta) % 360;
    if (next < 0) next += 360;
    return next;
}

export function rotationFromInput(input) {
    const n = Number(input);
    if (!Number.isFinite(n)) return null;
    let next = n % 360;
    if (next < 0) next += 360;
    return next;
}

// ───────────────────────── 스타일/상수 안전 접근 ─────────────────────────
export function getSafeStroke(style) {
    const s = style || {};
    const stroke = s?.stroke || {};
    return {
        color: stroke.color ?? '#000000',
        width: Number(stroke.width ?? 3),
    };
}

export function getColorList(STYLE_CONST) {
    return Array.isArray(STYLE_CONST?.ALLOWED_COLOR)
        ? STYLE_CONST.ALLOWED_COLOR.map((c) => c.value)
        : [];
}

export function getWidthList(STYLE_CONST) {
    return Array.isArray(STYLE_CONST?.ALLOWED_WIDTH)
        ? STYLE_CONST.ALLOWED_WIDTH.map((w) => w.value)
        : [];
}

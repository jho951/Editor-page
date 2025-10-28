/**
 * @file icons.js
 * @author YJH
 * @description 중앙 아이콘 레지스트리 (중복 제거, undo/redo 개선 포함)
 *
 * 구조:
 * ICONS[key] = {
 *   vb: '0 0 24 24', // viewBox
 *   g: [ { el: 'path'|'rect'|'circle'|'ellipse', ...attrs } ]
 * }
 */

const VB = '0 0 24 24';
const STROKE = { stroke: 'currentColor', fill: 'none' };
const FILL = { fill: 'currentColor' };

const ICONS = {};

// 유틸
const icon = (defs) => ({ vb: VB, g: defs });

/* ───────────────────────── 기본 툴/편집 ───────────────────────── */
ICONS.select = icon([
    { el: 'path', d: 'M4 4l5 13 2-5 5-2-12-6z', ...FILL },
    {
        el: 'path',
        d: 'M14 14l6 6',
        ...STROKE,
        strokeWidth: 2,
        strokeLinecap: 'round',
    },
]);

ICONS.bucket = icon([
    {
        el: 'path',
        d: 'M4 10l6-6 6 6v6a3 3 0 01-3 3H7a3 3 0 01-3-3v-6z',
        ...FILL,
    },
    {
        el: 'path',
        d: 'M10 4l6 6',
        ...STROKE,
        strokeWidth: 2,
        strokeLinecap: 'round',
    },
]);

ICONS.text = icon([
    {
        el: 'path',
        d: 'M4 6h16M12 6v12',
        ...STROKE,
        strokeWidth: 2,
        strokeLinecap: 'round',
    },
]);

ICONS.eyedrop = icon([
    { el: 'path', d: 'M14 3l7 7-5 5-7-7 5-5z', ...FILL },
    {
        el: 'path',
        d: 'M3 21l6-6',
        ...STROKE,
        strokeWidth: 2,
        strokeLinecap: 'round',
    },
]);

ICONS.magnifier = icon([
    { el: 'circle', cx: 10, cy: 10, r: 6, ...STROKE, strokeWidth: 2 },
    {
        el: 'path',
        d: 'M14.5 14.5L20 20',
        ...STROKE,
        strokeWidth: 2,
        strokeLinecap: 'round',
    },
]);

/* ───────────────────────── 도형/변형 ───────────────────────── */
ICONS.shapes = icon([
    { el: 'rect', x: 3, y: 3, width: 8, height: 8, ...STROKE },
    { el: 'circle', cx: 17, cy: 7, r: 4, ...STROKE },
    { el: 'path', d: 'M4 20l4-6 4 6H4z', ...STROKE },
]);

ICONS.transform = icon([
    { el: 'rect', x: 5, y: 5, width: 14, height: 14, ...STROKE },
    {
        el: 'path',
        d: 'M5 9h4M15 19v-4M19 15h-4M9 5v4',
        ...STROKE,
        strokeLinecap: 'round',
    },
]);

ICONS.rect = icon([
    { el: 'rect', x: 4, y: 6, width: 16, height: 12, ...STROKE },
]);
ICONS.ellipse = icon([
    { el: 'ellipse', cx: 12, cy: 12, rx: 8, ry: 5, ...STROKE },
]);
ICONS.line = icon([
    {
        el: 'path',
        d: 'M4 18L20 6',
        ...STROKE,
        strokeWidth: 2,
        strokeLinecap: 'round',
    },
]);
ICONS.polygon = icon([
    { el: 'path', d: 'M12 3l8 5-3 10H7L4 8l8-5z', ...STROKE },
]);
ICONS.star = icon([
    {
        el: 'path',
        d: 'M12 3l3 6 6 .9-4.5 4.3L18 21l-6-3-6 3 1.5-6.8L3 9.9 9 9l3-6z',
        ...STROKE,
    },
]);

ICONS.freeDraw = icon([
    {
        el: 'path',
        d: 'M3 16c3-6 8-4 11-1s5 3 7-2',
        ...STROKE,
        strokeLinecap: 'round',
    },
]);

ICONS.resize = icon([
    { el: 'path', d: 'M4 20l6-6M14 10l6-6', ...STROKE, strokeLinecap: 'round' },
    { el: 'rect', x: 3, y: 3, width: 8, height: 8, ...STROKE },
    { el: 'rect', x: 13, y: 13, width: 8, height: 8, ...STROKE },
]);

ICONS.skew = icon([{ el: 'path', d: 'M5 17l4-10h10l-4 10H5z', ...STROKE }]);

ICONS.flipH = icon([
    { el: 'path', d: 'M12 4v16M12 4L4 12l8 8M12 4l8 8-8 8', ...STROKE },
]);
ICONS.flipV = icon([
    { el: 'path', d: 'M4 12h16M4 12l8-8 8 8M4 12l8 8 8-8', ...STROKE },
]);

ICONS.reset = icon([
    { el: 'path', d: 'M12 6V3l-3 3 3 3V6', ...STROKE, strokeLinecap: 'round' },
    { el: 'circle', cx: 12, cy: 12, r: 7, ...STROKE },
]);

/* ───────────────────────── 이력/파일 ───────────────────────── */
/** 개선된 Undo: 왼쪽 화살표 + 원호 */
ICONS.undo = icon([
    {
        el: 'path',
        d: 'M9 7H5v4',
        ...STROKE,
        strokeWidth: 2,
        strokeLinecap: 'round',
        strokeLinejoin: 'round',
    },
    {
        el: 'path',
        d: 'M5 11a7 7 0 1 0 7-7',
        ...STROKE,
        strokeWidth: 2,
        strokeLinecap: 'round',
    },
]);

/** 개선된 Redo: 오른쪽 화살표 + 원호(미러) */
ICONS.redo = icon([
    {
        el: 'path',
        d: 'M15 7h4v4',
        ...STROKE,
        strokeWidth: 2,
        strokeLinecap: 'round',
        strokeLinejoin: 'round',
    },
    {
        el: 'path',
        d: 'M19 11a7 7 0 1 1-7-7',
        ...STROKE,
        strokeWidth: 2,
        strokeLinecap: 'round',
    },
]);

ICONS.save = icon([
    { el: 'path', d: 'M4 4h12l4 4v12H4z', ...STROKE },
    { el: 'path', d: 'M8 4v6h8V4', ...STROKE },
    { el: 'rect', x: 7, y: 14, width: 10, height: 5, ...STROKE },
]);

ICONS.open = icon([
    {
        el: 'path',
        d: 'M3 7h7l2 2h9v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7z',
        ...STROKE,
    },
]);

ICONS.trash = icon([
    { el: 'path', d: 'M3 6h18', ...STROKE, strokeLinecap: 'round' },
    { el: 'path', d: 'M8 6V4h8v2', ...STROKE },
    { el: 'rect', x: 6, y: 6, width: 12, height: 14, ...STROKE },
    { el: 'path', d: 'M10 10v6M14 10v6', ...STROKE },
]);

ICONS.file = icon([
    {
        el: 'path',
        d: 'M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z',
        ...FILL,
        opacity: 0.12,
    },
    {
        el: 'path',
        d: 'M14 2v6h6M8 13h8M8 17h8M8 9h4',
        ...STROKE,
        strokeWidth: 1.5,
    },
]);

/* ───────────────────────── 패널/줌/스타일/닫기 ───────────────────────── */
ICONS.zoom = icon([
    { el: 'circle', cx: 11, cy: 11, r: 6.5, ...STROKE },
    { el: 'path', d: 'M20 20l-3.2-3.2', ...STROKE, strokeLinecap: 'round' },
]);

ICONS.style = icon([
    {
        el: 'path',
        d: 'M5.5 13.5h6a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2h-6a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2z',
        ...STROKE,
        strokeWidth: 1.7,
        strokeLinecap: 'round',
        strokeLinejoin: 'round',
    },
    {
        el: 'path',
        d: 'M10.5 8.5h6a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2h-6a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2z',
        ...STROKE,
        strokeWidth: 1.7,
        strokeLinecap: 'round',
        strokeLinejoin: 'round',
    },
    {
        el: 'path',
        d: 'M15.5 3.5h5a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-5a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2z',
        ...STROKE,
        strokeWidth: 1.7,
        strokeLinecap: 'round',
        strokeLinejoin: 'round',
    },
    { el: 'path', d: 'M18 9a1 1 0 1 1-2 0a1 1 0 0 1 2 0z', ...FILL },
]);

ICONS.close = icon([
    {
        el: 'path',
        d: 'M6 6 L18 18 M18 6 L6 18',
        ...STROKE,
        strokeWidth: 1.7,
        strokeLinecap: 'round',
    },
]);

/* ───────────────────────── 별칭(중복 제거용 Alias) ─────────────────────────
 * - 렌더 시 동일 객체를 참조하므로 용어만 다르게 써도 같은 아이콘을 사용 가능.
 * - 실제 중복 정의를 두지 않아 유지보수 용이.
 */
ICONS.shape = ICONS.shapes; // shape ⇔ shapes
ICONS.freedraw = ICONS.freeDraw; // freedraw ⇔ freeDraw
ICONS.search = ICONS.magnifier; // search ⇔ magnifier
// 이미 확대경이 있지만, UI에 따라 zoom 키를 쓰는 경우가 있어 같이 맞춰 둠.
ICONS.zoomAlt = ICONS.magnifier; // 예: 다른 위치에서 'zoomAlt' 키로 참조해도 동일 아이콘

export { ICONS };

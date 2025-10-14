import { TOOL } from './tool';

/**
 *  @property {width} 캔버스 너비
 *  @property {height} 캔버스 높이
 *  @property {background} 캔버스 배경
 *  @property {grid}
 */
const CANVAS_DEFAULT = {
    width: 1,
    height: 1,
    background: null,
    grid: { enabled: false, size: 10 },
};

/**
 *  @property {past} [{ canvas, layers, render, hitmap }]
 *  @property {future} [{ canvas, layers, render, hitmap }]
 *  @property {applied} pop 시 일시 저장
 */
const HISTORY_DEFAULT = {
    past: [],
    future: [],
    applied: null,
};

/**
 *  @property {tool} [{ canvas, layers, render, hitmap }]
 *  @property {draft} [{ canvas, layers, render, hitmap }]
 *  @property {selectionRect} pop 시 일시 저장
 *  @property {cursor} pop 시 일시 저장
 */
const TOOL_DEFAULT = {
    tool: TOOL.SELECT,
    draft: { stroke: '#111', fill: 'transparent', strokeWidth: 2 },
};

export { CANVAS_DEFAULT, HISTORY_DEFAULT, TOOL_DEFAULT };

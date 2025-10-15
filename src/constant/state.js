import { TOOL } from './tool';

/**
 * @property {width} canvas 벡터 좌표계 기반 너비
 * @property {height} canvas 벡터 좌표계 기반 높이
 * @property {background} canvas 배경 (null: 투명)
 * @property {grid} canvas 그리드 설정
 * @property {enabled} grid 활성화 여부
 * @property {size} grid 격자 크기
 */
const CANVAS = {
    width: 800,
    height: 600,
    background: null,
    grid: {
        enabled: false,
        size: 10,
    },
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

export const state = { CANVAS, HISTORY_DEFAULT, TOOL_DEFAULT };

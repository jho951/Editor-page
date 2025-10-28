/**
 * @file ui.initial.js
 * @author YJH
 * @description Redux Toolkit의 uiSlice 초기 상태 및 슬라이스 이름
 * @see {@link ../slice/canvasSlice.js}
 */

/**
 * @constant
 * @type {string}
 * @readonly
 * @description uiSlice의 슬라이스 이름
 */
const HEADER_NAME = 'header';

/**
 * @property{tool}  'select' | 'rect' | 'ellipse' | 'line' | 'polygon' | 'star' | 'freedraw' | 'text'
 */
const HEADER_STATE = {
    tool: 'select',
    view: { scale: 1, tx: 0, ty: 0 },
    canvasBg: '#f5f5f5',
};

export { HEADER_NAME, HEADER_STATE };

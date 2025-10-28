/**
 * @file doc.initial.js
 * @author YJH
 * @description Redux Toolkit의 canvasSlice 초기 상태 및 슬라이스 이름
 * @see {@link ../slice/canvasSlice.js}
 */

/**
 * @constant
 * @type {string}
 * @readonly
 * @description canvasSlice의 슬라이스 이름
 */
const CANVAS_NAME = 'canvas';

const CAMVAS_STATE = {
    shapes: [],
    focusId: null,
    nextId: 1,
    past: [],
    future: [],
};

export { CANVAS_NAME, CAMVAS_STATE };

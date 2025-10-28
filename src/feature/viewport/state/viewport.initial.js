/**
 * @file viewport.initial.js
 * @description 확대/이동/회전 상태의 초기값과 상수
 */
const VIEWPORT_NAME = 'viewport';

const MIN_SCALE = 0.125;
const MAX_SCALE = 8;
const ZOOM_STEP = 1.1;

/** @type {{ scale:number, tx:number, ty:number, rotation:number }} */
const VIEWPORT_STATE = {
    scale: 1,
    tx: 0,
    ty: 0,
    rotation: 0,
};

export { VIEWPORT_NAME, VIEWPORT_STATE, MIN_SCALE, MAX_SCALE, ZOOM_STEP };

/**
 * @file initial.js
 * @author YJH
 */

const DOC_NAME = 'doc';
const DOC_STATE = {
    items: [],
    loading: false,
    error: null,
    ui: { loadOpen: false, saveOpen: false },
    current: { id: null, title: '', version: null, dirty: false },
};

const CANVAS_NAME = 'canvas';
const CAMVAS_STATE = {
    shapes: [],
    focusId: null,
    nextId: 1,
    past: [],
    future: [],
};

/**
 * @property{tool}  'select' | 'rect' | 'ellipse' | 'line' | 'polygon' | 'star' | 'freedraw' | 'text'
 */

const UI_NAME = 'ui';
const UI_STATE = {
    tool: 'select',
    polygonSides: 5,
    starPoints: 5,
    starInnerRatio: 0.5,
    view: { scale: 1, tx: 0, ty: 0 },
    canvasBg: '#f5f5f5',
};

/** 히스토리 최대 저장 횟수(과거/미래 각각) */
const MAX_HISTORY = 10;

export {
    DOC_NAME,
    DOC_STATE,
    CANVAS_NAME,
    CAMVAS_STATE,
    UI_NAME,
    UI_STATE,
    MAX_HISTORY,
};

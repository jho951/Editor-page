/**
 * @file initial.js
 * @author YJH
 */
/**
 * @proper
 */
const DOC_STATE = {
    items: [],
    loading: false,
    error: null,
    ui: { loadOpen: false, saveOpen: false },
    current: { id: null, title: '', version: null, dirty: false },
};

const CAMVAS_STATE = {
    shapes: [],
    focusId: null,
    nextId: 1,
    past: [], // ← undo 스택
    future: [], // ← redo 스택
};

/**
 * @property{tool}  'select' | 'rect' | 'ellipse' | 'line' | 'polygon' | 'star' | 'freedraw' | 'text'
 */
const UI_STATE = {
    tool: 'select',
    polygonSides: 5,
    starPoints: 5,
    starInnerRatio: 0.5,
    view: { scale: 1, tx: 0, ty: 0 },
    canvasBg: '#f5f5f5',
};

export { DOC_STATE, CAMVAS_STATE, UI_STATE };

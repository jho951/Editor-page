/**
 * @file header.initial.js
 * @author YJH
 * @description Redux Toolkit의 uiSlice 초기 상태 및 슬라이스 이름
 */

/**
 * @constant
 * @type {string}
 * @readonly
 * @description headerSlice의 슬라이스 이름
 */
const HEADER_NAME = 'header';

/**
 * @property{tool}  'select' | 'rect' | 'ellipse' | 'line' | 'polygon' | 'star' | 'freedraw' | 'text'
 */
const HEADER_STATE = {
    tool: 'select',
    view: { scale: 1, tx: 0, ty: 0 },
    background: '#ffffff',
    sidebarOpen: null, // 'file' | 'shape' | 'transform' | 'style' | 'zoom' | null
    sectionActive: {
        file: null,
        shape: 'select', // 기본 선택 도구를 보여주면 직관적
        transform: null,
        style: null,
        zoom: null,
    },
};

export { HEADER_NAME, HEADER_STATE };

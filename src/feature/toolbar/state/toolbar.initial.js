/**
 * @file toolbar.initial.js
 * @author YJH
 * @description Redux Toolkit의 toolbarSlice 초기 상태 및 슬라이스 이름
 */

/**
 * @constant
 * @type {string}
 * @readonly
 * @description toolbarSlice의 슬라이스 이름
 */
const TOOLBAR_NAME = 'toolbar';

/**
 * @typedef {'select'|'rect'|'ellipse'|'line'|'polygon'|'star'|'freedraw'|'text'} ToolKind
 */

/**
 * @constant
 * @type {{
 *   tool: ToolKind,
 *   background: string,
 *   sidebarOpen: ('file'|'shape'|'transform'|'style'|'zoom'|null),
 *   sectionActive: {
 *     file: any,
 *     shape: ToolKind|null,
 *     transform: any,
 *     style: any,
 *     zoom: any
 *   }
 * }}
 * @description 좌측 Lnb·툴 선택 UI 전용 상태
 */
const TOOLBAR_STATE = {
    tool: 'select',
    background: '#ffffff',
    sidebarOpen: null,
    sectionActive: {
        file: null,
        shape: 'select',
        transform: null,
        style: null,
        zoom: null,
    },
};

export { TOOLBAR_NAME, TOOLBAR_STATE };

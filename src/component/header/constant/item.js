import { getIcon } from '../../icon/util/get-icon';
import { displayShortcut } from '../util/keymap';

const ITEM_SIZE = 26;

/**
 * @file element.js
 * @author YJH
 * @description 헤더에 사용되는 상수들
 * - 아이콘은 모두 ITEM_SIZE px로 통일
 * - 단축키는 Mac 기준으로 표기 (Cmd = Mod, Option = Alt)
 * - 단축키 표기는 displayShortcut() 함수로 변환
 * - key 값은 소문자, 단어 구분은 하이픈(-) 사용
 * - label 값은 한글로 표기
 * - shortcutLabel 값은 displayShortcut() 함수로 변환한 값 사용
 * - icon 값은 getIcon() 함수로 가져온 React 요소 사용
 * - 객체 배열로 만들고, 필요에 따라 단일 객체로도 사용 가능
 * - disabled 속성은 필요에 따라 추가 가능
 * - HEADER_ELEMENTS 객체로 묶어서 export
 */
const FILE_ITEM = [
    {
        key: 'file-new',
        label: '새로 만들기',
        icon: getIcon('file', ITEM_SIZE),
        shortcut: 'Mod+N',
        shortcutLabel: displayShortcut('Mod+N'),
        cursor: 'default',
    },
    {
        key: 'file-save',
        label: '저장',
        icon: getIcon('save', ITEM_SIZE),
        shortcut: 'Mod+S',
        shortcutLabel: displayShortcut('Mod+S'),
        cursor: 'default',
    },
    {
        key: 'file-open',
        label: '불러오기',
        icon: getIcon('open', ITEM_SIZE),
        shortcut: 'Mod+O',
        shortcutLabel: displayShortcut('Mod+O'),
        cursor: 'default',
    },
];

const SHAPE_ITEM = [
    {
        key: 'shape-rect',
        label: '사각형',
        icon: getIcon('rect', 30),
        shortcut: 'R',
        cursor: 'crosshair',
        shortcutLabel: displayShortcut('R'),
    },
    {
        key: 'shape-ellipse',
        label: '원',
        icon: getIcon('ellipse', 30),
        shortcut: 'O',
        cursor: 'crosshair',
        shortcutLabel: displayShortcut('O'),
    },
    {
        key: 'shape-line',
        label: '직선',
        icon: getIcon('line', 30),
        shortcut: 'L',
        cursor: 'crosshair',
        shortcutLabel: displayShortcut('L'),
    },
    {
        key: 'shape-polygon',
        label: '다각형',
        icon: getIcon('polygon', 30),
        shortcut: 'G',
        cursor: 'crosshair',
        shortcutLabel: displayShortcut('G'),
    },
    {
        key: 'shape-star',
        label: '별',
        icon: getIcon('star', 30),
        shortcut: 'S',
        cursor: 'crosshair',
        shortcutLabel: displayShortcut('S'),
    },
    {
        key: 'path',
        label: '프리드로우',
        icon: getIcon('freeDraw', 30),
        shortcut: 'P',
        cursor: 'crosshair',
        shortcutLabel: displayShortcut('P'),
    },
    {
        key: 'text',
        label: '텍스트',
        icon: getIcon('text', 30),
        shortcut: 'T',
        cursor: 'text',
        shortcutLabel: displayShortcut('T'),
    },
];

const TRANSFORM_ITEM = [
    {
        key: 'rotate',
        label: '회전',
        icon: getIcon('rotate', 30),
        shortcut: 'Alt+R',
        cursor: 'alias',
        shortcutLabel: displayShortcut('Alt+R'),
    },
    {
        key: 'flipH',
        label: '좌우 뒤집기',
        icon: getIcon('flipH', 30),
        shortcut: 'Shift+H',
        cursor: 'default',
        shortcutLabel: displayShortcut('Shift+H'),
    },
    {
        key: 'flipV',
        label: '상하 뒤집기',
        icon: getIcon('flipV', 30),
        shortcut: 'Shift+V',
        cursor: 'default',
        shortcutLabel: displayShortcut('Shift+V'),
    },
];

const ZOOM_ITEM = [
    {
        key: 'fit',
        label: '화면에 맞춤',
        icon: null,
        shortcut: 'Mod+0',
        cursor: 'default',
        shortcutLabel: displayShortcut('Mod+0'),
    },
    {
        key: 'in',
        label: '확대',
        icon: getIcon('plus', 30),
        shortcut: 'Mod+=',
        cursor: 'zoom-in',
        shortcutLabel: displayShortcut('Mod+='),
    },
    {
        key: 'out',
        label: '축소',
        icon: getIcon('minus', 30),
        shortcut: 'Mod+-',
        cursor: 'zoom-out',
        shortcutLabel: displayShortcut('Mod+-'),
    },
];

const HISTORY_ITEM = [
    {
        key: 'undo',
        label: '실행 취소',
        icon: getIcon('undo', 30),
        shortcut: 'Mod+Z',
        cursor: 'default',
        shortcutLabel: displayShortcut('Mod+Z'),
    },
    {
        key: 'redo',
        label: '다시 실행',
        icon: getIcon('redo', 30),
        shortcut: 'Mod+Shift+Z',
        cursor: 'default',
        shortcutLabel: displayShortcut('Mod+Shift+Z'),
    },
];

export const HEADER_ELEMENTS = {
    ITEM_SIZE,
    FILE_ITEM,
    SHAPE_ITEM,
    TRANSFORM_ITEM,
    ZOOM_ITEM,
    HISTORY_ITEM,
};

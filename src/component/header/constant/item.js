import { getIcon } from '../../icon/util/get-icon';
import { displayShortcut } from '../util/keymap';

const ITEM_SIZE = 26;

const FILE_ITEM = [
    {
        key: 'new',
        label: '새로 만들기',
        icon: getIcon('file', ITEM_SIZE),
        shortcut: 'Mod+N',
        shortcutLabel: displayShortcut('Mod+N'),
        cursor: 'default',
    },
    {
        key: 'save',
        label: '저장',
        icon: getIcon('save', ITEM_SIZE),
        shortcut: 'Mod+S',
        shortcutLabel: displayShortcut('Mod+S'),
        cursor: 'default',
    },
    // 빠른 저장(서버 저장 바로 수행)
    {
        key: 'quick-save',
        label: '빠른 저장',
        icon: getIcon('save', ITEM_SIZE),
        shortcut: 'Mod+Shift+S',
        shortcutLabel: displayShortcut('Mod+Shift+S'),
        cursor: 'default',
    },
    {
        key: 'open',
        label: '불러오기',
        icon: getIcon('open', ITEM_SIZE),
        shortcut: 'Mod+O',
        shortcutLabel: displayShortcut('Mod+O'),
        cursor: 'default',
    },
];

const SHAPE_ITEM = [
    {
        key: 'rect',
        label: '사각형',
        icon: getIcon('rect', ITEM_SIZE),
        shortcut: 'R',
        cursor: 'crosshair',
        shortcutLabel: displayShortcut('R'),
    },
    {
        key: 'ellipse',
        label: '원',
        icon: getIcon('ellipse', ITEM_SIZE),
        shortcut: 'O',
        cursor: 'crosshair',
        shortcutLabel: displayShortcut('O'),
    },
    {
        key: 'line',
        label: '직선',
        icon: getIcon('line', ITEM_SIZE),
        shortcut: 'L',
        cursor: 'crosshair',
        shortcutLabel: displayShortcut('L'),
    },
    {
        key: 'polygon',
        label: '다각형',
        icon: getIcon('polygon', ITEM_SIZE),
        shortcut: 'G',
        cursor: 'crosshair',
        shortcutLabel: displayShortcut('G'),
    },
    {
        key: 'star',
        label: '별',
        icon: getIcon('star', ITEM_SIZE),
        shortcut: 'S',
        cursor: 'crosshair',
        shortcutLabel: displayShortcut('S'),
    },
    {
        key: 'path',
        label: '프리드로우',
        icon: getIcon('freeDraw', ITEM_SIZE),
        shortcut: 'P',
        cursor: 'crosshair',
        shortcutLabel: displayShortcut('P'),
    },
    {
        key: 'text',
        label: '텍스트',
        icon: getIcon('text', ITEM_SIZE),
        shortcut: 'T',
        cursor: 'text',
        shortcutLabel: displayShortcut('T'),
    },
];

const TRANSFORM_ITEM = [
    // 🔸회전은 각도 분기 키를 명시적으로 둬서 미들웨어 해석을 단순화
    {
        key: 'rotate-90',
        label: '회전 90°',
        icon: getIcon('rotate', ITEM_SIZE),
        shortcut: 'Alt+R',
        cursor: 'alias',
        shortcutLabel: displayShortcut('Alt+R'),
    },
    {
        key: 'rotate-180',
        label: '회전 180°',
        icon: getIcon('rotate', ITEM_SIZE),
        shortcut: 'Alt+Shift+R',
        cursor: 'alias',
        shortcutLabel: displayShortcut('Alt+Shift+R'),
    },
    {
        key: 'flipH',
        label: '좌우 뒤집기',
        icon: getIcon('flipH', ITEM_SIZE),
        shortcut: 'Shift+H',
        cursor: 'default',
        shortcutLabel: displayShortcut('Shift+H'),
    },
    {
        key: 'flipV',
        label: '상하 뒤집기',
        icon: getIcon('flipV', ITEM_SIZE),
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
        icon: getIcon('plus', ITEM_SIZE),
        shortcut: 'Mod+=',
        cursor: 'zoom-in',
        shortcutLabel: displayShortcut('Mod+='),
    },
    {
        key: 'out',
        label: '축소',
        icon: getIcon('minus', ITEM_SIZE),
        shortcut: 'Mod+-',
        cursor: 'zoom-out',
        shortcutLabel: displayShortcut('Mod+-'),
    },
];

const HISTORY_ITEM = [
    {
        key: 'undo',
        label: '실행 취소',
        icon: getIcon('undo', ITEM_SIZE),
        shortcut: 'Mod+Z',
        cursor: 'default',
        shortcutLabel: displayShortcut('Mod+Z'),
    },
    {
        key: 'redo',
        label: '다시 실행',
        icon: getIcon('redo', ITEM_SIZE),
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

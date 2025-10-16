import { getIcon } from '../../icon/util/get-icon';
import { displayShortcut } from '../util/keymap';

/**
 * 키조합 → 커맨드 키
 * 커맨드 키는 아래 dispatchCommand 스위치의 분기와 연결됨
 */
const KEYMAP = {
    // 파일
    'Mod+N': 'new',
    'Mod+S': 'save',
    'Mod+O': 'export',

    // 도구/도형
    V: 'select',
    R: 'shape-rect',
    O: 'shape-ellipse',
    L: 'shape-line',
    P: 'path',
    T: 'text',
    S: 'shape-star', // 별
    // 다각형은 'G' 또는 'Y' 등 취향에 맞게
    G: 'shape-polygon',

    // 줌
    'Mod+Plus': 'zoom-in', // 일부 키보드 대응
    'Mod+=': 'zoom-in',
    'Mod+-': 'zoom-out',
    'Mod+0': 'fit',

    // 히스토리
    'Mod+Z': 'undo',
    'Mod+Shift+Z': 'redo',
    'Mod+Y': 'redo',

    // 트랜스폼 (브라우저 기본 단축키와 충돌 없는 쪽으로)
    'Alt+R': 'rotate',
    'Shift+H': 'flipH',
    'Shift+V': 'flipV',
    'Shift+K': 'skew',

    // 이동(Nudge)
    ArrowUp: 'nudge-up',
    ArrowDown: 'nudge-down',
    ArrowLeft: 'nudge-left',
    ArrowRight: 'nudge-right',
    'Shift+ArrowUp': 'nudge10-up',
    'Shift+ArrowDown': 'nudge10-down',
    'Shift+ArrowLeft': 'nudge10-left',
    'Shift+ArrowRight': 'nudge10-right',
};

// 선택 핸들 단축키(옵션): Alt+1~9 로 N,NE,...,ROTATE
const HANDLE = {
    NONE: 0,
    N: 1,
    NE: 2,
    E: 3,
    SE: 4,
    S: 5,
    SW: 6,
    W: 7,
    NW: 8,
    ROTATE: 9,
};

const HANDLE_KEYS = [
    HANDLE.N,
    HANDLE.NE,
    HANDLE.E,
    HANDLE.SE,
    HANDLE.S,
    HANDLE.SW,
    HANDLE.W,
    HANDLE.NW,
    HANDLE.ROTATE,
];

const HANDLE_KEYMAP = {
    'Alt+1': HANDLE.N,
    'Alt+2': HANDLE.NE,
    'Alt+3': HANDLE.E,
    'Alt+4': HANDLE.SE,
    'Alt+5': HANDLE.S,
    'Alt+6': HANDLE.SW,
    'Alt+7': HANDLE.W,
    'Alt+8': HANDLE.NW,
    'Alt+9': HANDLE.ROTATE,
};

const FILE_ITEM = [
    {
        key: 'new',
        label: '새로 만들기',
        icon: getIcon('file', 30),
        shortcut: 'Mod+N',
        shortcutLabel: displayShortcut('Mod+N'),
    },
    {
        key: 'save',
        label: '저장',
        icon: getIcon('save', 30),
        shortcut: 'Mod+S',
        shortcutLabel: displayShortcut('Mod+S'),
    },
    {
        key: 'export',
        label: '불러오기',
        icon: getIcon('open', 30),
        shortcut: 'Mod+O',
        shortcutLabel: displayShortcut('Mod+O'),
    },
];

const SHAPE_ITEM = [
    {
        key: 'shape-rect',
        label: '사각형',
        icon: getIcon('rect', 30),
        shortcut: 'R',
        shortcutLabel: displayShortcut('R'),
    },
    {
        key: 'shape-ellipse',
        label: '원',
        icon: getIcon('ellipse', 30),
        shortcut: 'O',
        shortcutLabel: displayShortcut('O'),
    },
    {
        key: 'shape-line',
        label: '직선',
        icon: getIcon('line', 30),
        shortcut: 'L',
        shortcutLabel: displayShortcut('L'),
    },
    {
        key: 'shape-polygon',
        label: '다각형',
        icon: getIcon('polygon', 30),
        shortcut: 'G',
        shortcutLabel: displayShortcut('G'),
    },
    {
        key: 'shape-star',
        label: '별',
        icon: getIcon('star', 30),
        shortcut: 'S',
        shortcutLabel: displayShortcut('S'),
    },
];

const FREE_DRAW_ITEM = {
    key: 'path',
    label: '프리드로우',
    icon: getIcon('freeDraw', 30),
    shortcut: 'P',
    shortcutLabel: displayShortcut('P'),
};

const TEXT_ITEM = {
    key: 'text',
    label: '텍스트',
    icon: getIcon('text', 30),
    shortcut: 'T',
    shortcutLabel: displayShortcut('T'),
};

const ZOOM_ITEM = [
    {
        key: 'fit',
        label: '화면에 맞춤',
        icon: null,
        shortcut: 'Mod+0',
        shortcutLabel: displayShortcut('Mod+0'),
    },
    {
        key: 'in',
        label: '확대',
        icon: getIcon('plus', 30),
        shortcut: 'Mod+=',
        shortcutLabel: displayShortcut('Mod+='),
    },
    {
        key: 'out',
        label: '축소',
        icon: getIcon('minus', 30),
        shortcut: 'Mod+-',
        shortcutLabel: displayShortcut('Mod+-'),
    },
];

const TRANSFORM_ITEM = [
    {
        key: 'skew',
        label: '기울이기',
        icon: getIcon('skew', 30),
        shortcut: 'Shift+K',
        shortcutLabel: displayShortcut('Shift+K'),
    },
    {
        key: 'rotate',
        label: '회전',
        icon: getIcon('rotate', 30),
        shortcut: 'Alt+R',
        shortcutLabel: displayShortcut('Alt+R'),
    },
    {
        key: 'flipH',
        label: '좌우 뒤집기',
        icon: getIcon('flipH', 30),
        shortcut: 'Shift+H',
        shortcutLabel: displayShortcut('Shift+H'),
    },
    {
        key: 'flipV',
        label: '상하 뒤집기',
        icon: getIcon('flipV', 30),
        shortcut: 'Shift+V',
        shortcutLabel: displayShortcut('Shift+V'),
    },
];

const UNDO_ITEM = {
    key: 'undo',
    label: '실행 취소',
    icon: getIcon('undo', 30),
    shortcut: 'Mod+Z',
    shortcutLabel: displayShortcut('Mod+Z'),
};

const REDO_ITEM = {
    key: 'redo',
    label: '다시 실행',
    icon: getIcon('redo', 30),
    shortcut: 'Mod+Shift+Z',
    shortcutLabel: displayShortcut('Mod+Shift+Z'),
};

export const HEADER_ELEMENTS = {
    KEYMAP,
    HANDLE,
    HANDLE_KEYS,
    HANDLE_KEYMAP,
    FILE_ITEM,
    SHAPE_ITEM,
    TRANSFORM_ITEM,
    ZOOM_ITEM,
    FREE_DRAW_ITEM,
    TEXT_ITEM,
    UNDO_ITEM,
    REDO_ITEM,
};

/**
 * 에디터 전역 단축키 맵(Feature/Handle)
 * --------------------------------------------
 * - FEATURE: 기능/도구/줌/히스토리/편집 등
 * - HANDLE/HANDLE_KEYS/HANDLE_KEYMAP: 리사이즈/회전 핸들에 대한 키 바인딩
 */

/** @type {Record<string, string>} */
const FEATURE = {
    // 파일
    'Mod+N': 'new',
    'Mod+S': 'save',
    'Mod+Shift+S': 'quick-save',
    'Mod+O': 'open',

    // 도구
    V: 'select',
    R: 'rect',
    O: 'ellipse',
    L: 'line',
    P: 'path', // ToolHeader에서는 'freedraw'로 매핑해서 사용
    T: 'text',
    S: 'star',
    G: 'polygon',

    // 줌
    'Mod+Plus': 'in',
    'Mod+=': 'in',
    'Mod+Shift+Plus': 'in',
    'Mod+-': 'out',
    'Mod+0': 'fit',

    // 히스토리
    'Mod+Z': 'undo',
    'Mod+Shift+Z': 'redo',
    'Mod+Y': 'redo',

    // 변형
    'Alt+R': 'rotate-90',
    'Alt+Shift+R': 'rotate-180',
    'Shift+H': 'flipH',
    'Shift+V': 'flipV',
    'Shift+K': 'skew',

    // 선택 이동(nudge)
    ArrowUp: 'nudge-up',
    ArrowDown: 'nudge-down',
    ArrowLeft: 'nudge-left',
    ArrowRight: 'nudge-right',
    'Shift+ArrowUp': 'nudge10-up',
    'Shift+ArrowDown': 'nudge10-down',
    'Shift+ArrowLeft': 'nudge10-left',
    'Shift+ArrowRight': 'nudge10-right',

    // 편집 모드
    Enter: 'edit-enter',
    Escape: 'edit-exit',
    Delete: 'node-delete',
    Backspace: 'node-delete',
    Insert: 'node-insert',
};

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

/** @type {Record<string, number>} */
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

export const KEYMAP = { FEATURE, HANDLE, HANDLE_KEYS, HANDLE_KEYMAP };

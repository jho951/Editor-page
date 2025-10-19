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
    P: 'path',
    T: 'text',
    S: 'star',
    G: 'polygon',

    // 줌 (키보드/레이아웃 차이 대응)
    'Mod+Plus': 'in',
    'Mod+=': 'in',
    'Mod+Shift+Plus': 'in', // 🔸추가 (일부 키보드 + 가 Shift+=)
    'Mod+-': 'out',
    'Mod+0': 'fit',

    // 히스토리
    'Mod+Z': 'undo',
    'Mod+Shift+Z': 'redo',
    'Mod+Y': 'redo',

    // 변형 (회전 세분화)
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
    Backspace: 'node-delete', // 🔸추가(윈도우 노트북 등)
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

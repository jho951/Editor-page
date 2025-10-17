const FEATURE = {
    'Mod+N': 'new',
    'Mod+S': 'save',
    'Mod+O': 'export',

    V: 'select',
    R: 'shape-rect',
    O: 'shape-ellipse',
    L: 'shape-line',
    P: 'path',
    T: 'text',
    S: 'shape-star',
    G: 'shape-polygon',

    'Mod+Plus': 'zoom-in',
    'Mod+=': 'zoom-in',
    'Mod+-': 'zoom-out',
    'Mod+0': 'fit',

    'Mod+Z': 'undo',
    'Mod+Shift+Z': 'redo',
    'Mod+Y': 'redo',

    'Alt+R': 'rotate',
    'Shift+H': 'flipH',
    'Shift+V': 'flipV',
    'Shift+K': 'skew',

    ArrowUp: 'nudge-up',
    ArrowDown: 'nudge-down',
    ArrowLeft: 'nudge-left',
    ArrowRight: 'nudge-right',
    'Shift+ArrowUp': 'nudge10-up',
    'Shift+ArrowDown': 'nudge10-down',
    'Shift+ArrowLeft': 'nudge10-left',
    'Shift+ArrowRight': 'nudge10-right',

    Enter: 'edit-enter',
    Escape: 'edit-exit',
    Delete: 'node-delete',
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

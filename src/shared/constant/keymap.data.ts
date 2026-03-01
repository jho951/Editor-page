export type Scope = "global" | "canvas" | "text";
export type Command = string;
export type Combo = string;

export const GLOBAL = {
    "Mod+N": "new",
    "Mod+S": "save",
    "Mod+Shift+S": "quick-save",
    "Mod+O": "open",
} as const satisfies Record<Combo, Command>;

export const CANVAS = {
    V: "select",
    R: "rect",
    O: "ellipse",
    L: "line",
    P: "path",
    T: "text",
    S: "star",
    G: "polygon",

    "Mod+Plus": "in",
    "Mod+=": "in",
    "Mod+Shift+Plus": "in",
    "Mod+-": "out",
    "Mod+0": "fit",

    "Mod+Z": "undo",
    "Mod+Shift+Z": "redo",
    "Mod+Y": "redo",

    "Alt+R": "rotate-90",
    "Alt+Shift+R": "rotate-180",
    "Shift+H": "flipH",
    "Shift+V": "flipV",
    "Shift+K": "skew",

    ArrowUp: "nudge-up",
    ArrowDown: "nudge-down",
    ArrowLeft: "nudge-left",
    ArrowRight: "nudge-right",
    "Shift+ArrowUp": "nudge10-up",
    "Shift+ArrowDown": "nudge10-down",
    "Shift+ArrowLeft": "nudge10-left",
    "Shift+ArrowRight": "nudge10-right",

    Enter: "edit-enter",
    Escape: "edit-exit",
    Delete: "node-delete",
    Backspace: "node-delete",
    Insert: "node-insert",

    "Alt+1": "toggle-section:file",
    "Alt+2": "toggle-section:shape",
    "Alt+3": "toggle-section:transform",
    "Alt+4": "toggle-section:style",
    "Alt+5": "toggle-section:zoom",
} as const satisfies Record<Combo, Command>;

export const HANDLE = Object.freeze({
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
} as const);

export type HandleValue = (typeof HANDLE)[keyof typeof HANDLE];

export const HANDLE_KEYS = Object.freeze([
    HANDLE.N, HANDLE.NE, HANDLE.E, HANDLE.SE,
    HANDLE.S, HANDLE.SW, HANDLE.W, HANDLE.NW,
    HANDLE.ROTATE,
] as const);

export const HANDLE_KEYMAP = Object.freeze({
    "Alt+1": HANDLE.N,
    "Alt+2": HANDLE.NE,
    "Alt+3": HANDLE.E,
    "Alt+4": HANDLE.SE,
    "Alt+5": HANDLE.S,
    "Alt+6": HANDLE.SW,
    "Alt+7": HANDLE.W,
    "Alt+8": HANDLE.NW,
    "Alt+9": HANDLE.ROTATE,
} as const satisfies Record<Combo, HandleValue>);

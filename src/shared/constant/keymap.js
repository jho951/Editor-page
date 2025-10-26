/**
 * @file keymap.js
 * @description
 * 전역 단축키와 리사이즈 핸들 키를 정의합니다.
 * - FEATURE: UI/툴/파일/줌/히스토리 등 '커맨드 ID'로 통일된 키매핑
 * - HANDLE : 리사이즈/회전 핸들의 방향 키 정의 (도형 편집 시 사용)
 *
 * 대규모 확장 팁
 * 1) 커맨드 ID 일원화: 메뉴/툴바/단축키가 모두 동일한 command key를 쓰면 라우팅이 쉬움
 * 2) 지역화: label은 메뉴 쪽에서만 갖고, keymap은 순수 매핑만 유지 (i18n 분리)
 * 3) 충돌 탐지: 앱 시작 시 FEATURE의 키 중복과 브라우저 예약 키를 탐지/로그
 * 4) 플랫폼 대응: 'Mod' 키워드는 Mac ⌘ / Win/Linux Ctrl를 통일 표현
 */

/** @typedef {'new'|'save'|'quick-save'|'open'|
 *            'select'|'rect'|'ellipse'|'line'|'path'|'text'|'star'|'polygon'|
 *            'in'|'out'|'fit'|
 *            'undo'|'redo'|
 *            'rotate-90'|'rotate-180'|'flipH'|'flipV'|'skew'|
 *            'nudge-up'|'nudge-down'|'nudge-left'|'nudge-right'|
 *            'nudge10-up'|'nudge10-down'|'nudge10-left'|'nudge10-right'|
 *            'edit-enter'|'edit-exit'|'node-delete'|'node-insert'
 * } CommandId */

/** @type {Record<string, CommandId>} */
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

    // 줌 (키보드/레이아웃 차이 대응: +가 Shift+= 인 레이아웃 고려)
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

    // 선택 미세 이동(nudge)
    ArrowUp: 'nudge-up',
    ArrowDown: 'nudge-down',
    ArrowLeft: 'nudge-left',
    ArrowRight: 'nudge-right',
    'Shift+ArrowUp': 'nudge10-up',
    'Shift+ArrowDown': 'nudge10-down',
    'Shift+ArrowLeft': 'nudge10-left',
    'Shift+ArrowRight': 'nudge10-right',

    // 편집 모드 전환/노드 편집
    Enter: 'edit-enter',
    Escape: 'edit-exit',
    Delete: 'node-delete',
    Backspace: 'node-delete',
    Insert: 'node-insert',
};

/**
 * 리사이즈/회전 핸들 정의
 * UI/렌더링 계층에서 공통으로 사용됨
 */
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

/** @type {number[]} */
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

/**
 * 핸들 단축키 매핑 (예: Alt+1 → N)
 * - 고급 사용: 키패드/레이아웃마다 다른 키 조합을 추가로 허용하도록 확장 가능
 * @type {Record<string, number>}
 */
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

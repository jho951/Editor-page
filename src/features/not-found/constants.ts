/**
 * 404 타일 보드 계산에 필요한 상수 모음입니다.
 */
export const FIXED_COLS = 30;

/**
 * FIXED ROWS 상수입니다.
 */
export const FIXED_ROWS = 15;

/**
 * MAX TILE WIDTH 상수입니다.
 */
export const MAX_TILE_WIDTH = 54;

/**
 * ASPECT RATIO 상수입니다.
 */
export const ASPECT_RATIO = 38 / 32;

/**
 * TILE COLS 상수입니다.
 */
export const TILE_COLS = 4;

/**
 * TILE ROWS 상수입니다.
 */
export const TILE_ROWS = 7;

/**
 * DIGIT SPACING 상수입니다.
 */
export const DIGIT_SPACING = 2;

/**
 * PADDING 상수입니다.
 */
export const PADDING = 6;

/**
 * TILE WIDTH 상수입니다.
 */
export const TILE_WIDTH = MAX_TILE_WIDTH;

/**
 * TILE HEIGHT 상수입니다.
 */
export const TILE_HEIGHT = TILE_WIDTH * ASPECT_RATIO;

/**
 * 404 숫자 타일 패턴을 정의한 매트릭스입니다.
 */
export const DIGITS: Record<'4' | '0', string[]> = {
    '4': ['1001', '1001', '1001', '1111', '0001', '0001', '0001'],
    '0': ['0110', '1001', '1001', '1001', '1001', '1001', '0110'],
};

/**
 * COLORS 상수입니다.
 */
export const COLORS = [
    '#FF6B6B',
    '#FFD93D',
    '#6BCB77',
    '#4D96FF',
    '#B197FC',
    '#F06595',
    '#20C997',
    '#FAB005',
    '#FF922B',
    '#845EF7',
    '#339AF0',
    '#51CF66',
    '#FCC419',
    '#FF8787',
    '#94D82D',
    '#EEBEFA',
    '#A5D8FF',
    '#FFD8A8',
];

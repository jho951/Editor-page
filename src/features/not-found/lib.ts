/**
 * 404 타일 색상과 활성 상태 계산을 돕는 유틸입니다.
 */

import {
    COLORS,
    DIGIT_SPACING, DIGITS,
    FIXED_COLS,
    FIXED_ROWS,
    TILE_COLS,
    TILE_ROWS
} from "@features/not-found/constants.ts";

/**
 * Hover Color를 반환합니다.
 *
 * @param x X 좌표값입니다.
 * @param y Y 좌표값입니다.
 * @returns 계산된 결과를 반환합니다.
 */
export function getHoverColor(x: number, y: number) {

    const index = (x * 7 + y * 13) % COLORS.length;
    return COLORS[index];
}

/**
 * Active Tiles를 생성합니다.
 * @returns 계산된 결과를 반환합니다.
 */
export function createActiveTiles() {

    const activeTiles = new Set<string>();

    const startCol = Math.floor((FIXED_COLS - (TILE_COLS * 3 + DIGIT_SPACING * 2)) / 2);

    const startRow = Math.floor((FIXED_ROWS - TILE_ROWS) / 2);

    (['4', '0', '4'] as const).forEach((digit, digitIndex) => {
        DIGITS[digit].forEach((row, y) => {
            row.split('').forEach((cell, x) => {
                if (cell === '1') {
                    activeTiles.add(
                        `${startCol + digitIndex * (TILE_COLS + DIGIT_SPACING) + x}-${startRow + y}`,
                    );
                }
            });
        });
    });

    return activeTiles;
}

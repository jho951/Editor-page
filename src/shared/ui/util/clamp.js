/**
 * @function clamp
 * @summary
 * - 값을 [min, max] 범위로 고정합니다.
 *
 * @description
 * - 인자 순서: (value, min, max)
 * - min > max 이면 자동으로 두 값을 교환합니다.
 * - value/min/max 중 유한수가 아니면 안전 가드로 처리합니다.
 *
 * @param {number} value - 고정할 대상 값
 * @param {number} min   - 하한(최소값)
 * @param {number} max   - 상한(최대값)
 * @returns {number} - [min, max] 구간으로 고정된 값
 */
function clamp(value, min, max) {
    const v = Number.isFinite(value) ? value : 0;
    let lo = Number.isFinite(min) ? min : -Infinity;
    let hi = Number.isFinite(max) ? max : Infinity;

    if (lo > hi) [lo, hi] = [hi, lo];

    return Math.max(lo, Math.min(v, hi));
}

export { clamp };

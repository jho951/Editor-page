/**
 * 값을 [min, max] 범위로 고정합니다.
 * @param value - 고정할 대상 값
 * @param min   - 하한(최소값)
 * @param max   - 상한(최대값)
 * @returns [min, max] 구간으로 고정된 값
 */
function clamp(value: number, min: number, max: number): number {
    const v = Number.isFinite(value) ? value : 0;
    let lo = Number.isFinite(min) ? min : -Infinity;
    let hi = Number.isFinite(max) ? max : Infinity;
    if (lo > hi) [lo, hi] = [hi, lo];
    return Math.max(lo, Math.min(v, hi));
}

export { clamp };
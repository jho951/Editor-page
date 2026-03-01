/**
 * 객체를 재귀적으로 동결(Freeze)하여 완전한 읽기 전용 상태로 만듭니다.
 */
function deepFreeze<T>(obj: T, seen = new WeakSet<object>()): T {
    // 기본 타입이거나 null, 또는 이미 확인한 객체인 경우 그대로 반환
    if (obj === null || typeof obj !== 'object' || seen.has(obj as object)) {
        return obj;
    }

    seen.add(obj as object);

    // 속성 이름과 심볼을 모두 가져옴
    const keys = [
        ...Object.getOwnPropertyNames(obj),
        ...Object.getOwnPropertySymbols(obj),
    ] as (keyof T)[];

    for (const k of keys) {
        const v = obj[k];
        // 속성값이 객체인 경우 재귀적으로 처리
        if (v && typeof v === 'object') {
            deepFreeze(v, seen);
        }
    }

    return Object.freeze(obj);
}

export { deepFreeze };
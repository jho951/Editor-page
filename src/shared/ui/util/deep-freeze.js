function deepFreeze(obj, seen = new WeakSet()) {
    if (obj === null || typeof obj !== 'object' || seen.has(obj)) return obj;
    seen.add(obj);

    const keys = [
        ...Object.getOwnPropertyNames(obj),
        ...Object.getOwnPropertySymbols(obj),
    ];

    for (const k of keys) {
        const v = obj[k];
        if (v && typeof v === 'object') deepFreeze(v, seen);
    }
    return Object.freeze(obj);
}

export { deepFreeze };

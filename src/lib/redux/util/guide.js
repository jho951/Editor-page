const coerceSize = (n, fallback) => {
    const v = Number(n);
    return Number.isFinite(v) && v > 0 ? v : fallback;
};

export { coerceSize };

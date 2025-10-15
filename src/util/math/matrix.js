export const I = () => [1, 0, 0, 1, 0, 0];

export const multiply = (m1, m2) => {
    const [a1, b1, c1, d1, e1, f1] = m1;
    const [a2, b2, c2, d2, e2, f2] = m2;
    return [
        a1 * a2 + c1 * b2,
        b1 * a2 + d1 * b2,
        a1 * c2 + c1 * d2,
        b1 * c2 + d1 * d2,
        a1 * e2 + c1 * f2 + e1,
        b1 * e2 + d1 * f2 + f1,
    ];
};

export const translate = (tx, ty) => [1, 0, 0, 1, tx, ty];
export const scale = (sx, sy = sx) => [sx, 0, 0, sy, 0, 0];
export const rotate = (deg) => {
    const rad = (deg * Math.PI) / 180;
    const cos = Math.cos(rad),
        sin = Math.sin(rad);
    return [cos, sin, -sin, cos, 0, 0];
};
export const skewX = (deg) => {
    const t = Math.tan((deg * Math.PI) / 180);
    return [1, 0, t, 1, 0, 0];
};
export const skewY = (deg) => {
    const t = Math.tan((deg * Math.PI) / 180);
    return [1, t, 0, 1, 0, 0];
};

// 중심점(pivot) 기준 변환: T(p) * M * T(-p)
export const around = (mx, my, M) =>
    multiply(multiply(translate(mx, my), M), translate(-mx, -my));

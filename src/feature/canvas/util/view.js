function screenToWorld(view, xs, ys) {
    const v = view ?? { scale: 1, tx: 0, ty: 0 };
    const { scale = 1, tx = 0, ty = 0 } = v;
    return { x: (xs - tx) / scale, y: (ys - ty) / scale };
}

function worldToScreen(view, xw, yw) {
    const v = view ?? { scale: 1, tx: 0, ty: 0 };
    const { scale = 1, tx = 0, ty = 0 } = v;
    return { x: xw * scale + tx, y: yw * scale + ty };
}

export { screenToWorld, worldToScreen };

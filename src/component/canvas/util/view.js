function screenToWorld(view, xs, ys) {
    const { scale, tx, ty } = view;
    return { x: (xs - tx) / scale, y: (ys - ty) / scale };
}
function worldToScreen(view, xw, yw) {
    const { scale, tx, ty } = view;
    return { x: xw * scale + tx, y: yw * scale + ty };
}

export { screenToWorld, worldToScreen };

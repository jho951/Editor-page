const mergeAttrs = (node, { stroke, fill, strokeWidth }) => {
    const out = { ...node };
    if (out.stroke == null) out.stroke = stroke;
    if (out.fill == null) out.fill = fill;
    if (out.strokeWidth == null && strokeWidth != null)
        out.strokeWidth = strokeWidth;
    return out;
};

export { mergeAttrs };

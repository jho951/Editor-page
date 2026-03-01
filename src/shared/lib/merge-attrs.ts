interface DefaultAttrs {
    stroke?: string;
    fill?: string;
    strokeWidth?: number;
}

/**
 * 기존 노드 객체에 기본 속성(stroke, fill, strokeWidth)을 병합합니다.
 * 이미 값이 있는 경우는 유지합니다.
 */
const mergeAttrs = <T extends object>(
    node: T,
    { stroke, fill, strokeWidth }: DefaultAttrs
): T & DefaultAttrs => {
    // 기존 노드 복사 (T 타입과 DefaultAttrs 속성을 모두 가질 수 있는 객체로 생성)
    const out = { ...node } as T & DefaultAttrs;

    if (out.stroke == null) out.stroke = stroke;
    if (out.fill == null) out.fill = fill;
    if (out.strokeWidth == null && strokeWidth != null) {
        out.strokeWidth = strokeWidth;
    }

    return out;
};

export { mergeAttrs };
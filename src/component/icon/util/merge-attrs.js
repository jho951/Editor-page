/**
 *
 * 기능
 * - 전달된 `node` 객체를 복사하여 새로운 객체를 만듭니다.
 * - `node`에 특정 속성(`stroke`, `fill`, `strokeWidth`)이 없을 경우,
 *   두 번째 인자로 전달된 기본 속성값을 채워넣습니다.
 * - 이미 값이 정의된 경우는 덮어쓰지 않습니다.
 *
 * @param {Object} node - 기존 노드 객체 (도형이나 벡터 데이터)
 * @param {Object} attrs - 병합할 기본 속성값들
 * @param {string} [attrs.stroke] - 기본 선 색상
 * @param {string} [attrs.fill] - 기본 채움 색상
 * @param {number} [attrs.strokeWidth] - 기본 선 두께
 * @returns {Object} 새롭게 병합된 노드 객체
 */
const mergeAttrs = (node, { stroke, fill, strokeWidth }) => {
    const out = { ...node };
    if (out.stroke == null) out.stroke = stroke;
    if (out.fill == null) out.fill = fill;
    if (out.strokeWidth == null && strokeWidth != null)
        out.strokeWidth = strokeWidth;
    return out;
};

export { mergeAttrs };

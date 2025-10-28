/**
 * 오버레이 렌더링에 사용하는 공통 상수 모음
 * 한 곳에서 스타일/사이즈를 관리해 일관성 유지
 * handleSize는 '뷰 스케일 적용 전' 좌표계 기준(CSS px)
 */
const OVERLAY = Object.freeze({
    /** 포커스(선택 영역) 외곽선 색상 */
    focusStroke: 'rgba(0, 0, 0, 0.1)',
    /** 포커스 내부 채움 색상(대개 흰색으로 투명 배경 대비) */
    focusFill: '#ffffff',
    /** 포커스 외곽선의 점선 패턴 [dash, gap] */
    dash: [6, 4],
    /** 포커스 외곽선 두께(px) */
    lineWidth: 1,
    /** 리사이즈/회전 핸들 박스의 한 변 길이(CSS px 기준) */
    handleSize: 8,
});

/**
 * 정수 ID → RGB 매핑
 * 히트맵(피킹 버퍼)에서 도형을 고유 색상으로 인코딩할 때 사용
 * 24비트 정수(id)를 R/G/B 각 8비트로 분해
 * @param {number} id 0~16,777,215 범위 정수
 * @returns {{r:number,g:number,b:number}} 0~255 범위의 RGB
 */
const idToRGB = (id) => ({
    r: (id >> 16) & 255,
    g: (id >> 8) & 255,
    b: id & 255,
});

/**
 * RGB → 정수 ID 역매핑
 * 히트맵에서 읽은 픽셀 색을 다시 도형의 고유 정수 ID로 복원
 * @param {number} r - 0~255
 * @param {number} g - 0~255
 * @param {number} b - 0~255
 * @returns {number} 0~16,777,215 범위 정수 ID (>>>0로 부호 없는 정수화)
 */
const rgbToId = (r, g, b) => ((r << 16) | (g << 8) | b) >>> 0;

export { OVERLAY, idToRGB, rgbToId };

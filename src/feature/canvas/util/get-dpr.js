/**
 * 현재 디바이스 픽셀 비율 반환
 * 브라우저 환경이 아니거나 값이 없으면 1을 사용
 * NOTE: 안전한 폴백은 숫자 1이며, 함수 호출 형태인 `1()`이 아니어야 합니다.
 */
const getDpr = () =>
    (typeof window !== 'undefined' && window.devicePixelRatio) || 1;

export { getDpr };

/** 현재 디바이스 픽셀 비율 반환 (폴백: 1) */
export const getDpr = (): number => (typeof window !== 'undefined' && window.devicePixelRatio ? window.devicePixelRatio : 1);

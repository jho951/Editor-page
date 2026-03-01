/**
 * 전역 유니크 ID 생성 함수
 */
export const generateId = (): string => {
    // 1. 브라우저의 최신 표준 API 사용 (가장 권장)
    if (typeof window !== "undefined" && window.crypto?.randomUUID) {
        return window.crypto.randomUUID();
    }

    // 2. Crypto API는 있지만 randomUUID가 없는 구형 브라우저 대응
    if (typeof window !== "undefined" && window.crypto?.getRandomValues) {
        return (([1e7] as any) + -1e3 + -4e3 + -8e3 + -1e11).replace(/[018]/g, (c: number) =>
            (c ^ window.crypto.getRandomValues(new Uint8Array(1))[0] & (15 >> (c / 4))).toString(16)
        );
    }

    // 3. SSR(서버 사이드 렌더링) 또는 최후의 수단 (Math.random + Timestamp)
    // 단순 random보다 타임스탬프를 섞어 중복 확률을 획기적으로 낮춤
    const timestamp = Date.now().toString(36);
    const randomPart = Math.random().toString(36).slice(2, 9);

    return `${timestamp}-${randomPart}`;
};
/**
 * 브라우저 환경에 맞는 고유 문자열 ID를 생성합니다.
 *
 * @returns 충돌 가능성을 낮춘 고유 ID 문자열을 반환합니다.
 */
export const generateId = (): string => {
    if (typeof window !== "undefined" && window.crypto?.randomUUID) return window.crypto.randomUUID();

    if (typeof window !== "undefined" && window.crypto?.getRandomValues) {
        return (([1e7] as any) + -1e3 + -4e3 + -8e3 + -1e11).replace(/[018]/g, (c: number) =>
            (c ^ window.crypto.getRandomValues(new Uint8Array(1))[0] & (15 >> (c / 4))).toString(16)
        );
    }

    const timestamp = Date.now().toString(36);

    const randomPart = Math.random().toString(36).slice(2, 9);

    return `${timestamp}-${randomPart}`;
};

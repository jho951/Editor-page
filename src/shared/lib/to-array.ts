/**
 * 입력을 배열 형태로 변환합니다.
 * items 속성을 가진 객체나 일반 배열을 처리합니다.
 */
const toArray = <T>(payload: T[] | { items: T[] } | null | undefined): T[] => {
    if (Array.isArray(payload)) {
        return payload;
    }
    if (payload && 'items' in payload && Array.isArray(payload.items)) {
        return payload.items;
    }
    return [];
};

export { toArray };
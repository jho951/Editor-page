/**
 * 레이아웃 상태를 localStorage와 연동하기 위한 읽기 유틸을 제공합니다.
 */

import {LAST} from "@features/layout/constant/constant.ts";

/**
 * localStorage JSON 값을 안전하게 읽습니다.
 *
 * @param key 변환 또는 조회에 사용할 키 값입니다.
 * @param fallback fallback 값입니다.
 * @returns 계산된 결과를 반환합니다.
 */
export function safeReadJson(key: string, fallback: any) {
    try {
        if (typeof window === "undefined") return fallback;

        const raw = window.localStorage.getItem(key);
        if (!raw) return fallback;
        return JSON.parse(raw);
    } catch {
        return fallback;
    }
}

/**
 * String Array를 읽습니다.
 *
 * @param key 변환 또는 조회에 사용할 키 값입니다.
 * @returns 문자열 결과를 반환합니다.
 */
export function readStringArray(key: string): string[] {

    const v = safeReadJson(key, []);
    return Array.isArray(v) ? v.filter((x) => typeof x === "string") : [];
}

/**
 * Last Location를 읽습니다.
 * @returns 문자열 결과를 반환합니다.
 */
export function readLastLocation(): { docId: string } | null {

    const v = safeReadJson(LAST, null);
    if (!v || typeof v !== "object") return null;
    if (typeof v.docId !== "string") return null;
    return { docId: v.docId };
}

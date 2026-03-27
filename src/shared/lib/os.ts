/**
 * 현재 실행 환경의 운영체제 정보를 판별합니다.
 */

import type { UADataLike } from "@shared/lib/os.types.ts";

/**
 * UAData를 반환합니다.
 * @returns 값이 없으면 null을 포함해 반환합니다.
 */
function getUAData(): UADataLike | null {

    const nav = navigator as Navigator & { userAgentData?: unknown };

    const uad = nav.userAgentData;
    if (!uad || typeof uad !== "object") return null;

    return uad as UADataLike;
}

/**
 * Mac 여부를 확인합니다.
 * @returns 참 또는 거짓 결과를 반환합니다.
 */
export const isMac = (): boolean => {
    if (typeof window === "undefined") return false;

    const uaData = getUAData();

    const platforms = uaData?.platforms;

    if (Array.isArray(platforms)) {

        const hit = platforms.some((p) => /mac|ios|iphone|ipad|ipados/i.test(p.platform));
        if (hit) return true;
    }

    const p = (navigator.platform || "").toLowerCase();

    const ua = (navigator.userAgent || "").toLowerCase();

    return /mac|iphone|ipad|ipod/.test(p) || /mac os x|iphone|ipad|ipod/.test(ua);
};

/**
 * 현재 운영체제에서 사용할 기본 수정 키를 나타냅니다.
 */
export const MOD: "Meta" | "Control" = isMac() ? "Meta" : "Control";

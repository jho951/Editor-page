type UADataPlatform = { platform: string };
type UADataLike = {
    platforms?: UADataPlatform[];
    platform?: string;
};

function getUAData(): UADataLike | null {
    const nav = navigator as Navigator & { userAgentData?: unknown };
    const uad = nav.userAgentData;
    if (!uad || typeof uad !== "object") return null;

    return uad as UADataLike;
}

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

export const MOD: "Meta" | "Control" = isMac() ? "Meta" : "Control";

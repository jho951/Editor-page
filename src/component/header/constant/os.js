const isAppleLike = () => {
    if (typeof window === 'undefined') return false;

    const uaData = navigator.userAgentData;
    if (uaData && Array.isArray(uaData.platforms)) {
        if (uaData.platforms.some((p) => /mac|ios|iphone|ipad|ipados/i.test(p)))
            return true;
    }

    const p = (navigator.platform || '').toLowerCase();
    const ua = (navigator.userAgent || '').toLowerCase();

    return (
        /mac|iphone|ipad|ipod/.test(p) || /mac os x|iphone|ipad|ipod/.test(ua)
    );
};

const isMac = isAppleLike();
const MOD = isMac ? 'Meta' : 'Control';

export { MOD, isMac };

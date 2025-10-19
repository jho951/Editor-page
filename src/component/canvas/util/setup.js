function setup(
    el,
    cssW,
    cssH,
    {
        dpr = (typeof window !== 'undefined' && window.devicePixelRatio) || 1,
        alpha = true,
        willReadFrequently = false,
    } = {}
) {
    const min = 16;
    const prevW = Number(el?.dataset?.cssw) || 0;
    const prevH = Number(el?.dataset?.cssh) || 0;
    let w = cssW,
        h = cssH;
    if (!Number.isFinite(w) || !Number.isFinite(h) || w < min || h < min) {
        w = prevW >= min ? prevW : Math.max(cssW || 0, min);
        h = prevH >= min ? prevH : Math.max(cssH || 0, min);
    }
    el.width = Math.round(w * dpr);
    el.height = Math.round(h * dpr);
    el.style.width = w + 'px';
    el.style.height = h + 'px';
    el.dataset.cssw = String(w);
    el.dataset.cssh = String(h);
    const ctx = el.getContext('2d', { alpha, willReadFrequently });
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    return { ctx, w, h, dpr };
}

export { setup };

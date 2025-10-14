export function idToRGB(id, handleCode = 0) {
    const r = id & 255;
    const g = (id >> 8) & 255;
    const b = handleCode & 255; // 0 for body, 1.. for handles
    return [r, g, b];
}
export function rgbToIdHandle(r, g, b) {
    const id = (g << 8) | r;
    const handle = b; // 0=body, >0 handle enum
    return { id, handle };
}
export function rgbToCss(r, g, b) {
    return `rgb(${r},${g},${b})`;
}

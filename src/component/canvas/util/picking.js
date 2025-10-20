import { rgbToId } from '../constant/constants';

function pickIdAt(hitCanvas, clientX, clientY) {
    if (!hitCanvas) return null;
    const rect = hitCanvas.getBoundingClientRect();
    const x = Math.floor(
        (clientX - rect.left) * (hitCanvas.width / rect.width)
    );
    const y = Math.floor(
        (clientY - rect.top) * (hitCanvas.height / rect.height)
    );
    const d = hitCanvas.getContext('2d').getImageData(x, y, 1, 1).data;
    if (d[3] === 0) return null;
    return rgbToId(d[0], d[1], d[2]);
}

export { pickIdAt };

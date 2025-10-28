import { rgbToId } from '../constant/constants';
import { denormPath, distPointToSegment } from '../service/geometry';
import { screenToWorld } from './view';

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

/**
 * @param {HTMLCanvasElement} viewCanvas  화면좌표 → 월드좌표 변환용(크기/뷰 변환 필요 시)
 * @param {Object} view {scale, tx, ty}
 * @param {Object} shape 편집중인 path shape ({ x,y,w,h, path:[{u,v},...], strokeWidth })
 * @param {number} clientX
 * @param {number} clientY
 * @param {number} tolerancePx 화면 픽셀 허용치(없으면 자동)
 * @returns {{kind:'vertex'|'segment'|'none', index:number, H?:{x,y}, d:number}}
 */
function pickFreeDrawDetail(view, shape, clientX, clientY, tolerancePx) {
    if (
        !shape ||
        shape.type !== 'path' ||
        !Array.isArray(shape.path) ||
        shape.path.length < 2
    )
        return { kind: 'none', index: -1, d: Infinity };

    const P = screenToWorld(view, clientX, clientY);
    const pts = denormPath(shape.path, shape.x, shape.y, shape.w, shape.h);

    // 줌/선굵기 고려한 허용치(픽셀)
    const base = Math.max(4, (shape.strokeWidth || 2) * 0.5);
    const tol = (tolerancePx ?? base) / (view.scale || 1);

    let best = { kind: 'none', index: -1, d: Infinity, H: null };

    for (let i = 0; i < pts.length - 1; i++) {
        const A = pts[i],
            B = pts[i + 1];
        const seg = distPointToSegment(P, A, B);
        if (seg.d < best.d)
            best = { kind: 'segment', index: i, d: seg.d, H: seg.H };

        const dA = Math.hypot(P.x - A.x, P.y - A.y);
        if (dA < best.d) best = { kind: 'vertex', index: i, d: dA, H: A };
        const dB = Math.hypot(P.x - B.x, P.y - B.y);
        if (dB < best.d) best = { kind: 'vertex', index: i + 1, d: dB, H: B };
    }
    return best.d <= tol ? best : { kind: 'none', index: -1, d: best.d };
}

export { pickIdAt, pickFreeDrawDetail };

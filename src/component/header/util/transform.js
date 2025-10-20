export function parseVectorJson(vectorJson) {
    if (!vectorJson)
        return {
            view: { tx: 0, ty: 0, scale: 1 },
            canvas: { background: '#f5f5f5' },
            shapes: [],
        };

    const doc =
        typeof vectorJson === 'string' ? JSON.parse(vectorJson) : vectorJson;
    const view = doc.view || { tx: 0, ty: 0, scale: 1 };
    const canvas = doc.canvas || { background: '#f5f5f5' };

    // "vector" 타입 레이어 찾기 (없으면 첫 레이어 사용)
    const layers = Array.isArray(doc.layers) ? doc.layers : [];
    const vectorLayer = layers.find(
        (l) => (l.type || '').toLowerCase() === 'vector'
    ) ||
        layers[0] || { shapes: [] };
    const arr = Array.isArray(vectorLayer.shapes) ? vectorLayer.shapes : [];

    // 서버 shape -> 내부 shape
    const shapes = arr.map((s) => {
        const base = {
            id: Number(s.id) || 0,
            pickId: Number(s.id) || 0,
            type: s.type,
            x: Number(s.x) || 0,
            y: Number(s.y) || 0,
            w: Number(s.w) || 0,
            h: Number(s.h) || 0,
            stroke: s.stroke ?? '#333',
            fill: s.type === 'line' ? undefined : (s.fill ?? '#fff'),
            strokeWidth: Number(s.strokeWidth) || 2,
        };

        if (s.type === 'polygon') base.sides = Number(s.sides) || 5;
        if (s.type === 'star') {
            base.points = Number(s.points) || 5;
            base.innerRatio = Number(s.innerRatio) || 0.5;
        }
        if (s.type === 'path') {
            base.path = Array.isArray(s.path)
                ? s.path.map((p) => ({
                      u: Number(p.u) || 0,
                      v: Number(p.v) || 0,
                  }))
                : [];
        }
        if (s.type === 'text') {
            base.text = s.text ?? '';
            base.font = s.font || '16px sans-serif';
            base.color = s.color || '#111';
            base.align = s.align || 'left';
            base.lineHeight = Number(s.lineHeight) || 1.3;
        }
        return base;
    });

    return { view, canvas, shapes };
}

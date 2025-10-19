// /lib/redux/middleware/transformToolMiddleware.js (또는 기존 경로 교체)
import { setTool } from '../slice/toolSlice';
import {
    rotateShapes,
    flipHShapes,
    flipVShapes,
    skewShapes,
} from '../slice/shapeSlice';

const transformToolMiddleware = (store) => (next) => (action) => {
    const result = next(action);

    if (action.type !== setTool.type) return result;

    const payload = action.payload;
    const state = store.getState();
    const selId = state.selection?.id ?? null;
    const ids = selId ? [selId] : [];

    const done = () => store.dispatch(setTool('select'));

    if (!ids.length) return result;

    // 객체 페이로드
    if (payload && typeof payload === 'object' && payload.type) {
        switch (payload.type) {
            case 'rotate': {
                const deg = Number(payload.deg) || 90;
                store.dispatch(rotateShapes({ ids, deg }));
                done();
                return result;
            }
            case 'flipH': {
                store.dispatch(flipHShapes({ ids }));
                done();
                return result;
            }
            case 'flipV': {
                store.dispatch(flipVShapes({ ids }));
                done();
                return result;
            }
            case 'skew': {
                const kx = Number(payload.kx ?? 0.2);
                const ky = Number(payload.ky ?? 0);
                store.dispatch(skewShapes({ ids, kx, ky }));
                done();
                return result;
            }
            default:
                return result;
        }
    }

    // 문자열 페이로드(호환)
    if (payload === 'rotate') {
        store.dispatch(rotateShapes({ ids, deg: 90 }));
        done();
        return result;
    }
    if (payload === 'flipH') {
        store.dispatch(flipHShapes({ ids }));
        done();
        return result;
    }
    if (payload === 'flipV') {
        store.dispatch(flipVShapes({ ids }));
        done();
        return result;
    }
    if (payload === 'skew') {
        store.dispatch(skewShapes({ ids, kx: 0.2, ky: 0 }));
        done();
        return result;
    }

    return result;
};

export { transformToolMiddleware };

import { setTool } from '../slice/toolSlice';
import { rotateShapes, flipHShapes, flipVShapes } from '../slice/shapeSlice';

const transformToolMiddleware = (store) => (next) => (action) => {
    const result = next(action);

    if (action.type === setTool.type) {
        const payload = action.payload;
        const state = store.getState();
        const selId = state.selection?.id ?? null;
        const ids = selId ? [selId] : [];

        const done = () => store.dispatch(setTool('select'));

        if (typeof payload === 'object' && payload?.type) {
            const t = payload.type;
            if (t === 'rotate') {
                const deg = Number(payload.deg) || 90;
                if (ids.length) store.dispatch(rotateShapes({ ids, deg }));
                return done();
            }
            if (t === 'flipH') {
                if (ids.length) store.dispatch(flipHShapes({ ids }));
                return done();
            }
            if (t === 'flipV') {
                if (ids.length) store.dispatch(flipVShapes({ ids }));
                return done();
            }
            return result;
        }

        if (payload === 'rotate') {
            if (ids.length) store.dispatch(rotateShapes({ ids, deg: 90 }));
            return done();
        }
        if (payload === 'flipH') {
            if (ids.length) store.dispatch(flipHShapes({ ids }));
            return done();
        }
        if (payload === 'flipV') {
            if (ids.length) store.dispatch(flipVShapes({ ids }));
            return done();
        }
    }

    return result;
};

export { transformToolMiddleware };

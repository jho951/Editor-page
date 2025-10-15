import { setTool } from '../slice/toolSlice';
import { rotateShapes, flipHShapes, flipVShapes } from '../slice/shapeSlice';

const transformToolMiddleware = (store) => (next) => (action) => {
    const result = next(action);

    if (action.type === setTool.type) {
        const payload = action.payload;
        const state = store.getState();
        const ids = state.selection?.ids || [];

        const applyAndReturn = () => {
            store.dispatch(setTool('select'));
        };

        if (typeof payload === 'object' && payload?.type) {
            const t = payload.type;
            if (t === 'rotate') {
                const deg = Number(payload.deg) || 90;
                if (ids.length) store.dispatch(rotateShapes({ ids, deg }));
                applyAndReturn();
            }
            if (t === 'flipH') {
                if (ids.length) store.dispatch(flipHShapes({ ids }));
                applyAndReturn();
            }
            if (t === 'flipV') {
                if (ids.length) store.dispatch(flipVShapes({ ids }));
                applyAndReturn();
            }
            return result;
        }

        if (payload === 'rotate') {
            if (ids.length) store.dispatch(rotateShapes({ ids, deg: 90 }));
            applyAndReturn();
        }
        if (payload === 'flipH') {
            if (ids.length) store.dispatch(flipHShapes({ ids }));
            applyAndReturn();
        }
        if (payload === 'flipV') {
            if (ids.length) store.dispatch(flipVShapes({ ids }));
            applyAndReturn();
        }
    }

    return result;
};

export { transformToolMiddleware };

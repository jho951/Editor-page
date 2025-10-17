import { createSlice } from '@reduxjs/toolkit';
import { DEFAULT } from '../constant/default';
import { REDUCER_NAME } from '../constant/name';

const editSlice = createSlice({
    name: REDUCER_NAME.EDIT,
    initialState: DEFAULT.EDIT,
    reducers: {
        exitEdit: () => DEFAULT.EDIT,

        enterPathEdit: (s, { payload }) => {
            s.mode = 'path';
            s.targetId = payload.id;
        },
        setPathHoverNode: (s, { payload }) => {
            if (s.mode === 'path')
                s.hoverNode =
                    payload?.index != null ? { index: payload.index } : null;
        },
        startPathNodeDrag: (s, { payload }) => {
            if (s.mode === 'path')
                s.draggingNode = {
                    index: payload.index,
                    start: { x: payload.x, y: payload.y },
                };
        },
        endPathNodeDrag: (s) => {
            if (s.mode === 'path') s.draggingNode = null;
        },

        enterTextEdit: (s, { payload }) => {
            s.mode = 'text';
            s.targetId = payload.id;
        },

        enterTransform: (s, { payload }) => {
            s.mode = 'transform';
            s.targetId = payload.id;
            s.handle = payload.handle ?? null;
            s.origin = payload.origin ?? null;
        },
        setTransformHandle: (s, { payload }) => {
            if (s.mode === 'transform') s.handle = payload?.handle ?? null;
        },
    },
});

export const {
    exitEdit,
    enterPathEdit,
    setPathHoverNode,
    startPathNodeDrag,
    endPathNodeDrag,
    enterTextEdit,
    enterTransform,
    setTransformHandle,
} = editSlice.actions;

export default editSlice.reducer;

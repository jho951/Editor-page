import { combineReducers } from '@reduxjs/toolkit';
import canvasReducer from '@/feature/canvas/state/canvas.slice';
import documentReducer from '@/feature/document/state/document.slice';
import headerReducer from '@/feature/header/state/header.slice';

const rootReducer = combineReducers({
    canvas: canvasReducer,
    document: documentReducer,
    header: headerReducer,
});

export { rootReducer };

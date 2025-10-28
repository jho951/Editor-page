import { combineReducers } from '@reduxjs/toolkit';
import { canvasReducer } from '@/feature/canvas/state/canvas.slice';
import { documentReducer } from '@/feature/document/state/document.slice';
import { toolbarReducer } from '@/feature/toolbar/state/toolbar.slice';
import { viewportReducer } from '@/feature/viewport/state/viewport.slice';

const rootReducer = combineReducers({
    canvas: canvasReducer,
    document: documentReducer,
    toolbar: toolbarReducer,
    viewport: viewportReducer,
});

export { rootReducer };

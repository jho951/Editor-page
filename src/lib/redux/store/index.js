import { configureStore, combineReducers } from '@reduxjs/toolkit';

import canvas from '../slice/canvasSlice';
import doc from '../slice/docSlice';
import tools from '../slice/toolSlice';
import shapes from '../slice/shapeSlice';
import render from '../slice/renderSlice';
import selection from '../slice/selectionSlice';
import historyDoc from '../slice/historySlice';
import viewport from '../slice/viewportSlice';

import { historyDocMiddleware } from '../middleware/historyDocMiddleware';
import { transformToolMiddleware } from '../middleware/transformToolMiddleware';

const rootReducer = combineReducers({
    canvas,
    viewport,
    tools,
    shapes,
    selection,
    historyDoc,
    doc,
    render,
});

const store = configureStore({
    reducer: rootReducer,
    middleware: (getDefault) =>
        getDefault({ serializableCheck: false }).concat(
            transformToolMiddleware,
            historyDocMiddleware
        ),
});

export { store };

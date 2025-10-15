import { configureStore, combineReducers } from '@reduxjs/toolkit';

import doc from '../slice/docSlice';
import tools from '../slice/toolSlice';
import shapes from '../slice/shapeSlice';
import layers from '../slice/layerSlice';
import render from '../slice/renderSlice';
import canvas from '../slice/canvasSlice';
import viewport from '../slice/viewportSlice';
import selection from '../slice/selectionSlice';
import historyDoc from '../slice/historyDocSlice';

import { historyDocMiddleware } from '../middleware/historyDocMiddleware';
import { transformToolMiddleware } from '../middleware/transformToolMiddleware';

const store = configureStore({
    reducer: combineReducers({
        tools,
        viewport,
        shapes,
        selection,
        historyDoc,
        doc,
        canvas,
        layers,
        render,
    }),
    middleware: (getDefault) =>
        getDefault({ serializableCheck: false }).concat(
            transformToolMiddleware,
            historyDocMiddleware
        ),
    devTools: true,
});

export { store };

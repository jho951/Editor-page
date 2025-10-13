import { configureStore, combineReducers } from '@reduxjs/toolkit';

// 히스토리(Undo/Redo) 슬라이스
import historyDoc from '../slice/historyDocSlice';

// 벡터 문서 관련 슬라이스들
import canvas from '../slice/canvasSlice';
import layers from '../slice/layerSlice';
import render from '../slice/renderSlice';
import hitmap from '../slice/hitmapSlice';

// 미들웨어
import vectorHistoryMiddleware from '../middleware/vectorHistoryMiddleware';

const vectorDoc = combineReducers({
    canvas,
    layers,
    render,
    hitmap,
});

export const store = configureStore({
    reducer: {
        historyDoc,
        vectorDoc,
    },
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware({
            serializableCheck: {
                ignoredActions: [
                    'historyDoc/pushPast',
                    'historyDoc/pushFuture',
                    'historyDoc/clearFuture',
                    'historyDoc/popPast',
                    'historyDoc/popFuture',
                    'historyDoc/reset',

                    'canvas/replaceAll',
                    'layers/replaceAll',
                    'render/replaceAll',
                    'hitmap/replaceAll',
                ],
                ignoredPaths: [
                    'historyDoc.past',
                    'historyDoc.future',
                    'historyDoc.applied',
                ],
            },
            immutableCheck: false,
        }).concat(vectorHistoryMiddleware),
});

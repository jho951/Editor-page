// import { configureStore, combineReducers } from '@reduxjs/toolkit';

// import canvas from '../slice/canvasSlice';
// import doc from '../slice/docSlice';
// import edit from '../slice/editSlice';
// import history from '../slice/historySlice';
// import tool from '../slice/toolSlice';
// import shape from '../slice/shapeSlice';
// import render from '../slice/renderSlice';
// import selection from '../slice/selectionSlice';
// import viewport from '../slice/viewportSlice';

// import { historyDocMiddleware } from '../middleware/historyDocMiddleware';
// import { transformToolMiddleware } from '../middleware/transformToolMiddleware';

// const rootReducer = combineReducers({
//     canvas,
//     doc,
//     edit,
//     history,
//     render,
//     shape,
//     tool,
//     selection,
//     viewport,
// });

// const store = configureStore({
//     reducer: rootReducer,
//     middleware: (getDefault) =>
//         getDefault({ serializableCheck: false }).concat(
//             transformToolMiddleware,
//             historyDocMiddleware
//         ),
// });

// export { store };

import { configureStore } from '@reduxjs/toolkit';
import canvas from '../slice/canvasSlice';
import ui from '../slice/uiSlice';

export const store = configureStore({
    reducer: {
        canvas,
        ui,
    },
});

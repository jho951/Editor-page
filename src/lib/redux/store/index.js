import { configureStore } from '@reduxjs/toolkit';
import canvas from '../slice/canvasSlice';
import ui from '../slice/uiSlice';
import doc from '../slice/docSlice';

const store = configureStore({
    reducer: {
        doc,
        canvas,
        ui,
    },
});

export { store };

import { configureStore } from '@reduxjs/toolkit';

import canvas from '../../lib/redux/slice/canvasSlice';
import ui from '../../lib/redux/slice/uiSlice';
import doc from '../../lib/redux/slice/docSlice';

const store = configureStore({
    reducer: {
        doc,
        canvas,
        ui,
    },
});

export { store };

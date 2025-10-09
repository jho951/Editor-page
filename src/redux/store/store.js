import { configureStore } from '@reduxjs/toolkit';
import shape from '../slice/shapeSlice';
import history from '../slice/historySlice';
import size from '../slice/sizeSlice';
import select from '../slice/selectSlice';
import style from '../slice/styleSlice';
import ui from '../slice/uiSlice';
import Middleware from '../middleware/middleware';

const store = configureStore({
    reducer: { shape, history, size, select, style, ui },
    middleware: (gdm) => Middleware(gdm),
});

export { store };

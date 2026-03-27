/**
 * Redux store를 생성하고 미들웨어를 구성합니다.
 */

import { configureStore } from '@reduxjs/toolkit';
import { rootReducer } from '@app/store/rootReducer';

/**
 * 를 저장합니다.
 */
const store = configureStore({
    reducer: rootReducer,
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
export { store };


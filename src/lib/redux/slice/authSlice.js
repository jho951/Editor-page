import { createSlice } from '@reduxjs/toolkit';
import { login } from '../util/authAsync';

const initialState = { accessToken: null, refreshToken: null, user: null };

const slice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        logout(state) {
            state.accessToken = null;
            state.refreshToken = null;
            state.user = null;
        },
    },
    extraReducers: (b) => {
        b.addCase(login.fulfilled, (state, { payload }) => {
            state.accessToken = payload.accessToken;
            state.refreshToken = payload.refreshToken;
        });
    },
});
export const { logout } = slice.actions;
export default slice.reducer;

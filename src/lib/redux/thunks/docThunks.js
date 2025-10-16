import { createAsyncThunk } from '@reduxjs/toolkit';
import { drawings } from '../../axios/drawings';
import { safeParseVectorJson } from '../util/parsing-json';
import { applyVectorJson } from '../util/apply-json';

export const fetchDrawings = createAsyncThunk(
    'doc/fetchDrawings',
    async (_, { rejectWithValue }) => {
        try {
            const res = await drawings.list();
            return Array.isArray(res) ? res : (res?.data ?? []);
        } catch (e) {
            return rejectWithValue(e.message || String(e));
        }
    }
);

export const loadDrawing = createAsyncThunk(
    'doc/loadDrawing',
    async (id, { dispatch, rejectWithValue }) => {
        try {
            const res = await drawings.get(id);
            const data = res?.data ?? res;
            const vj = safeParseVectorJson(data?.vectorJson);
            if (vj) applyVectorJson(dispatch, vj);
            return { ...data, vectorJson: vj };
        } catch (e) {
            return rejectWithValue(e.message || String(e));
        }
    }
);

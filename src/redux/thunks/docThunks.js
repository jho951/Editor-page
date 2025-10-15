import { createAsyncThunk } from '@reduxjs/toolkit';
import { drawings } from '@/api/drawings';
import { safeParseVectorJson } from '@/features/vector/format/vectorJson';
import { applyVectorJson } from '@/redux/util/vectorJsonApply';

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

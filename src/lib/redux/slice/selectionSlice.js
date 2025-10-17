import { createSlice } from '@reduxjs/toolkit';
import { DEFAULT } from '../constant/default';
import { REDUCER_NAME } from '../constant/name';

/**
 * @file selectionSlice.js
 * @author YJH
 * @description 캔버스 내 요소 선택 관리 슬라이스
 * @property {id} 선택된 도형의 아이디
 * @property {anchor} 노드 선택
 * @see {@link DEFAULT.SELCECTION} 초기 상태
 */
const selectionSlice = createSlice({
    name: REDUCER_NAME.SELCECTION,
    initialState: DEFAULT.SELCECTION,
    reducers: {
        setSelection: (state, { payload }) => {
            state.id = payload ?? null;
            state.anchor = null;
        },
        clearSelection: (state) => {
            state.id = null;
            state.anchor = null;
        },
        setAnchorSelection: (state, { payload }) => {
            state.anchor = payload ?? null;
        },
    },
});

export const { setSelection, clearSelection, setAnchorSelection } =
    selectionSlice.actions;
export default selectionSlice.reducer;

export const getSelectedId = (s) => s.selection?.id ?? null;
export const hasSelection = (s) => !!s.selection?.id;

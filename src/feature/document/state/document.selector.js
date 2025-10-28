import { createSelector } from '@reduxjs/toolkit';

const root = (s) => s.document;

export const selectItems = (s) => root(s).items;
export const selectLoading = (s) => root(s).loading;
export const selectError = (s) => root(s).error;
export const selectModal = (s) => root(s).modal;
export const selectModalLoad = (s) => root(s).modal.loadOpen;
export const selectModalSave = (s) => root(s).modal.saveOpen;
export const selectModalRestore = (s) => root(s).modal.restoreOpen;
export const selectCurrent = (s) => root(s).current;
export const selectCurrentId = (s) => root(s).current.id;
export const selectCurrentTitle = (s) => root(s).current.title;
export const selectCurrentDirty = (s) => root(s).current.dirty;

// 메모이즈 예시: items를 id 맵으로
export const selectItemMap = createSelector(selectItems, (items) => {
    const map = Object.create(null);
    for (const it of items) if (it?.id != null) map[it.id] = it;
    return map;
});

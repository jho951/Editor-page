import type { RootState } from "@app/store/store.ts";

export const selectSidebarActiveKey = (s: RootState) => s.layout.activeKey;
export const selectSidebarCollapsed = (s: RootState) => s.layout.sidebarCollapsed;
export const selectLnbOpenFolderIds = (s: RootState) => s.layout.openFolderIds;

export const selectFolders = (s: RootState) => s.layout.folders;
export const selectTrashItems = (s: RootState) => s.layout.trashItems;

export const selectRecentDocIds = (s: RootState) => s.layout.recentDocIds;
export const selectPinnedDocIds = (s: RootState) => s.layout.pinnedDocIds;
export const selectLastLocation = (s: RootState) => s.layout.lastLocation;

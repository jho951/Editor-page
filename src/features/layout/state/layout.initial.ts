/**
 * 레이아웃 상태의 초기값과 기본 폴더 구조를 정의합니다.
 */

import { DEFAULT_FOLDER } from "@features/layout/ui/constant/lnbitem.ts";
import { PINNED, RECENTS } from "@features/layout/constant/constant.ts";
import { readLastLocation, readStringArray } from "@features/layout/state/layout.hook.ts";

import type { LnbActiveKey, FolderItem, TrashItem } from "@features/layout/ui/lnb/Lnb.types.ts";

export type OpenFolderMap = Record<string, boolean>;

interface LayoutState {
    activeKey: LnbActiveKey;
    sidebarCollapsed: boolean;
    openFolderIds: OpenFolderMap;
    folders: FolderItem[];
    trashItems: TrashItem[];
    recentDocIds: string[];
    pinnedDocIds: string[];
    sharedDocIds: string[];
    lastLocation: { docId: string } | null;
}

/**
 * 레이아웃 slice의 초기 상태입니다.
 */
export const initialState: LayoutState = {
    activeKey: "home",
    sidebarCollapsed: false,
    openFolderIds: {
        my: true,
        pinned: true,
        sharedRoot: true,
    },
    folders: DEFAULT_FOLDER,
    trashItems: [],
    recentDocIds: readStringArray(RECENTS),
    pinnedDocIds: readStringArray(PINNED),
    sharedDocIds: [],
    lastLocation: readLastLocation()
};

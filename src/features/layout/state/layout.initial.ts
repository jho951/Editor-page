import { DEFAULT_FOLDER } from "@features/layout/ui/constant/lnbitem.ts";
import { PINNED, RECENTS } from "@features/layout/constant/constant.ts";
import { readLastLocation, readStringArray } from "@features/layout/state/layout.hook.ts";

import type { LnbActiveKey, FolderItem, TrashItem } from "@features/layout/ui/lnb/Lnb.types.ts";
import type {EditorMode} from "@features/layout/api/pages.ts";

export type OpenFolderMap = Record<string, boolean>;

interface LayoutState {
    activeKey: LnbActiveKey;
    sidebarCollapsed: boolean;
    openFolderIds: OpenFolderMap;
    folders: FolderItem[];
    trashItems: TrashItem[];
    recentDocIds: string[];
    pinnedDocIds: string[];
    lastLocation: { docId: string; mode: EditorMode } | null;
}

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
    lastLocation: readLastLocation()
};

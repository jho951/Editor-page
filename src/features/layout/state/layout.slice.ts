import { createSlice, createAsyncThunk, type PayloadAction } from "@reduxjs/toolkit";
import type { LnbActiveKey, FolderItem } from "@features/layout/ui/lnb/Lnb.types.ts";
import { initialState, type OpenFolderMap } from "@features/layout/state/layout.initial.ts";
import { generateId } from "@shared/lib/id.ts";
import { pagesApi } from "@features/layout/api/pages.ts";


function addChildById(nodes: FolderItem[], parentId: string, child: FolderItem): boolean {
    for (const n of nodes) {
        if (n.id === parentId) {
            n.children = n.children ? [...n.children, child] : [child];
            return true;
        }
        if (n.children?.length) {
            const ok = addChildById(n.children, parentId, child);
            if (ok) return true;
        }
    }
    return false;
}

function removePageById(
    nodes: FolderItem[],
    pageId: string
): { removed: FolderItem | null; next: FolderItem[] } {
    let removed: FolderItem | null = null;

    const next = nodes.flatMap((n) => {
        const isTarget =
            n.id === pageId ||
            n.docId === pageId ||
            n.key === (`folder:${pageId}` as LnbActiveKey);

        if (isTarget) {
            removed = n;
            return [];
        }

        if (n.children?.length) {
            const childResult = removePageById(n.children, pageId);
            if (childResult.removed) removed = childResult.removed;
            return [{ ...n, children: childResult.next }];
        }

        return [n];
    });

    return { removed, next };
}

function hasPageId(nodes: FolderItem[], pageId: string): boolean {
    for (const n of nodes) {
        if (n.id === pageId || n.docId === pageId || n.key === (`folder:${pageId}` as LnbActiveKey)) return true;
        if (n.children?.length && hasPageId(n.children, pageId)) return true;
    }
    return false;
}

const layoutSlice = createSlice({
    name: "layout",
    initialState,
    reducers: {
        setActiveKey(state, action: PayloadAction<LnbActiveKey>) {
            state.activeKey = action.payload;
        },
        toggleSidebarCollapsed(state) {
            state.sidebarCollapsed = !state.sidebarCollapsed;
        },
        setSidebarCollapsed(state, action: PayloadAction<boolean>) {
            state.sidebarCollapsed = action.payload;
        },

        toggleFolderOpen(state, action: PayloadAction<string>) {
            const id = action.payload;
            state.openFolderIds[id] = !state.openFolderIds[id];
        },

        setFolderOpen(state, action: PayloadAction<{ id: string; open: boolean }>) {
            const { id, open } = action.payload;
            state.openFolderIds[id] = open;
        },

        setOpenFolderIds(state, action: PayloadAction<OpenFolderMap>) {
            state.openFolderIds = action.payload;
        },

        addChildPage: {
            prepare: ({ parentId }: { parentId: string }) => {
                const childId = generateId();
                return { payload: { parentId, childId } };
            },
            reducer: (state, action: PayloadAction<{ parentId: string; childId: string }>) => {
                const { parentId, childId } = action.payload;

                const child: FolderItem = {
                    id: childId,
                    label: "새 페이지",
                    key: `folder:${childId}`, // ✅ 라우팅 키
                    docId: childId,           // ✅ 문서 id로도 사용
                    mode: "text",             // ✅ 기본은 text
                };

                addChildById(state.folders, parentId, child);

                // ✅ 추가하면 부모는 펼쳐짐
                state.openFolderIds[parentId] = true;
            },
        },

        movePageToTrash(state, action: PayloadAction<{ pageId: string }>) {
            const pageId = action.payload.pageId;
            if (!pageId) return;

            const result = removePageById(state.folders, pageId);
            if (!result.removed) return;

            state.folders = result.next;
            state.recentDocIds = state.recentDocIds.filter((id) => id !== pageId);
            state.pinnedDocIds = state.pinnedDocIds.filter((id) => id !== pageId);

            const label = result.removed.label || "제목 없음";
            state.trashItems = [
                { id: pageId, label, deletedAt: Date.now() },
                ...state.trashItems.filter((t) => t.id !== pageId),
            ];

            if (state.activeKey === (`folder:${pageId}` as LnbActiveKey)) {
                state.activeKey = "home";
            }
        },
        restorePageFromTrash(state, action: PayloadAction<{ pageId: string }>) {
            const pageId = action.payload.pageId;
            if (!pageId) return;

            const item = state.trashItems.find((t) => t.id === pageId);
            if (!item) return;
            if (hasPageId(state.folders, pageId)) {
                state.trashItems = state.trashItems.filter((t) => t.id !== pageId);
                return;
            }

            const restored: FolderItem = {
                id: pageId,
                docId: pageId,
                key: `folder:${pageId}` as LnbActiveKey,
                label: item.label || "복구된 페이지",
                mode: "text",
            };

            const inserted = addChildById(state.folders, "my", restored);
            if (!inserted) {
                state.folders = [
                    ...state.folders,
                    { id: "my", label: "개인 페이지", icon: "folder", children: [restored] },
                ];
            }

            state.openFolderIds.my = true;
            state.trashItems = state.trashItems.filter((t) => t.id !== pageId);
        },
        permanentDeleteFromTrash(state, action: PayloadAction<{ pageId: string }>) {
            const pageId = action.payload.pageId;
            if (!pageId) return;
            state.trashItems = state.trashItems.filter((t) => t.id !== pageId);
        },

        recordRecent(state, action: PayloadAction<string>) {
            const docId = action.payload;
            if (!docId) return;
            state.recentDocIds = [docId, ...state.recentDocIds.filter((id) => id !== docId)].slice(0, 20);
        },

        togglePinned(state, action: PayloadAction<string>) {
            const docId = action.payload;
            if (!docId) return;
            const has = state.pinnedDocIds.includes(docId);
            state.pinnedDocIds = has
                ? state.pinnedDocIds.filter((id) => id !== docId)
                : [docId, ...state.pinnedDocIds].slice(0, 50);
        },

        setLastLocation(state, action: PayloadAction<{ docId: string; mode: "text" | "canvas" } | null>) {
            state.lastLocation = action.payload;
        },
    },
});

export const layoutActions = layoutSlice.actions;

export const createChildPage = createAsyncThunk<
  { childId: string; key: LnbActiveKey },
  { parentId: string },
  { rejectValue: string }
>("layout/createChildPage", async ({ parentId }, { dispatch, rejectWithValue }) => {
  // 1) Optimistic update: 즉시 트리에 추가
  const action = layoutActions.addChildPage({ parentId });
  dispatch(action);

  const childId = action.payload.childId;
  const key = (`folder:${childId}`) as LnbActiveKey;

  // 2) 즉시 active로 전환
  dispatch(layoutActions.setActiveKey(key));

  // 3) 서버에 생성 요청 (실패 시 UI는 유지하고 에러만 반환)
  try {
    await pagesApi.createPage({
      id: childId,
      parentId,
      title: "새 페이지",
      mode: "text",
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "create page failed";
    return rejectWithValue(msg);
  }

  return { childId, key };
});
export const layoutReducer = layoutSlice.reducer;

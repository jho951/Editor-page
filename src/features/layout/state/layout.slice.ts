/**
 * LNB 상태, 최근/고정/공유 페이지 목록, 페이지 생성 흐름을 관리합니다.
 */

import { createSlice, createAsyncThunk, type PayloadAction } from "@reduxjs/toolkit";
import type { LnbActiveKey, FolderItem } from "@features/layout/ui/lnb/Lnb.types.ts";
import { initialState, type OpenFolderMap } from "@features/layout/state/layout.initial.ts";
import { generateId } from "@shared/lib/id.ts";
import { pagesApi } from "@features/layout/api/pages.ts";
import { upsertCatalogItem } from "@features/document/index.ts";

/**
 * 지정한 부모 폴더 아래에 새 페이지를 추가합니다.
 *
 * @param nodes 검사하거나 수정할 트리 노드 목록입니다.
 * @param parentId 기준이 되는 부모 블록 또는 폴더 ID입니다.
 * @param child 추가할 하위 페이지 노드입니다.
 * @returns 대상 부모를 찾아 추가에 성공하면 true, 실패하면 false를 반환합니다.
 */
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

/**
 * 트리에서 페이지를 제거하고 제거된 항목을 반환합니다.
 *
 * @param nodes 검사하거나 수정할 트리 노드 목록입니다.
 * @param pageId 대상 페이지 ID입니다.
 * @returns 제거된 페이지와 제거 후 트리 목록을 함께 반환합니다.
 */
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

/**
 * 트리 안에 지정한 페이지 ID가 이미 존재하는지 확인합니다.
 *
 * @param nodes 검사하거나 수정할 트리 노드 목록입니다.
 * @param pageId 대상 페이지 ID입니다.
 * @returns 페이지가 있으면 true, 없으면 false를 반환합니다.
 */
function hasPageId(nodes: FolderItem[], pageId: string): boolean {
    for (const n of nodes) {
        if (n.id === pageId || n.docId === pageId || n.key === (`folder:${pageId}` as LnbActiveKey)) return true;
        if (n.children?.length && hasPageId(n.children, pageId)) return true;
    }
    return false;
}

/**
 * 레이아웃 상태와 관련 reducer를 정의하는 slice입니다.
 */
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
        setDocShared(state, action: PayloadAction<{ docId: string; shared: boolean }>) {
            const { docId, shared } = action.payload;
            if (!docId) return;

            const has = state.sharedDocIds.includes(docId);
            if (shared && !has) {
                state.sharedDocIds = [docId, ...state.sharedDocIds].slice(0, 200);
                return;
            }
            if (!shared && has) {
                state.sharedDocIds = state.sharedDocIds.filter((id) => id !== docId);
            }
        },

        setLastLocation(state, action: PayloadAction<{ docId: string } | null>) {
            state.lastLocation = action.payload;
        },
    },
});

/**
 * 레이아웃 slice 액션 모음입니다.
 */
export const layoutActions = layoutSlice.actions;

/**
 * 하위 페이지를 생성하고 상태에 반영하는 thunk입니다.
 */
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

  upsertCatalogItem({
    id: childId,
    title: "새 페이지",
    accent: "#D7D7D7",
    kind: "documents",
  });

  // 2) 즉시 active로 전환
  dispatch(layoutActions.setActiveKey(key));

  // 3) 서버에 생성 요청 (실패 시 UI는 유지하고 에러만 반환)
  try {

    const response = await pagesApi.createPage({
      id: childId,
      parentId,
      title: "새 페이지",
    });

    upsertCatalogItem({
      id: response.id,
      title: response.title ?? "새 페이지",
      accent: "#D7D7D7",
      kind: "documents",
    });
  } catch (e) {

    const msg = e instanceof Error ? e.message : "create page failed";
    return rejectWithValue(msg);
  }

  return { childId, key };
});

/**
 * 페이지 공유 상태를 전환하는 thunk입니다.
 */
export const togglePageShared = createAsyncThunk<
  { docId: string; shared: boolean },
  { docId: string },
  { rejectValue: string }
>("layout/togglePageShared", async ({ docId }, { dispatch, getState, rejectWithValue }) => {

  const state = getState() as { layout: { sharedDocIds: string[] } };

  const currentShared = state.layout.sharedDocIds.includes(docId);

  const nextShared = !currentShared;

  dispatch(layoutActions.setDocShared({ docId, shared: nextShared }));
  try {
    const metadata = await pagesApi.getPage(docId);
    const currentVisibility = metadata.visibility === "PUBLIC" ? "PUBLIC" : "PRIVATE";
    const targetVisibility = nextShared ? "PUBLIC" : "PRIVATE";

    if (currentVisibility !== targetVisibility) {
      await pagesApi.updatePageVisibility(docId, {
        visibility: targetVisibility,
        version: metadata.version ?? 0,
      });
    }
  } catch (e) {
    dispatch(layoutActions.setDocShared({ docId, shared: currentShared }));

    const msg = e instanceof Error ? e.message : "toggle share failed";
    return rejectWithValue(msg);
  }

  return { docId, shared: nextShared };
});

/**
 * 문서를 휴지통으로 이동하는 thunk입니다.
 */
export const movePageToTrashRemote = createAsyncThunk<
  { pageId: string },
  { pageId: string },
  { rejectValue: string }
>("layout/movePageToTrashRemote", async ({ pageId }, { dispatch, rejectWithValue }) => {
  dispatch(layoutActions.movePageToTrash({ pageId }));
  try {
    await pagesApi.moveToTrash(pageId);
  } catch (e) {
    const msg = e instanceof Error ? e.message : "move to trash failed";
    return rejectWithValue(msg);
  }
  return { pageId };
});

/**
 * 휴지통 문서를 복구하는 thunk입니다.
 */
export const restorePageFromTrashRemote = createAsyncThunk<
  { pageId: string },
  { pageId: string },
  { rejectValue: string }
>("layout/restorePageFromTrashRemote", async ({ pageId }, { dispatch, rejectWithValue }) => {
  dispatch(layoutActions.restorePageFromTrash({ pageId }));
  try {
    await pagesApi.restoreFromTrash(pageId);
  } catch (e) {
    const msg = e instanceof Error ? e.message : "restore page failed";
    return rejectWithValue(msg);
  }
  return { pageId };
});

/**
 * 휴지통 문서를 완전 삭제하는 thunk입니다.
 */
export const permanentDeletePageRemote = createAsyncThunk<
  { pageId: string },
  { pageId: string },
  { rejectValue: string }
>("layout/permanentDeletePageRemote", async ({ pageId }, { dispatch, rejectWithValue }) => {
  dispatch(layoutActions.permanentDeleteFromTrash({ pageId }));
  try {
    await pagesApi.deleteFromTrash(pageId);
  } catch (e) {
    const msg = e instanceof Error ? e.message : "permanent delete failed";
    return rejectWithValue(msg);
  }
  return { pageId };
});

/**
 * 레이아웃 slice reducer입니다.
 */
export const layoutReducer = layoutSlice.reducer;

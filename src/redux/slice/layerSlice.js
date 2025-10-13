import { createSlice, nanoid } from '@reduxjs/toolkit';

// 정규화 상태: 트리 → { byId, rootIds }
const initialState = { byId: {}, rootIds: [] };

function normalizeLayers(layers = []) {
    const byId = {};
    const rootIds = [];

    const walk = (arr, parentId = null) => {
        arr.forEach((raw) => {
            const id = raw.id || nanoid();
            const children = Array.isArray(raw.children) ? raw.children : null;

            // 자식부터 처리해 childIds 구성
            const childIds = children
                ? children.map((c) => c.id || nanoid())
                : [];

            // 현재 노드 저장(자식은 id 배열만 유지)
            byId[id] = {
                id,
                type: raw.type,
                visible: raw.visible ?? true,
                locked: !!raw.locked,
                transform: {
                    x: raw.transform?.x ?? 0,
                    y: raw.transform?.y ?? 0,
                    scaleX: raw.transform?.scaleX ?? 1,
                    scaleY: raw.transform?.scaleY ?? 1,
                    rotation: raw.transform?.rotation ?? 0,
                },
                style: raw.style ?? null,
                props: raw.props ?? {},
                flags: raw.flags ?? null,
                bbox: raw.bbox ?? null,
                children: childIds,
            };

            if (parentId == null) rootIds.push(id);
            if (children) walk(children, id);
        });
    };

    walk(layers, null);
    return { byId, rootIds };
}

function denormalizeLayers({ byId, rootIds }) {
    const build = (id) => {
        const n = byId[id];
        return {
            id: n.id,
            type: n.type,
            visible: n.visible,
            locked: n.locked,
            transform: n.transform,
            style: n.style,
            props: n.props,
            flags: n.flags ?? undefined,
            bbox: n.bbox ?? undefined,
            children:
                Array.isArray(n.children) && n.children.length
                    ? n.children.map(build)
                    : null,
        };
    };
    return rootIds.map(build);
}

const layersSlice = createSlice({
    name: 'layers',
    initialState,
    reducers: {
        hydrate: (_state, { payload }) => normalizeLayers(payload || []),
        setAll: (_state, { payload }) => normalizeLayers(payload || []),

        addLayer: {
            prepare: (layer, parentId = null, index = undefined) => ({
                payload: {
                    layer: { ...layer, id: layer.id || nanoid() },
                    parentId,
                    index,
                },
            }),
            reducer: (state, { payload: { layer, parentId, index } }) => {
                const id = layer.id;
                // 등록
                state.byId[id] = {
                    id,
                    type: layer.type,
                    visible: layer.visible ?? true,
                    locked: !!layer.locked,
                    transform: {
                        x: layer.transform?.x ?? 0,
                        y: layer.transform?.y ?? 0,
                        scaleX: layer.transform?.scaleX ?? 1,
                        scaleY: layer.transform?.scaleY ?? 1,
                        rotation: layer.transform?.rotation ?? 0,
                    },
                    style: layer.style ?? null,
                    props: layer.props ?? {},
                    flags: layer.flags ?? null,
                    bbox: layer.bbox ?? null,
                    children: [],
                };

                if (parentId) {
                    const p = state.byId[parentId];
                    if (!p) return;
                    if (!Array.isArray(p.children)) p.children = [];
                    if (Number.isInteger(index))
                        p.children.splice(index, 0, id);
                    else p.children.push(id);
                } else {
                    if (Number.isInteger(index))
                        state.rootIds.splice(index, 0, id);
                    else state.rootIds.push(id);
                }
            },
        },

        updateLayer: (state, { payload: { id, changes } }) => {
            if (!state.byId[id]) return;
            const t = state.byId[id];
            // 얕은 병합
            Object.assign(t, {
                ...changes,
                transform: { ...t.transform, ...(changes?.transform || {}) },
            });
        },

        removeLayer: (state, { payload: id }) => {
            const removeSubtree = (nodeId) => {
                const n = state.byId[nodeId];
                if (!n) return;
                if (Array.isArray(n.children))
                    n.children.forEach(removeSubtree);

                // 부모에서 제거
                // rootIds
                const ri = state.rootIds.indexOf(nodeId);
                if (ri >= 0) state.rootIds.splice(ri, 1);
                // 비루트 부모 탐색
                Object.values(state.byId).forEach((p) => {
                    if (Array.isArray(p.children)) {
                        const idx = p.children.indexOf(nodeId);
                        if (idx >= 0) p.children.splice(idx, 1);
                    }
                });

                delete state.byId[nodeId];
            };
            removeSubtree(id);
        },

        moveLayer: (
            state,
            { payload: { id, toParentId = null, toIndex = undefined } }
        ) => {
            // 기존 부모에서 제거
            const removeFromParent = () => {
                const ri = state.rootIds.indexOf(id);
                if (ri >= 0) state.rootIds.splice(ri, 1);
                Object.values(state.byId).forEach((p) => {
                    const idx = p.children?.indexOf(id);
                    if (idx >= 0) p.children.splice(idx, 1);
                });
            };
            removeFromParent();

            // 새 부모에 삽입
            if (toParentId) {
                const p = state.byId[toParentId];
                if (!p) return;
                if (!Array.isArray(p.children)) p.children = [];
                if (Number.isInteger(toIndex))
                    p.children.splice(toIndex, 0, id);
                else p.children.push(id);
            } else {
                if (Number.isInteger(toIndex))
                    state.rootIds.splice(toIndex, 0, id);
                else state.rootIds.push(id);
            }
        },

        toggleVisible: (state, { payload: id }) => {
            if (state.byId[id])
                state.byId[id].visible = !state.byId[id].visible;
        },
        toggleLocked: (state, { payload: id }) => {
            if (state.byId[id]) state.byId[id].locked = !state.byId[id].locked;
        },
        setBBox: (state, { payload: { id, bbox } }) => {
            if (state.byId[id]) state.byId[id].bbox = bbox ?? null;
        },
        reset: () => initialState,
    },
});

export const {
    hydrate,
    setAll,
    addLayer,
    updateLayer,
    removeLayer,
    moveLayer,
    toggleVisible,
    toggleLocked,
    setBBox,
    reset,
} = layersSlice.actions;

export default layersSlice.reducer;

// selectors
export const selectLayersState = (s) => s.vectorDoc.layers;
export const selectLayerById = (s, id) => s.vectorDoc.layers.byId[id] || null;
export const selectLayersTree = (s) => denormalizeLayers(s.vectorDoc.layers);

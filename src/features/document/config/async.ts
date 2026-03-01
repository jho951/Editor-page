import { createAsyncThunk } from '@reduxjs/toolkit';

import { drawings } from './drawings.ts';
import { parseVectorJson } from '@shared/lib/transform.ts';
import { markClean, setCurrentMeta } from "../model/document.slice.ts";
import type { RootState, AppDispatch } from '@app/store/store.ts';
import type {DrawingDetail, DrawingId, DrawingListItem} from "@features/document/ui/types.ts";
import { replaceAll, setBackground, setViewport } from "@features/canvas/state/canvas.slice.ts";
import {type SnapshotDocument, takeSnapshot} from "@features/canvas/engine/serde.ts";

type RejectValue = string;

type ApiEnvelope<T> = {
  data?: {
    data?: T;
  } | T;
};

function unwrap<T>(d: ApiEnvelope<T> | null | undefined): T | null {
  if (d == null) return null;
  if (typeof d === 'object' && d !== null && 'data' in d) {
    const inner = (d as { data?: unknown }).data;
    if (inner && typeof inner === 'object' && 'data' in (inner as Record<string, unknown>)) {
      return ((inner as { data?: T }).data ?? null) as T | null;
    }
    return (inner as T) ?? null;
  }
  return (d as unknown as T) ?? null;
}

export interface FetchDrawingsArg {
  deleted?: boolean;
  page?: number;
  size?: number;
}

export const fetchDrawings = createAsyncThunk<
  DrawingListItem[],
  FetchDrawingsArg | void,
  { rejectValue: RejectValue }
>('doc/list', async (arg, { rejectWithValue }) => {
  const { deleted = false, page = 1, size = 20 } = arg ?? {};
  try {
    const res = await drawings.list(page, size, deleted);
    const pageObj = unwrap<{ rows?: DrawingListItem[] }>(res as ApiEnvelope<{ rows?: DrawingListItem[] }>);
    const rows = (pageObj as unknown as { rows?: unknown }).rows;
    const items = Array.isArray(rows) ? (rows as DrawingListItem[]) : [];
    return items;
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'list failed';
    return rejectWithValue(msg);
  }
});

export const loadDrawingById = createAsyncThunk<
  DrawingDetail,
  DrawingId,
  { rejectValue: RejectValue; dispatch: AppDispatch; state: RootState }
>('doc/loadById', async (id, { dispatch, rejectWithValue }) => {
  try {
    const res = await drawings.get(id);
    const payload = unwrap<DrawingDetail>(res as ApiEnvelope<DrawingDetail>);
    if (!payload) throw new Error('invalid response');

    const detail = payload as unknown as DrawingDetail;

    dispatch(
      setCurrentMeta({
        id: detail.id,
        title: detail.title ?? '',
        version: detail.version ?? null,
      })
    );

    const { view, canvas, shapes } = parseVectorJson(detail.vectorJson ?? null);

    dispatch(
      setViewport({
        tx: Number(view.tx) || 0,
        ty: Number(view.ty) || 0,
        scale: Number(view.scale) || 1,
      })
    );

    if (canvas.background) dispatch(setBackground(canvas.background));

    dispatch(replaceAll({ shapes }));
    dispatch(markClean());

    return detail;
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'load failed';
    return rejectWithValue(msg);
  }
});

export const saveDrawingByName = createAsyncThunk<
  DrawingDetail,
  string,
  { rejectValue: RejectValue; dispatch: AppDispatch; state: RootState }
>('doc/saveNew', async (title, { getState, dispatch, rejectWithValue }) => {
  try {
    if (!String(title).trim()) throw new Error('제목이 비었습니다.');

    const snapshot: SnapshotDocument = takeSnapshot(getState());

    const res = await drawings.create({ title, vectorJson: snapshot });
    const data = unwrap<DrawingDetail>(res as ApiEnvelope<DrawingDetail>);
    if (!data) throw new Error('invalid create response');

    const detail = data as unknown as DrawingDetail;

    dispatch(
      setCurrentMeta({
        id: detail.id,
        title: detail.title ?? title,
        version: detail.version ?? 0,
      })
    );
    dispatch(markClean());

    return detail;
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'save failed';
    return rejectWithValue(msg);
  }
});

export const saveCurrentDrawing = createAsyncThunk<
  DrawingDetail,
  void,
  { rejectValue: RejectValue; dispatch: AppDispatch; state: RootState }
>('doc/update', async (_arg, { getState, dispatch, rejectWithValue }) => {
  try {
    const state = getState();
    const meta = state.document.current;
    if (!meta.id) throw new Error('문서 ID가 없습니다.');

    const snapshot: SnapshotDocument = takeSnapshot(state);

    const req = {
      id: meta.id,
      title: meta.title || 'Untitled',
      version: meta.version,
      vectorJson: snapshot,
    };

    const res = await drawings.update(req);
    const data = unwrap<DrawingDetail>(res as ApiEnvelope<DrawingDetail>);
    if (!data) throw new Error('invalid update response');

    const detail = data as unknown as DrawingDetail;

    dispatch(
      setCurrentMeta({
        id: detail.id ?? meta.id,
        title: detail.title ?? meta.title,
        version: detail.version ?? meta.version,
      })
    );
    dispatch(markClean());

    return detail;
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'update failed';
    return rejectWithValue(msg);
  }
});

export const saveDrawingById = createAsyncThunk<
  { id: DrawingId; title: string },
  DrawingId,
  { rejectValue: RejectValue; state: RootState }
>('doc/saveById', async (id, { getState, rejectWithValue }) => {
  try {
    if (!id) throw new Error('id가 없습니다.');
    const state = getState();

    const snapshot: SnapshotDocument = takeSnapshot(state);
    const title = state.document.current.title || 'Untitled';
    const version = state.document.current.version;

    const body = { id, title, version, vectorJson: snapshot };
    const res = await drawings.update(body);
    const data = unwrap<DrawingDetail>(res as ApiEnvelope<DrawingDetail>);
    if (!data) throw new Error('invalid update response');

    const detail = data as unknown as DrawingDetail;

    return { id, title: detail.title ?? title };
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'saveById failed';
    return rejectWithValue(msg);
  }
});

export const softDeleteDrawing = createAsyncThunk<
  { id: DrawingId },
  { id?: DrawingId } | DrawingId | void,
  { rejectValue: RejectValue; dispatch: AppDispatch; state: RootState }
>('doc/softDelete', async (arg, { getState, dispatch, rejectWithValue }) => {
  try {
    const idFromArg = typeof arg === 'string' || typeof arg === 'number' ? arg : arg?.id;
    const id = idFromArg ?? getState().document.current.id;
    if (!id) return rejectWithValue('문서 ID가 없습니다.');

    await drawings.remove(id);
    await dispatch(fetchDrawings()).unwrap();

    return { id };
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'soft-delete failed';
    return rejectWithValue(msg);
  }
});

export const deleteDrawing = createAsyncThunk<
  boolean,
  DrawingId,
  { rejectValue: RejectValue; dispatch: AppDispatch }
>('doc/delete', async (id, { dispatch, rejectWithValue }) => {
  try {
    if (!id) return rejectWithValue('문서 ID가 없습니다.');
    await drawings.delete(id);
    await dispatch(fetchDrawings()).unwrap();
    return true;
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'delete failed';
    return rejectWithValue(msg);
  }
});

export const restoreDrawing = createAsyncThunk<
  boolean,
  DrawingId,
  { rejectValue: RejectValue; dispatch: AppDispatch }
>('doc/restore', async (id, { dispatch, rejectWithValue }) => {
  try {
    if (!id) return rejectWithValue('문서 id가 없습니다.');
    await drawings.restore(id);
    await dispatch(fetchDrawings()).unwrap();
    return true;
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'restore failed';
    return rejectWithValue(msg);
  }
});

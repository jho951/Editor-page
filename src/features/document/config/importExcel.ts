import type { AppDispatch } from '@app/store/store.ts';
import { parseVectorJson } from '@shared/lib/transform.ts';
import {replaceAll} from "@features/canvas/state/canvas.slice.ts";

type ImportResponse = {
  data?: {
    items?: Array<{ id?: string | number }>;
  };
};

type DrawingResponse = { data?: { vectorJson?: unknown } };

export async function ImportExcel(file: File, dispatch: AppDispatch): Promise<void> {
  const fd = new FormData();
  fd.append('file', file);

  const res = await fetch('/api/drawings/import.xlsx', {
    method: 'POST',
    body: fd,
  });

  const body = (await res.json()) as ImportResponse;
  const first = body.data?.items?.[0];
  if (!first?.id) return;

  const docRes = await fetch(`/api/drawings/${first.id}`);
  const docJson = (await docRes.json()) as DrawingResponse;
  const parsed = parseVectorJson(docJson.data?.vectorJson);

  dispatch(replaceAll({ shapes: parsed.shapes }));
}

import { parseVectorJson } from '../../header/util/transform';
import { replaceAll } from '../../../lib/redux/slice/canvasSlice';

async function ImportExcel(file, dispatch) {
    const fd = new FormData();
    fd.append('file', file);
    const res = await fetch('/api/drawings/import.xlsx', {
        method: 'POST',
        body: fd,
    });
    const body = await res.json();
    const first = body?.data?.items?.[0];
    if (first?.id) {
        const doc = await (await fetch(`/api/drawings/${first.id}`)).json();
        dispatch(replaceAll(parseVectorJson(doc.data.vectorJson)));
    }
}

export { ImportExcel };

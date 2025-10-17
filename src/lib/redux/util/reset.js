import { reset as resetCanvas } from '../slice/canvasSlice';
import { resetHistory } from '../slice/historySlice';
import { resetLayer } from '../slice/layerSlice';

// ─── 새 문서 시작(툴바에서 호출) ───
const newDrawing = () => (dispatch) => {
    dispatch(resetCanvas());
    dispatch(resetHistory);
    dispatch(resetLayer());
    dispatch(setSelection());
    dispatch(replaceAllShapes());
    dispatch(resetRender());
};

export { newDrawing };

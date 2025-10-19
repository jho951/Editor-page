// reset.js
import { reset as resetCanvas } from '../slice/canvasSlice';
import { reset as resetHistory, clearFuture } from '../slice/historySlice';
import { reset as resetLayer } from '../slice/layerSlice'; // 프로젝트에 존재할 경우
import { clearSelection } from '../slice/selectionSlice';
import { replaceAll as replaceAllShapes } from '../slice/shapeSlice';
import { markAllDirty } from '../slice/renderSlice';
import { fitIn as viewportFitIn } from '../slice/viewportSlice';
import { resetDoc, setDocMeta } from '../slice/docSlice';
import { DEFAULT } from '../constant/initial';

// ─── 새 문서 시작(툴바에서 호출) ───
const newDrawing = () => (dispatch) => {
    // 0) 문서 메타 초기화
    dispatch(resetDoc?.());

    // 1) 레이어/도형/선택/히스토리 초기화
    dispatch(resetCanvas());
    dispatch(replaceAllShapes([]));
    dispatch(clearSelection());
    dispatch(resetHistory());
    dispatch(clearFuture?.());
    dispatch(resetLayer?.()); // 선택적

    // 2) 메타/타이틀
    const width = DEFAULT?.CANVAS?.width ?? 1280;
    const height = DEFAULT?.CANVAS?.height ?? 800;
    dispatch(
        setDocMeta?.({
            id: null,
            title: 'Untitled',
            version: 0,
            updatedAt: null,
            width,
            height,
        })
    );

    // 3) 뷰포트 맞춤 + 리렌더
    dispatch(
        viewportFitIn({
            canvasW: width,
            canvasH: height,
            viewW: width,
            viewH: height,
            padding: 16,
        })
    );
    dispatch(markAllDirty());
};

export { newDrawing };

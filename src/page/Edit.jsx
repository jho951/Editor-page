import { useEffect } from 'react';
import { useParams } from 'react-router-dom';

import { useDispatch, useSelector } from 'react-redux';

import { setTitle } from '../lib/redux/slice/docSlice';
import { loadDrawingById } from '../lib/redux/util/async';
import ToolHeader from '../component/header/implementation/ToolHeader';
import CanvasStageRobustRedux from '../component/canvas/Canvs';

// pages/Edit.jsx (네 코드 그대로 사용 가능)
function Edit() {
    const { id } = useParams();
    const dispatch = useDispatch();

    const meta = useSelector((s) => s.doc?.current);
    const loading = useSelector((s) => s.doc?.loading);

    useEffect(() => {
        if (id && id !== 'new') {
            dispatch(loadDrawingById(id));
        }
    }, [id, dispatch]);

    return (
        <div className="page app main" style={{ height: '100%' }}>
            <ToolHeader
                title={meta?.title}
                onTitleChange={(t) => dispatch(setTitle(t))}
            />
            {loading ? (
                <div style={{ padding: 16 }}>불러오는 중…</div>
            ) : (
                <main style={{ flex: 1, display: 'flex', minHeight: 0 }}>
                    <div
                        className="canvas-stage-wrap"
                        style={{ flex: 1, minHeight: 0 }}
                    >
                        <CanvasStageRobustRedux />
                    </div>
                </main>
            )}
        </div>
    );
}

export default Edit;

import { useEffect } from 'react';
import { useParams } from 'react-router-dom';

import { useDispatch, useSelector } from 'react-redux';

import { loadDrawingById } from '../feature/document/api/async';

import { Header } from '../feature/header/component/Header';
import { setTitle } from '@/feature/document/state/document.slice';
import { CanvasStage } from '@/feature/canvas/component/CanvasStage';

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
        <div className="page fill-viewport">
            <Header
                title={meta?.title}
                onTitleChange={(t) => dispatch(setTitle(t))}
            />
            {loading ? (
                <div style={{ padding: 16 }}>불러오는 중…</div>
            ) : (
                <main>
                    <CanvasStage />
                </main>
            )}
        </div>
    );
}

export default Edit;

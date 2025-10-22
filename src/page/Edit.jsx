import { useEffect } from 'react';
import { useParams } from 'react-router-dom';

import { useDispatch, useSelector } from 'react-redux';

import { setTitle } from '../lib/redux/slice/docSlice';
import { loadDrawingById } from '../lib/redux/util/async';

import { Canvas } from '../component/canvas/implementation/Canvas';
import { Header } from '../component/header/implementation/Header';

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
                <main>{/* <Canvas /> */}</main>
            )}
        </div>
    );
}

export default Edit;

// src/page/Edit.jsx
import { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { loadDrawing } from '../redux/slice/docSlice';
import Toolbar from '../component/toolbar/Toolbar'; // 파일명 대소문자 주의
import CanvasStage from '../component/CanvasStage';

export default function Edit() {
    const { id } = useParams();
    const dispatch = useDispatch();

    useEffect(() => {
        if (id)
            dispatch(loadDrawing(String(id)))
                .unwrap()
                .catch(console.error);
    }, [id, dispatch]);

    return (
        <main>
            <Toolbar />
            <div style={{ padding: 12 }}>
                <CanvasStage />
            </div>
        </main>
    );
}

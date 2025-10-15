import { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useDispatch } from 'react-redux';

import { loadDrawing } from '../redux/slice/docSlice';

import Toolbar from '../component/toolbar/Toolbar';
import CanvasStage from '../component/CanvasStage';

function Edit() {
    const { id } = useParams();
    const dispatch = useDispatch();

    useEffect(() => {
        dispatch(loadDrawing(String(id)))
            .unwrap()
            .catch((err) => console.error(err));
    }, [id, dispatch]);

    return (
        <main>
            <Toolbar />
            <CanvasStage />
        </main>
    );
}

export default Edit;

import { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useDispatch } from 'react-redux';

import { loadDrawing } from '../lib/redux/thunks/docThunks';

export default function Edit() {
    const { id } = useParams();
    const dispatch = useDispatch();

    useEffect(() => {
        if (id)
            dispatch(loadDrawing(String(id)))
                .unwrap()
                .catch(console.error);
    }, [id, dispatch]);

    return <main></main>;
}

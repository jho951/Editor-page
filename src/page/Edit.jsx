import { useEffect, useRef } from 'react';
import { useDispatch } from 'react-redux';
import { useParams, useLocation } from 'react-router-dom';
import { openNew, loadAndApplyDrawing } from '../lib/redux/util/async';
import { Header } from '../component/header/implementation/Header';

function Edit() {
    const dispatch = useDispatch();
    const { id } = useParams();
    const loc = useLocation();
    const did = useRef(false);

    useEffect(() => {
        did.current = true;
        if (id === 'new' || loc.pathname.endsWith('/new')) {
            dispatch(openNew());
        } else if (id) {
            dispatch(loadAndApplyDrawing(id));
        }
    }, [id, loc.pathname, dispatch]);

    return (
        <main>
            <Header />
        </main>
    );
}

export default Edit;

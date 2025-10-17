import { useEffect, useRef } from 'react';
import { useDispatch } from 'react-redux';
import { useParams, useLocation } from 'react-router-dom';
import { openNew, loadAndApplyDrawing } from '../lib/redux/util/async';
import { Header } from '../component/header/implementation/Header';
import EditorCanvas from '../component/dashboard/implementation/EditCanvas';

export default function Edit() {
    const dispatch = useDispatch();
    const { id } = useParams();
    const loc = useLocation();
    const did = useRef(false);

    useEffect(() => {
        if (did.current && (id === 'new' || id)) {
            /* route 재진입 시 제어 필요하면 */
        }
        did.current = true;

        if (id === 'new' || loc.pathname.endsWith('/new')) {
            dispatch(openNew());
        } else if (id) {
            dispatch(loadAndApplyDrawing(id));
        }
    }, [id, loc.pathname, dispatch]);

    return (
        <div>
            <Header />
            <div
                style={{
                    display: 'grid',
                    placeItems: 'center',
                    height: 'calc(100vh - 56px)',
                    overflow: 'auto',
                }}
            >
                <EditorCanvas key={id || 'new'} />
            </div>
        </div>
    );
}

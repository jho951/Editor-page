import React, { useEffect } from 'react';
import { useParams } from 'react-router-dom';

import { useDispatch, useSelector } from 'react-redux';

import { loadDrawingById } from '../feature/document/api/async';

import { ToolBar } from '../feature/toolbar/component/ToolBar';
import { CanvasStage } from '@/feature/canvas/component/CanvasStage';
import { Spinner } from '@/shared/component/spinner/Spinner';

function Edit() {
    const { id } = useParams();
    const dispatch = useDispatch();
    const loading = useSelector((s) => s.doc?.loading);

    useEffect(() => {
        if (id && id !== 'new') {
            dispatch(loadDrawingById(id));
        }
    }, [id, dispatch]);

    return (
        <React.Fragment>
            <ToolBar />
            {loading ? (
                <Spinner />
            ) : (
                <main>
                    <CanvasStage />
                </main>
            )}
        </React.Fragment>
    );
}

export default Edit;

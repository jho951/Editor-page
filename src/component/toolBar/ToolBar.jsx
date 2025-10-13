import { useDispatch, useSelector } from 'react-redux';
import VectorUndoRedoControl from '../historybtn/VectorBtn';
import ZoomControl from './ZoomControl';
import WidthControl from './WidthControl';
import ColorControl from './ColorControl';
import RotationControl from './RotationControl';

import { stepZoom, setZoom } from '../../redux/slice/viewportSlice';
import {
    setStrokeWidthOnSelection,
    setStyleOnSelection,
    rotateSelection,
} from '../../redux/slice/layerSlice';

import './toolbar.css';

export default function Toolbar() {
    const dispatch = useDispatch();
    const zoom = useSelector((s) => s.viewport?.zoom ?? 1);
    const selectedCount = useSelector(
        (s) => s.layers?.selectedIds?.length ?? 0
    );

    // Zoom
    const handleZoomStep = (delta) => dispatch(stepZoom(delta));
    const handleZoomSet = (val) => dispatch(setZoom(parseFloat(val)));

    // Stroke width
    const handleStrokeWidthChange = (w) =>
        dispatch(setStrokeWidthOnSelection(w));

    // Color
    const handleFillChange = (fill) => dispatch(setStyleOnSelection({ fill }));
    const handleStrokeChange = (stroke) =>
        dispatch(setStyleOnSelection({ stroke }));

    // Rotation
    const handleRotate = (deg) => dispatch(rotateSelection(deg));

    return (
        <header className="toolbar">
            {/* Undo / Redo */}
            <VectorUndoRedoControl />

            {/* Zoom */}
            <ZoomControl
                value={zoom}
                onStep={handleZoomStep}
                onSet={handleZoomSet}
            />

            {/* Stroke Width */}
            <WidthControl
                value={1}
                onChange={handleStrokeWidthChange}
                disabled={selectedCount === 0}
            />

            {/* Colors */}
            <ColorControl
                onFill={handleFillChange}
                onStroke={handleStrokeChange}
                disabled={selectedCount === 0}
            />

            {/* Rotation */}
            <RotationControl
                onRotateCW={() => handleRotate(+15)}
                onRotateCCW={() => handleRotate(-15)}
                disabled={selectedCount === 0}
            />
        </header>
    );
}

import {
    addShape,
    removeShapes,
    setShapeData,
    setShapeStyle,
    translateShapes,
    rotateShapes,
    flipHShapes,
    flipVShapes,
    skewShapes,
    scaleShapes,
    updatePolylineNode,
    insertPolylineNode,
    deletePolylineNode,
} from '../slice/shapeSlice';

export const HISTORY_UNDO = 'history/UNDO';
export const HISTORY_REDO = 'history/REDO';
export const historyUndo = () => ({ type: HISTORY_UNDO });
export const historyRedo = () => ({ type: HISTORY_REDO });

export const MUTATION_TYPES = new Set([
    addShape.type,
    removeShapes.type,
    setShapeData.type,
    setShapeStyle.type,
    translateShapes.type,
    rotateShapes.type,
    flipHShapes.type,
    flipVShapes.type,
    skewShapes.type,
    scaleShapes.type,
    updatePolylineNode.type,
    insertPolylineNode.type,
    deletePolylineNode.type,
]);

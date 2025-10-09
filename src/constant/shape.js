/**
 * @file shape.js
 * @description 벡터 도형 상수 (Toolbar용)
 */
import { deepFreeze } from '../util/deep-freeze';
import { getId } from '../util/get-id';

const SHAPE_TYPE = 'shape';

const SHAPES = deepFreeze([
    {
        id: getId(),
        type: SHAPE_TYPE,
        payload: 'path',
        name: '드로우',
        icon: 'pen',
        shortcut: 'P',
        cursor: 'crosshair',
    },
    {
        id: getId(),
        type: SHAPE_TYPE,
        payload: 'line',
        name: '직선',
        icon: 'line',
        shortcut: 'L',
        cursor: 'crosshair',
    },
    {
        id: getId(),
        type: SHAPE_TYPE,
        payload: 'rect',
        name: '사각형',
        icon: 'rect',
        shortcut: 'R',
        cursor: 'crosshair',
    },
    {
        id: getId(),
        type: SHAPE_TYPE,
        payload: 'circle',
        name: '원',
        icon: 'circle',
        shortcut: 'C',
        cursor: 'crosshair',
    },
    {
        id: getId(),
        type: SHAPE_TYPE,
        payload: 'polygon',
        name: '다각형',
        icon: 'polygon',
        shortcut: 'G',
        cursor: 'crosshair',
    },
    {
        id: getId(),
        type: SHAPE_TYPE,
        payload: 'star',
        name: '별',
        icon: 'star',
        shortcut: 'S',
        cursor: 'crosshair',
    },
]);

export const SHAPE = { SHAPE_TYPE, SHAPES };

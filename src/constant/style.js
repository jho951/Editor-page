/**
 * @file style.js
 * @description 스타일 상수 (선/색상/채우기)
 */
import { deepFreeze } from '../util/deep-freeze';

const STYLE = deepFreeze({
    strokeColors: [
        '#000000',
        '#FF4D4F',
        '#FAAD14',
        '#52C41A',
        '#1890FF',
        '#722ED1',
        '#FFFFFF',
    ],
    strokeWidths: [1, 2, 3, 4, 6, 8, 12],
});

export { STYLE };

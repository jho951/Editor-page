/**
 * @file select.js
 * @description 선택(Selection) 관련 상수
 */
import { deepFreeze } from '../util/deep-freeze';

const SELECT = deepFreeze({
    handles: ['n', 'ne', 'e', 'se', 's', 'sw', 'w', 'nw', 'rotate'],
    handleSize: 8,
});

export { SELECT };

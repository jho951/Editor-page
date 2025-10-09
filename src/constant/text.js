/**
 * @file text.js
 * @description 텍스트 툴 기본 설정
 */
import { deepFreeze } from '../util/deep-freeze';

const TEXT = deepFreeze({
    default: {
        font: '14px/1.4 Inter, system-ui, sans-serif',
        color: '#222222',
        align: 'left',
    },
});

export { TEXT };

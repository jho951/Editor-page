/**
 * @file image.js
 * @description 이미지 관련 상수
 */
import { deepFreeze } from '../util/deep-freeze';

const IMAGE = deepFreeze({
    maxSizeMB: 10,
    allowedTypes: ['image/png', 'image/jpeg', 'image/webp', 'image/svg+xml'],
});

export { IMAGE };

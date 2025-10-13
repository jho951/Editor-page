/**
 * @file history.js
 * @author YJH
 */

/**
 * @description historySlice 초기값
 */
const INITIAL_STATE = {
    vector: {
        past: [],
        future: [],
        applied: null,
    },
};

/**
 * @description historySlice 이름
 */
const NAME = 'history';

/**
 * @description 비트맵/벡터 공통 히스토리 제한
 */
const DEFAULT_LIMIT = 10;

export const HISTORY = {
    INITIAL_STATE,
    NAME,
    DEFAULT_LIMIT,
};

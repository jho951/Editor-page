/**
 * @file deep-freeze.js
 * @author YJH
 * @function deepFreeze
 * @description object나 array 불변성 제공
 *
 * @param {object|Array} obj - 불변으로 만들 객체 또는 배열
 * @returns {object|Array} - 모든 하위 속성까지 동결된 객체/배열
 */
function deepFreeze(obj) {
    if (obj && typeof obj === 'object' && !Object.isFrozen(obj)) {
        Object.freeze(obj);
        Object.keys(obj).forEach((key) => {
            const value = obj[key];
            if (value && typeof value === 'object' && !Object.isFrozen(value)) {
                deepFreeze(value);
            }
        });
    }
    return obj;
}

export { deepFreeze };

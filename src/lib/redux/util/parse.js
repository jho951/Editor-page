/**
 * @description 객체를 깊은 복사하여 반환합니다. `structuredClone`이 지원되지 않는 환경에서는 `JSON.parse(JSON.stringify())`를 사용합니다.
 * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/structuredClone}  structuredClone 설명
 * @param {any} v - 복사할 객체
 * @returns {any} 복사된 객체
 */
const deepClone = (v) =>
    typeof structuredClone === 'function'
        ? structuredClone(v)
        : JSON.parse(JSON.stringify(v));
export { deepClone };

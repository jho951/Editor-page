/**
 * @file get-id.js
 * @author YJH
 * @description UUID 아이디를 생성해 유일성 보장
 * @return UUID id
 * @example const id = getId();
 */
function genId() {
    return crypto.randomUUID();
}
export { genId };

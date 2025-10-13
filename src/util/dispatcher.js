/**
 * @file dispatcher.js
 * @author YJH
 * @description 카탈로그 아이템 클릭/단축키를 Redux 액션으로 변환
 */
import { setMode } from '../redux/slice/modeSlice';
import { setTool } from '../redux/slice/toolSlice';
import { setShape } from '../redux/slice/shapeSlice';
import { hydrateFromCatalog } from '../redux/slice/styleSlicesss';

import { TOOL } from '../constant/tool';
import { SHAPE } from '../constant/shape';
import { TEXT } from '../constant/text';
import { SELECT } from '../constant/select';

/**
 * 카탈로그 버튼 클릭 → 관련 액션 디스패치
 * item 예:
 * { type: 'tool'|'shape'|'text'|'image'|'select', payload: 'brush'|'rect'..., shortcut?, defaults? }
 */
export function dispatchFromCatalogItem(dispatch, item) {
    if (!item || !item.type) return;

    if (item.type === TOOL.TOOL_TYPE) {
        dispatch(setMode(TOOL.TOOL_TYPE));
        dispatch(setTool(item.payload));
        if (item.defaults) {
            dispatch(
                hydrateFromCatalog({
                    mode: TOOL.TOOL_TYPE,
                    defaults: item.defaults,
                })
            );
        }
        return;
    }

    if (item.type === SHAPE.SHAPE_TYPE) {
        dispatch(setMode(SHAPE.SHAPE_TYPE));
        dispatch(setShape(item.payload));
        if (item.defaults) {
            dispatch(
                hydrateFromCatalog({
                    mode: SHAPE.SHAPE_TYPE,
                    defaults: item.defaults,
                })
            );
        }
        return;
    }

    if (item.type === TEXT.TEXT_TYPE) {
        dispatch(setMode(TEXT.TEXT_TYPE));
        if (item.defaults) {
            dispatch(
                hydrateFromCatalog({
                    mode: TEXT.TEXT_TYPE,
                    defaults: item.defaults,
                })
            );
        }
        return;
    }

    if (item.type === SELECT.SELECT_TYPE) {
        dispatch(setMode(SELECT.SELECT_TYPE));
        if (item.defaults) {
            dispatch(
                hydrateFromCatalog({
                    mode: SELECT.SELECT_TYPE,
                    defaults: item.defaults,
                })
            );
        }
        return;
    }
}

/**
 * 전역 단축키 → 등록된 카탈로그 배열에서 찾기 → 디스패치
 * @param {*} dispatch
 * @param {string} key
 * @param {Array<Array<Item>>} groupItemArrays
 */
export function dispatchFromShortcut(dispatch, key, groupItemArrays) {
    if (!key || !Array.isArray(groupItemArrays)) return;
    const k = String(key).toUpperCase();

    for (const items of groupItemArrays) {
        if (!Array.isArray(items)) continue;
        for (const item of items) {
            if (!item?.shortcut) continue;
            if (String(item.shortcut).toUpperCase() === k) {
                dispatchFromCatalogItem(dispatch, item);
                return;
            }
        }
    }
}

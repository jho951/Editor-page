/**
 * 타입이 지정된 Redux 훅을 제공합니다.
 */

import {type TypedUseSelectorHook, useDispatch, useSelector} from "react-redux";
import type { RootState, AppDispatch } from "@app/store/store.ts";

/**
 * 타입이 지정된 dispatch 훅입니다.
 */
export const useAppDispatch: () => AppDispatch = useDispatch;
/**
 * 타입이 지정된 selector 훅입니다.
 */
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;

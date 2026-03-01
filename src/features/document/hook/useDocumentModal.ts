import { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {openByKey} from "@features/document/model/document.selector.ts";

import type {AppDispatch, RootState} from "@app/store/store.ts";
import {type ModalKey, setModal} from "@features/document/model/document.slice.ts";


export function useDocumentModal(key: ModalKey): {
  open: boolean;
  show: () => void;
  hide: () => void;
} {
  const dispatch = useDispatch<AppDispatch>();
  const open = useSelector((s: RootState) => openByKey(s, key));

  const show = useCallback(() => {
    dispatch(setModal({ key, open: true }));
  }, [dispatch, key]);

  const hide = useCallback(() => {
    dispatch(setModal({ key, open: false }));
  }, [dispatch, key]);

  return { open, show, hide };
}

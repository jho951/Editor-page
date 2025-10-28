import { useEffect, useMemo } from 'react';
import { useDispatch, useSelector, shallowEqual } from 'react-redux';
import {
    openByKey,
    selectError,
    selectItems,
    selectLoading,
} from '../state/document.selector';
import { setModal } from '../state/document.slice';

/**
 * 공통 모달 훅: 열림 여부, 목록/로딩/에러 관리, 초기 fetch 트리거
 * @param {'load'|'save'|'restore'} key
 * @param {{fetchList?: Function, onOpen?: Function}} opts
 */
function useDocumentModal(key, { fetchList, onOpen } = {}) {
    const dispatch = useDispatch();
    const open = useSelector(setModal(key, { open }));
    const items = useSelector(selectItems, shallowEqual);
    const loading = useSelector(selectLoading);
    const error = useSelector(selectError);

    useEffect(() => {
        if (open) {
            if (typeof fetchList === 'function') dispatch(fetchList());
            if (typeof onOpen === 'function') onOpen();
        }
    }, [open, dispatch, fetchList, onOpen]);

    // 유틸: 공통 empty 상태
    const empty = useMemo(
        () => !loading && !error && Array.isArray(items) && items.length === 0,
        [items, loading, error]
    );

    return { open, items, loading, error, empty, dispatch };
}

export { useDocumentModal };

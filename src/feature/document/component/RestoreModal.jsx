import { useCallback, useMemo } from 'react';
import { useDispatch } from 'react-redux';

import { DocumentModalShell } from './DocumentModalShell';

import { fetchDrawings, restoreDrawing } from '../api/async';
import { setModal } from '../state/document.slice';
import { IconBtn } from '@/shared/component/button/IconBtn';

import styles from './OpenModal.module.css';
import { useDocumentModal } from '../hook/useDocumentModal';

export default function RestoreModal() {
    const dispatch = useDispatch();

    // 열릴 때 "삭제된 문서" 목록을 불러오도록 설정
    const { open, items, loading, error, empty } = useDocumentModal('restore', {
        fetchList: () => fetchDrawings({ deleted: true }),
    });

    // 삭제일자 최신순 정렬
    const sorted = useMemo(() => {
        const arr = Array.isArray(items) ? items.slice() : [];
        return arr.sort((a, b) => {
            const da = a?.deletedAt ? new Date(a.deletedAt).getTime() : 0;
            const db = b?.deletedAt ? new Date(b.deletedAt).getTime() : 0;
            return db - da;
        });
    }, [items]);

    const onClose = useCallback(() => {
        if (typeof setModal === 'function')
            dispatch(setModal({ key: 'restore', open: false }));
    }, [dispatch]);

    const onRestore = useCallback(
        async (e, id) => {
            e?.stopPropagation?.();
            if (!window.confirm('복구하시겠습니까?')) return;
            const res = await dispatch(restoreDrawing(id));
            if (res.meta.requestStatus === 'fulfilled') {
                dispatch(fetchDrawings({ deleted: true }));
            } else {
                alert('복구에 실패했습니다.');
            }
        },
        [dispatch]
    );

    return (
        <DocumentModalShell
            open={!!open}
            title="삭제된 문서"
            onClose={onClose}
            loading={loading}
            error={error}
            empty={empty}
            emptyText="삭제된 문서가 없습니다."
        >
            <ul>
                {sorted.map((it) => (
                    <li
                        key={it.id}
                        className={styles.row}
                        tabIndex={0}
                        role="button"
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' || e.key === ' ')
                                onRestore(e, it.id);
                        }}
                    >
                        <p className={styles.meta}>
                            <span>{it.title}</span>
                            <span>
                                {it.deletedAt
                                    ? new Date(it.deletedAt).toLocaleString()
                                    : it.updatedAt
                                      ? new Date(it.updatedAt).toLocaleString()
                                      : ''}
                            </span>
                        </p>
                        <IconBtn
                            icon="restore" // 아이콘 셋에 따라 'rotate-ccw' 등으로 변경
                            onClick={(e) => onRestore(e, it.id)}
                            title="복원"
                        />
                    </li>
                ))}
            </ul>
        </DocumentModalShell>
    );
}

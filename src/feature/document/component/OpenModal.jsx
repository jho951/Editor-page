import { useCallback } from 'react';
import { useDispatch } from 'react-redux';

import { fetchDrawings, softDeleteDrawing } from '../api/async';
import { setModal } from '../state/document.slice';
import { IconBtn } from '@/shared/component/button/IconBtn';

import { useDocumentModal } from '../hook/useDocumentModal';
import { DocumentModalShell } from './DocumentModalShell';

import styles from './OpenModal.module.css';

export function OpenModal() {
    const dispatch = useDispatch();
    const { open, items, loading, error, empty } = useDocumentModal('load', {
        fetchList: fetchDrawings,
    });

    const openInNewTab = (id) =>
        window.open(`/edit/${id}`, '_blank', 'noopener,noreferrer');

    const onDelete = useCallback(
        async (e, id) => {
            e.stopPropagation();
            if (!window.confirm('삭제하시겠습니까?')) return;
            const res = await dispatch(softDeleteDrawing(id));
            if (res.meta.requestStatus === 'fulfilled')
                dispatch(fetchDrawings());
            else alert('삭제에 실패했습니다.');
        },
        [dispatch]
    );

    const onClose = () => {
        if (setModal) dispatch(setModal({ key: 'load', open: false }));
    };

    return (
        <DocumentModalShell
            open={open}
            title="불러오기"
            onClose={onClose}
            loading={loading}
            error={error}
            empty={empty}
            emptyText="저장된 문서가 없습니다."
        >
            <ul>
                {items.map((it) => (
                    <li
                        className={`${styles.row} ${styles.active}`}
                        key={it.id}
                        onClick={() => openInNewTab(it.id)}
                        title="클릭하면 새 탭에서 열립니다"
                        role="button"
                        tabIndex={0}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' || e.key === ' ')
                                openInNewTab(it.id);
                        }}
                    >
                        <p className={styles.meta}>
                            <span>{it.title}</span>
                            <span>
                                {it.updatedAt &&
                                    new Date(it.updatedAt).toLocaleString()}
                            </span>
                        </p>
                        <IconBtn
                            icon="trash"
                            onClick={(e) => onDelete(e, it.id)}
                            title="삭제"
                        />
                    </li>
                ))}
            </ul>
        </DocumentModalShell>
    );
}

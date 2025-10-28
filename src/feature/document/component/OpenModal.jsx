import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { closeLoadModal } from '../state/document.slice';
import { fetchDrawings, softDeleteDrawing } from '../api/async';

import { Modal } from '@/shared/component/modal/Modal';
import { IconBtn } from '@/shared/component/button/IconBtn';

import styles from './OpenModal.module.css';

function OpenModal() {
    const dispatch = useDispatch();

    const items = useSelector((s) => s.document?.items);
    const error = useSelector((s) => s.document?.error);
    const loading = useSelector((s) => s.document?.loading);
    const open = useSelector((s) => s.document?.ui?.loadOpen);

    const openInNewTab = (id) => {
        window.open(`/edit/${id}`, '_blank', 'noopener,noreferrer');
    };

    const onDelete = async (e, id) => {
        e.stopPropagation();
        if (!window.confirm('삭제하시겠습니까?')) return;
        const res = await dispatch(softDeleteDrawing(id));
        if (res.meta.requestStatus === 'fulfilled') dispatch(fetchDrawings());
        else alert('삭제에 실패했습니다.');
    };

    useEffect(() => {
        if (open) dispatch(fetchDrawings());
    }, [open, dispatch]);

    return (
        <Modal
            open={open}
            title="불러오기"
            onClose={() => dispatch(closeLoadModal())}
        >
            {/* 본문 */}
            {loading && <div>불러오는 중…</div>}
            {!loading && error && (
                <div style={{ color: 'crimson' }}>{String(error)}</div>
            )}
            {!loading && !error && items.length === 0 && (
                <div>저장된 문서가 없습니다.</div>
            )}

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
                            icon={'trash'}
                            onClick={(e) => onDelete(e, it.id)}
                            title="삭제"
                        />
                    </li>
                ))}
            </ul>
        </Modal>
    );
}

export { OpenModal };

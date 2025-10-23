import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import Modal from './Modal';
import styles from '../style/Modal.module.css';

import { closeLoadModal } from '../../../lib/redux/slice/docSlice';
import {
    fetchDrawings,
    softDeleteDrawing,
} from '../../../lib/redux/util/async';

import { getIcon } from '../../icon/util/get-icon';
import { IconBtn } from '../../button/implementation/IconBtn';

function OpenModal() {
    const dispatch = useDispatch();

    const items = useSelector((s) => s.doc?.items);
    const error = useSelector((s) => s.doc?.error);
    const loading = useSelector((s) => s.doc?.loading);
    const open = useSelector((s) => s.doc?.ui?.loadOpen);

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
                            icon={getIcon('trash')}
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

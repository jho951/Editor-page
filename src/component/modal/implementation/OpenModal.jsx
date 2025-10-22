import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { closeLoadModal } from '../../../lib/redux/slice/docSlice';
import {
    fetchDrawings,
    softDeleteDrawing,
} from '../../../lib/redux/util/async';
import styles from '../style/Modal.module.css';

function OpenModal() {
    const dispatch = useDispatch();
    const open = useSelector((s) => s.doc?.ui?.loadOpen);
    const items = useSelector((s) => s.doc?.items || []);
    const loading = useSelector((s) => s.doc?.loading);
    const error = useSelector((s) => s.doc?.error);

    const openInNewTab = (it) =>
        window.open(`/edit/${it.id}`, '_blank', 'noopener');

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

    useEffect(() => {
        if (!open) return;
        const onKey = (e) => {
            if (e.key === 'Escape') dispatch(closeLoadModal());
        };
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, [open, dispatch]);

    if (!open) return null;

    return (
        <div
            className={styles.backdrop}
            role="none"
            onClick={() => dispatch(closeLoadModal())}
        >
            <div
                className={styles.modal}
                role="dialog"
                aria-modal="true"
                aria-labelledby="open-title"
                onClick={(e) => e.stopPropagation()}
            >
                <div className={styles.modalHeader}>
                    <h3 id="open-title" className={styles.modalTitle}>
                        불러오기
                    </h3>
                    <button
                        className={styles.closeBtn}
                        onClick={() => dispatch(closeLoadModal())}
                        aria-label="닫기"
                        type="button"
                    >
                        ×
                    </button>
                </div>

                <div className={styles.modalBody} style={{ maxHeight: 420 }}>
                    {loading && <div>불러오는 중…</div>}
                    {!loading && error && (
                        <div style={{ color: 'crimson' }}>{String(error)}</div>
                    )}
                    {!loading && !error && items.length === 0 && (
                        <div>저장된 문서가 없습니다.</div>
                    )}

                    <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                        {items.map((it) => (
                            <li
                                key={it.id}
                                className={styles.row}
                                onClick={() => openInNewTab(it)}
                                title="클릭하면 새 탭에서 열립니다"
                            >
                                <div>
                                    <div style={{ fontWeight: 700 }}>
                                        {it.title || '(제목없음)'}
                                    </div>
                                    <div
                                        style={{
                                            fontSize: 12,
                                            color: '#6b7280',
                                        }}
                                    >
                                        {it.updatedAt
                                            ? new Date(
                                                  it.updatedAt
                                              ).toLocaleString()
                                            : ''}
                                    </div>
                                </div>

                                <button
                                    type="button"
                                    className={styles.btn}
                                    onClick={(e) => onDelete(e, it.id)}
                                    aria-label="삭제"
                                    title="삭제"
                                >
                                    삭제
                                </button>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </div>
    );
}

export { OpenModal };

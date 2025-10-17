import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { closeLoadModal } from '../../../lib/redux/slice/docSlice';
import { deleteDrawing, fetchDrawings } from '../../../lib/redux/util/async';
import styles from '../style/Modal.module.css';

function OpenModal() {
    const dispatch = useDispatch();

    const open = useSelector((s) => s.doc?.ui?.loadOpen);
    const items = useSelector((s) => s.doc?.items || []);
    const loading = useSelector((s) => s.doc?.loading);
    const error = useSelector((s) => s.doc?.error);

    useEffect(() => {
        if (open) dispatch(fetchDrawings());
    }, [open, dispatch]);

    if (!open) return null;

    const openInNewTab = (it) => {
        window.open(`/edit/${it.id}`, '_blank', 'noopener');
    };

    const onDelete = async (e, id) => {
        e.stopPropagation();
        if (!window.confirm('삭제하시겠습니까?')) return;
        const res = await dispatch(deleteDrawing(id));
        if (res.meta.requestStatus === 'fulfilled') {
            dispatch(fetchDrawings());
        } else {
            alert('삭제에 실패했습니다.');
        }
    };

    return (
        <div
            className={styles.backdrop}
            onClick={() => dispatch(closeLoadModal())}
        >
            <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
                <div className={styles.modalHeader}>
                    <h3>불러오기</h3>
                    <button
                        className={styles.closeBtn}
                        onClick={() => dispatch(closeLoadModal())}
                    >
                        ×
                    </button>
                </div>

                <div
                    className={styles.modalBody}
                    style={{ maxHeight: 360, overflow: 'auto' }}
                >
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
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'space-between',
                                    padding: '10px 8px',
                                    borderBottom: '1px solid #eee',
                                    cursor: 'pointer',
                                }}
                                onClick={() => openInNewTab(it)}
                                title="클릭하면 새 탭에서 열립니다"
                            >
                                <div>
                                    <div style={{ fontWeight: 600 }}>
                                        {it.title || '(제목없음)'}
                                    </div>
                                    <div
                                        style={{ fontSize: 12, color: '#666' }}
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
                                    onClick={(e) => onDelete(e, it.id)}
                                    style={{
                                        border: '1px solid #e5e7eb',
                                        background: '#fff',
                                        borderRadius: 6,
                                        padding: '6px 10px',
                                        cursor: 'pointer',
                                    }}
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

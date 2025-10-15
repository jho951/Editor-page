import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchDrawings, loadDrawing } from '../../redux/slice/docSlice';
import { useNavigate } from 'react-router-dom';

export default function LoadModal({ open, onClose }) {
    const dispatch = useDispatch();
    const nav = useNavigate();
    const { items = [], loading, error } = useSelector((s) => s.doc);

    useEffect(() => {
        if (open) dispatch(fetchDrawings({ page: 1, size: 20 }));
    }, [open, dispatch]);

    const onPick = async (id) => {
        try {
            await dispatch(loadDrawing(id)).unwrap();
            onClose?.();
            nav(`/edit/${id}`);
        } catch (e) {
            console.error(e);
            alert('불러오기에 실패했습니다.');
        }
    };

    if (!open) return null;

    return (
        <div style={backdrop} onClick={onClose}>
            <div style={modal} onClick={(e) => e.stopPropagation()}>
                <div style={header}>
                    <strong>문서 불러오기</strong>
                    <button style={closeBtn} onClick={onClose}>
                        ×
                    </button>
                </div>

                <div style={{ padding: 12 }}>
                    {!loading && !error && items.length === 0 && (
                        <div>저장된 문서가 없습니다.</div>
                    )}

                    <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                        {items.map((d) => (
                            <li
                                key={d.id}
                                style={row}
                                onClick={() => onPick(d.id)}
                            >
                                <div style={{ fontWeight: 600 }}>{d.title}</div>
                                <div style={{ fontSize: 12, opacity: 0.8 }}>
                                    {d.updatedAt
                                        ? new Date(d.updatedAt).toLocaleString()
                                        : '—'}
                                </div>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </div>
    );
}

/* styles */
const backdrop = {
    position: 'fixed',
    width: '100vw',
    inset: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'rgba(0,0,0,.35)',
    zIndex: 1000,
};
const modal = {
    width: 480,
    maxWidth: '90vw',
    maxHeight: '80vh',
    overflow: 'auto',
    background: '#fff',
    borderRadius: 12,
    boxShadow: '0 10px 30px rgba(0,0,0,.2)',
};

const header = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '10px 12px',
    borderBottom: '1px solid #e5e7eb',
};
const closeBtn = {
    fontSize: 20,
    lineHeight: 1,
    border: 'none',
    background: 'transparent',
    cursor: 'pointer',
};
const row = {
    display: 'flex',
    justifyContent: 'space-between',
    gap: 12,
    padding: '10px 8px',
    borderBottom: '1px solid #f1f5f9',
    cursor: 'pointer',
};

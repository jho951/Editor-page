import { useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import Modal from './Modal';
import styles from '../style/Modal.module.css';

import { closeRestoreModal } from '../../../lib/redux/slice/docSlice';
import { fetchDrawings, restoreDrawing } from '../../../lib/redux/util/async';

import { getIcon } from '../../icon/util/get-icon';
import { IconBtn } from '../../button/implementation/IconBtn';

function RestoreModal() {
    const dispatch = useDispatch();
    const open = useSelector((s) => s.doc?.ui?.restoreOpen);
    const items = useSelector((s) => s.doc?.items || []);
    const loading = useSelector((s) => s.doc?.loading);
    const error = useSelector((s) => s.doc?.error);

    useEffect(() => {
        if (open) dispatch(fetchDrawings({ deleted: true }));
    }, [open, dispatch]);

    const sorted = useMemo(() => {
        return [...items].sort((a, b) => {
            const da = a?.deletedAt ? new Date(a.deletedAt).getTime() : 0;
            const db = b?.deletedAt ? new Date(b.deletedAt).getTime() : 0;
            return db - da;
        });
    }, [items]);

    const onRestore = async (e, id) => {
        e.stopPropagation();
        if (!window.confirm('복구하시겠습니까?')) return;
        const res = await dispatch(restoreDrawing(id));
        if (res.meta.requestStatus === 'fulfilled')
            dispatch(fetchDrawings({ deleted: true }));
        else alert('복구에 실패했습니다.');
    };

    // 영구 삭제가 필요하면 이 핸들러 사용
    // const onPurge = async (id) => {
    //   if (!window.confirm('이 문서를 영구 삭제하시겠습니까? 되돌릴 수 없습니다.')) return;
    //   const res = await dispatch(deleteDrawing(id));
    //   if (res.meta.requestStatus === 'fulfilled') {
    //     dispatch(fetchDrawings({ page: 1, size: 20, deleted: true }));
    //   } else {
    //     alert('영구 삭제에 실패했습니다.');
    //   }
    // };

    return (
        <Modal
            open={!!open}
            title="삭제된 문서"
            onClose={() => dispatch(closeRestoreModal())}
        >
            {loading && <div>불러오는 중…</div>}
            {!loading && error && (
                <div style={{ color: 'crimson' }}>{String(error)}</div>
            )}
            {!loading && !error && sorted.length === 0 && (
                <div>삭제된 문서가 없습니다.</div>
            )}
            <ul>
                {items.map((it) => (
                    <li className={styles.row} key={it.id} tabIndex={0}>
                        <p className={styles.meta}>
                            <span>{it.title}</span>
                            <span>
                                {it.updatedAt &&
                                    new Date(it.updatedAt).toLocaleString()}
                            </span>
                        </p>
                        <IconBtn
                            icon={getIcon('trash')}
                            onClick={(e) => onRestore(e, it.id)}
                            title="복원"
                        />
                    </li>
                ))}
            </ul>

            {/* (선택) 영구 삭제 버튼
              <button
                type="button"
                className={styles.btn}
                onClick={() => onPurge(it.id)}
                title="영구 삭제"
              >
                영구 삭제
              </button>
              */}
        </Modal>
    );
}

export default RestoreModal;

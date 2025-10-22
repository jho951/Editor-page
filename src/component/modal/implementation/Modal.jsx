import { useDispatch, useSelector } from 'react-redux';
import { IconBtn } from '../../button/implementation/IconBtn';
import { styles } from '../style/Modal.module.css';

const Modal = ({ title, children }) => {
    const dispatch = useDispatch();
    const loading = useSelector((s) => s.doc.loading);
    const error = useSelector((s) => s.doc.error);

    return (
        <aside
            className={styles.backdrop}
            onClick={() => dispatch(closeModal())}
        >
            <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
                <div className={styles.modalHeader}>
                    <h3 className={styles.title}>{title}</h3>
                    <IconBtn
                        icon="close"
                        onClick={() => dispatch(closeLoadModal())}
                    />
                </div>

                <div className={styles.body}>
                    <ul>
                        {render}
                        {children}
                    </ul>
                </div>
            </div>
        </aside>
    );
};
export { Modal };

const render = (loading, error, item) => {
    if (loading) {
        return <span>loading...</span>;
    } else if (!loading && error) {
        return <span>{String(error)}</span>;
    } else if (!loading && !error && item === 0) {
        return <div>저장된 문서가 없습니다.</div>;
    }
};

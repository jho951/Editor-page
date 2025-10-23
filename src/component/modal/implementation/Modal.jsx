import { getIcon } from '../../icon/util/get-icon';
import { IconBtn } from '../../button/implementation/IconBtn';

import { useClose } from '../hook/useClose';
import { useScrollLock } from '../hook/useScrollLock';

import styles from '../style/Modal.module.css';

/**
 * @file Modal.jsx
 * @author YJH
 * @description
 * 재사용 가능한 모달 컴포넌트.
 *
 * 기능 요약
 * - ESC 키로 닫기
 * - 바깥(backdrop) 클릭으로 닫기
 * - 헤더/본문/푸터 레이아웃 통일
 * - 포커스 트랩(탭 순환)이나 외부 스크롤 잠금
 */

/**
 * @param {Object}   props
 * @param {boolean}  props.open - 모달 표시 여부. false면 렌더링하지 않음.
 * @param {string}   props.title - 모달 헤더 제목
 * @param {() => void} [props.onClose] - 모달 닫기 ESC/backdrop/X 버튼에서 호출.
 * @param {React.ReactNode} [props.children]  - 모달 본문 컨텐츠.
 * @param {React.ReactNode} [props.footer=null] - 푸터 컨텐츠. 존재할 때만 렌더링됨.
 * @param {React.CSSProperties} [props.bodyStyle] - 본문 컨테이너에 추가 적용할 인라인 스타일.
 * @param {Object}   [props.modalProps={}]    - 모달 래퍼에 스프레드할 추가 props.
 * @param {boolean}  [props.closeButton=true] - 헤더 우측 닫기 버튼 표시 여부.
 * @param {string}   [props.labelledBy='modal-title'] 접근성용 제목 요소의 id. h3의 id와 동일해야 함(aria-labelledby 연결).
 *
 * @returns {JSX.Element|null}
 *
 * 이벤트 처리
 * - backdrop 클릭 시 onClose 실행
 * - 내부 박스 클릭은 e.stopPropagation()으로 backdrop 닫기 방지
 */
function Modal({
    open,
    title,
    onClose,
    children,
    footer = null,
    bodyStyle,
    modalProps = {},
    closeButton = true,
    labelledBy = 'modal-title',
}) {
    useClose(!!open, onClose);
    useScrollLock(!!open);

    if (!open) return null;

    return (
        <section className={styles.backdrop} onClick={() => onClose?.()}>
            <div
                className={styles.modal}
                onClick={(e) => e.stopPropagation()}
                {...modalProps}
            >
                {/* 헤더 */}
                <div className={styles.header}>
                    <h3 id={labelledBy} className={styles.title}>
                        {title}
                    </h3>
                    {closeButton && (
                        <IconBtn
                            icon={getIcon('close')}
                            onClick={() => onClose?.()}
                        />
                    )}
                </div>

                {/* 본문 */}
                <div className={styles.body} style={bodyStyle}>
                    {children}
                </div>

                {/* 푸터 */}
                {footer && <div className={styles.footer}>{footer}</div>}
            </div>
        </section>
    );
}

export default Modal;

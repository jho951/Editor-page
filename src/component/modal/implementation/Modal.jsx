import { useEffect } from 'react';
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
 * @param {boolean}  props.open               - 모달 표시 여부. false면 렌더링하지 않음.
 * @param {string}   props.title              - 모달 상단 제목(헤더에 표시).
 * @param {() => void} [props.onClose]        - 닫기 핸들러. ESC/backdrop/X 버튼에서 호출.
 * @param {React.ReactNode} [props.headerExtra=null]
 *        헤더 우측 영역에 추가로 표시할 요소(예: 도움말 버튼).
 * @param {React.ReactNode} [props.children]  - 모달 본문 컨텐츠.
 * @param {React.ReactNode} [props.footer=null]
 *        푸터(버튼 영역) 컨텐츠. 존재할 때만 푸터 영역이 렌더링됨.
 * @param {React.CSSProperties} [props.bodyStyle]
 *        본문 컨테이너(styles.modalBody)에 추가 적용할 인라인 스타일.
 * @param {Object}   [props.modalProps={}]    - 모달 래퍼(div.modal)에 스프레드할 추가 props.
 * @param {boolean}  [props.closeButton=true] - 헤더 우측 X(닫기) 버튼 표시 여부.
 * @param {string}   [props.labelledBy='modal-title']
 *        접근성용 제목 요소의 id. h3의 id와 동일해야 함(aria-labelledby 연결).
 *
 * @returns {JSX.Element|null}
 *
 * 접근성(a11y)
 *   상위에서 ref를 전달해 focus() 호출하는 방식을 권장.
 *
 * 이벤트 처리
 * - backdrop 클릭 시 onClose 실행
 * - 내부 박스 클릭은 e.stopPropagation()으로 backdrop 닫기 방지
 */
function Modal({
    open,
    title,
    onClose,
    headerExtra = null,
    children,
    footer = null,
    bodyStyle,
    modalProps = {},
    closeButton = true,
    labelledBy = 'modal-title',
}) {
    // ESC 키로 닫기 처리 (open일 때만 리스너 등록)
    useEffect(() => {
        if (!open) return;
        const onKey = (e) => {
            if (e.key === 'Escape') onClose?.();
        };
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, [open, onClose]);

    // 열리지 않으면 아무것도 렌더링하지 않음 (포털 사용 시 포털로 감싸도 동일 동작)
    if (!open) return null;

    return (
        <div
            className={styles.backdrop}
            role="none"
            onClick={() => onClose?.()} // ⬅︎ backdrop 클릭 시 닫기
        >
            <div
                className={styles.modal}
                role="dialog"
                aria-modal="true"
                aria-labelledby={labelledBy}
                onClick={(e) => e.stopPropagation()} // ⬅︎ 내부 클릭은 닫기 방지
                {...modalProps} // data-* 속성, 테스트 id 등 전달용
            >
                {/* ── 헤더 영역 ── */}
                <div className={styles.modalHeader}>
                    <h3 id={labelledBy} className={styles.modalTitle}>
                        {title}
                    </h3>

                    {/* 우측: 추가 버튼/닫기 버튼 영역 */}
                    <div
                        style={{ marginLeft: 'auto', display: 'flex', gap: 8 }}
                    >
                        {headerExtra}
                        {closeButton && (
                            <button
                                className={styles.closeBtn}
                                onClick={() => onClose?.()}
                                aria-label="닫기"
                                type="button"
                            >
                                ×
                            </button>
                        )}
                    </div>
                </div>

                {/* ── 본문 영역 ── */}
                <div className={styles.modalBody} style={bodyStyle}>
                    {children}
                </div>

                {/* ── 푸터 영역(있을 때만) ── */}
                {footer && <div className={styles.modalFooter}>{footer}</div>}
            </div>
        </div>
    );
}

export default Modal;

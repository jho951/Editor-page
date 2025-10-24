/**
 * @file doc.initial.js
 * @author YJH
 * @description Redux Toolkit의 docSlice 초기 상태 및 슬라이스 이름
 * @see {@link ../slice/docSlice.js}
 */

/**
 * @constant
 * @type {string}
 * @readonly
 * @description docSlice의 슬라이스 이름 상수
 */
const DOC_NAME = 'doc';

/**
 * @constant
 * @type {Object}
 * @description docSlice의 초기 상태 값.
 * @property {Array} items                         서버에서 불러온 문서 리스트
 * @property {boolean} loading                     API 호출 중 상태
 * @property {string|Object|null} error            오류 메시지 또는 객체
 * @property {Object} ui                           모달 상태 객체
 * @property {boolean} ui.loadOpen                 목록 모달 여닫이 상태
 * @property {boolean} ui.saveOpen                 저장 모달 여닫이 상태
 * @property {boolean} ui.restoreOpen              복원 모달 여닫이 상태
 * @property {Object} current                      현재 활성화된 문서 메타데이터
 * @property {string|null} current.id
 * @property {string} current.title
 * @property {number|null} current.version
 * @property {boolean} current.dirty
 */
const DOC_STATE = {
    items: [],
    loading: false,
    error: null,
    ui: { loadOpen: false, saveOpen: false, restoreOpen: false },
    current: { id: null, title: '', version: null, dirty: false },
};

export { DOC_NAME, DOC_STATE };

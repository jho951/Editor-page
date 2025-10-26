/**
 * @file menu.js
 * @description
 * 헤더의 드롭다운/버튼 섹션 구성 정의.
 * - items는 전부 item.js에서 가져와 사용
 * - key는 섹션 그룹 ID (analytics/logging 등에 활용 가능)
 */

import { getIcon } from '../../icon/util/get-icon';
import { HEADER_ELEMENTS } from './item';

const SECTION_SIZE = HEADER_ELEMENTS.ITEM_SIZE + 4;

/**
 * 드롭다운/툴바 섹션 구성
 * - 단일 버튼(기본 선택)과 드롭다운 그룹을 혼용
 * - 플러그인/실험기능을 섹션 단위로 삽입하기 쉬운 형태
 */
const DROPDOWN_SECTION = [
    {
        key: 'file',
        label: '파일',
        icon: getIcon('open', SECTION_SIZE),
        items: HEADER_ELEMENTS.FILE_ITEM,
    },
    // 단일 기본 아이템(예: 선택 툴)
    HEADER_ELEMENTS.DEFAULT_ITEM[0],
    {
        key: 'shape',
        label: '도형',
        icon: getIcon('shape', SECTION_SIZE),
        items: HEADER_ELEMENTS.SHAPE_ITEM,
    },
    {
        key: 'transform',
        label: '변형',
        icon: getIcon('transform', SECTION_SIZE),
        items: HEADER_ELEMENTS.TRANSFORM_ITEM,
    },
    {
        key: 'style',
        label: '스타일',
        icon: getIcon('palette', SECTION_SIZE),
        items: [], // 스타일 패널 열기/프리셋 등으로 확장 가능
    },
    {
        key: 'zoom',
        label: '확대/축소',
        icon: getIcon('zoom', SECTION_SIZE),
        items: HEADER_ELEMENTS.ZOOM_ITEM,
    },
    // 단일 버튼 형태의 Undo/Redo
    HEADER_ELEMENTS.HISTORY_ITEM[0],
    HEADER_ELEMENTS.HISTORY_ITEM[1],
];

export { SECTION_SIZE, DROPDOWN_SECTION };

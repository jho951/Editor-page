import { getIcon } from '../../icon/util/get-icon';
import { HEADER_ELEMENTS } from './item';

/** @description 헤더 gnb 아이콘 크기 */
const SECTION_SIZE = HEADER_ELEMENTS.ITEM_SIZE + 4;

/**
 * @description 드롭다운 섹션 정보
 * @see {@link HEADER_ELEMENTS}
 */
const DROPDOWN_SECTION = [
    {
        id: 'file',
        title: '파일',
        icon: getIcon('open', SECTION_SIZE),
        items: HEADER_ELEMENTS.FILE_ITEM,
    },
    {
        id: 'shape',
        title: '도형',
        icon: getIcon('shape', SECTION_SIZE),
        items: HEADER_ELEMENTS.SHAPE_ITEM,
    },
    {
        id: 'transform',
        title: '변형',
        icon: getIcon('transform', SECTION_SIZE),
        items: HEADER_ELEMENTS.TRANSFORM_ITEM,
    },
    {
        id: 'zoom',
        title: '확대/축소',
        icon: getIcon('zoom', SECTION_SIZE),
        items: HEADER_ELEMENTS.ZOOM_ITEM,
    },
    HEADER_ELEMENTS.HISTORY_ITEM[0],
    HEADER_ELEMENTS.HISTORY_ITEM[1],
];

export { DROPDOWN_SECTION };

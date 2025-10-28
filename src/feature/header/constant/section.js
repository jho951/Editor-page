import { Icon } from '@/shared/component/icon/Icon';
import { HEADER_ELEMENTS } from './item';

const DROPDOWN_SECTION = [
    {
        key: 'file',
        label: '파일',
        icon: <Icon name="open" size={HEADER_ELEMENTS.ITEM_SIZE + 4} />,
        items: HEADER_ELEMENTS.FILE_ITEM,
    },
    HEADER_ELEMENTS.DEFAULT_ITEM[0],
    {
        key: 'shape',
        label: '도형',

        icon: <Icon name="shape" size={HEADER_ELEMENTS.ITEM_SIZE + 4} />,
        items: HEADER_ELEMENTS.SHAPE_ITEM,
    },
    {
        key: 'transform',
        label: '변형',

        icon: <Icon name="transform" size={HEADER_ELEMENTS.ITEM_SIZE + 4} />,
        items: HEADER_ELEMENTS.TRANSFORM_ITEM,
    },
    {
        key: 'style',
        label: '스타일',

        icon: <Icon name="palette" size={HEADER_ELEMENTS.ITEM_SIZE + 4} />,
        items: [],
    },
    {
        key: 'zoom',
        label: '확대/축소',

        icon: <Icon name="zoom" size={HEADER_ELEMENTS.ITEM_SIZE + 4} />,
        items: HEADER_ELEMENTS.ZOOM_ITEM,
    },
    HEADER_ELEMENTS.HISTORY_ITEM[0],
    HEADER_ELEMENTS.HISTORY_ITEM[1],
];

export { DROPDOWN_SECTION };

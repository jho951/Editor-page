import { Icon } from '@/shared/component/icon/Icon';
import { HEADER_ELEMENTS } from './item';

const DROPDOWN_SECTION = [
    {
        key: 'file',
        label: '파일',
        icon: <Icon name="open" size={HEADER_ELEMENTS.ITEM_SIZE + 4} />,
        items: HEADER_ELEMENTS.FILE_ITEM,
    },

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
    // 히스토리는 그대로 확장
    ...HEADER_ELEMENTS.HISTORY_ITEM,
];

export { DROPDOWN_SECTION };

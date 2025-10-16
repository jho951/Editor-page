import { HEADER_ELEMENTS } from './element';

const DROPDOWN_SECTION = [
    {
        id: 'file',
        title: '파일',
        icon: 'open',
        items: HEADER_ELEMENTS.FILE_ITEM,
    },
    {
        id: 'shape',
        title: '도형',
        icon: 'shape',
        items: HEADER_ELEMENTS.SHAPE_ITEM,
    },
    {
        id: 'transform',
        title: '변형',
        icon: 'transform',
        items: HEADER_ELEMENTS.TRANSFORM_ITEM,
    },
    {
        id: 'zoom',
        title: '확대/축소',
        icon: 'zoom',
        items: HEADER_ELEMENTS.ZOOM_ITEM,
    },
];
export { DROPDOWN_SECTION };

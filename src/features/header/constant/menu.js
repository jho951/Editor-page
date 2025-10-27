const SECTION_SIZE = HEADER_ELEMENTS.ITEM_SIZE + 4;

const DROPDOWN_SECTION = [
    {
        key: 'file',
        label: '파일',
        icon: getIcon('open', SECTION_SIZE),
        items: HEADER_ELEMENTS.FILE_ITEM,
    },
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
        items: [],
    },

    {
        key: 'zoom',
        label: '확대/축소',
        icon: getIcon('zoom', SECTION_SIZE),
        items: HEADER_ELEMENTS.ZOOM_ITEM,
    },

    HEADER_ELEMENTS.HISTORY_ITEM[0],
    HEADER_ELEMENTS.HISTORY_ITEM[1],
];

export { SECTION_SIZE, DROPDOWN_SECTION };

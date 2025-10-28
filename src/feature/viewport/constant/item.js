const ZOOM_CANVAS = [
    {
        key: 'fit',
        label: '화면에 맞춤',
        icon: null,
        shortcut: 'Mod+0',
        cursor: 'default',
        shortcutLabel: displayShortcut('Mod+0'),
    },
    {
        key: 'in',
        label: '확대',
        icon: <Icon name="plus" size={ITEM_SIZE} />,
        shortcut: 'Mod+=',
        cursor: 'zoom-in',
        shortcutLabel: displayShortcut('Mod+='),
    },
    {
        key: 'out',
        label: '축소',
        icon: <Icon name="minus" size={ITEM_SIZE} />,
        shortcut: 'Mod+-',
        cursor: 'zoom-out',
        shortcutLabel: displayShortcut('Mod+-'),
    },
    {
        key: 'rotate-left',
        label: '왼쪽으로 90° 회전°',
        icon: <Icon name="rotate" size={ITEM_SIZE} />,
        shortcut: 'Alt+R',
        cursor: 'alias',
        shortcutLabel: displayShortcut('Alt+R'),
    },
    {
        key: 'rotate-right',
        label: '오른쪽으로 90° 회전°',
        icon: <Icon name="rotate" size={ITEM_SIZE} />,
        shortcut: 'Alt+R',
        cursor: 'alias',
        shortcutLabel: displayShortcut('Alt+R'),
    },
];

export { ZOOM_CANVAS };

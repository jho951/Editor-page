export function IconSelect({ size = 18, ...props }) {
    return (
        <svg
            viewBox="0 0 24 24"
            width={size}
            height={size}
            aria-hidden="true"
            {...props}
        >
            <path d="M4 4l5 13 2-5 5-2-12-6z" fill="currentColor" />
            <path d="M14 14l6 6" stroke="currentColor" strokeWidth="2" />
        </svg>
    );
}
export function IconBucket({ size = 18, ...props }) {
    return (
        <svg viewBox="0 0 24 24" width={size} height={size} {...props}>
            <path
                d="M4 10l6-6 6 6v6a3 3 0 01-3 3H7a3 3 0 01-3-3v-6z"
                fill="currentColor"
            />
            <path d="M10 4l6 6" stroke="#fff" strokeWidth="2" />
        </svg>
    );
}
export function IconText({ size = 18, ...props }) {
    return (
        <svg viewBox="0 0 24 24" width={size} height={size} {...props}>
            <path d="M4 6h16M12 6v12" stroke="currentColor" strokeWidth="2" />
        </svg>
    );
}
export function IconEyedrop({ size = 18, ...props }) {
    return (
        <svg viewBox="0 0 24 24" width={size} height={size} {...props}>
            <path d="M14 3l7 7-5 5-7-7 5-5z" fill="currentColor" />
            <path d="M3 21l6-6" stroke="currentColor" strokeWidth="2" />
        </svg>
    );
}
export function IconMagnifier({ size = 18, ...props }) {
    return (
        <svg viewBox="0 0 24 24" width={size} height={size} {...props}>
            <circle
                cx="10"
                cy="10"
                r="6"
                stroke="currentColor"
                strokeWidth="2"
                fill="none"
            />
            <path d="M14.5 14.5L20 20" stroke="currentColor" strokeWidth="2" />
        </svg>
    );
}
export function IconShapes({ size = 18, ...props }) {
    return (
        <svg viewBox="0 0 24 24" width={size} height={size} {...props}>
            <rect
                x="3"
                y="3"
                width="8"
                height="8"
                stroke="currentColor"
                fill="none"
            />
            <circle cx="17" cy="7" r="4" stroke="currentColor" fill="none" />
            <path d="M4 20l4-6 4 6H4z" stroke="currentColor" fill="none" />
        </svg>
    );
}
export function IconTransform({ size = 18, ...props }) {
    return (
        <svg viewBox="0 0 24 24" width={size} height={size} {...props}>
            <rect
                x="5"
                y="5"
                width="14"
                height="14"
                stroke="currentColor"
                fill="none"
            />
            <path d="M5 9h4M15 19v-4M19 15h-4M9 5v4" stroke="currentColor" />
        </svg>
    );
}

export function IconRect({ size = 16, ...props }) {
    return (
        <svg viewBox="0 0 24 24" width={size} height={size} {...props}>
            <rect
                x="4"
                y="6"
                width="16"
                height="12"
                stroke="currentColor"
                fill="none"
            />
        </svg>
    );
}
export function IconEllipse({ size = 16, ...props }) {
    return (
        <svg viewBox="0 0 24 24" width={size} height={size} {...props}>
            <ellipse
                cx="12"
                cy="12"
                rx="8"
                ry="5"
                stroke="currentColor"
                fill="none"
            />
        </svg>
    );
}
export function IconLine({ size = 16, ...props }) {
    return (
        <svg viewBox="0 0 24 24" width={size} height={size} {...props}>
            <path d="M4 18L20 6" stroke="currentColor" strokeWidth="2" />
        </svg>
    );
}
export function IconPolygon({ size = 16, ...props }) {
    return (
        <svg viewBox="0 0 24 24" width={size} height={size} {...props}>
            <path
                d="M12 3l8 5-3 10H7L4 8l8-5z"
                stroke="currentColor"
                fill="none"
            />
        </svg>
    );
}
export function IconStar({ size = 16, ...props }) {
    return (
        <svg viewBox="0 0 24 24" width={size} height={size} {...props}>
            <path
                d="M12 3l3 6 6 .9-4.5 4.3L18 21l-6-3-6 3 1.5-6.8L3 9.9 9 9l3-6z"
                stroke="currentColor"
                fill="none"
            />
        </svg>
    );
}
export function IconFreeDraw({ size = 16, ...props }) {
    return (
        <svg viewBox="0 0 24 24" width={size} height={size} {...props}>
            <path
                d="M3 16c3-6 8-4 11-1s5 3 7-2"
                stroke="currentColor"
                fill="none"
            />
        </svg>
    );
}
export function IconResize({ size = 16, ...props }) {
    return (
        <svg viewBox="0 0 24 24" width={size} height={size} {...props}>
            <path d="M4 20l6-6M14 10l6-6" stroke="currentColor" />
            <rect
                x="3"
                y="3"
                width="8"
                height="8"
                stroke="currentColor"
                fill="none"
            />
            <rect
                x="13"
                y="13"
                width="8"
                height="8"
                stroke="currentColor"
                fill="none"
            />
        </svg>
    );
}
export function IconSkew({ size = 16, ...props }) {
    return (
        <svg viewBox="0 0 24 24" width={size} height={size} {...props}>
            <path
                d="M5 17l4-10h10l-4 10H5z"
                stroke="currentColor"
                fill="none"
            />
        </svg>
    );
}
export function IconRotate({ size = 16, ...props }) {
    return (
        <svg viewBox="0 0 24 24" width={size} height={size} {...props}>
            <path d="M12 6V2l-3 3 3 3V4" stroke="currentColor" />
            <circle cx="12" cy="12" r="7" stroke="currentColor" fill="none" />
        </svg>
    );
}
export function IconFlipH({ size = 16, ...props }) {
    return (
        <svg viewBox="0 0 24 24" width={size} height={size} {...props}>
            <path
                d="M12 4v16M12 4L4 12l8 8M12 4l8 8-8 8"
                stroke="currentColor"
                fill="none"
            />
        </svg>
    );
}
export function IconFlipV({ size = 16, ...props }) {
    return (
        <svg viewBox="0 0 24 24" width={size} height={size} {...props}>
            <path
                d="M4 12h16M4 12l8-8 8 8M4 12l8 8 8-8"
                stroke="currentColor"
                fill="none"
            />
        </svg>
    );
}

export function IconMinus({ size = 14, ...props }) {
    return (
        <svg viewBox="0 0 24 24" width={size} height={size} {...props}>
            <path d="M5 12h14" stroke="currentColor" strokeWidth="2" />
        </svg>
    );
}
export function IconPlus({ size = 14, ...props }) {
    return (
        <svg viewBox="0 0 24 24" width={size} height={size} {...props}>
            <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2" />
        </svg>
    );
}
export function IconReset({ size = 14, ...props }) {
    return (
        <svg viewBox="0 0 24 24" width={size} height={size} {...props}>
            <path d="M12 6V3l-3 3 3 3V6" stroke="currentColor" />
            <circle cx="12" cy="12" r="7" stroke="currentColor" fill="none" />
        </svg>
    );
}
export function IconUndo({ size = 14, ...props }) {
    return (
        <svg
            viewBox="0 0 24 24"
            width={size}
            height={size}
            aria-hidden="true"
            {...props}
        >
            <path
                d="M7 7l-4 4 4 4"
                stroke="currentColor"
                fill="none"
                strokeWidth="2"
            />
            <path
                d="M20 17a7 7 0 0 0-7-7H3"
                stroke="currentColor"
                fill="none"
                strokeWidth="2"
            />
        </svg>
    );
}
export function IconRedo({ size = 14, ...props }) {
    return (
        <svg
            viewBox="0 0 24 24"
            width={size}
            height={size}
            aria-hidden="true"
            {...props}
        >
            <path
                d="M17 7l4 4-4 4"
                stroke="currentColor"
                fill="none"
                strokeWidth="2"
            />
            <path
                d="M4 17a7 7 0 0 1 7-7h10"
                stroke="currentColor"
                fill="none"
                strokeWidth="2"
            />
        </svg>
    );
}

export function IconSave({ size = 16, ...props }) {
    return (
        <svg viewBox="0 0 24 24" width={size} height={size} {...props}>
            <path d="M4 4h12l4 4v12H4z" stroke="currentColor" fill="none" />
            <path d="M8 4v6h8V4" stroke="currentColor" fill="none" />
            <rect
                x="7"
                y="14"
                width="10"
                height="5"
                stroke="currentColor"
                fill="none"
            />
        </svg>
    );
}

export function IconOpen({ size = 16, ...props }) {
    return (
        <svg viewBox="0 0 24 24" width={size} height={size} {...props}>
            <path
                d="M3 7h7l2 2h9v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7z"
                stroke="currentColor"
                fill="none"
            />
        </svg>
    );
}

export function IconTrash({ size = 16, ...props }) {
    return (
        <svg viewBox="0 0 24 24" width={size} height={size} {...props}>
            <path d="M3 6h18" stroke="currentColor" />
            <path d="M8 6V4h8v2" stroke="currentColor" />
            <rect
                x="6"
                y="6"
                width="12"
                height="14"
                stroke="currentColor"
                fill="none"
            />
            <path d="M10 10v6M14 10v6" stroke="currentColor" />
        </svg>
    );
}

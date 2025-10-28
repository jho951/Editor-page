// src/shared/component/icon/Icon.jsx
import React, { forwardRef } from 'react';
import { ICONS } from '@/asset/svg';

/**
 * 심플 SVG Icon 컴포넌트
 * - name: ICONS 키
 * - size: px 단위 (width/height)
 * - color: 기본 stroke/fill에 넣어줄 색 (노드별 값이 있으면 그게 우선)
 * - strokeWidth: 기본 선 두께 (노드별 값이 있으면 그게 우선)
 * - title: 접근성 레이블 (없으면 aria-hidden)
 */
const Icon = forwardRef(function Icon(
    {
        name,
        size = 18,
        color = 'currentColor',
        strokeWidth = 1.5,
        title,
        ...rest
    },
    ref
) {
    const def = ICONS?.[name];
    if (!def) return null;

    const { vb = '0 0 24 24', g = [] } = def;

    const a11y = {
        role: 'img',
        'aria-hidden': title ? undefined : 'true',
        'aria-label': title || undefined,
    };

    return (
        <svg
            ref={ref}
            viewBox={vb}
            width={size}
            height={size}
            focusable="false"
            {...a11y}
            {...rest}
        >
            {g.map((node, i) => {
                const { el = 'path', stroke, fill, ...attrs } = node || {};
                // 기본값(color, strokeWidth)은 노드에 값이 없을 때만 적용
                const props = {
                    stroke: stroke ?? color,
                    fill: fill ?? (stroke ? 'none' : color), // stroke만 있으면 기본 fill 없음
                    strokeWidth: attrs.strokeWidth ?? strokeWidth,
                    ...attrs,
                };
                return React.createElement(el, { key: i, ...props });
            })}
        </svg>
    );
});

export { Icon };

import React, { forwardRef } from 'react';

import { ICONS } from '@/asset/svg';
import { mergeAttrs } from '@/shared/util/merge-attrs';

const Icon = forwardRef(function Icon(
    {
        name,
        size = 18,
        stroke = 'currentColor',
        fill = 'currentColor',
        strokeWidth = 1.5,
        ...rest
    },
    ref
) {
    if (!ICONS[name]) return null;
    return (
        <svg
            ref={ref}
            viewBox={ICONS[name.props.name].vb || '0 0 24 24'}
            width={size}
            height={size}
            {...rest}
        >
            {ICONS[name.props.name].g.map((n, i) =>
                React.createElement(n.el, {
                    key: i,
                    ...mergeAttrs(n, { stroke, fill, strokeWidth }),
                })
            )}
        </svg>
    );
});

export { Icon };

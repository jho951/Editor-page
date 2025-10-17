import React, { forwardRef, memo } from 'react';
import { ICONS } from '../constant/svg';
import { mergeAttrs } from '../util/merge-attrs';

const Icon = memo(
    forwardRef(function Icon(
        {
            name,
            size = 18,
            stroke = 'currentColor',
            fill = 'none',
            strokeWidth = 1.5,
            title,
            ...rest
        },
        ref
    ) {
        if (!ICONS[name]) return null;

        return (
            <svg
                ref={ref}
                viewBox={ICONS[name].vb || '0 0 24 24'}
                width={size}
                height={size}
                {...rest}
            >
                {title ? <title>{title}</title> : null}
                {ICONS[name].g.map((n, i) =>
                    React.createElement(n.el, {
                        key: i,
                        ...mergeAttrs(n, { stroke, fill, strokeWidth }),
                    })
                )}
            </svg>
        );
    })
);

export { Icon };

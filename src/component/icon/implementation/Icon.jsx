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
        const def = ICONS[name];
        if (!def) return null;

        const ariaProps = title
            ? { role: 'img', 'aria-label': title }
            : { role: 'presentation', 'aria-hidden': true };

        return (
            <svg
                ref={ref}
                viewBox={def.vb || '0 0 24 24'}
                width={size}
                height={size}
                {...ariaProps}
                {...rest}
            >
                {title ? <title>{title}</title> : null}
                {def.g.map((n, i) =>
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

import { forwardRef } from 'react';

const isForwardRefComponent = (Comp) =>
    typeof Comp === 'object' &&
    Comp !== null &&
    Comp.$$typeof === Symbol.for('react.forward_ref');

const SafeTrigger = forwardRef(function SafeTrigger(
    { Trigger, triggerProps, className },
    ref
) {
    const isDomTag = typeof Trigger === 'string';

    if (isDomTag || isForwardRefComponent(Trigger)) {
        const Comp = Trigger;
        return <Comp ref={ref} className={className} {...triggerProps} />;
    }

    return (
        <button ref={ref} type="button" className={className} {...triggerProps}>
            <Trigger {...triggerProps} />
        </button>
    );
});

const popRight = {
    initial: { opacity: 0, transform: 'translateX(-6px)' },
    animate: {
        opacity: 1,
        transform: 'translateX(0)',
        transition: { duration: 0.14 },
    },
    exit: {
        opacity: 0,
        transform: 'translateX(-6px)',
        transition: { duration: 0.12 },
    },
};

export { isForwardRefComponent, SafeTrigger, popRight };

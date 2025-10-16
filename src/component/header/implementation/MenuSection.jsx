import React from 'react';
import { DropDown } from '../../select/implementation/DropDown';
import { ToolBtn } from '../../button/implementation/ToolBtn';
import { Icon } from '../../icon/implementation/Icon';

function MenuSection({
    title,
    icon,
    items,
    selectedKey,
    onSelect,
    ariaLabel,
    classNames,
    disabled,
    TriggerProps = {},
}) {
    return (
        <DropDown
            Trigger={(p) => (
                <ToolBtn
                    {...p}
                    {...TriggerProps}
                    title={title}
                    disabled={disabled}
                >
                    <Icon name={icon} />
                </ToolBtn>
            )}
            items={(items || []).filter(Boolean)}
            selectedKey={selectedKey ?? null}
            onSelect={onSelect}
            ariaLabel={ariaLabel || title}
            classNames={classNames}
        />
    );
}
export { MenuSection };

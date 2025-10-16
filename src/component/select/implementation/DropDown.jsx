import { useEffect, useRef, useState, useCallback } from 'react';
import { ToolBtn } from '../../button/implementation/ToolBtn';
import internalStyles from '../style/DropDown.module.css';

const cx = (...arr) => arr.filter(Boolean).join(' ');

const DropDown = ({
    Trigger = (p) => <ToolBtn {...p} />,
    triggerProps = {},
    items = [], // [{ key, label, icon, disabled? }]
    selectedKey,
    onSelect,
    ariaLabel = 'Menu',
    classNames = {}, // { wrap, panel, item, checked, icon }
    closeOnSelect = true,
    open: controlledOpen,
    onOpenChange,
    renderPanel, // ★ 추가: 커스텀 패널 렌더러 (helpers => ReactNode)
}) => {
    const isControlled = typeof controlledOpen === 'boolean';
    const [uncontrolledOpen, setUncontrolledOpen] = useState(false);
    const isOpen = isControlled ? controlledOpen : uncontrolledOpen;

    const setOpen = useCallback(
        (next) => {
            if (!isControlled) setUncontrolledOpen(next);
            onOpenChange && onOpenChange(next);
        },
        [isControlled, onOpenChange]
    );

    const wrapRef = useRef(null);
    const triggerRef = useRef(null);
    const menuRef = useRef(null);
    const itemRefs = useRef([]);

    useEffect(() => {
        if (!isOpen) return;
        const onDocMouseDown = (e) => {
            const w = wrapRef.current;
            if (!w) return;
            if (!w.contains(e.target)) setOpen(false);
        };
        document.addEventListener('mousedown', onDocMouseDown);
        return () => document.removeEventListener('mousedown', onDocMouseDown);
    }, [isOpen, setOpen]);

    useEffect(() => {
        if (isOpen && itemRefs.current[0]) itemRefs.current[0].focus();
    }, [isOpen]);

    useEffect(() => {
        if (!isOpen && triggerRef.current) triggerRef.current.focus?.();
    }, [isOpen]);

    const onTriggerKeyDown = (e) => {
        if (e.key === 'ArrowDown' || e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            setOpen(true);
        }
    };

    const onMenuKeyDown = (e) => {
        const currentIndex = itemRefs.current.findIndex(
            (el) => el === document.activeElement
        );
        const lastIndex = items.length - 1;

        if (e.key === 'Escape') {
            e.preventDefault();
            setOpen(false);
            return;
        }
        if (e.key === 'Tab') {
            setOpen(false);
            return;
        }
        if (e.key === 'ArrowDown') {
            e.preventDefault();
            const next =
                currentIndex < 0 ? 0 : Math.min(currentIndex + 1, lastIndex);
            itemRefs.current[next]?.focus();
            return;
        }
        if (e.key === 'ArrowUp') {
            e.preventDefault();
            const prev =
                currentIndex < 0 ? lastIndex : Math.max(currentIndex - 1, 0);
            itemRefs.current[prev]?.focus();
            return;
        }
        if (e.key === 'Home') {
            e.preventDefault();
            itemRefs.current[0]?.focus();
            return;
        }
        if (e.key === 'End') {
            e.preventDefault();
            itemRefs.current[lastIndex]?.focus();
            return;
        }
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            const idx = currentIndex < 0 ? 0 : currentIndex;
            const item = items[idx];
            if (item && !item.disabled) {
                onSelect?.(item.key);
                if (closeOnSelect) setOpen(false);
            }
        }
    };

    const wrapCls =
        classNames.wrap ??
        internalStyles.dropdownWrap ??
        internalStyles.wrap ??
        '';
    const panelCls =
        classNames.panel ??
        internalStyles.dropdown ??
        internalStyles.panel ??
        '';
    const itemCls =
        classNames.item ?? internalStyles.menuItem ?? internalStyles.item ?? '';
    const checked = classNames.checked ?? internalStyles.checked ?? '';
    const iconCls =
        classNames.icon ?? internalStyles.menuIcon ?? internalStyles.icon ?? '';

    return (
        <div ref={wrapRef} className={wrapCls}>
            <div onKeyDown={onTriggerKeyDown}>
                <Trigger
                    {...triggerProps}
                    ref={triggerRef}
                    active={Boolean(
                        selectedKey && items.some((i) => i.key === selectedKey)
                    )}
                    onClick={() => setOpen(!isOpen)}
                    aria-haspopup="menu"
                    aria-expanded={isOpen}
                />
            </div>

            {isOpen && (
                <div
                    ref={menuRef}
                    className={panelCls}
                    role="menu"
                    aria-label={ariaLabel}
                    onKeyDown={onMenuKeyDown}
                >
                    {typeof renderPanel === 'function'
                        ? renderPanel({ close: () => setOpen(false), isOpen })
                        : items.map((t, i) => {
                              const isChecked = selectedKey === t.key;
                              return (
                                  <ToolBtn
                                      key={t.key}
                                      ref={(el) => (itemRefs.current[i] = el)}
                                      variant="menu"
                                      className={cx(
                                          itemCls,
                                          isChecked && checked
                                      )}
                                      onClick={() => {
                                          if (t.disabled) return;
                                          onSelect?.(t.key);
                                          if (closeOnSelect) setOpen(false);
                                      }}
                                      role={
                                          selectedKey != null
                                              ? 'menuitemradio'
                                              : 'menuitem'
                                      }
                                      aria-checked={
                                          selectedKey != null
                                              ? isChecked
                                              : undefined
                                      }
                                      aria-disabled={t.disabled || undefined}
                                      disabled={t.disabled}
                                      title={t.label}
                                      active={isChecked}
                                  >
                                      {t.icon ? (
                                          <span className={iconCls}>
                                              {t.icon}
                                          </span>
                                      ) : null}
                                      <span>{t.label}</span>
                                  </ToolBtn>
                              );
                          })}
                </div>
            )}
        </div>
    );
};

export { DropDown };

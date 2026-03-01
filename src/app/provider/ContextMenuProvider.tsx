import React, { createContext, useContext, useState, useCallback, useLayoutEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { Menu } from "@jho951/ui-components";
import type { MenuConfig } from "@app/provider/provider.types.ts";

const ContextMenuContext = createContext<{
    openMenu: (config: MenuConfig) => void;
    closeMenu: () => void;
} | null>(null);

export const ContextMenuProvider = ({ children }: { children: React.ReactNode }) => {
    const [config, setConfig] = useState<MenuConfig | null>(null);
    const menuRef = useRef<HTMLDivElement>(null);

    const openMenu = useCallback((newConfig: MenuConfig) => setConfig(newConfig), []);
    const closeMenu = useCallback(() => setConfig(null), []);

    useLayoutEffect(() => {
        if (!config || !menuRef.current) return;

        const rect = menuRef.current.getBoundingClientRect();
        const screenW = window.innerWidth;
        const screenH = window.innerHeight;
        let x = config.x - rect.width;
        let y = config.y;

        if (x < 12) x = 12;
        if (x + rect.width > screenW) x = screenW - rect.width - 12;
        if (y + rect.height > screenH) y = screenH - rect.height - 12;

        menuRef.current.style.left = `${x}px`;
        menuRef.current.style.top = `${y}px`;
        menuRef.current.style.visibility = "visible";
    }, [config]);

    return (
        <ContextMenuContext.Provider value={{ openMenu, closeMenu }}>
            {children}
            {config ? createPortal(
                <>
                    <div
                        onClick={closeMenu}
                        style={{ position: "fixed", inset: 0, zIndex: 999 }}
                    />
                    <div
                        ref={menuRef}
                        style={{
                            position: "fixed",
                            zIndex: 1000,
                            visibility: "hidden",
                            minWidth: 160,
                            background: "white",
                            borderRadius: 8,
                            boxShadow: "0 8px 24px rgba(0,0,0,0.12)",
                            border: "1px solid #e5e7eb",
                            padding: 6,
                        }}
                    >
                        <Menu
                            items={config.items.map((item, index) => ({
                                id: String(index),
                                label: item.label,
                                danger: item.danger,
                                onSelect: item.onClick,
                            }))}
                            onRequestClose={closeMenu}
                        />
                    </div>
                </>,
                document.body
            ) : null}
        </ContextMenuContext.Provider>
    );
};

export const useContextMenuTrigger = () => {
    const context = useContext(ContextMenuContext);
    if (!context) throw new Error("useContextMenuTrigger must be used within Provider");
    return context;
};

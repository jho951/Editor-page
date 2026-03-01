import { useEffect } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";


import type { AppDispatch } from "@app/store/store.ts";

import {Lnb} from "@features/layout/ui/lnb/Lnb.tsx";
import {Gnb} from "@features/layout/ui/gnb/Gnb.tsx";
import { layoutActions } from "@features/layout/state/layout.slice.ts";
import {
    selectSidebarActiveKey,
    selectRecentDocIds,
    selectPinnedDocIds,
    selectLastLocation,
} from "@features/layout/state/layout.selector.ts";
import {findDocById} from "@features/document/lib/catalog.ts";
import {shortcutsActions} from "@features/shortcuts/state/shortcuts.slice.ts";
import type {LnbActiveKey} from "@features/layout/ui/lnb/Lnb.types.ts";

import styles from './AppRouter.module.css'

function pathToActiveKey(pathname: string): LnbActiveKey {
    if (pathname === "/") return "home";
    if (pathname.startsWith("/documents")) return "allDocs";
    if (pathname.startsWith("/templates")) return "template";
    if (pathname.startsWith("/shared")) return "shared";
    if (pathname.startsWith("/delete")) return "trash";
    if (pathname.startsWith("/doc/")) {
        const parts = pathname.split("/");
        const id = parts[2];
        return `folder:${id}` as LnbActiveKey;
    }

    if (pathname.startsWith("/folder/")) return `folder:${pathname.split("/folder/")[1]}` as LnbActiveKey;
    return "home";
}

function activeKeyToPath(key: LnbActiveKey): string {
    if (key === "home") return "/";
    if (key === "allDocs") return "/documents";
    if (key === "newDocument") return "/new";
    if (key === "shared") return "/shared";
    if (key === "template") return "/templates";
    if (key === "trash") return "/delete";
    if (key === "settings") return "/settings";
    if (String(key).startsWith("folder:")) return `/doc/${String(key).slice("folder:".length)}`;
    return "/";
}


function AppRouter() {
    const dispatch = useDispatch<AppDispatch>();
    const location = useLocation();
    const navigate = useNavigate();

    useEffect(() => {
        if (location.pathname.startsWith("/doc/") && location.pathname.endsWith("/canvas")) {
            dispatch(shortcutsActions.setScope("canvas"));
        } else {
            dispatch(shortcutsActions.setScope("text"));
        }
    }, [location.pathname, dispatch]);

    const activeKey = useSelector(selectSidebarActiveKey);
    const recentIds = useSelector(selectRecentDocIds);
    const pinnedIds = useSelector(selectPinnedDocIds);
    const lastLocation = useSelector(selectLastLocation);

    const recentDocs = recentIds
        .map((id) => {
            const doc = findDocById(id);
            return doc ? { id: doc.id, title: doc.title } : null;
        })
        .filter(Boolean) as { id: string; title: string }[];

    const pinnedDocs = pinnedIds
        .map((id) => {
            const doc = findDocById(id);
            return doc ? { id: doc.id, title: doc.title } : null;
        })
        .filter(Boolean) as { id: string; title: string }[];

    useEffect(() => {
        const nextKey = pathToActiveKey(location.pathname);
        if (nextKey !== activeKey) {
            dispatch(layoutActions.setActiveKey(nextKey));
        }
    }, [location.pathname, activeKey, dispatch]);

    return (
        <div className={styles.wrap}>
            <Lnb
                activeKey={activeKey}
                onNavigate={(key) => {
                    dispatch(layoutActions.setActiveKey(key));
                    navigate(activeKeyToPath(key));
                }}
                recentDocs={recentDocs}
                pinnedDocs={pinnedDocs}
                lastLocation={lastLocation}
                onOpenDoc={(docId) => navigate(`/doc/${docId}`)}
                onResumeLast={(loc) => navigate(`/doc/${loc.docId}/${loc.mode}`)}
            />
            <div className={styles.main}>
                <Gnb profile="YiJangHo" />

                <main className={styles.content}>
                    <Outlet />
                </main>

            </div>
        </div>
    );
}

export { AppRouter };

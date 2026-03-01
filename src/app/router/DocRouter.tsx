import React, { useEffect } from "react";
import { Outlet, useLocation, useNavigate, useParams } from "react-router-dom";
import { useDispatch } from "react-redux";

import { layoutActions } from "@features/layout/state/layout.slice.ts";
import {findDocById} from "@features/document/lib/catalog.ts";

type Mode = "text" | "canvas";

function detectMode(pathname: string): Mode | null {
  const segs = pathname.split("/").filter(Boolean);
  const last = segs[segs.length - 1];

  if (last === "text" || last === "canvas") return last;
  return null;
}

 function DocRouter(): React.ReactElement {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();

  useEffect(() => {
    if (!id) return;
    const mode = detectMode(location.pathname);
    if (mode) return;

    const doc = findDocById(id);
    const defaultMode: Mode = doc?.editor === "canvas" ? "canvas" : "text";
    navigate(`/doc/${id}/${defaultMode}`, { replace: true });
  }, [id, location.pathname, navigate]);

  useEffect(() => {
    if (!id) return;
    const mode = detectMode(location.pathname);
    if (!mode) return;

    dispatch(layoutActions.recordRecent(id));
    dispatch(layoutActions.setLastLocation({ docId: id, mode }));
  }, [dispatch, id, location.pathname]);

  return <Outlet />;
}

export {DocRouter};
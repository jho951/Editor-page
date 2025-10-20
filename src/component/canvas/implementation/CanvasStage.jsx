// ============================
// File structure proposal
// ============================
// src/component/canvas/stage/CanvasStage.jsx
// src/component/canvas/stage/constants.js
// src/component/canvas/stage/util/canvas.js
// src/component/canvas/stage/util/picking.js
// src/component/canvas/stage/util/geometry.js
// src/component/canvas/stage/util/paths.js
// src/component/canvas/stage/util/text.js
// src/component/canvas/stage/util/view.js
// src/component/canvas/stage/render/vector.js
// src/component/canvas/stage/render/hitmap.js
// src/component/canvas/stage/render/overlay.js
// src/component/canvas/stage/hooks/useStableSize.js
// src/component/canvas/stage/hooks/useCanvasHotkeys.js
// src/component/canvas/stage/hooks/useStageInteractions.js
// src/component/canvas/stage/TextEditorOverlay.jsx







// ──────────────────────────────────────────────────────────────────────────────
// src/component/canvas/stage/util/text.js
// ──────────────────────────────────────────────────────────────────────────────
export function wrapLines(ctx, text, maxW) {
  const words = (text || '').split(/\s+/);
  const lines = []; let line = '';
  for (const w of words) {
    const test = line ? line + ' ' + w : w;
    if (ctx.measureText(test).width <= maxW || line === '') line = test;
    else { lines.push(line); line = w; }
  }
  if (line) lines.push(line);
  return lines;
}

// ──────────────────────────────────────────────────────────────────────────────
// src/component/canvas/stage/util/view.js
// ──────────────────────────────────────────────────────────────────────────────
export function screenToWorld(view, xs, ys) {
  const { scale, tx, ty } = view;
  return { x: (xs - tx) / scale, y: (ys - ty) / scale };
}
export function worldToScreen(view, xw, yw) {
  const { scale, tx, ty } = view;
  return { x: xw * scale + tx, y: yw * scale + ty };
}

// ──────────────────────────────────────────────────────────────────────────────
// src/component/canvas/stage/render/vector.js
// ──────────────────────────────────────────────────────────────────────────────
import { denormPath } from '../util/geometry';
import { drawLinePath, drawEllipsePath, drawPolygonPath, drawStarPath, strokePath } from '../util/paths';
import { wrapLines } from '../util/text';

export function renderVector(ctx, shapes, view, { editingId } = {}) {
  ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
  ctx.save();
  const { scale, tx, ty } = view;
  ctx.translate(tx, ty);
  ctx.scale(scale, scale);

  for (const s of shapes) {
    ctx.save();
    ctx.lineWidth = (s.strokeWidth || 2) / scale;
    ctx.strokeStyle = s.stroke || '#333';
    ctx.fillStyle = s.fill ?? (s.type === 'line' ? undefined : '#fff');

    if (s.type === 'rect') {
      if (s.fill) ctx.fillRect(s.x, s.y, s.w, s.h);
      ctx.strokeRect(s.x, s.y, s.w, s.h);
    } else if (s.type === 'line') {
      drawLinePath(ctx, s.x, s.y, s.w, s.h);
      ctx.stroke();
    } else if (s.type === 'path') {
      const pts = denormPath(s.path, s.x, s.y, s.w, s.h);
      ctx.lineCap = 'round'; ctx.lineJoin = 'round';
      strokePath(ctx, pts);
    } else if (s.type === 'text') {
      if (editingId === s.id) { ctx.restore(); continue; }
      const font = s.font || '16px sans-serif';
      const color = s.color || '#111';
      const align = s.align || 'left';
      const lh = s.lineHeight || 1.3;
      ctx.font = font; ctx.textBaseline = 'top'; ctx.fillStyle = color;
      const lines = wrapLines(ctx, s.text || '', Math.max(0, s.w));
      const lhPx = parseInt(font, 10) * lh;
      let x = s.x; if (align === 'center') x = s.x + s.w / 2; else if (align === 'right') x = s.x + s.w;
      ctx.textAlign = align;
      for (let i = 0; i < lines.length; i++) {
        const yy = s.y + i * lhPx;
        if (yy > s.y + s.h) break;
        ctx.fillText(lines[i], x, yy, s.w);
      }
    } else {
      if (s.type === 'ellipse') drawEllipsePath(ctx, s.x, s.y, s.w, s.h);
      else if (s.type === 'polygon') drawPolygonPath(ctx, s.x, s.y, s.w, s.h, s.sides || 5);
      else if (s.type === 'star') drawStarPath(ctx, s.x, s.y, s.w, s.h, s.points || 5, s.innerRatio || 0.5);
      if (s.fill) ctx.fill();
      ctx.stroke();
    }
    ctx.restore();
  }
  ctx.restore();
}

// ──────────────────────────────────────────────────────────────────────────────
// src/component/canvas/stage/render/hitmap.js
// ──────────────────────────────────────────────────────────────────────────────
import { idToRGB } from '../util/picking';
import { denormPath } from '../util/geometry';
import { drawLinePath, drawEllipsePath, drawPolygonPath, drawStarPath, strokePath } from '../util/paths';

export function renderHitmap(ctx, shapes, view) {
  ctx.save();
  ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
  ctx.imageSmoothingEnabled = false;
  const { scale, tx, ty } = view;
  ctx.translate(tx, ty);
  ctx.scale(scale, scale);

  for (const s of shapes) {
    const { r, g, b } = idToRGB(s.pickId);
    const col = `rgb(${r},${g},${b})`;
    ctx.fillStyle = col; ctx.strokeStyle = col;

    if (s.type === 'rect') {
      ctx.fillRect(s.x, s.y, s.w, s.h);
      ctx.lineWidth = Math.max((s.strokeWidth || 2) / scale, 8 / scale);
      ctx.strokeRect(s.x, s.y, s.w, s.h);
    } else if (s.type === 'line') {
      drawLinePath(ctx, s.x, s.y, s.w, s.h);
      ctx.lineWidth = Math.max(s.strokeWidth || 2, 12);
      ctx.stroke();
    } else if (s.type === 'path') {
      const pts = denormPath(s.path, s.x, s.y, s.w, s.h);
      ctx.lineCap = 'round'; ctx.lineJoin = 'round';
      ctx.lineWidth = Math.max(s.strokeWidth || 2, 16);
      strokePath(ctx, pts);
    } else if (s.type === 'text') {
      ctx.fillRect(s.x, s.y, s.w, s.h);
      ctx.lineWidth = 6; ctx.strokeRect(s.x, s.y, s.w, s.h);
    } else {
      if (s.type === 'ellipse') drawEllipsePath(ctx, s.x, s.y, s.w, s.h);
      else if (s.type === 'polygon') drawPolygonPath(ctx, s.x, s.y, s.w, s.h, s.sides || 5);
      else if (s.type === 'star') drawStarPath(ctx, s.x, s.y, s.w, s.h, s.points || 5, s.innerRatio || 0.5);
      ctx.fill(); ctx.lineWidth = Math.max(s.strokeWidth || 2, 8); ctx.stroke();
    }
  }
  ctx.restore();
}

// ──────────────────────────────────────────────────────────────────────────────
// src/component/canvas/stage/render/overlay.js
// ──────────────────────────────────────────────────────────────────────────────
export function renderOverlay(ctx, focusedShape, view) {
  ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
  if (!focusedShape) return;
  ctx.save();
  const { scale, tx, ty } = view;
  ctx.translate(tx, ty);
  ctx.scale(scale, scale);

  ctx.setLineDash([6, 4]);
  ctx.strokeStyle = 'rgb(76,139,245)';
  ctx.lineWidth = 1;
  ctx.strokeRect(focusedShape.x, focusedShape.y, focusedShape.w, focusedShape.h);

  ctx.setLineDash([]);
  ctx.fillStyle = '#fff';
  ctx.strokeStyle = 'rgb(76,139,245)';
  ctx.lineWidth = 1;
  const s = 8;
  const f = focusedShape;
  const midX = f.x + f.w / 2, midY = f.y + f.h / 2;
  const boxes = [
    { x: f.x - s/2, y: f.y - s/2 },
    { x: midX - s/2, y: f.y - s/2 },
    { x: f.x + f.w - s/2, y: f.y - s/2 },
    { x: f.x - s/2, y: midY - s/2 },
    { x: f.x + f.w - s/2, y: midY - s/2 },
    { x: f.x - s/2, y: f.y + f.h - s/2 },
    { x: midX - s/2, y: f.y + f.h - s/2 },
    { x: f.x + f.w - s/2, y: f.y + f.h - s/2 },
  ];
  for (const r of boxes) { ctx.fillRect(r.x, r.y, s, s); ctx.strokeRect(r.x, r.y, s, s); }
  ctx.restore();
}

// ──────────────────────────────────────────────────────────────────────────────
// src/component/canvas/stage/hooks/useStableSize.js
// ──────────────────────────────────────────────────────────────────────────────
import { useEffect, useRef, useState } from 'react';
import { MIN_CSS, RETRY_FRAMES } from '../../stage/constants';

export function useStableSize(wrapRef, init = { w: 640, h: 420 }) {
  const [size, setSize] = useState(init);
  const lastGood = useRef(init);

  useEffect(() => {
    const el = wrapRef.current; if (!el) return;
    let raf = null, frames = 0;

    const measure = () => {
      const r = el.getBoundingClientRect();
      const w = Math.round(r.width), h = Math.round(r.height);
      if (w >= MIN_CSS && h >= MIN_CSS) { lastGood.current = { w, h }; setSize({ w, h }); return true; }
      setSize({ ...lastGood.current }); return false;
    };

    const tick = () => { frames += 1; measure(); if (frames < RETRY_FRAMES) raf = requestAnimationFrame(tick); };
    tick();

    const ro = new ResizeObserver(() => measure()); ro.observe(el);
    let io = null;
    if ('IntersectionObserver' in window) {
      io = new IntersectionObserver(() => measure(), { threshold: [0, 0.01, 1] });
      io.observe(el);
    }
    const onVis = () => measure(); document.addEventListener('visibilitychange', onVis);

    return () => { cancelAnimationFrame(raf); ro.disconnect(); io && io.disconnect(); document.removeEventListener('visibilitychange', onVis); };
  }, [wrapRef]);

  return { size, lastGood };
}

// ──────────────────────────────────────────────────────────────────────────────
// src/component/canvas/stage/hooks/useCanvasHotkeys.js
// ──────────────────────────────────────────────────────────────────────────────
import { useEffect } from 'react';

export function useCanvasHotkeys({ dispatch, focusRef, editingRef, actions }) {
  const { historyStart, deleteFocused, undo, redo } = actions;

  useEffect(() => {
    function onKeyDown(e) {
      const tag = e.target?.tagName;
      const typing = tag === 'INPUT' || tag === 'TEXTAREA' || e.target?.isContentEditable;

      if (!typing && !editingRef.current) {
        const isMac = navigator.platform.toLowerCase().includes('mac');
        const cmd = isMac ? e.metaKey : e.ctrlKey;
        if (cmd && e.key.toLowerCase() === 'z') { e.preventDefault(); if (e.shiftKey) dispatch(redo()); else dispatch(undo()); return; }
        if (cmd && e.key.toLowerCase() === 'y') { e.preventDefault(); dispatch(redo()); return; }
      }

      if ((e.key === 'Backspace' || e.key === 'Delete') && !typing) {
        if (focusRef.current == null) return;
        e.preventDefault();
        dispatch(historyStart());
        dispatch(deleteFocused());
      }
    }
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [dispatch, focusRef, editingRef, actions]);
}

// ──────────────────────────────────────────────────────────────────────────────
// src/component/canvas/stage/hooks/useStageInteractions.js
// ──────────────────────────────────────────────────────────────────────────────
import { useEffect, useRef } from 'react';
import { DPR, MIN_SCALE, MAX_SCALE } from '../constants';
import { pickIdAt } from '../util/picking';
import { screenToWorld } from '../util/view';
import { drawEllipsePath, drawPolygonPath, drawStarPath, drawLinePath } from '../util/paths';
import { denormPath, computeBBox, normalizePath } from '../util/geometry';

export function useStageInteractions(params) {
  const {
    ovRef, hitRef, viewRef, toolRef, shapesRef, focusRef,
    polygonSides, starPoints, starInnerRatio,
    dispatch,
    actions, // { setView, setTool, setFocus, clearFocus, historyStart, addShape, moveShape, resizeShape }
    beginTextEdit,
  } = params;

  const dragRef = useRef(null); // { type, start, id, handle, origBBox, last, tool, path:[] }

  useEffect(() => {
    const ov = ovRef.current; if (!ov) return;

    function toCanvasPt(e) {
      const rect = ov.getBoundingClientRect();
      const xs = ((e.clientX - rect.left) * (ov.width / rect.width)) / DPR();
      const ys = ((e.clientY - rect.top) * (ov.height / rect.height)) / DPR();
      return screenToWorld(viewRef.current, xs, ys);
    }

    function hitHandle(pt, bbox, s = 8) {
      const { x, y, w, h } = bbox;
      const corners = {
        nw: { x: x - s/2, y: y - s/2, w: s, h: s },
        ne: { x: x + w - s/2, y: y - s/2, w: s, h: s },
        sw: { x: x - s/2, y: y + h - s/2, w: s, h: s },
        se: { x: x + w - s/2, y: y + h - s/2, w: s, h: s },
      };
      const edges = {
        n: { x: x + s/2, y: y - s/2, w: Math.max(0, w - s), h: s },
        s: { x: x + s/2, y: y + h - s/2, w: Math.max(0, w - s), h: s },
        w: { x: x - s/2, y: y + s/2, w: s, h: Math.max(0, h - s) },
        e: { x: x + w - s/2, y: y + s/2, w: s, h: Math.max(0, h - s) },
      };
      const hit = (r) => pt.x >= r.x && pt.x <= r.x + r.w && pt.y >= r.y && pt.y <= r.y + r.h;
      for (const k of ['n','s','e','w']) { const r = edges[k]; if (r.w > 0 && r.h > 0 && hit(r)) return k; }
      for (const k of ['nw','ne','sw','se']) { const r = corners[k]; if (hit(r)) return k; }
      return null;
    }

    function drawPreview(ctx, start, p, t) {
      const x = Math.min(start.x, p.x), y = Math.min(start.y, p.y);
      const w = Math.abs(p.x - start.x), h = Math.abs(p.y - start.y);
      ctx.setLineDash([6,4]); ctx.strokeStyle = 'rgb(76,139,245)'; ctx.lineWidth = 1;
      if (t === 'rect') ctx.strokeRect(x, y, w, h);
      else if (t === 'line') { ctx.beginPath(); ctx.moveTo(start.x, start.y); ctx.lineTo(p.x, p.y); ctx.stroke(); }
      else if (t === 'freedraw') {
        const ds = dragRef.current; const pts = ds?.path || [];
        ctx.setLineDash([]); ctx.lineWidth = 1; ctx.strokeStyle = 'rgb(76,139,245)'; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
        if (pts.length > 1) { ctx.beginPath(); ctx.moveTo(pts[0].x, pts[0].y); for (let i=1;i<pts.length;i++) ctx.lineTo(pts[i].x, pts[i].y); ctx.stroke(); }
        return;
      } else {
        ctx.setLineDash([]); ctx.beginPath();
        if (t === 'ellipse') drawEllipsePath(ctx, x, y, w, h);
        else if (t === 'polygon') drawPolygonPath(ctx, x, y, w, h, polygonSides);
        else if (t === 'star') drawStarPath(ctx, x, y, w, h, starPoints, starInnerRatio);
        ctx.stroke();
      }
    }

    function bboxByHandle(handle, p, orig) {
      switch (handle) {
        case 'nw': return { x: Math.min(orig.x + orig.w, p.x), y: Math.min(orig.y + orig.h, p.y), w: Math.abs(orig.x + orig.w - p.x), h: Math.abs(orig.y + orig.h - p.y) };
        case 'ne': return { x: Math.min(orig.x, p.x), y: Math.min(orig.y + orig.h, p.y), w: Math.abs(p.x - orig.x), h: Math.abs(orig.y + orig.h - p.y) };
        case 'sw': return { x: Math.min(orig.x + orig.w, p.x), y: Math.min(orig.y, p.y), w: Math.abs(orig.x + orig.w - p.x), h: Math.abs(p.y - orig.y) };
        case 'se': return { x: Math.min(orig.x, p.x), y: Math.min(orig.y, p.y), w: Math.abs(p.x - orig.x), h: Math.abs(p.y - orig.y) };
        case 'n':  return { x: orig.x, y: Math.min(orig.y + orig.h, p.y), w: orig.w, h: Math.abs(orig.y + orig.h - p.y) };
        case 's':  return { x: orig.x, y: Math.min(orig.y, p.y), w: orig.w, h: Math.abs(p.y - orig.y) };
        case 'w':  return { x: Math.min(orig.x + orig.w, p.x), y: orig.y, w: Math.abs(orig.x + orig.w - p.x), h: orig.h };
        case 'e':  return { x: Math.min(orig.x, p.x), y: orig.y, w: Math.abs(p.x - orig.x), h: orig.h };
        default:   return { ...orig };
      }
    }

    function onDbl(e) {
      if (toolRef.current !== 'select') return;
      const id = pickIdAt(hitRef.current, e.clientX, e.clientY); if (id == null) return;
      const found = shapesRef.current.find((s) => s.pickId === id);
      if (found) { dispatch(actions.setFocus(found.id)); focusRef.current = found.id; if (found.type === 'text') beginTextEdit(found); }
      else { dispatch(actions.clearFocus()); focusRef.current = null; }
    }

    function onDown(e) {
      e.preventDefault();
      const p = toCanvasPt(e);
      const currentTool = toolRef.current;

      const rect = ov.getBoundingClientRect();
      const xs = ((e.clientX - rect.left) * (ov.width / rect.width)) / DPR();
      const ys = ((e.clientY - rect.top) * (ov.height / rect.height)) / DPR();

      const isPan = e.button === 1 || e.buttons === 4 || e.shiftKey || e.code === 'Space' || e.key === ' ';
      if (isPan) { dragRef.current = { type: 'pan', startScreen: { xs, ys } }; return; }

      if (currentTool !== 'select') {
        if (currentTool === 'freedraw') { dragRef.current = { type: 'freedraw', start: p, tool: currentTool, path: [p] }; }
        else if (currentTool === 'text') { dragRef.current = { type: 'draw', start: p, tool: 'text' }; return; }
        else { dragRef.current = { type: 'draw', start: p, tool: currentTool }; }
        return;
      }

      const fid = focusRef.current;
      if (fid != null) {
        const f = shapesRef.current.find((s) => s.id === fid);
        if (f) {
          const hh = hitHandle(p, { x: f.x, y: f.y, w: f.w, h: f.h }, 8);
          if (hh) { dispatch(actions.historyStart()); dragRef.current = { type: 'resize', id: f.id, handle: hh, start: p, origBBox: { ...f } }; return; }
          if (p.x >= f.x && p.x <= f.x + f.w && p.y >= f.y && p.y <= f.y + f.h) { dispatch(actions.historyStart()); dragRef.current = { type: 'move', id: f.id, start: p }; return; }
        }
      }

      const pickedId = pickIdAt(hitRef.current, e.clientX, e.clientY);
      if (pickedId != null) {
        const target = shapesRef.current.find((s) => s.pickId === pickedId);
        if (target) {
          if (focusRef.current !== target.id) { dispatch(actions.setFocus(target.id)); focusRef.current = target.id; }
          const hh = hitHandle(p, { x: target.x, y: target.y, w: target.w, h: target.h }, 8);
          if (hh) { dispatch(actions.historyStart()); dragRef.current = { type: 'resize', id: target.id, handle: hh, start: p, origBBox: { ...target } }; return; }
          if (p.x >= target.x && p.x <= target.x + target.w && p.y >= target.y && p.y <= target.y + target.h) { dispatch(actions.historyStart()); dragRef.current = { type: 'move', id: target.id, start: p }; return; }
        }
      }
      dragRef.current = { type: 'maybeClear', start: p };
    }

    function onMove(e) {
      const ds = dragRef.current; if (!ds) return;
      const p = toCanvasPt(e);

      if (ds.type === 'maybeClear') return;
      if (ds.type === 'draw') {
        const octx = ovRef.current.getContext('2d');
        octx.clearRect(0, 0, ovRef.current.width, ovRef.current.height);
        drawPreview(octx, ds.start, p, ds.tool); ds.last = p; return;
      }
      if (ds.type === 'move') { const dx = p.x - ds.start.x, dy = p.y - ds.start.y; dispatch(actions.moveShape({ id: ds.id, dx, dy })); ds.start = p; return; }
      if (ds.type === 'resize') { const nb = bboxByHandle(ds.handle, p, ds.origBBox); const x = nb.x, y = nb.y, w = Math.max(1, nb.w), h = Math.max(1, nb.h); dispatch(actions.resizeShape({ id: ds.id, x, y, w, h })); return; }
      if (ds.type === 'freedraw') {
        const last = ds.path[ds.path.length - 1]; if (!last || Math.hypot(p.x - last.x, p.y - last.y) >= 1) ds.path.push(p);
        const octx = ovRef.current.getContext('2d'); octx.clearRect(0, 0, ovRef.current.width, ovRef.current.height); drawPreview(octx, ds.start, p, 'freedraw'); ds.last = p; return;
      }
      if (ds.type === 'pan') {
        const rect = ov.getBoundingClientRect();
        const xs = ((e.clientX - rect.left) * (ov.width / rect.width)) / DPR();
        const ys = ((e.clientY - rect.top) * (ov.height / rect.height)) / DPR();
        const dx = xs - ds.startScreen.xs; const dy = ys - ds.startScreen.ys;
        const { scale, tx, ty } = viewRef.current;
        dispatch(actions.setView({ tx: tx + dx, ty: ty + dy }));
        ds.startScreen = { xs, ys }; return;
      }
    }

    function onUp(e) {
      const ds = dragRef.current; if (!ds) return;
      if (ds.type === 'maybeClear') {
        const end = toCanvasPt(e);
        if (Math.hypot(ds.start.x - end.x, ds.start.y - end.y) <= 3) { dispatch(actions.clearFocus()); focusRef.current = null; }
      } else if (ds.type === 'draw') {
        const end = ds.last || ds.start; const tool = ds.tool || toolRef.current;
        const x = Math.min(ds.start.x, end.x), y = Math.min(ds.start.y, end.y);
        const w = tool === 'line' ? end.x - ds.start.x : Math.abs(end.x - ds.start.x);
        const h = tool === 'line' ? end.y - ds.start.y : Math.abs(end.y - ds.start.y);
        const minOK = tool === 'line' ? Math.abs(w) + Math.abs(h) >= 2 : w >= 2 && h >= 2;
        if (minOK) {
          dispatch(actions.historyStart());
          const payload = { type: tool, x: tool === 'line' ? ds.start.x : x, y: tool === 'line' ? ds.start.y : y, w, h };
          if (tool === 'text') Object.assign(payload, { text: '', font: '16px sans-serif', color: '#111', align: 'left', lineHeight: 1.3 });
          if (tool === 'polygon') payload.sides = polygonSides;
          if (tool === 'star') { payload.points = starPoints; payload.innerRatio = starInnerRatio; }
          dispatch(actions.addShape(payload));
          if (tool === 'text') setTimeout(() => { const f = shapesRef.current.find((s) => s.type === 'text' && s.id === focusRef.current); if (f) beginTextEdit(f); }, 0);
          dispatch(actions.setTool('select'));
        }
        const octx = ovRef.current.getContext('2d'); octx.clearRect(0, 0, ovRef.current.width, ovRef.current.height);
      } else if (ds.type === 'freedraw') {
        const pts = ds.path || []; const bbox = computeBBox(pts);
        if (pts.length >= 2 && bbox) {
          dispatch(actions.historyStart());
          let { minX, minY, w, h } = bbox; const MIN_SIDE = 2;
          if (w < MIN_SIDE) { const pad = (MIN_SIDE - w) / 2; minX -= pad; w = MIN_SIDE; }
          if (h < MIN_SIDE) { const pad = (MIN_SIDE - h) / 2; minY -= pad; h = MIN_SIDE; }
          const pathUV = normalizePath(pts, { minX, minY, w, h });
          dispatch(actions.addShape({ type: 'path', x: minX, y: minY, w, h, path: pathUV, strokeWidth: 2 }));
          dispatch(actions.setTool('select'));
        }
        const octx = ovRef.current.getContext('2d'); octx.clearRect(0, 0, ovRef.current.width, ovRef.current.height);
      }
      if (ds.type === 'pan') { dragRef.current = null; return; }
      dragRef.current = null;
    }

    function onWheel(e) {
      const delta = e.deltaY; e.preventDefault();
      const rect = ov.getBoundingClientRect();
      const xs = ((e.clientX - rect.left) * (ov.width / rect.width)) / DPR();
      const ys = ((e.clientY - rect.top) * (ov.height / rect.height)) / DPR();
      const { scale, tx, ty } = viewRef.current;
      const zoom = Math.exp(-delta * 0.0015);
      const newScale = Math.min(MAX_SCALE, Math.max(MIN_SCALE, scale * zoom));
      if (newScale !== scale) {
        const wx = (xs - tx) / scale, wy = (ys - ty) / scale; // world point under cursor
        const ntx = xs - wx * newScale; const nty = ys - wy * newScale;
        dispatch(actions.setView({ scale: newScale, tx: ntx, ty: nty }));
      }
    }

    ov.addEventListener('dblclick', onDbl);
    ov.addEventListener('mousedown', onDown);
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
    ov.addEventListener('wheel', onWheel, { passive: false });

    return () => {
      ov.removeEventListener('dblclick', onDbl);
      ov.removeEventListener('mousedown', onDown);
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
      ov.removeEventListener('wheel', onWheel);
    };
  }, [ovRef, hitRef, viewRef, toolRef, shapesRef, focusRef, polygonSides, starPoints, starInnerRatio, dispatch, actions, beginTextEdit]);
}

// ──────────────────────────────────────────────────────────────────────────────
// src/component/canvas/stage/TextEditorOverlay.jsx
// ──────────────────────────────────────────────────────────────────────────────
import React, { useEffect } from 'react';
import { worldToScreen } from './util/view';

export default function TextEditorOverlay({ shape, view, textareaRef, onCommit, onCancel }) {
  if (!shape) return null;
  const { x: left, y: top } = worldToScreen(view, shape.x, shape.y);
  const { x: right, y: bottom } = worldToScreen(view, shape.x + shape.w, shape.y + shape.h);
  const width = right - left; const height = bottom - top;

  useEffect(() => { textareaRef.current && textareaRef.current.focus(); }, [textareaRef]);

  const style = {
    position: 'absolute', left, top, width, height, zIndex: 10000,
    padding: 4, margin: 0, border: '1px solid var(--overlay-marquee-stroke)',
    outline: 'none', background: 'transparent', color: shape.color || '#111',
    font: shape.font || '16px sans-serif', lineHeight: shape.lineHeight || 1.3,
    resize: 'none', overflow: 'auto', whiteSpace: 'pre-wrap',
  };

  return (
    <textarea
      ref={textareaRef}
      style={style}
      defaultValue={shape.text || ''}
      onBlur={() => onCommit(textareaRef.current?.value || '')}
      onKeyDown={(e) => {
        if (e.key === 'Escape') { e.preventDefault(); onCancel(); }
        if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) { e.preventDefault(); onCommit(textareaRef.current?.value || ''); }
      }}
    />
  );
}

// ──────────────────────────────────────────────────────────────────────────────
// src/component/canvas/stage/CanvasStage.jsx
// ──────────────────────────────────────────────────────────────────────────────
import React, { useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
// Redux selectors & actions (keep your original paths)
import { selectShapes, selectFocusId, setFocus, clearFocus, addShape, moveShape, resizeShape, deleteFocused, updateText, historyStart, redo, undo } from '../../lib/redux/slice/canvasSlice';
import { selectTool, selectPoly, selectStarPts, selectStarRatio, setTool, selectView, setView, selectCanvasBg } from '../../lib/redux/slice/uiSlice';

import { DPR } from './constants';
import { setCanvasSize } from './util/canvas';
import { renderVector } from './render/vector';
import { renderHitmap } from './render/hitmap';
import { renderOverlay } from './render/overlay';
import { useStableSize } from './hooks/useStableSize';
import { useCanvasHotkeys } from './hooks/useCanvasHotkeys';
import { useStageInteractions } from './hooks/useStageInteractions';
import TextEditorOverlay from './TextEditorOverlay';

export default function CanvasStage() {
  const [editingId, setEditingId] = useState(null);

  const dispatch = useDispatch();
  const shapes = useSelector(selectShapes);
  const focusId = useSelector(selectFocusId);
  const tool = useSelector(selectTool);
  const polygonSides = useSelector(selectPoly);
  const starPoints = useSelector(selectStarPts);
  const starInnerRatio = useSelector(selectStarRatio);
  const canvasBg = useSelector(selectCanvasBg);
  const view = useSelector(selectView);

  // DOM refs
  const wrapRef = useRef(null);
  const vecRef = useRef(null); const hitRef = useRef(null); const ovRef = useRef(null);
  const textRef = useRef(null);

  // State mirrors in refs
  const shapesRef = useRef(shapes); useEffect(() => { shapesRef.current = shapes; }, [shapes]);
  const focusRef = useRef(focusId); useEffect(() => { focusRef.current = focusId; }, [focusId]);
  const viewRef = useRef({ scale: 1, tx: 0, ty: 0 });
  useEffect(() => { if (!view) return; viewRef.current = { ...viewRef.current, ...view }; requestAnimationFrame(renderAllOnce); }, [view]);
  const toolRef = useRef(tool); useEffect(() => { toolRef.current = tool; }, [tool, polygonSides, starPoints, starInnerRatio]);
  const editingRef = useRef(false);

  // Size
  const { size } = useStableSize(wrapRef, { w: 640, h: 420 });

  // Keep editingId in a ref to sync with vector render skip
  const editingIdRef = useRef(null); useEffect(() => { editingIdRef.current = editingId; }, [editingId]);
  useEffect(() => { if (editingId != null && focusId !== editingId) endTextEdit(true); }, [focusId]);

  // Canvas pixels on size change
  useEffect(() => {
    const { w, h } = size; if (!vecRef.current || !hitRef.current || !ovRef.current) return;
    setCanvasSize(vecRef.current, w, h, { dpr: DPR(), alpha: true });
    setCanvasSize(hitRef.current, w, h, { dpr: DPR(), alpha: false, willRead: true });
    setCanvasSize(ovRef.current, w, h, { dpr: DPR(), alpha: true });
    requestAnimationFrame(renderAllOnce);
  }, [size.w, size.h]);

  // Renderers
  function renderAllOnce() {
    const vctx = vecRef.current?.getContext('2d');
    const hctx = hitRef.current?.getContext('2d');
    const octx = ovRef.current?.getContext('2d');
    if (vctx) renderVector(vctx, shapesRef.current, viewRef.current, { editingId: editingIdRef.current });
    if (hctx) renderHitmap(hctx, shapesRef.current, viewRef.current);
    if (octx) {
      const fid = focusRef.current; const f = shapesRef.current.find((s) => s.id === fid);
      renderOverlay(octx, f, viewRef.current);
    }
  }
  useEffect(() => { renderAllOnce(); }, [shapes, focusId]);

  // Hotkeys (Delete, Undo/Redo)
  useCanvasHotkeys({
    dispatch,
    focusRef,
    editingRef,
    actions: { historyStart, deleteFocused, undo, redo }
  });

  // Text edit helpers
  function beginTextEdit(shape) { setEditingId(shape.id); editingRef.current = true; requestAnimationFrame(renderAllOnce); }
  function endTextEdit(commit = true) {
    const id = editingIdRef.current ?? editingId; const val = textRef.current?.value ?? '';
    if (commit && id != null) { dispatch(historyStart()); dispatch(updateText({ id, text: val })); }
    editingRef.current = false; editingIdRef.current = null; setEditingId(null); requestAnimationFrame(() => requestAnimationFrame(renderAllOnce));
  }

  // Pointer & wheel interactions
  useStageInteractions({
    ovRef, hitRef, viewRef, toolRef, shapesRef, focusRef,
    polygonSides, starPoints, starInnerRatio,
    dispatch,
    actions: { setView, setTool, setFocus, clearFocus, historyStart, addShape, moveShape, resizeShape },
    beginTextEdit,
  });

  return (
    <div className="canvas-outer" style={{ position: 'relative', overflow: 'auto', width: '100%', height: '100%' }}>
      <div className="canvas-stage-wrap fill-viewport" ref={wrapRef} style={{ background: canvasBg }}>
        <canvas ref={vecRef} className="layer-vector" />
        <canvas ref={hitRef} className="layer-hitmap" />
        <canvas ref={ovRef} className="layer-overlay" />
        <div style={{ position: 'absolute', left: 8, top: 8, zIndex: 9999, fontSize: '1.2rem', color: 'var(--text-color)' }}>
          tool: <b>{tool}</b> · 드래그: 도형 생성 · 더블클릭(선택모드): 포커스 · 포커스 후 드래그: 이동/리사이즈 · 빈 곳 클릭: 포커스 해제 · ⌫/Del: 삭제
        </div>
        {editingId != null && (
          <TextEditorOverlay
            shape={shapes.find((v) => v.id === editingId)}
            view={viewRef.current}
            textareaRef={textRef}
            onCommit={(text) => { dispatch(historyStart()); dispatch(updateText({ id: editingId, text })); endTextEdit(false); }}
            onCancel={() => endTextEdit(false)}
          />
        )}
      </div>
    </div>
  );
}

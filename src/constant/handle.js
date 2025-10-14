import { useMemo } from 'react';
import {
    IconEllipse,
    IconFlipH,
    IconFlipV,
    IconFreeDraw,
    IconLine,
    IconPolygon,
    IconRect,
    IconResize,
    IconRotate,
    IconSkew,
    IconStar,
} from '../component/icon/Icon';

/**
 * @file handle.js
 * @author YJH
 * @description 단축키 번호 설정
 */
const HANDLE = {
    NONE: 0,
    N: 1,
    NE: 2,
    E: 3,
    SE: 4,
    S: 5,
    SW: 6,
    W: 7,
    NW: 8,
    ROTATE: 9,
};
const HANDLE_KEYS = [
    HANDLE.N,
    HANDLE.NE,
    HANDLE.E,
    HANDLE.SE,
    HANDLE.S,
    HANDLE.SW,
    HANDLE.W,
    HANDLE.NW,
    HANDLE.ROTATE,
];

const SHAPE_TOOLS = [
    { key: 'shape-rect', label: '사각형', icon: <IconRect /> },
    { key: 'shape-ellipse', label: '원/타원', icon: <IconEllipse /> },
    { key: 'shape-line', label: '직선', icon: <IconLine /> },
    { key: 'shape-polygon', label: '다각형', icon: <IconPolygon /> },
    { key: 'shape-star', label: '별', icon: <IconStar /> },
    { key: 'path', label: '프리드로우', icon: <IconFreeDraw /> },
];

const TRANSFORM_ITEM = [
    { key: 'resize', label: '크기 조정', icon: <IconResize /> },
    { key: 'skew', label: '기울이기', icon: <IconSkew /> },
    { key: 'rotate', label: '회전', icon: <IconRotate /> },
    { key: 'flipH', label: '좌우 뒤집기', icon: <IconFlipH /> },
    { key: 'flipV', label: '상하 뒤집기', icon: <IconFlipV /> },
];

export { HANDLE, HANDLE_KEYS, SHAPE_TOOLS, TRANSFORM_ITEM };

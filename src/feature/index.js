/**
 * @file index.js
 * @author YJH
 */

import { Path } from './path';
import { Line } from './line';
import { Rect } from './rect';
import { Circle } from './circle';
import { Polygon } from './polygon';
import { Star } from './star';

const ShapeMap = {
    path: Path,
    line: Line,
    rect: Rect,
    circle: Circle,
    polygon: Polygon,
    star: Star,
};

export { ShapeMap };

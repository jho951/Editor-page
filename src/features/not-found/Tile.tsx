/**
 * 404 타일 애니메이션 한 조각을 렌더링합니다.
 */

import React from "react";

import { FIXED_COLS, FIXED_ROWS, PADDING, TILE_HEIGHT, TILE_WIDTH } from "@features/not-found/constants.ts";
import { createActiveTiles, getHoverColor } from "@features/not-found/lib.ts";
import type { TileProps } from "@features/not-found/Tile.types.ts";

/**
 * Tile 컴포넌트입니다.
 *
 * @param props 컴포넌트에 전달된 props 객체입니다.
 * @returns 렌더링할 React 엘리먼트를 반환합니다.
 */
function Tile({ x, y, isActive }: TileProps): React.ReactElement {

    const hoverColor = getHoverColor(x, y);

    return (
        <rect
            x={x * TILE_WIDTH + PADDING / 2}
            y={y * TILE_HEIGHT + PADDING / 2}
            width={TILE_WIDTH - PADDING}
            height={TILE_HEIGHT - PADDING}
            rx={(TILE_WIDTH - PADDING) * 0.2}
            fill={isActive ? "rgba(110, 141, 116, 0.8)" : "rgba(61, 53, 45, 0.08)"}
            stroke={hoverColor}
            strokeOpacity={isActive ? 0 : 0.16}
        />
    );
}

/**
 * Not Found Tiles 컴포넌트입니다.
 * @returns 렌더링할 React 엘리먼트를 반환합니다.
 */
function NotFoundTiles(): React.ReactElement {

    const activeTiles = createActiveTiles();

    const svgWidth = FIXED_COLS * TILE_WIDTH;

    const svgHeight = FIXED_ROWS * TILE_HEIGHT;

    return (
        <div>
            <svg width={svgWidth} height={svgHeight} viewBox={`0 0 ${svgWidth} ${svgHeight}`}>
                {Array.from({ length: FIXED_ROWS }).map((_, y) =>
                    Array.from({ length: FIXED_COLS }).map((__, x) => (
                        <Tile key={`${x}-${y}`} x={x} y={y} isActive={activeTiles.has(`${x}-${y}`)} />
                    )),
                )}
            </svg>
        </div>
    );
}

export { Tile };
export default NotFoundTiles;

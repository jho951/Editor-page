import { useMemo, memo } from 'react';
import {Link} from "react-router-dom";

import styles from './NotFound.module.css';

const FIXED_COLS = 30;
const FIXED_ROWS = 15;
const MAX_TILE_WIDTH = 32;
const ASPECT_RATIO = 38 / 32;
const TILE_COLS = 4;
const TILE_ROWS = 7;
const DIGIT_SPACING = 2;

const DIGITS: Record<'4' | '0', string[]> = {
    '4': ['1001', '1001', '1001', '1111', '0001', '0001', '0001'],
    '0': ['0110', '1001', '1001', '1001', '1001', '1001', '0110'],
};

const COLORS = [
    '#FF6B6B', '#FFD93D', '#6BCB77', '#4D96FF', '#B197FC', '#F06595', '#20C997', '#FAB005',
    '#FF922B', '#845EF7', '#339AF0', '#51CF66', '#FCC419', '#FF8787', '#94D82D', '#EEBEFA', '#A5D8FF', '#FFD8A8'
];

const PADDING = 6;
const TILE_WIDTH = MAX_TILE_WIDTH;
const TILE_HEIGHT = TILE_WIDTH * ASPECT_RATIO;

interface TileProps {
    x: number;
    y: number;
    isActive: boolean;
}

const Tile = memo(({ x, y, isActive }: TileProps) => {
    const hoverColor = useMemo(() => {
        const index = (x * 7 + y * 13) % COLORS.length;
        return COLORS[index];
    }, [x, y]);

    return (
        <rect
            x={x * TILE_WIDTH + PADDING / 2}
            y={y * TILE_HEIGHT + PADDING / 2}
            width={TILE_WIDTH - PADDING}
            height={TILE_HEIGHT - PADDING}
            rx={(TILE_WIDTH - PADDING) * 0.2}
            style={{ ['--hover-color' as string]: hoverColor }}
            className={`${styles.tile} ${isActive ? styles.active : styles.inactive}`}
        />
    );
});

Tile.displayName = 'Tile';

export default function NotFound() {
    const svgWidth = FIXED_COLS * TILE_WIDTH;
    const svgHeight = FIXED_ROWS * TILE_HEIGHT;

    const activeTiles = useMemo(() => {
        const newActiveSet = new Set<string>();
        const startCol = Math.floor((FIXED_COLS - (TILE_COLS * 3 + DIGIT_SPACING * 2)) / 2);
        const startRow = Math.floor((FIXED_ROWS - TILE_ROWS) / 2);

        (['4', '0', '4'] as const).forEach((digit, dIndex) => {
            DIGITS[digit].forEach((rowStr, y) => {
                rowStr.split('').forEach((cell, x) => {
                    if (cell === '1') {
                        newActiveSet.add(`${startCol + dIndex * (TILE_COLS + DIGIT_SPACING) + x}-${startRow + y}`);
                    }
                });
            });
        });
        return newActiveSet;
    }, []);

    return (
        <main className={styles.wrapper}>
            <h1>페이지를 <br/> 찾을 수 없습니다.</h1>

            <div className={styles.scrollOuter}>
                <svg
                    width={svgWidth}
                    height={svgHeight}
                    viewBox={`0 0 ${svgWidth} ${svgHeight}`}
                    className={styles.svg}
                >
                    {Array.from({ length: FIXED_ROWS }).map((_, y) =>
                        Array.from({ length: FIXED_COLS }).map((_, x) => (
                            <Tile
                                key={`${x}-${y}`}
                                x={x}
                                y={y}
                                isActive={activeTiles.has(`${x}-${y}`)}
                            />
                        ))
                    )}
                </svg>
            </div>
                <Link className={styles.homeLink} to="/" >
                    홈으로 돌아가기
                </Link>
        </main>
    );
}
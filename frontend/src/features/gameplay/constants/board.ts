import type { TileCoord } from '../types';

export const BOARD_COLS = 8;
export const BOARD_ROWS = 5;

export const PATH_TILES: TileCoord[] = [
  { x: 0, y: 2 },
  { x: 1, y: 2 },
  { x: 2, y: 2 },
  { x: 3, y: 2 },
  { x: 4, y: 2 },
  { x: 5, y: 2 },
  { x: 6, y: 1 },
  { x: 7, y: 1 },
];

export const GAME_TICK_MS = 50;

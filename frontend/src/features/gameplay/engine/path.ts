import { PATH_TILES } from '../constants/board';

export type PathPoint = { x: number; y: number };

export function buildPathPoints(tileSize: number): PathPoint[] {
  return PATH_TILES.map((tile) => ({
    x: tile.x * tileSize + tileSize / 2,
    y: tile.y * tileSize + tileSize / 2,
  }));
}

export function getPathPoint(distance: number, pathPoints: PathPoint[], tileSize: number): PathPoint {
  let remaining = distance;
  for (let i = 0; i < pathPoints.length - 1; i++) {
    if (remaining <= tileSize) {
      const t = remaining / tileSize;
      return {
        x: pathPoints[i].x + (pathPoints[i + 1].x - pathPoints[i].x) * t,
        y: pathPoints[i].y + (pathPoints[i + 1].y - pathPoints[i].y) * t,
      };
    }
    remaining -= tileSize;
  }
  return pathPoints[pathPoints.length - 1];
}

export function getPathLength(tileSize: number): number {
  return (PATH_TILES.length - 1) * tileSize;
}

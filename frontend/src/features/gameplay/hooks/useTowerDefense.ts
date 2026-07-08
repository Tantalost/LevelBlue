import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { PanResponder } from 'react-native';
import { BOARD_COLS, BOARD_ROWS, GAME_TICK_MS, PATH_TILES } from '../constants/board';
import { WAVE_ENEMY_COUNTS, WAVES_PER_STAGE } from '../constants/stages';
import { TOWER_STATS } from '../constants/towers';
import { buildPathPoints, getPathLength, getPathPoint } from '../engine/path';
import type {
  BoardLayout,
  Enemy,
  Tower,
  TowerBuffs,
  TowerType,
} from '../types';
import { landscapeWidth } from '../utils/scaling';

type UseTowerDefenseOptions = {
  stage: number;
  startingGold: number;
  startingBaseHealth: number;
  towerBuffs: TowerBuffs;
  containerW?: number;
  containerH?: number;
};

export function useTowerDefense({
  stage,
  startingGold,
  startingBaseHealth,
  towerBuffs,
  containerW = 0,
  containerH = 0,
}: UseTowerDefenseOptions) {
  const [gameStarted, setGameStarted] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [stageCleared, setStageCleared] = useState(false);
  const [gold, setGold] = useState(startingGold);
  const [baseHealth, setBaseHealth] = useState(startingBaseHealth);
  const [enemies, setEnemies] = useState<Enemy[]>([]);
  const [towers, setTowers] = useState<Tower[]>([]);
  const [currentWave, setCurrentWave] = useState(0);
  const [waveSpawned, setWaveSpawned] = useState(0);
  const [message, setMessage] = useState(
    `Budget: ${startingGold}g — spend it wisely.`,
  );
  const [selectedTowerType, setSelectedTowerType] = useState<TowerType | null>(null);
  const [draggingTower, setDraggingTower] = useState<{ type: TowerType; x: number; y: number } | null>(null);
  const [boardLayout, setBoardLayout] = useState<BoardLayout | null>(null);

  const goldRef = useRef(startingGold);
  const baseHealthRef = useRef(startingBaseHealth);
  const enemiesRef = useRef<Enemy[]>([]);
  const towersRef = useRef<Tower[]>([]);
  const enemyIdRef = useRef(1);
  const towerIdRef = useRef(1);
  const spawnTimerRef = useRef(0);
  const currentWaveRef = useRef(0);
  const waveSpawnedRef = useRef(0);
  const selectedTowerTypeRef = useRef<TowerType | null>(null);
  const boardLayoutRef = useRef<BoardLayout | null>(null);
  const towerBuffsRef = useRef(towerBuffs);

  useEffect(() => { towerBuffsRef.current = towerBuffs; }, [towerBuffs]);
  useEffect(() => { goldRef.current = gold; }, [gold]);
  useEffect(() => { baseHealthRef.current = baseHealth; }, [baseHealth]);
  useEffect(() => { enemiesRef.current = enemies; }, [enemies]);
  useEffect(() => { towersRef.current = towers; }, [towers]);
  useEffect(() => { selectedTowerTypeRef.current = selectedTowerType; }, [selectedTowerType]);
  useEffect(() => { currentWaveRef.current = currentWave; }, [currentWave]);
  useEffect(() => { waveSpawnedRef.current = waveSpawned; }, [waveSpawned]);

  // Compute tileSize from actual available space if measured, else use landscapeWidth estimate
  const tileSize = useMemo(() => {
    if (containerW > 0 && containerH > 0) {
      // Fit board to available container with a small padding
      const tileByCols = Math.floor((containerW - 8) / BOARD_COLS);
      const tileByRows = Math.floor((containerH - 8) / BOARD_ROWS);
      return Math.max(16, Math.min(tileByCols, tileByRows));
    }
    // Fallback before first layout measurement
    return Math.floor((landscapeWidth * 0.6) / BOARD_COLS);
  }, [containerW, containerH]);
  const pathPoints = useMemo(() => buildPathPoints(tileSize), [tileSize]);
  const pathLength = useMemo(() => getPathLength(tileSize), [tileSize]);
  const boardW = tileSize * BOARD_COLS;
  const boardH = tileSize * BOARD_ROWS;

  const getEnemyPoint = useCallback(
    (distance: number) => getPathPoint(distance, pathPoints, tileSize),
    [pathPoints, tileSize],
  );

  const spawnEnemy = useCallback(() => {
    const waveIndex = currentWaveRef.current;
    setEnemies((prev) => [
      ...prev,
      {
        id: enemyIdRef.current++,
        distance: 0,
        hp: 3 + stage * 2 + waveIndex,
        speed: 0.8 + stage * 0.15 + waveIndex * 0.05,
      },
    ]);
    const nextSpawned = waveSpawnedRef.current + 1;
    waveSpawnedRef.current = nextSpawned;
    setWaveSpawned(nextSpawned);
  }, [stage]);

  const hoveredTile = useMemo(() => {
    if (!draggingTower || !boardLayoutRef.current) return null;
    const col = Math.floor((draggingTower.x - boardLayoutRef.current.x) / tileSize);
    const row = Math.floor((draggingTower.y - boardLayoutRef.current.y) / tileSize);
    if (col < 0 || col >= BOARD_COLS || row < 0 || row >= BOARD_ROWS) return null;
    const isPath = PATH_TILES.some((t) => t.x === col && t.y === row);
    const occupied = towersRef.current.some((t) => t.x === col && t.y === row);
    return { x: col, y: row, valid: !isPath && !occupied };
  }, [draggingTower, tileSize]);

  const placeTowerAt = useCallback(
    (pageX: number, pageY: number) => {
      const layout = boardLayoutRef.current;
      const type = selectedTowerTypeRef.current;
      if (!layout || !type) return;

      const col = Math.floor((pageX - layout.x) / tileSize);
      const row = Math.floor((pageY - layout.y) / tileSize);
      if (col < 0 || col >= BOARD_COLS || row < 0 || row >= BOARD_ROWS) return;

      const isPath = PATH_TILES.some((t) => t.x === col && t.y === row);
      const occupied = towersRef.current.some((t) => t.x === col && t.y === row);
      const stats = TOWER_STATS[type];

      if (!isPath && !occupied && goldRef.current >= stats.cost) {
        setGold((g) => g - stats.cost);
        setTowers((prev) => [
          ...prev,
          { id: towerIdRef.current++, type, x: col, y: row, cooldown: 0 },
        ]);
        setSelectedTowerType(null);
        setMessage('Tower placed!');
        return;
      }

      if (isPath) setMessage("Can't place on path!");
      else if (occupied) setMessage('Tile occupied!');
      else setMessage('Not enough gold!');
    },
    [tileSize],
  );

  const boardResponder = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => !!selectedTowerTypeRef.current,
        onMoveShouldSetPanResponder: () => !!selectedTowerTypeRef.current,
        onPanResponderGrant: (e) => {
          if (!selectedTowerTypeRef.current) return;
          setDraggingTower({
            type: selectedTowerTypeRef.current,
            x: e.nativeEvent.pageX,
            y: e.nativeEvent.pageY,
          });
        },
        onPanResponderMove: (e) => {
          if (!selectedTowerTypeRef.current) return;
          setDraggingTower({
            type: selectedTowerTypeRef.current,
            x: e.nativeEvent.pageX,
            y: e.nativeEvent.pageY,
          });
        },
        onPanResponderRelease: (e) => {
          placeTowerAt(e.nativeEvent.pageX, e.nativeEvent.pageY);
          setDraggingTower(null);
        },
      }),
    [placeTowerAt],
  );

  useEffect(() => {
    if (!gameStarted || gameOver || stageCleared) return;

    const interval = setInterval(() => {
      spawnTimerRef.current += GAME_TICK_MS;
      const waveIndex = currentWaveRef.current;
      const waveQuota = WAVE_ENEMY_COUNTS[waveIndex] ?? 0;
      const spawnInterval = Math.max(900, 1600 - stage * 80 - waveIndex * 40);

      if (
        waveIndex < WAVES_PER_STAGE &&
        waveSpawnedRef.current < waveQuota &&
        spawnTimerRef.current >= spawnInterval
      ) {
        spawnTimerRef.current = 0;
        spawnEnemy();
      }

      setEnemies((prev) => {
        const alive: Enemy[] = [];
        let baseDmg = 0;
        for (const enemy of prev) {
          const newDist = enemy.distance + enemy.speed;
          if (newDist >= pathLength) {
            baseDmg += 1;
            continue;
          }
          alive.push({ ...enemy, distance: newDist });
        }
        if (baseDmg > 0) {
          const newHp = baseHealthRef.current - baseDmg;
          baseHealthRef.current = newHp;
          setBaseHealth(newHp);
          if (newHp <= 0) setGameOver(true);
        }
        return alive;
      });

      setTowers((prev) =>
        prev.map((tower) => {
          const stats = TOWER_STATS[tower.type];
          const effectiveRange = (stats.range + towerBuffsRef.current.range) * tileSize;
          const newCd = tower.cooldown - GAME_TICK_MS;
          if (newCd > 0) return { ...tower, cooldown: newCd };

          const inRange = enemiesRef.current.find((enemy) => {
            const ep = getPathPoint(enemy.distance, pathPoints, tileSize);
            const tx = tower.x * tileSize + tileSize / 2;
            const ty = tower.y * tileSize + tileSize / 2;
            return Math.hypot(ep.x - tx, ep.y - ty) <= effectiveRange;
          });

          if (!inRange) return { ...tower, cooldown: 0 };

          const dmg = stats.damage + towerBuffsRef.current.damage;
          setEnemies((es) =>
            es
              .map((enemy) => {
                if (enemy.id !== inRange.id) return enemy;
                const newHp = enemy.hp - dmg;
                if (newHp <= 0) {
                  return { ...enemy, hp: -1 };
                }
                return { ...enemy, hp: newHp };
              })
              .filter((enemy) => enemy.hp > 0),
          );

          const effectiveCooldown = Math.max(
            200,
            stats.cooldown - towerBuffsRef.current.cooldown,
          );
          return { ...tower, cooldown: effectiveCooldown };
        }),
      );

      const allWavesSpawned = currentWaveRef.current >= WAVES_PER_STAGE;
      const waveComplete =
        waveSpawnedRef.current >= (WAVE_ENEMY_COUNTS[currentWaveRef.current] ?? 0);

      if (
        !allWavesSpawned &&
        waveComplete &&
        enemiesRef.current.length === 0 &&
        !gameOver
      ) {
        const nextWave = currentWaveRef.current + 1;
        currentWaveRef.current = nextWave;
        waveSpawnedRef.current = 0;
        spawnTimerRef.current = 0;
        setCurrentWave(nextWave);
        setWaveSpawned(0);
        setMessage(`Wave ${nextWave + 1} incoming!`);
      }

      if (allWavesSpawned && enemiesRef.current.length === 0 && !gameOver) {
        setStageCleared(true);
      }
    }, GAME_TICK_MS);

    return () => clearInterval(interval);
  }, [gameStarted, gameOver, stageCleared, tileSize, pathPoints, pathLength, spawnEnemy, stage]);

  const waveProgress =
    currentWave >= WAVES_PER_STAGE
      ? 100
      : ((currentWave + waveSpawned / Math.max(1, WAVE_ENEMY_COUNTS[currentWave] ?? 1)) /
          WAVES_PER_STAGE) *
        100;

  const selectTower = useCallback((type: TowerType) => {
    if (selectedTowerTypeRef.current === type) {
      setSelectedTowerType(null);
      return;
    }
    if (goldRef.current < TOWER_STATS[type].cost) {
      setMessage('Not enough gold!');
      return;
    }
    setSelectedTowerType(type);
  }, []);

  const onBoardLayout = useCallback((layout: BoardLayout) => {
    boardLayoutRef.current = layout;
    setBoardLayout(layout);
  }, []);

  return {
    gameStarted,
    setGameStarted,
    gameOver,
    stageCleared,
    gold,
    baseHealth,
    enemies,
    towers,
    currentWave,
    waveSpawned,
    waveProgress,
    message,
    selectedTowerType,
    draggingTower,
    boardLayout,
    tileSize,
    boardW,
    boardH,
    hoveredTile,
    boardResponder,
    getEnemyPoint,
    selectTower,
    onBoardLayout,
  };
}

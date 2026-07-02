import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Dimensions,
  StatusBar,
  PixelRatio,
  Modal,
  PanResponder,
  LayoutChangeEvent,
} from "react-native";
import StageSelectScreen, {
  BuildingLevels,
} from "./StageSelectScreen";

const { width } = Dimensions.get("window");
const BASE_WIDTH = 932;
const scaleFactor = width / BASE_WIDTH;
const normalize = (size: number) =>
  Math.round(PixelRatio.roundToNearestPixel(size * scaleFactor));
const bw = (size: number) => Math.max(1, normalize(size));

const BOARD_COLS = 8;
const BOARD_ROWS = 5;
const PATH_TILES = [
  { x: 0, y: 2 },
  { x: 1, y: 2 },
  { x: 2, y: 2 },
  { x: 3, y: 2 },
  { x: 4, y: 2 },
  { x: 5, y: 2 },
  { x: 6, y: 1 },
  { x: 7, y: 1 },
];

type TowerType = "basic";
type Tile = { x: number; y: number };
type Enemy = { id: number; distance: number; hp: number; speed: number };
type Tower = {
  id: number;
  type: TowerType;
  x: number;
  y: number;
  cooldown: number;
};
type TowerBuffs = {
  damage: number;
  range: number;
  cooldown: number;
};
type BoardLayout = { x: number; y: number; width: number; height: number };

const towerStats: Record<
  TowerType,
  { cost: number; range: number; damage: number; cooldown: number }
> = {
  basic: { cost: 25, range: 2.2, damage: 18, cooldown: 650 },
};

// Matches the ribbon text on the login screen ("Module 1 — The Basics").
// Swap this out (or wire it up dynamically) once more modules exist.
const MODULE_NAME = "Module 1: The Basics";

const ResourceItem = ({ icon, value }: { icon: string; value: string }) => (
  <View style={styles.resourceRow}>
    <Text style={styles.resourceIcon}>{icon}</Text>
    <Text style={styles.resourceValue}>{value}</Text>
  </View>
);

export default function GameScreen({ navigation }: any) {
  const [isMenuVisible, setIsMenuVisible] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [gold, setGold] = useState(60);
  const [baseHealth, setBaseHealth] = useState(1);
  const [waveCount, setWaveCount] = useState(1);
  const [enemies, setEnemies] = useState<Enemy[]>([]);
  const [towers, setTowers] = useState<Tower[]>([]);
  const [message, setMessage] = useState(
    "Tap a tower to select it, then drag it onto a tile beside the path.",
  );
  const [selectedTowerType, setSelectedTowerType] = useState<TowerType | null>(
    null,
  );
  const [draggingTower, setDraggingTower] = useState<{
    type: TowerType;
    x: number;
    y: number;
  } | null>(null);
  const [isUpgradeVisible, setIsUpgradeVisible] = useState(false);
  const [currentStage, setCurrentStage] = useState(1);
  const [buildingLevels, setBuildingLevels] = useState<BuildingLevels>({
    tower: 1,
    glade: 1,
    forge: 1,
  });
  const [towerBuffs, setTowerBuffs] = useState<TowerBuffs>({
    damage: 0,
    range: 0,
    cooldown: 0,
  });
  const [boardLayout, setBoardLayout] = useState<BoardLayout | null>(null);

  const goldRef = useRef(60);
  const baseHealthRef = useRef(1);
  const enemiesRef = useRef<Enemy[]>([]);
  const towersRef = useRef<Tower[]>([]);
  const enemyIdRef = useRef(1);
  const towerIdRef = useRef(1);
  const spawnTimerRef = useRef(0);
  const waveSpawnedRef = useRef(0);
  const waveCountRef = useRef(1);

  // The board's PanResponder is created once (via useRef) and lives for the
  // whole component lifetime, so its callbacks close over whatever these
  // values were on the very first render — not the latest ones. Mirroring
  // them into refs (same pattern as goldRef/towersRef above) is what lets
  // onPanResponderRelease see the *current* selection and board position
  // instead of being permanently stuck on their initial (null) values.
  const selectedTowerTypeRef = useRef<TowerType | null>(null);
  const boardLayoutRef = useRef<BoardLayout | null>(null);

  useEffect(() => {
    goldRef.current = gold;
  }, [gold]);

  useEffect(() => {
    baseHealthRef.current = baseHealth;
  }, [baseHealth]);

  useEffect(() => {
    enemiesRef.current = enemies;
  }, [enemies]);

  useEffect(() => {
    towersRef.current = towers;
  }, [towers]);

  useEffect(() => {
    waveCountRef.current = waveCount;
  }, [waveCount]);

  useEffect(() => {
    selectedTowerTypeRef.current = selectedTowerType;
  }, [selectedTowerType]);

  const tileSize = useMemo(
    () => Math.max(34, Math.min(54, (width - 80) / BOARD_COLS)),
    [],
  );
  const pathPoints = useMemo(
    () =>
      PATH_TILES.map((tile) => ({
        x: tile.x * tileSize + tileSize / 2,
        y: tile.y * tileSize + tileSize / 2,
      })),
    [tileSize],
  );

  const getPathPoint = (distance: number) => {
    if (distance <= 0) {
      return pathPoints[0];
    }

    const totalLength = pathPoints.reduce((sum, _, index) => {
      if (index >= pathPoints.length - 1) {
        return sum;
      }
      const current = pathPoints[index];
      const next = pathPoints[index + 1];
      const dx = next.x - current.x;
      const dy = next.y - current.y;
      return sum + Math.hypot(dx, dy);
    }, 0);

    if (distance >= totalLength) {
      return pathPoints[pathPoints.length - 1];
    }

    let remaining = distance;
    for (let i = 0; i < pathPoints.length - 1; i += 1) {
      const current = pathPoints[i];
      const next = pathPoints[i + 1];
      const segmentLength = Math.hypot(next.x - current.x, next.y - current.y);
      if (remaining <= segmentLength) {
        const t = remaining / segmentLength;
        return {
          x: current.x + (next.x - current.x) * t,
          y: current.y + (next.y - current.y) * t,
        };
      }
      remaining -= segmentLength;
    }

    return pathPoints[pathPoints.length - 1];
  };

  const isValidPlacement = (tile: Tile) => {
    if (
      PATH_TILES.some(
        (pathTile) => pathTile.x === tile.x && pathTile.y === tile.y,
      )
    ) {
      return false;
    }

    const isNearPath = PATH_TILES.some(
      (pathTile) =>
        Math.abs(pathTile.x - tile.x) + Math.abs(pathTile.y - tile.y) <= 1,
    );
    const isOccupied = towersRef.current.some(
      (tower) => tower.x === tile.x && tower.y === tile.y,
    );
    return isNearPath && !isOccupied;
  };

  // Takes the tower type explicitly instead of reading selectedTowerType
  // from state — this function gets called from inside the board
  // PanResponder's long-lived closure, so it can only safely rely on refs,
  // stable setters, and values passed in directly as arguments.
  const placeTower = (tile: Tile, type: TowerType) => {
    const stats = towerStats[type];
    if (goldRef.current < stats.cost) {
      setMessage("Not enough gold for that tower.");
      return;
    }

    if (!isValidPlacement(tile)) {
      setMessage("Place towers on tiles beside the path.");
      return;
    }

    const nextTower: Tower = {
      id: towerIdRef.current++,
      type,
      x: tile.x,
      y: tile.y,
      cooldown: 0,
    };

    const nextTowers = [...towersRef.current, nextTower];
    towersRef.current = nextTowers;
    setTowers(nextTowers);
    setGold(goldRef.current - stats.cost);
    goldRef.current -= stats.cost;
    setMessage("Tower placed.");
  };

  useEffect(() => {
    if (!gameStarted || gameOver) {
      return;
    }

    const interval = setInterval(() => {
      spawnTimerRef.current += 100;
      const currentEnemies = enemiesRef.current;
      const currentTowers = towersRef.current;
      const nextTowers = currentTowers.map((tower) => ({
        ...tower,
        cooldown: Math.max(0, tower.cooldown - 100),
      }));
      let nextEnemies = currentEnemies.map((enemy) => ({
        ...enemy,
        distance: enemy.distance + enemy.speed,
      }));
      let nextBaseHealth = baseHealthRef.current;
      let nextGold = goldRef.current;
      let nextWave = waveCountRef.current;

      nextEnemies = nextEnemies.filter((enemy) => {
        if (enemy.distance >= 300) {
          nextBaseHealth -= 1;
          return false;
        }
        return true;
      });

      if (spawnTimerRef.current >= 900) {
        spawnTimerRef.current = 0;
        waveSpawnedRef.current += 1;
        nextEnemies = [
          ...nextEnemies,
          {
            id: enemyIdRef.current++,
            distance: 0,
            hp: 45,
            speed: 1.5,
          },
        ];
        if (waveSpawnedRef.current >= 8) {
          nextWave += 1;
          waveSpawnedRef.current = 0;
        }
      }

      nextTowers.forEach((tower) => {
        if (tower.cooldown > 0) {
          return;
        }

        const effectiveStats = {
          ...towerStats[tower.type],
          damage: towerStats[tower.type].damage + towerBuffs.damage,
          range: towerStats[tower.type].range + towerBuffs.range,
          cooldown: Math.max(100, towerStats[tower.type].cooldown - towerBuffs.cooldown),
        };

        const targetEnemy = [...nextEnemies]
          .sort((a, b) => a.distance - b.distance)
          .find((enemy) => {
            const point = getPathPoint(enemy.distance);
            const dx = point.x - (tower.x * tileSize + tileSize / 2);
            const dy = point.y - (tower.y * tileSize + tileSize / 2);
            const distance = Math.hypot(dx, dy);
            return distance <= effectiveStats.range * tileSize;
          });

        if (targetEnemy) {
          const updatedEnemies = nextEnemies.map((enemy) => {
            if (enemy.id !== targetEnemy.id) {
              return enemy;
            }
            return { ...enemy, hp: enemy.hp - effectiveStats.damage };
          });
          const survivors = updatedEnemies.filter((enemy) => enemy.hp > 0);
          const killed = updatedEnemies.length - survivors.length;
          if (killed > 0) {
            nextGold += 10 * killed;
          }
          nextEnemies = survivors;
          tower.cooldown = effectiveStats.cooldown;
        }
      });

      if (nextBaseHealth <= 0) {
        setGameOver(true);
        setGameStarted(false);
        setMessage("Your base was destroyed.");
      } else if (nextEnemies.length === 0 && waveSpawnedRef.current === 0) {
        setMessage(`Wave ${nextWave} is ready.`);
      } else {
        setMessage(`Wave ${nextWave} is live.`);
      }

      baseHealthRef.current = nextBaseHealth;
      goldRef.current = nextGold;
      setBaseHealth(nextBaseHealth);
      setGold(nextGold);
      setEnemies(nextEnemies);
      setTowers(nextTowers);
      setWaveCount(nextWave);
    }, 100);

    return () => clearInterval(interval);
  }, [gameStarted, gameOver, tileSize]);

  // Step 1 of placement: tapping the card selects/deselects the tower type.
  // This is a plain onPress handler re-created every render, so it always
  // sees the latest state directly — no staleness issue here.
  const handleSelectTower = (type: TowerType) => {
    if (selectedTowerType === type) {
      setSelectedTowerType(null);
      setMessage("Tower deselected.");
      return;
    }

    const stats = towerStats[type];
    if (goldRef.current < stats.cost) {
      setMessage("Not enough gold for that tower.");
      return;
    }

    setSelectedTowerType(type);
    setMessage("Drag onto a tile beside the path to place your tower.");
  };

  // Step 2 of placement: with a tower selected, pressing and dragging on
  // the board itself moves the ghost tower; releasing over a valid tile
  // places it. Only active while a tower is selected.
  const boardResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => !!selectedTowerTypeRef.current,
      onMoveShouldSetPanResponder: () => !!selectedTowerTypeRef.current,
      onPanResponderGrant: (_event, gestureState) => {
        const type = selectedTowerTypeRef.current;
        if (!type) return;
        setDraggingTower({ type, x: gestureState.x0, y: gestureState.y0 });
      },
      onPanResponderMove: (_event, gestureState) => {
        const type = selectedTowerTypeRef.current;
        if (!type) return;
        setDraggingTower({ type, x: gestureState.moveX, y: gestureState.moveY });
      },
      onPanResponderRelease: (_event, gestureState) => {
        const type = selectedTowerTypeRef.current;
        const layout = boardLayoutRef.current;
        if (type && layout) {
          const relativeX = gestureState.moveX - layout.x;
          const relativeY = gestureState.moveY - layout.y;
          const col = Math.floor(relativeX / tileSize);
          const row = Math.floor(relativeY / tileSize);
          if (col >= 0 && col < BOARD_COLS && row >= 0 && row < BOARD_ROWS) {
            placeTower({ x: col, y: row }, type);
          } else {
            setMessage("Release over a tile beside the path to place it.");
          }
        }
        setDraggingTower(null);
        setSelectedTowerType(null);
      },
      onPanResponderTerminate: () => {
        setDraggingTower(null);
        setSelectedTowerType(null);
      },
    }),
  ).current;

  const boardTiles = Array.from({ length: BOARD_ROWS }, (_, row) =>
    Array.from({ length: BOARD_COLS }, (_, col) => {
      const isPath = PATH_TILES.some(
        (tile) => tile.x === col && tile.y === row,
      );
      const isBase =
        col === BOARD_COLS - 1 && row === PATH_TILES[PATH_TILES.length - 1].y;
      return { col, row, isPath, isBase };
    }),
  );

  // Live preview of which tile the ghost tower is currently over, and
  // whether it's a legal placement — pure render-time calculation, so it
  // always reflects the latest state (no ref needed here).
  const hoveredTile = useMemo(() => {
    if (!draggingTower || !boardLayout) {
      return null;
    }
    const relativeX = draggingTower.x - boardLayout.x;
    const relativeY = draggingTower.y - boardLayout.y;
    const col = Math.floor(relativeX / tileSize);
    const row = Math.floor(relativeY / tileSize);
    if (col < 0 || col >= BOARD_COLS || row < 0 || row >= BOARD_ROWS) {
      return null;
    }
    return { x: col, y: row, valid: isValidPlacement({ x: col, y: row }) };
  }, [draggingTower, boardLayout, tileSize]);

  const resetGame = () => {
    setGameOver(false);
    setGameStarted(true);
    setBaseHealth(1);
    baseHealthRef.current = 1;
    setGold(60);
    goldRef.current = 60;
    setEnemies([]);
    enemiesRef.current = [];
    setTowers([]);
    towersRef.current = [];
    setWaveCount(1);
    waveCountRef.current = 1;
    setCurrentStage(1);
    setMessage("The stage has restarted.");
  };

  const handleStageSelect = (stage: number) => {
    setCurrentStage(stage);
    setWaveCount(stage);
    waveCountRef.current = stage;
    setMessage(`Selected Tiny Forest stage ${stage}.`);
  };

  const applyBuildingUpgrade = (building: "tower" | "glade" | "forge") => {
    const cost = 25;
    if (goldRef.current < cost) {
      setMessage("Not enough gold to upgrade.");
      return;
    }

    setGold((current) => current - cost);
    goldRef.current -= cost;
    setBuildingLevels((prev) => ({
      ...prev,
      [building]: prev[building] + 1,
    }));

    setTowerBuffs((prev) => {
      if (building === "tower") {
        return { ...prev, damage: prev.damage + 8 };
      }
      if (building === "glade") {
        return { ...prev, range: prev.range + 0.5 };
      }
      return { ...prev, cooldown: prev.cooldown + 200 };
    });

    setMessage(
      `Upgraded ${
        building === "tower"
          ? "Tower Keep"
          : building === "glade"
          ? "Forest Glade"
          : "Arcane Forge"
      }.`,
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar hidden />
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.topHud}>
          <View style={styles.topLeft}>
            <Text style={styles.sectionLabel}>MATERIALS</Text>
            <View style={styles.resourcePanel}>
              <ResourceItem icon="🪙" value={gold.toString()} />
              <ResourceItem icon="❤️" value={baseHealth.toString()} />
              <ResourceItem icon="👾" value={enemies.length.toString()} />
            </View>
          </View>

          <View style={styles.topCenter}>
            <Text style={styles.sectionLabel}>WAVE PROGRESSION</Text>
            <View style={styles.waveBarOuter}>
              <View
                style={[
                  styles.waveBarInner,
                  { width: `${Math.min(100, waveCount * 20)}%` },
                ]}
              />
            </View>
            <Text style={styles.waveCountText}>Wave {waveCount}</Text>
          </View>

          <View style={styles.topRight}>
            <Text style={styles.sectionLabel}>STAGE</Text>
            <View style={styles.stageInfoBox}>
              <Text style={styles.stageLabel}>A1</Text>
              <Text style={styles.stageSubText}>LEVEL 01</Text>
            </View>
            <TouchableOpacity
              style={styles.settingsBtn}
              onPress={() => setIsMenuVisible(true)}
            >
              <Text style={styles.settingsIcon}>⚙️</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.boardWrap}>
          <View
            style={[
              styles.boardSurface,
              { width: tileSize * BOARD_COLS, height: tileSize * BOARD_ROWS },
            ]}
            onLayout={(event: LayoutChangeEvent) => {
              const layout = event.nativeEvent.layout;
              const nextLayout: BoardLayout = {
                x: layout.x,
                y: layout.y,
                width: layout.width,
                height: layout.height,
              };
              boardLayoutRef.current = nextLayout;
              setBoardLayout(nextLayout);
            }}
            {...boardResponder.panHandlers}
          >
            {boardTiles.flat().map((tile) => (
              <View
                key={`${tile.row}-${tile.col}`}
                style={[
                  styles.tile,
                  {
                    left: tile.col * tileSize,
                    top: tile.row * tileSize,
                    width: tileSize,
                    height: tileSize,
                  },
                  tile.isPath ? styles.pathTile : styles.groundTile,
                  tile.isBase ? styles.baseTile : null,
                ]}
              />
            ))}

            {hoveredTile ? (
              <View
                pointerEvents="none"
                style={[
                  styles.tileHover,
                  hoveredTile.valid
                    ? styles.tileHoverValid
                    : styles.tileHoverInvalid,
                  {
                    left: hoveredTile.x * tileSize,
                    top: hoveredTile.y * tileSize,
                    width: tileSize,
                    height: tileSize,
                  },
                ]}
              />
            ) : null}

            {towers.map((tower) => (
              <View
                key={tower.id}
                style={[
                  styles.tower,
                  {
                    left: tower.x * tileSize,
                    top: tower.y * tileSize,
                    width: tileSize * 0.7,
                    height: tileSize * 0.7,
                  },
                ]}
              >
                <Text style={styles.towerIcon}>🛡️</Text>
              </View>
            ))}

            {enemies.map((enemy) => {
              const point = getPathPoint(enemy.distance);
              return (
                <View
                  key={enemy.id}
                  style={[
                    styles.enemy,
                    {
                      left: point.x - tileSize / 2,
                      top: point.y - tileSize / 2,
                      width: tileSize * 0.6,
                      height: tileSize * 0.6,
                    },
                  ]}
                >
                  <Text style={styles.enemyIcon}>👾</Text>
                </View>
              );
            })}

            {draggingTower ? (
              <View
                pointerEvents="none"
                style={[
                  styles.ghostTower,
                  {
                    left:
                      draggingTower.x - (boardLayout?.x ?? 0) - tileSize / 2,
                    top: draggingTower.y - (boardLayout?.y ?? 0) - tileSize / 2,
                    width: tileSize * 0.7,
                    height: tileSize * 0.7,
                  },
                ]}
              >
                <Text style={styles.towerIcon}>🛡️</Text>
              </View>
            ) : null}
          </View>
        </View>

        {gameOver ? (
          <View style={styles.gameOverOverlay} pointerEvents="box-none">
            <View style={styles.gameOverPanel}>
              <Text style={styles.gameOverTitle}>Castle Destroyed</Text>
              <Text style={styles.gameOverSubtext}>Your base has fallen.</Text>
              <Text style={styles.gameOverNotice}>
                Choose Restart or Upgrade to continue.
              </Text>
              <View style={styles.gameOverButtonRow}>
                <TouchableOpacity
                  style={styles.gameOverButton}
                  onPress={resetGame}
                >
                  <Text style={styles.gameOverButtonText}>RESTART</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.gameOverButton, styles.upgradeButton]}
                  onPress={() => setIsUpgradeVisible(true)}
                >
                  <Text style={styles.gameOverButtonText}>UPGRADE</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        ) : null}

        <View style={styles.bottomHud}>
          <View style={styles.deckContainer}>
            <Text style={styles.deckArrow}>⬇</Text>
            <View style={styles.deckRow}>
              <TouchableOpacity
                style={[
                  styles.unitCardOuter,
                  selectedTowerType === "basic" && styles.unitCardSelected,
                ]}
                activeOpacity={0.8}
                onPress={() => handleSelectTower("basic")}
              >
                <View style={styles.unitCardInner}>
                  <Text style={styles.unitSprite}>🛡️</Text>
                </View>
                <View style={styles.unitCountBadge}>
                  <Text style={styles.unitCountText}>25g</Text>
                </View>
              </TouchableOpacity>
            </View>
            <TouchableOpacity
              style={styles.startBtn}
              onPress={() => {
                if (gameOver) {
                  setGameOver(false);
                  setBaseHealth(1);
                  baseHealthRef.current = 1;
                  setGold(60);
                  goldRef.current = 60;
                  setEnemies([]);
                  enemiesRef.current = [];
                  setTowers([]);
                  towersRef.current = [];
                  setWaveCount(1);
                  waveCountRef.current = 1;
                  waveSpawnedRef.current = 0;
                  spawnTimerRef.current = 0;
                  enemyIdRef.current = 1;
                  towerIdRef.current = 1;
                  setMessage("A fresh defense run is ready.");
                }
                setGameStarted((prev) => !prev);
              }}
            >
              <Text style={styles.startText}>
                {gameStarted ? "PAUSE" : gameOver ? "RESTART" : "START"}
              </Text>
            </TouchableOpacity>
            <Text style={styles.helperText}>{message}</Text>
          </View>
        </View>
      </SafeAreaView>

      <Modal
        visible={isMenuVisible}
        transparent
        animationType="fade"
        supportedOrientations={[
          "landscape",
          "landscape-left",
          "landscape-right",
        ]}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.menuContainer}>
            <Text style={styles.menuTitle}>PAUSED</Text>
            <TouchableOpacity
              style={styles.menuButton}
              onPress={() => setIsMenuVisible(false)}
            >
              <Text style={styles.menuButtonText}>RESUME</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.menuButton}
              onPress={() => {
                setIsMenuVisible(false);
                navigation.navigate("Dashboard");
              }}
            >
              <Text style={styles.menuButtonText}>BACK TO DASHBOARD</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <StageSelectScreen
        visible={isUpgradeVisible}
        onClose={() => setIsUpgradeVisible(false)}
        currentStage={currentStage}
        onSelectStage={handleStageSelect}
        buildingLevels={buildingLevels}
        onUpgradeBuilding={applyBuildingUpgrade}
        moduleName={MODULE_NAME}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#05070d",
  },
  safeArea: {
    flex: 1,
    justifyContent: "space-between",
    padding: normalize(16),
  },
  topHud: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: normalize(12),
  },
  topLeft: {
    flex: 1,
    alignItems: "flex-start",
    justifyContent: "center",
    gap: normalize(10),
  },
  resourceRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  resourceIcon: {
    fontSize: normalize(18),
    marginRight: normalize(8),
    color: "#fff",
  },
  resourceValue: {
    color: "#fff",
    fontFamily: "PixelFont",
    fontSize: normalize(16),
  },
  topCenter: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  resourcePanel: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-start",
    gap: normalize(10),
    marginTop: normalize(6),
  },
  sectionLabel: {
    color: "#9cc7ff",
    fontFamily: "PixelFont",
    fontSize: normalize(12),
    letterSpacing: 1.5,
    marginBottom: normalize(6),
  },
  waveBarOuter: {
    width: normalize(220),
    height: normalize(16),
    backgroundColor: "#1a1016",
    borderWidth: bw(2),
    borderColor: "#e8d5b5",
    borderRadius: normalize(4),
    marginBottom: normalize(4),
    overflow: "hidden",
  },
  waveBarInner: {
    height: "100%",
    backgroundColor: "#3fbf7f",
  },
  waveCountOuter: {
    backgroundColor: "#1a1016",
    borderWidth: bw(2),
    borderColor: "#e8d5b5",
    paddingVertical: normalize(4),
    paddingHorizontal: normalize(24),
    borderRadius: normalize(4),
  },
  waveCountText: {
    color: "#fff",
    fontFamily: "PixelFont",
    fontSize: normalize(14),
  },
  topRight: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
    gap: normalize(8),
  },
  stageInfoBox: {
    backgroundColor: "#1a1016",
    borderWidth: bw(2),
    borderColor: "#e8d5b5",
    borderRadius: normalize(6),
    paddingHorizontal: normalize(10),
    paddingVertical: normalize(6),
    alignItems: "center",
    justifyContent: "center",
  },
  stageLabel: {
    color: "#fff",
    fontFamily: "PixelFont",
    fontSize: normalize(16),
  },
  stageSubText: {
    color: "#9cc7ff",
    fontFamily: "PixelFont",
    fontSize: normalize(10),
    marginTop: normalize(2),
  },
  mapText: {
    color: "#fff",
    fontFamily: "PixelFont",
    fontSize: normalize(20),
  },
  settingsBtn: {
    justifyContent: "center",
    alignItems: "center",
  },
  settingsIcon: {
    fontSize: normalize(24),
  },
  boardWrap: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: normalize(12),
  },
  boardSurface: {
    backgroundColor: "#121826",
    borderWidth: bw(3),
    borderColor: "#e8d5b5",
    borderRadius: normalize(10),
    overflow: "hidden",
    position: "relative",
  },
  tile: {
    position: "absolute",
    borderWidth: bw(1),
    borderColor: "#2b3750",
  },
  groundTile: {
    backgroundColor: "#1f2a3d",
  },
  pathTile: {
    backgroundColor: "#8b5e3c",
  },
  baseTile: {
    backgroundColor: "#8b1d1d",
  },
  tileHover: {
    position: "absolute",
    borderWidth: bw(2),
    zIndex: 1,
  },
  tileHoverValid: {
    backgroundColor: "rgba(63, 191, 127, 0.35)",
    borderColor: "#3fbf7f",
  },
  tileHoverInvalid: {
    backgroundColor: "rgba(255, 99, 99, 0.35)",
    borderColor: "#ff6363",
  },
  tower: {
    position: "absolute",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#315f8c",
    borderWidth: bw(2),
    borderColor: "#dfe7f4",
    borderRadius: normalize(10),
    zIndex: 2,
  },
  ghostTower: {
    position: "absolute",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#315f8c",
    borderWidth: bw(2),
    borderColor: "#dfe7f4",
    borderRadius: normalize(10),
    opacity: 0.7,
    zIndex: 3,
  },
  towerIcon: {
    fontSize: normalize(24),
  },
  enemy: {
    position: "absolute",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#7a1733",
    borderWidth: bw(2),
    borderColor: "#ffd1dc",
    borderRadius: normalize(10),
    zIndex: 1,
  },
  enemyIcon: {
    fontSize: normalize(18),
  },
  bottomHud: {
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    marginTop: normalize(12),
  },
  deckContainer: {
    alignItems: "center",
    width: "100%",
  },
  deckRow: {
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
  },
  deckArrow: {
    color: "#fff",
    fontSize: normalize(24),
    marginBottom: normalize(4),
  },
  unitCardOuter: {
    width: normalize(68),
    height: normalize(68),
    backgroundColor: "#1a1016",
    borderWidth: bw(2),
    borderColor: "#e8d5b5",
    borderRadius: normalize(6),
    justifyContent: "center",
    alignItems: "center",
  },
  unitCardSelected: {
    borderColor: "#3fbf7f",
    shadowColor: "#3fbf7f",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.9,
    shadowRadius: 8,
    elevation: 6,
  },
  unitCardInner: {
    flex: 1,
    width: "100%",
    margin: bw(1),
    borderWidth: bw(1),
    borderColor: "#8e6c7a",
    backgroundColor: "#2a1a24",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: normalize(4),
  },
  unitSprite: {
    fontSize: normalize(28),
  },
  unitCountBadge: {
    position: "absolute",
    bottom: normalize(-10),
    backgroundColor: "#1a1016",
    paddingHorizontal: normalize(6),
    paddingVertical: normalize(2),
    borderRadius: normalize(4),
    borderWidth: bw(1),
    borderColor: "#e8d5b5",
  },
  unitCountText: {
    color: "#fff",
    fontFamily: "PixelFont",
    fontSize: normalize(10),
  },
  bottomRight: {
    flex: 1,
    alignItems: "flex-end",
    marginRight: normalize(8),
  },
  startBtn: {
    alignItems: "center",
    backgroundColor: "#2a1a24",
    borderWidth: bw(2),
    borderColor: "#e8d5b5",
    borderRadius: normalize(8),
    paddingHorizontal: normalize(22),
    paddingVertical: normalize(10),
    marginTop: normalize(12),
  },
  startText: {
    color: "#fff",
    fontFamily: "PixelFont",
    fontSize: normalize(20),
  },
  helperText: {
    color: "#d9e8ff",
    fontSize: normalize(12),
    marginTop: normalize(6),
    maxWidth: normalize(170),
    textAlign: "right",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    justifyContent: "center",
    alignItems: "center",
  },
  menuContainer: {
    backgroundColor: "#1a1016",
    borderWidth: bw(3),
    borderColor: "#e8d5b5",
    borderRadius: normalize(8),
    padding: normalize(24),
    width: normalize(320),
    alignItems: "center",
  },
  menuTitle: {
    color: "#e8d5b5",
    fontFamily: "PixelFont",
    fontSize: normalize(28),
    marginBottom: normalize(24),
  },
  menuSubText: {
    color: "#d9e8ff",
    fontFamily: "PixelFont",
    fontSize: normalize(12),
    textAlign: "center",
    marginBottom: normalize(18),
  },
  gameOverOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    zIndex: 10,
  },
  gameOverPanel: {
    width: "85%",
    padding: normalize(20),
    backgroundColor: "#0e111d",
    borderWidth: bw(2),
    borderColor: "#ff7f8d",
    borderRadius: normalize(14),
    alignItems: "center",
  },
  gameOverTitle: {
    color: "#ff99a0",
    fontFamily: "PixelFont",
    fontSize: normalize(28),
    marginBottom: normalize(10),
  },
  gameOverSubtext: {
    color: "#fff",
    fontFamily: "PixelFont",
    fontSize: normalize(14),
    marginBottom: normalize(8),
  },
  gameOverNotice: {
    color: "#a9c9ff",
    fontFamily: "PixelFont",
    fontSize: normalize(12),
    textAlign: "center",
    marginBottom: normalize(16),
  },
  gameOverButtonRow: {
    flexDirection: "row",
    gap: normalize(12),
  },
  gameOverButton: {
    backgroundColor: "#1a1016",
    borderWidth: bw(2),
    borderColor: "#ff7f8d",
    borderRadius: normalize(8),
    paddingHorizontal: normalize(16),
    paddingVertical: normalize(12),
    minWidth: normalize(110),
    alignItems: "center",
  },
  upgradeButton: {
    backgroundColor: "#2f1a2b",
  },
  gameOverButtonText: {
    color: "#fff",
    fontFamily: "PixelFont",
    fontSize: normalize(14),
  },
  menuButton: {
    backgroundColor: "#2a1a24",
    borderWidth: bw(2),
    borderColor: "#8e6c7a",
    borderRadius: normalize(6),
    paddingVertical: normalize(14),
    paddingHorizontal: normalize(20),
    marginBottom: normalize(16),
    width: "100%",
    alignItems: "center",
  },
  menuButtonText: {
    color: "#fff",
    fontFamily: "PixelFont",
    fontSize: normalize(14),
  },
});
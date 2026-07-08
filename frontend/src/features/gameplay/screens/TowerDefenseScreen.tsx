import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Modal,
  LayoutChangeEvent,
  useWindowDimensions,
} from 'react-native';
import { BOARD_COLS, BOARD_ROWS, PATH_TILES } from '../constants/board';
import { TOWER_STATS } from '../constants/towers';
import { WAVES_PER_STAGE } from '../constants/stages';
import { useTowerDefense } from '../hooks/useTowerDefense';
import type { CombatPayload } from '../types';
import { useLandscapeScaling } from '../utils/scaling';

type Props = {
  stage: number;
  combat: CombatPayload;
  onStageEnd: (cleared: boolean) => void;
  onExit: () => void;
};

export default function TowerDefenseScreen({ stage, combat, onStageEnd, onExit }: Props) {
  const [isMenuVisible, setIsMenuVisible] = useState(false);
  const [boardAreaSize, setBoardAreaSize] = useState({ width: 0, height: 0 });
  const { lw, pw, nL, nP } = useLandscapeScaling();

  const td = useTowerDefense({
    stage,
    startingGold: combat.startingGold,
    startingBaseHealth: combat.baseHealth,
    towerBuffs: combat.towerBuffs,
    containerW: boardAreaSize.width,
    containerH: boardAreaSize.height,
  });

  const handleDefeat = () => onStageEnd(false);
  const handleVictory = () => onStageEnd(true);

  return (
    <View style={styles.root}>
      <SafeAreaView style={[styles.hudTop, { paddingHorizontal: nL(12), paddingVertical: nL(6) }]}>
        <View style={[styles.hudRow, { gap: nL(6) }]}>
          <View style={styles.hudGroup}>
            <Text style={[styles.hudGroupLabel, { fontSize: nL(7) }]}>BUDGET</Text>
            <Text style={[styles.hudStat, { fontSize: nL(11) }]}>{td.gold}g</Text>
          </View>
          <View style={styles.hudGroup}>
            <Text style={[styles.hudGroupLabel, { fontSize: nL(7) }]}>BASE</Text>
            <Text style={[styles.hudStat, { fontSize: nL(11) }]}>{td.baseHealth} HP</Text>
          </View>
          <View style={[styles.hudCenter, { flex: 1 }]}>
            <View style={[styles.waveBarTrack, { width: '80%', height: nL(7) }]}>
              <View style={[styles.waveBarFill, { width: `${td.waveProgress}%` as `${number}%` }]} />
            </View>
            <Text style={[styles.waveLabel, { fontSize: nL(8) }]}>
              WAVE {Math.min(td.currentWave + 1, WAVES_PER_STAGE)} / {WAVES_PER_STAGE}
            </Text>
          </View>
          <View style={[styles.hudRight, { gap: nL(8) }]}>
            <View style={[styles.stagePill, { paddingHorizontal: nL(8), paddingVertical: nL(3) }]}>
              <Text style={[styles.stagePillText, { fontSize: nL(11) }]}>STG {stage}</Text>
            </View>
            <TouchableOpacity
              onPress={() => setIsMenuVisible(true)}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Text style={[styles.cogIcon, { fontSize: nL(10) }]}>MENU</Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>

      <View
        style={styles.boardArea}
        onLayout={(e: LayoutChangeEvent) => {
          const { width, height } = e.nativeEvent.layout;
          setBoardAreaSize({ width, height });
        }}
      >
        <View
          style={[styles.board, { width: td.boardW, height: td.boardH }]}
          onLayout={(e: LayoutChangeEvent) => {
            const layout = e.nativeEvent.layout;
            td.onBoardLayout(layout);
          }}
          {...td.boardResponder.panHandlers}
        >
          {Array.from({ length: BOARD_ROWS }, (_, row) =>
            Array.from({ length: BOARD_COLS }, (_, col) => {
              const isPath = PATH_TILES.some((t) => t.x === col && t.y === row);
              const isBase =
                col === BOARD_COLS - 1 && row === PATH_TILES[PATH_TILES.length - 1].y;
              return (
                <View
                  key={`${row}-${col}`}
                  style={[
                    styles.tile,
                    {
                      left: col * td.tileSize,
                      top: row * td.tileSize,
                      width: td.tileSize,
                      height: td.tileSize,
                    },
                    isBase ? styles.baseTile : isPath ? styles.pathTile : styles.groundTile,
                  ]}
                />
              );
            }),
          )}

          {td.hoveredTile && (
            <View
              pointerEvents="none"
              style={[
                styles.hoverTile,
                td.hoveredTile.valid ? styles.hoverValid : styles.hoverInvalid,
                {
                  left: td.hoveredTile.x * td.tileSize,
                  top: td.hoveredTile.y * td.tileSize,
                  width: td.tileSize,
                  height: td.tileSize,
                },
              ]}
            />
          )}

          {td.towers.map((tower) => (
            <View
              key={tower.id}
              style={[
                styles.tower,
                {
                  left: tower.x * td.tileSize + td.tileSize * 0.1,
                  top: tower.y * td.tileSize + td.tileSize * 0.1,
                  width: td.tileSize * 0.8,
                  height: td.tileSize * 0.8,
                },
              ]}
            >
              <Text style={{ fontSize: td.tileSize * 0.4, color: '#5ac8ff' }}>T</Text>
            </View>
          ))}

          {td.enemies.map((enemy) => {
            const point = td.getEnemyPoint(enemy.distance);
            return (
              <View
                key={enemy.id}
                style={[
                  styles.enemy,
                  {
                    left: point.x - td.tileSize * 0.35,
                    top: point.y - td.tileSize * 0.35,
                    width: td.tileSize * 0.7,
                    height: td.tileSize * 0.7,
                  },
                ]}
              >
                <Text style={{ fontSize: td.tileSize * 0.4, color: '#ff6363' }}>E</Text>
              </View>
            );
          })}

          {td.draggingTower && td.boardLayout && (
            <View
              pointerEvents="none"
              style={[
                styles.ghostTower,
                {
                  left: td.draggingTower.x - td.boardLayout.x - td.tileSize * 0.4,
                  top: td.draggingTower.y - td.boardLayout.y - td.tileSize * 0.4,
                  width: td.tileSize * 0.8,
                  height: td.tileSize * 0.8,
                },
              ]}
            >
              <Text style={{ fontSize: td.tileSize * 0.4, color: '#5ac8ff' }}>T</Text>
            </View>
          )}

          {td.gameOver && (
            <View style={styles.endOverlay}>
              <View style={[styles.endPanel, { borderColor: '#ff6363' }]}>
                <Text style={[styles.endTitle, { color: '#ff6363' }]}>BASE DESTROYED</Text>
                <Text style={styles.endSub}>Your defense was overwhelmed.</Text>
                <TouchableOpacity
                  style={[styles.endBtn, { borderColor: '#ff6363' }]}
                  onPress={handleDefeat}
                >
                  <Text style={styles.endBtnText}>VIEW REPORT</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          {td.stageCleared && (
            <View style={styles.endOverlay}>
              <View style={[styles.endPanel, { borderColor: '#3fbf7f' }]}>
                <Text style={[styles.endTitle, { color: '#3fbf7f' }]}>STAGE CLEARED!</Text>
                <Text style={styles.endSub}>Threat contained. Sector secured.</Text>
                <TouchableOpacity
                  style={[styles.endBtn, { borderColor: '#3fbf7f' }]}
                  onPress={handleVictory}
                >
                  <Text style={styles.endBtnText}>VIEW REPORT</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </View>
      </View>

      <SafeAreaView style={[styles.hudBottom, { paddingHorizontal: nL(12), paddingTop: nL(8), paddingBottom: nL(6) }]}>
        <Text style={[styles.msgText, { fontSize: nL(8) }]}>{td.message}</Text>
        <View style={[styles.deckRow, { gap: nL(10) }]}>
          <TouchableOpacity
            style={[styles.card,
              { width: nL(52), height: nL(60) },
              td.selectedTowerType === 'basic' && styles.cardSelected
            ]}
            onPress={() => td.selectTower('basic')}
          >
            <Text style={[styles.cardEmoji, { fontSize: nL(24) }]}>T</Text>
            <Text style={[styles.cardCost, { fontSize: nL(9) }]}>{TOWER_STATS.basic.cost}g</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.startBtn, (td.gameOver || td.stageCleared) && styles.startBtnDisabled]}
            disabled={td.gameOver || td.stageCleared}
            onPress={() => td.setGameStarted((prev) => !prev)}
          >
            <Text style={[styles.startBtnText, { fontSize: nL(13) }]}>
              {td.gameStarted ? 'PAUSE' : 'START BREACH'}
            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>

      <Modal
        visible={isMenuVisible}
        transparent
        animationType="fade"
        supportedOrientations={['portrait', 'landscape']}
      >
        <View style={styles.menuOverlay}>
          <View style={styles.menuBox}>
            <Text style={styles.menuTitle}>PAUSED</Text>
            <TouchableOpacity style={styles.menuItem} onPress={() => setIsMenuVisible(false)}>
              <Text style={styles.menuItemText}>RESUME</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.menuItem} onPress={onExit}>
              <Text style={styles.menuItemText}>ABORT MISSION</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#05070d' },
  hudTop: {
    backgroundColor: '#0a0f1c',
    borderBottomWidth: 1,
    borderBottomColor: '#1e3050',
    paddingHorizontal: normL(16),
    paddingVertical: normL(8),
  },
  hudRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: normL(8) },
  hudGroup: { minWidth: normL(56) },
  hudGroupLabel: {
    color: '#5a7aaa',
    fontFamily: 'PixelFont',
    fontSize: normL(8),
    letterSpacing: 1,
    marginBottom: normL(4),
  },
  hudStat: { color: '#fff', fontFamily: 'PixelFont', fontSize: normL(12) },
  hudCenter: { flex: 1, alignItems: 'center' },
  waveBarTrack: {
    width: normL(140),
    height: normL(8),
    backgroundColor: '#1e3050',
    borderRadius: normL(4),
    overflow: 'hidden',
    marginBottom: normL(4),
  },
  waveBarFill: { height: '100%', backgroundColor: '#3fbf7f', borderRadius: normL(4) },
  waveLabel: { color: '#5ac8ff', fontFamily: 'PixelFont', fontSize: normL(9) },
  hudRight: { flexDirection: 'row', alignItems: 'center', gap: normL(10) },
  stagePill: {
    backgroundColor: '#0f1e35',
    borderWidth: 1,
    borderColor: '#e8d5b5',
    borderRadius: normL(6),
    paddingHorizontal: normL(10),
    paddingVertical: normL(4),
  },
  stagePillText: { color: '#e8d5b5', fontFamily: 'PixelFont', fontSize: normL(12) },
  cogIcon: { color: '#5a7aaa', fontFamily: 'PixelFont', fontSize: normL(10) },
  boardArea: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: normL(8) },
  board: {
    backgroundColor: '#0f1a2e',
    borderWidth: 2,
    borderColor: '#1e3050',
    borderRadius: normL(8),
    overflow: 'hidden',
    position: 'relative',
  },
  tile: { position: 'absolute', borderWidth: 1, borderColor: '#162130' },
  groundTile: { backgroundColor: '#111e30' },
  pathTile: { backgroundColor: '#6e4a2c' },
  baseTile: { backgroundColor: '#6e1a1a' },
  hoverTile: { position: 'absolute', borderWidth: 2, zIndex: 5 },
  hoverValid: { backgroundColor: 'rgba(63,191,127,0.3)', borderColor: '#3fbf7f' },
  hoverInvalid: { backgroundColor: 'rgba(255,99,99,0.3)', borderColor: '#ff6363' },
  tower: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1e3a5f',
    borderRadius: normL(6),
    borderWidth: 1,
    borderColor: '#5ac8ff',
    zIndex: 2,
  },
  enemy: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#5a0f22',
    borderRadius: normL(4),
    borderWidth: 1,
    borderColor: '#ff6363',
    zIndex: 3,
  },
  ghostTower: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1e3a5f',
    borderRadius: normL(6),
    borderWidth: 2,
    borderColor: '#5ac8ff',
    opacity: 0.7,
    zIndex: 10,
  },
  endOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.82)',
    zIndex: 20,
  },
  endPanel: {
    backgroundColor: '#080e1a',
    borderWidth: 2,
    borderRadius: normL(14),
    padding: normL(24),
    alignItems: 'center',
    width: '70%',
  },
  endTitle: { fontFamily: 'PixelFont', fontSize: normL(22), marginBottom: normL(8) },
  endSub: {
    color: '#8a9bc0',
    fontFamily: 'PixelFont',
    fontSize: normL(10),
    textAlign: 'center',
    marginBottom: normL(16),
  },
  endBtn: {
    borderWidth: 2,
    borderRadius: normL(8),
    paddingHorizontal: normL(20),
    paddingVertical: normL(10),
  },
  endBtnText: { color: '#fff', fontFamily: 'PixelFont', fontSize: normL(12) },
  hudBottom: {
    backgroundColor: '#0a0f1c',
    borderTopWidth: 1,
    borderTopColor: '#1e3050',
    paddingHorizontal: normL(16),
    paddingTop: normL(10),
    paddingBottom: normL(8),
  },
  msgText: {
    color: '#5a7aaa',
    fontFamily: 'PixelFont',
    fontSize: normL(9),
    marginBottom: normL(8),
    textAlign: 'center',
  },
  deckRow: { flexDirection: 'row', alignItems: 'center', gap: normL(12) },
  card: {
    width: normL(56),
    height: normL(64),
    backgroundColor: '#0f1e35',
    borderWidth: 2,
    borderColor: '#1e3050',
    borderRadius: normL(8),
    alignItems: 'center',
    justifyContent: 'center',
    gap: normL(4),
  },
  cardSelected: {
    borderColor: '#3fbf7f',
    shadowColor: '#3fbf7f',
    shadowOpacity: 0.8,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 0 },
    elevation: 6,
  },
  cardEmoji: { fontSize: normL(26), color: '#5ac8ff' },
  cardCost: { color: '#ffcf5c', fontFamily: 'PixelFont', fontSize: normL(9) },
  startBtn: {
    flex: 1,
    backgroundColor: '#0f2e1a',
    borderWidth: 2,
    borderColor: '#3fbf7f',
    borderRadius: normL(10),
    paddingVertical: normL(12),
    alignItems: 'center',
  },
  startBtnDisabled: { opacity: 0.4 },
  startBtnText: { color: '#3fbf7f', fontFamily: 'PixelFont', fontSize: normL(14), letterSpacing: 1 },
  menuOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.75)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuBox: {
    backgroundColor: '#0c1525',
    borderWidth: 2,
    borderColor: '#1e3050',
    borderRadius: normP(16),
    padding: normP(28),
    width: normP(280),
    alignItems: 'center',
  },
  menuTitle: { color: '#ffcf5c', fontFamily: 'PixelFont', fontSize: normP(22), marginBottom: normP(20) },
  menuItem: {
    width: '100%',
    backgroundColor: '#0f1e35',
    borderWidth: 1,
    borderColor: '#1e3050',
    borderRadius: normP(10),
    paddingVertical: normP(14),
    alignItems: 'center',
    marginBottom: normP(10),
  },
  menuItemText: { color: '#fff', fontFamily: 'PixelFont', fontSize: normP(14) },
});

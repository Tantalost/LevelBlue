import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  PixelRatio,
  Modal,
  Animated,
} from "react-native";

const { width } = Dimensions.get("window");
const BASE_WIDTH = 932;
const scaleFactor = width / BASE_WIDTH;
const normalize = (size: number) =>
  Math.round(PixelRatio.roundToNearestPixel(size * scaleFactor));
const bw = (size: number) => Math.max(1, normalize(size));

import {
  ENEMIES_PER_STAGE,
  POST_TEST_STAGE,
  STAGE_NUMBERS,
  WAVE_ENEMY_COUNTS,
  WAVES_PER_STAGE,
} from '../features/gameplay/constants/stages';
import type { BuildingKey, BuildingLevels } from '../features/gameplay/types';

export {
  ENEMIES_PER_STAGE,
  WAVE_ENEMY_COUNTS,
  WAVES_PER_STAGE,
} from '../features/gameplay/constants/stages';
export type { BuildingKey, BuildingLevels } from '../features/gameplay/types';

type StageSelectScreenProps = {
  visible: boolean;
  onClose?: () => void;
  navigation: any;
  currentStage: number;
  onSelectStage: (stage: number) => void;
  buildingLevels: BuildingLevels;
  onUpgradeBuilding: (building: BuildingKey) => void;
  moduleName?: string;
  highestUnlockedStage?: number;
  materials: number;
};

const BUILDINGS: {
  key: BuildingKey;
  name: string;
  icon: string;
  color: string;
  buffLabel: (level: number) => string;
  cost: number;
}[] = [
    {
      key: "tower",
      name: "Tower Keep",
      icon: "🏯",
      color: "#5ac8ff",
      buffLabel: (level) => `+${8 * level} DMG`,
      cost: 25,
    },
    {
      key: "glade",
      name: "Forest Glade",
      icon: "🌳",
      color: "#3fbf7f",
      buffLabel: (level) => `+${(0.5 * level).toFixed(1)} RANGE`,
      cost: 25,
    },
    {
      key: "forge",
      name: "Arcane Forge",
      icon: "⚒️",
      color: "#7f6fff",
      buffLabel: (level) => `-${100 * level}ms CD`,
      cost: 25,
    },
  ];

const STAR_LAYOUT = Array.from({ length: 26 }, (_, i) => {
  const seed = i * 137.5;
  return {
    top: `${Math.round((seed % 100) * 0.55)}%`,
    left: `${Math.round((seed * 1.7) % 100)}%`,
    size: i % 4 === 0 ? 3 : 2,
    delay: (i * 180) % 2000,
    duration: 1400 + ((i * 97) % 1400),
  };
});

function Star({
  top,
  left,
  size,
  delay,
  duration,
}: {
  top: string;
  left: string;
  size: number;
  delay: number;
  duration: number;
}) {
  const opacity = useRef(new Animated.Value(0.15)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.delay(delay),
        Animated.timing(opacity, {
          toValue: 1,
          duration,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0.15,
          duration,
          useNativeDriver: true,
        }),
      ]),
    ).start();
  }, []);

  return (
    <Animated.View
      style={{
        position: "absolute",
        top: top as any,
        left: left as any,
        width: size,
        height: size,
        borderRadius: size / 2,
        backgroundColor: "#cfe0ff",
        opacity,
      }}
    />
  );
}

export default function StageSelectScreen({
  visible,
  onClose,
  navigation,
  currentStage,
  onSelectStage,
  buildingLevels,
  onUpgradeBuilding,
  moduleName = "Module 1: The Basics",
  highestUnlockedStage = 1,
  materials = 0,
}: StageSelectScreenProps) {
  const stars = useMemo(() => STAR_LAYOUT, []);
  const [selectedConfirmStage, setSelectedConfirmStage] = useState<number | null>(null);

  // Fully unmount on iOS — a hidden Modal still blocks touches on screens pushed above Dashboard
  if (!visible) return null;

  return (
    <Modal
      visible
      transparent
      animationType="fade"
      supportedOrientations={["landscape", "landscape-left", "landscape-right"]}
      onRequestClose={onClose}
    >
      <View style={styles.screen}>
        <View style={StyleSheet.absoluteFill} pointerEvents="none">
          {stars.map((star, index) => (
            <Star key={index} {...star} />
          ))}
        </View>

        <View style={styles.topBar}>
          <Text style={styles.moduleTitle}>{moduleName}</Text>
          <Text style={styles.moduleSubtitle}>
            {WAVES_PER_STAGE} WAVES · {ENEMIES_PER_STAGE} ENEMIES PER STAGE
          </Text>
          <View style={styles.titleUnderline} />
        </View>

        {/* --- Materials Display (Top Left) --- */}
        <View style={styles.materialsBox}>
          <Text style={styles.materialsIcon}>🔧</Text>
          <Text style={styles.materialsText}>{materials}</Text>
        </View>

        <View style={styles.buildingRow}>
          {BUILDINGS.map((building) => {
            const level = buildingLevels[building.key];
            const canAfford = materials >= building.cost;
            return (
              <TouchableOpacity
                key={building.key}
                style={[styles.buildingNode, !canAfford && styles.buildingNodeDisabled]}
                activeOpacity={0.8}
                onPress={() => {
                   if (canAfford) onUpgradeBuilding(building.key);
                }}
              >
                <View
                  style={[
                    styles.buildingGlow,
                    { borderColor: building.color, shadowColor: building.color },
                  ]}
                >
                  <Text style={styles.buildingIcon}>{building.icon}</Text>
                  <View
                    style={[
                      styles.levelBadge,
                      { borderColor: building.color },
                    ]}
                  >
                    <Text style={styles.levelBadgeText}>Lv.{level}</Text>
                  </View>
                </View>
                <Text style={styles.buildingName}>{building.name}</Text>
                <Text style={[styles.buildingBuff, { color: building.color }]}>
                  {building.buffLabel(level)}
                </Text>
                <Text style={[styles.buildingCost, !canAfford && styles.costError]}>
                  {building.cost} Materials
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <View style={styles.groundBand}>
          <View style={styles.stageRow}>
            {STAGE_NUMBERS.map((stage) => {
              const isPostTest = stage === POST_TEST_STAGE;
              const isActive = currentStage === stage;
              const isLocked = stage > highestUnlockedStage;
              return (
                <TouchableOpacity
                  key={stage}
                  disabled={isLocked}
                  style={[
                    styles.stageChip,
                    isPostTest && styles.stageChipPostTest,
                    isActive && styles.stageChipActive,
                    isLocked && styles.stageChipLocked,
                  ]}
                  onPress={() => setSelectedConfirmStage(stage)}
                >
                  {isLocked ? (
                    <Text style={styles.stageChipLockIcon}>🔒</Text>
                  ) : isPostTest ? (
                    <>
                      <Text style={styles.stageChipIcon}>🎓</Text>
                      <Text style={styles.stageChipMicroLabel}>TEST</Text>
                    </>
                  ) : (
                    <Text
                      style={[
                        styles.stageChipText,
                        isActive && styles.stageChipTextActive,
                      ]}
                    >
                      {stage}
                    </Text>
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        <TouchableOpacity
          style={styles.homeButton}
          onPress={() => {
            onClose?.();
            navigation.navigate("Dashboard");
          }}
        >
          <Text style={styles.homeButtonIcon}>🏠</Text>
          <Text style={styles.homeButtonText}>HOME</Text>
        </TouchableOpacity>
      </View>

      <Modal
        visible={selectedConfirmStage !== null}
        transparent
        animationType="fade"
        supportedOrientations={["landscape", "landscape-left", "landscape-right"]}
      >
        <View style={styles.confirmOverlay}>
          <View style={styles.confirmBox}>
            <Text style={styles.confirmTitle}>CONFIRM DEPLOYMENT</Text>
            <Text style={styles.confirmText}>
              Are you sure you want to run Stage {selectedConfirmStage}?
            </Text>
            <View style={styles.confirmButtonRow}>
              <TouchableOpacity
                style={styles.confirmBtnNo}
                onPress={() => setSelectedConfirmStage(null)}
              >
                <Text style={styles.confirmBtnText}>NO</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.confirmBtnYes}
                onPress={() => {
                  if (selectedConfirmStage !== null) {
                    const stage = selectedConfirmStage;
                    setSelectedConfirmStage(null);
                    requestAnimationFrame(() => onSelectStage(stage));
                  }
                }}
              >
                <Text style={styles.confirmBtnText}>YES</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </Modal>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#0b0a1a",
  },
  topBar: {
    alignItems: "center",
    paddingTop: normalize(32),
  },
  moduleTitle: {
    color: "#f3f0ff",
    fontFamily: "PixelFont",
    fontSize: normalize(20),
    textShadowColor: "#5ac8ff",
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 8,
  },
  moduleSubtitle: {
    marginTop: normalize(4),
    color: "#8a86b0",
    fontFamily: "PixelFont",
    fontSize: normalize(9),
    letterSpacing: 1,
  },
  titleUnderline: {
    marginTop: normalize(8),
    width: normalize(140),
    height: bw(2),
    backgroundColor: "#5ac8ff",
    opacity: 0.6,
  },

  materialsBox: {
    position: "absolute",
    top: normalize(24),
    left: normalize(24),
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.6)",
    borderWidth: bw(2),
    borderColor: "#e8d5b5",
    borderRadius: normalize(8),
    paddingVertical: normalize(6),
    paddingHorizontal: normalize(12),
    gap: normalize(8),
  },
  materialsIcon: {
    fontSize: normalize(16),
  },
  materialsText: {
    color: "#fff",
    fontFamily: "PixelFont",
    fontSize: normalize(14),
  },

  buildingRow: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: normalize(46),
  },
  buildingNode: {
    alignItems: "center",
  },
  buildingNodeDisabled: {
    opacity: 0.5,
  },
  buildingGlow: {
    width: normalize(84),
    height: normalize(84),
    borderRadius: normalize(20),
    borderWidth: bw(2),
    backgroundColor: "rgba(20, 18, 40, 0.85)",
    alignItems: "center",
    justifyContent: "center",
    shadowOpacity: 0.8,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 0 },
    elevation: 10,
  },
  buildingIcon: {
    fontSize: normalize(34),
  },
  levelBadge: {
    position: "absolute",
    bottom: normalize(-10),
    backgroundColor: "#0b0a1a",
    borderWidth: bw(1),
    borderRadius: normalize(8),
    paddingHorizontal: normalize(8),
    paddingVertical: normalize(2),
  },
  levelBadgeText: {
    color: "#f3f0ff",
    fontFamily: "PixelFont",
    fontSize: normalize(9),
  },
  buildingName: {
    marginTop: normalize(16),
    color: "#f3f0ff",
    fontFamily: "PixelFont",
    fontSize: normalize(11),
  },
  buildingBuff: {
    marginTop: normalize(6),
    fontFamily: "PixelFont",
    fontSize: normalize(11),
  },
  buildingCost: {
    marginTop: normalize(6),
    color: "#8a86b0",
    fontFamily: "PixelFont",
    fontSize: normalize(8),
  },
  costError: {
    color: "#ff6363",
  },

  groundBand: {
    borderTopWidth: bw(2),
    borderTopColor: "rgba(63, 191, 127, 0.5)",
    backgroundColor: "rgba(18, 36, 26, 0.55)",
    paddingVertical: normalize(18),
    alignItems: "center",
  },
  stageRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: normalize(14),
  },
  stageChip: {
    width: normalize(44),
    height: normalize(44),
    borderRadius: normalize(12),
    borderWidth: bw(2),
    borderColor: "#3fbf7f",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#0e1a13",
  },
  stageChipActive: {
    backgroundColor: "#3fbf7f",
  },
  stageChipLocked: {
    borderColor: "#3a3a4a",
    backgroundColor: "#15141f",
    opacity: 0.55,
  },
  stageChipLockIcon: {
    fontSize: normalize(16),
    opacity: 0.8,
  },
  stageChipText: {
    color: "#dff5e8",
    fontFamily: "PixelFont",
    fontSize: normalize(16),
  },
  stageChipTextActive: {
    color: "#0b0a1a",
  },
  stageChipPostTest: {
    borderColor: "#ffcf5c",
    backgroundColor: "#241a0e",
  },
  stageChipIcon: {
    fontSize: normalize(16),
  },
  stageChipMicroLabel: {
    color: "#ffcf5c",
    fontFamily: "PixelFont",
    fontSize: normalize(6),
    marginTop: normalize(2),
  },

  homeButton: {
    position: "absolute",
    top: normalize(24),
    right: normalize(24),
    flexDirection: "row",
    alignItems: "center",
    gap: normalize(8),
    borderWidth: bw(2),
    borderColor: "#7f6fff",
    borderRadius: normalize(10),
    paddingVertical: normalize(10),
    paddingHorizontal: normalize(22),
  },
  homeButtonIcon: {
    fontSize: normalize(14),
  },
  homeButtonText: {
    color: "#f3d9ff",
    fontFamily: "PixelFont",
    fontSize: normalize(12),
  },
  confirmOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.85)",
    justifyContent: "center",
    alignItems: "center",
  },
  confirmBox: {
    backgroundColor: "#1a1016",
    borderWidth: bw(3),
    borderColor: "#3fbf7f",
    borderRadius: normalize(12),
    padding: normalize(24),
    alignItems: "center",
    width: normalize(400),
  },
  confirmTitle: {
    color: "#3fbf7f",
    fontFamily: "PixelFont",
    fontSize: normalize(20),
    marginBottom: normalize(16),
  },
  confirmText: {
    color: "#fff",
    fontFamily: "PixelFont",
    fontSize: normalize(14),
    marginBottom: normalize(24),
    textAlign: "center",
  },
  confirmButtonRow: {
    flexDirection: "row",
    gap: normalize(20),
  },
  confirmBtnNo: {
    backgroundColor: "#1a1016",
    borderWidth: bw(2),
    borderColor: "#ff6363",
    borderRadius: normalize(8),
    paddingVertical: normalize(10),
    paddingHorizontal: normalize(24),
  },
  confirmBtnYes: {
    backgroundColor: "#3fbf7f",
    borderWidth: bw(2),
    borderColor: "#fff",
    borderRadius: normalize(8),
    paddingVertical: normalize(10),
    paddingHorizontal: normalize(24),
  },
  confirmBtnText: {
    color: "#fff",
    fontFamily: "PixelFont",
    fontSize: normalize(16),
  },
});
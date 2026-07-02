import React, { useEffect, useMemo, useRef } from "react";
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

const STAGE_NUMBERS = [1, 2, 3, 4, 5];
const POST_TEST_STAGE = STAGE_NUMBERS[STAGE_NUMBERS.length - 1];

export type BuildingKey = "tower" | "glade" | "forge";
export type BuildingLevels = {
  tower: number;
  glade: number;
  forge: number;
};

type StageSelectScreenProps = {
  visible: boolean;
  onClose: () => void;
  currentStage: number;
  onSelectStage: (stage: number) => void;
  buildingLevels: BuildingLevels;
  onUpgradeBuilding: (building: BuildingKey) => void;
  moduleName?: string;
};

const BUILDINGS: {
  key: BuildingKey;
  name: string;
  icon: string;
  color: string;
  buffLabel: (level: number) => string;
}[] = [
  {
    key: "tower",
    name: "Tower Keep",
    icon: "🏯",
    color: "#5ac8ff",
    buffLabel: (level) => `+${8 * level} DMG`,
  },
  {
    key: "glade",
    name: "Forest Glade",
    icon: "🌳",
    color: "#3fbf7f",
    buffLabel: (level) => `+${(0.5 * level).toFixed(1)} RANGE`,
  },
  {
    key: "forge",
    name: "Arcane Forge",
    icon: "⚒️",
    color: "#7f6fff",
    buffLabel: (level) => `-${200 * level}ms CD`,
  },
];

// A handful of fixed, twinkling background stars — same technique as the
// FloatingDot component on the intro screen, just simplified to plain
// opacity pulses since these don't need to drift.
const STAR_LAYOUT = Array.from({ length: 26 }, (_, i) => {
  // Deterministic pseudo-scatter so the layout doesn't reshuffle on every
  // re-render (this only runs once, at module load).
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
        top,
        left,
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
  currentStage,
  onSelectStage,
  buildingLevels,
  onUpgradeBuilding,
  moduleName = "Module 1: The Basics",
}: StageSelectScreenProps) {
  const stars = useMemo(() => STAR_LAYOUT, []);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      supportedOrientations={[
        "landscape",
        "landscape-left",
        "landscape-right",
      ]}
    >
      <View style={styles.screen}>
        <View style={StyleSheet.absoluteFill} pointerEvents="none">
          {stars.map((star, index) => (
            <Star key={index} {...star} />
          ))}
        </View>

        <View style={styles.topBar}>
          <Text style={styles.moduleTitle}>{moduleName}</Text>
          <View style={styles.titleUnderline} />
        </View>

        {/* Three upgradeable buildings — tap one to spend materials and
            grow it, piece by piece, into the next level. */}
        <View style={styles.buildingRow}>
          {BUILDINGS.map((building) => {
            const level = buildingLevels[building.key];
            return (
              <TouchableOpacity
                key={building.key}
                style={styles.buildingNode}
                activeOpacity={0.8}
                onPress={() => onUpgradeBuilding(building.key)}
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
                <Text style={styles.buildingCost}>Tap to upgrade · 25g</Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <View style={styles.groundBand}>
          <View style={styles.stageRow}>
            {STAGE_NUMBERS.map((stage) => {
              const isPostTest = stage === POST_TEST_STAGE;
              const isActive = currentStage === stage;
              return (
                <TouchableOpacity
                  key={stage}
                  style={[
                    styles.stageChip,
                    isPostTest && styles.stageChipPostTest,
                    isActive && styles.stageChipActive,
                  ]}
                  onPress={() => onSelectStage(stage)}
                >
                  {isPostTest ? (
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

        <TouchableOpacity style={styles.closeButton} onPress={onClose}>
          <Text style={styles.closeButtonText}>BACK</Text>
        </TouchableOpacity>
      </View>
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
  titleUnderline: {
    marginTop: normalize(8),
    width: normalize(140),
    height: bw(2),
    backgroundColor: "#5ac8ff",
    opacity: 0.6,
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

  closeButton: {
    position: "absolute",
    top: normalize(24),
    right: normalize(24),
    borderWidth: bw(2),
    borderColor: "#7f6fff",
    borderRadius: normalize(10),
    paddingVertical: normalize(10),
    paddingHorizontal: normalize(22),
  },
  closeButtonText: {
    color: "#f3d9ff",
    fontFamily: "PixelFont",
    fontSize: normalize(12),
  },
});
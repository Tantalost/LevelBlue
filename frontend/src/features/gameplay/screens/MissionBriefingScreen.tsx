import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  SafeAreaView,
  StatusBar,
  ScrollView,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { StageBriefing } from '../data/briefings';
import { normP } from '../utils/scaling';

type Props = {
  stage: number;
  moduleName: string;
  briefing: StageBriefing;
  onBegin: () => void;
  onAbort: () => void;
};

export default function MissionBriefingScreen({
  stage,
  moduleName,
  briefing,
  onBegin,
  onAbort,
}: Props) {
  const insets = useSafeAreaInsets();

  return (
    <View style={styles.container}>
      <StatusBar hidden />
      <View style={styles.topRedLine} pointerEvents="none" />

      <SafeAreaView style={styles.safeArea}>
        <View style={styles.topBar}>
          <Pressable
            onPress={onAbort}
            style={styles.consoleBtn}
            hitSlop={12}
          >
            <Text style={styles.consoleBtnText}>{'< Abort'}</Text>
          </Pressable>
          <View style={styles.liveBadge}>
            <View style={styles.liveDot} />
            <Text style={styles.liveText}>LIVE INTEL</Text>
          </View>
        </View>

        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <Text style={styles.kicker}>MISSION BRIEFING</Text>
          <Text style={styles.moduleText}>{moduleName.toUpperCase()}</Text>
          <Text style={styles.titleText}>STAGE {stage}</Text>
          <Text style={styles.threatTitle}>{briefing.threatTitle}</Text>
          <Text style={styles.subtitleText}>{briefing.threatDescription}</Text>

          <View style={styles.intelCard}>
            <Text style={styles.intelLabel}>PRIMARY SKILL VECTOR</Text>
            <Text style={styles.intelValue}>{briefing.primaryTopic}</Text>
            <Text style={styles.intelHint}>
              Threat assessment will update your BKT probability of learning (P(L)) for this
              domain before combat deployment.
            </Text>
          </View>

          <View style={styles.objectivesSection}>
            <Text style={styles.objectivesTitle}>MISSION OBJECTIVES</Text>
            {briefing.objectives.map((objective, index) => (
              <View key={index} style={styles.objectiveRow}>
                <Text style={styles.objectiveBullet}>{index + 1}</Text>
                <Text style={styles.objectiveText}>{objective}</Text>
              </View>
            ))}
          </View>
        </ScrollView>

        <Pressable
          style={[styles.playButton, { paddingBottom: Math.max(normP(18), insets.bottom) }]}
          onPress={onBegin}
        >
          <Text style={styles.playButtonTitle}>BEGIN THREAT ASSESSMENT</Text>
          <Text style={styles.playButtonSub}>PROCEED TO BKT ENGINE</Text>
        </Pressable>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0c161e' },
  topRedLine: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: normP(4),
    backgroundColor: '#e74c3c',
  },
  safeArea: { flex: 1 },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: normP(20),
    paddingTop: normP(12),
  },
  consoleBtn: { paddingVertical: normP(6) },
  consoleBtnText: { color: '#bdc3c7', fontSize: normP(13), fontWeight: '700' },
  liveBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#c0392b',
    borderRadius: normP(4),
    paddingHorizontal: normP(8),
    paddingVertical: normP(4),
  },
  liveDot: {
    width: normP(6),
    height: normP(6),
    borderRadius: normP(3),
    backgroundColor: '#e74c3c',
    marginRight: normP(6),
  },
  liveText: { color: '#e74c3c', fontSize: normP(9), fontWeight: '900', letterSpacing: 1 },
  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: normP(24), paddingBottom: normP(16) },
  kicker: {
    color: '#5a7aaa',
    fontFamily: 'PixelFont',
    fontSize: normP(9),
    letterSpacing: 2,
    marginTop: normP(8),
  },
  moduleText: {
    color: '#00d2d3',
    fontSize: normP(11),
    fontWeight: '800',
    letterSpacing: 1.5,
    marginTop: normP(8),
  },
  titleText: {
    color: '#ffffff',
    fontFamily: 'PixelFont',
    fontSize: normP(28),
    marginTop: normP(6),
    marginBottom: normP(8),
  },
  threatTitle: {
    color: '#ffcf5c',
    fontFamily: 'PixelFont',
    fontSize: normP(14),
    marginBottom: normP(10),
  },
  subtitleText: {
    color: '#95a5a6',
    fontSize: normP(13),
    lineHeight: normP(20),
    marginBottom: normP(20),
  },
  intelCard: {
    backgroundColor: '#111c28',
    borderWidth: 1,
    borderColor: '#2c3e50',
    borderRadius: normP(10),
    padding: normP(14),
    marginBottom: normP(20),
  },
  intelLabel: {
    color: '#5a7aaa',
    fontFamily: 'PixelFont',
    fontSize: normP(8),
    letterSpacing: 1.5,
    marginBottom: normP(6),
  },
  intelValue: {
    color: '#48dbfb',
    fontFamily: 'PixelFont',
    fontSize: normP(16),
    marginBottom: normP(8),
  },
  intelHint: { color: '#7f8c8d', fontSize: normP(11), lineHeight: normP(16) },
  objectivesSection: { marginBottom: normP(12) },
  objectivesTitle: {
    color: '#34495e',
    fontSize: normP(10),
    fontWeight: '900',
    letterSpacing: 2,
    marginBottom: normP(12),
  },
  objectiveRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: normP(10),
    gap: normP(10),
  },
  objectiveBullet: {
    color: '#3fbf7f',
    fontFamily: 'PixelFont',
    fontSize: normP(12),
    width: normP(18),
  },
  objectiveText: { flex: 1, color: '#dfe6e9', fontSize: normP(12), lineHeight: normP(18) },
  playButton: {
    backgroundColor: '#48dbfb',
    paddingVertical: normP(18),
    paddingHorizontal: normP(24),
    alignItems: 'center',
  },
  playButtonTitle: {
    color: '#ffffff',
    fontFamily: 'PixelFont',
    fontSize: normP(13),
    letterSpacing: 1,
  },
  playButtonSub: {
    color: '#0abde3',
    fontSize: normP(9),
    fontWeight: '800',
    letterSpacing: 2,
    marginTop: normP(4),
  },
});

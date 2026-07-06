import React, { useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  StatusBar,
  useWindowDimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { STAGE_CLEAR_MATERIALS } from '../constants/stages';
import { formatMasteryPercent } from '../engine/combatBridge';
import type { CombatPayload } from '../types';

const GRADE_COLORS: Record<CombatPayload['grade'], string> = {
  S: '#ffcf5c',
  A: '#3fbf7f',
  B: '#5ac8ff',
  C: '#c87fff',
  D: '#ff6363',
};

type Props = {
  combat: CombatPayload;
  onContinue: () => void;
};

function useCompactScale() {
  const { width, height } = useWindowDimensions();
  const shortSide = Math.min(width, height);

  return useMemo(() => {
    // iPhone landscape usable height is the short axis (~360–430pt)
    const scale = Math.min(shortSide / 430, 0.92);
    const n = (size: number) => Math.max(8, Math.round(size * scale));
    return { n, compact: shortSide < 440 };
  }, [shortSide]);
}

export default function AssessmentResultsScreen({ combat, onContinue }: Props) {
  const tierColor = GRADE_COLORS[combat.grade];
  const { n, compact } = useCompactScale();
  const insets = useSafeAreaInsets();
  const styles = useMemo(() => makeStyles(n), [n]);

  const stats = [
    {
      label: `P(L) · ${combat.primaryTopic}`,
      value: formatMasteryPercent(combat.masteryPl),
      badge: combat.bktSynced ? 'SYNCED' : 'LOCAL',
      badgeColor: '#5ac8ff',
      badgeBg: '#101828',
    },
    {
      label: 'Starting Gold',
      value: `+${combat.startingGold}g`,
      badge: `${combat.correctCount} ok`,
      badgeColor: '#ffcf5c',
      badgeBg: '#2a1800',
    },
    {
      label: 'Base Health',
      value: `${combat.baseHealth} HP`,
      badge: combat.wrongCount === 0 ? 'FULL' : `-${combat.wrongCount}`,
      badgeColor: '#3fbf7f',
      badgeBg: '#0a1a12',
    },
    {
      label: 'Win Bonus',
      value: `+${STAGE_CLEAR_MATERIALS} mat`,
      badge: 'CLEAR',
      badgeColor: '#5ac8ff',
      badgeBg: '#101828',
    },
  ];

  return (
    <View style={styles.root}>
      <StatusBar hidden />
      <View style={[styles.content, { paddingBottom: Math.max(n(8), insets.bottom) }]}>
        <View style={styles.headerRow}>
          <View style={styles.headerLeft}>
            <Text style={styles.title}>ANALYSIS COMPLETE</Text>
            <Text style={styles.scoreLine}>
              {combat.correctCount}/{combat.totalQuestions} correct · Grade {combat.grade}
            </Text>
          </View>
          <View style={[styles.gradeBadge, { borderColor: tierColor, shadowColor: tierColor }]}>
            <Text style={[styles.gradeText, { color: tierColor }]}>{combat.grade}</Text>
          </View>
        </View>

        <View style={styles.rewardsCard}>
          {stats.map((row, index) => (
            <View
              key={row.label}
              style={[styles.rewardRow, index > 0 && styles.rewardRowBorder]}
            >
              <View style={styles.rewardInfo}>
                <Text style={styles.rewardLabel} numberOfLines={1}>
                  {row.label}
                </Text>
                <Text style={styles.rewardValue} numberOfLines={1}>
                  {row.value}
                </Text>
              </View>
              <View style={[styles.rewardBadge, { backgroundColor: row.badgeBg }]}>
                <Text style={[styles.rewardBadgeText, { color: row.badgeColor }]}>
                  {row.badge}
                </Text>
              </View>
            </View>
          ))}
        </View>

        {!compact && (
          <Text style={styles.tipText} numberOfLines={2}>
            P(L) scaled your gold and HP. Deploy wisely with {combat.startingGold}g.
          </Text>
        )}

        <Pressable style={styles.continueBtn} onPress={onContinue}>
          <Text style={styles.continueBtnText}>BEGIN BREACH</Text>
        </Pressable>
      </View>
    </View>
  );
}

function makeStyles(n: (size: number) => number) {
  return StyleSheet.create({
    root: { flex: 1, backgroundColor: '#080e1a' },
    content: {
      flex: 1,
      paddingHorizontal: n(16),
      paddingTop: n(6),
      justifyContent: 'center',
      gap: n(8),
    },
    headerRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: n(10),
    },
    headerLeft: { flex: 1 },
    title: {
      color: '#ffcf5c',
      fontFamily: 'PixelFont',
      fontSize: n(11),
      letterSpacing: 1.5,
    },
    scoreLine: {
      color: '#8a9bc0',
      fontFamily: 'PixelFont',
      fontSize: n(8),
      marginTop: n(3),
    },
    gradeBadge: {
      borderWidth: 2,
      borderRadius: n(10),
      paddingHorizontal: n(14),
      paddingVertical: n(6),
      alignItems: 'center',
      justifyContent: 'center',
      minWidth: n(52),
      shadowOpacity: 0.5,
      shadowRadius: n(8),
      shadowOffset: { width: 0, height: 0 },
    },
    gradeText: {
      fontFamily: 'PixelFont',
      fontSize: n(26),
      lineHeight: n(28),
    },
    rewardsCard: {
      backgroundColor: '#0c1525',
      borderWidth: 1,
      borderColor: '#1e3050',
      borderRadius: n(10),
      paddingHorizontal: n(10),
      paddingVertical: n(4),
    },
    rewardRow: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: n(6),
      gap: n(8),
    },
    rewardRowBorder: {
      borderTopWidth: 1,
      borderTopColor: '#1e3050',
    },
    rewardInfo: { flex: 1, minWidth: 0 },
    rewardLabel: { color: '#5a7aaa', fontSize: n(9) },
    rewardValue: {
      color: '#fff',
      fontFamily: 'PixelFont',
      fontSize: n(10),
      marginTop: n(1),
    },
    rewardBadge: {
      paddingHorizontal: n(7),
      paddingVertical: n(3),
      borderRadius: n(5),
      flexShrink: 0,
    },
    rewardBadgeText: { fontFamily: 'PixelFont', fontSize: n(8) },
    tipText: {
      color: '#5a7aaa',
      fontSize: n(9),
      lineHeight: n(13),
      textAlign: 'center',
    },
    continueBtn: {
      backgroundColor: '#0f2e1a',
      borderWidth: 2,
      borderColor: '#3fbf7f',
      borderRadius: n(10),
      paddingVertical: n(12),
      alignItems: 'center',
    },
    continueBtnText: {
      color: '#3fbf7f',
      fontFamily: 'PixelFont',
      fontSize: n(11),
      letterSpacing: 1,
    },
  });
}

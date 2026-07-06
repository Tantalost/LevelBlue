import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, StatusBar, SafeAreaView } from 'react-native';
import type { StageOutcome } from '../types';
import { normP } from '../utils/scaling';

type Props = {
  outcome: StageOutcome;
  onContinue: () => void;
};

export default function PostActionReportScreen({ outcome, onContinue }: Props) {
  const cleared = outcome.cleared;
  const accent = cleared ? '#3fbf7f' : '#ff6363';

  return (
    <View style={styles.root}>
      <StatusBar hidden />
      <SafeAreaView style={styles.safe}>
        <View style={styles.content}>
          <Text style={styles.kicker}>POST-ACTION REPORT</Text>
          <Text style={[styles.title, { color: accent }]}>
            {cleared ? 'MISSION SUCCESS' : 'MISSION FAILED'}
          </Text>
          <Text style={styles.subtitle}>Stage {outcome.stage} debrief complete.</Text>

          <View style={styles.card}>
            <Text style={styles.cardTitle}>REWARDS</Text>
            <View style={styles.row}>
              <Text style={styles.label}>Upgrade Materials</Text>
              <Text style={[styles.value, { color: '#ffcf5c' }]}>
                +{outcome.materialsEarned}
              </Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.label}>Threat Points</Text>
              <Text style={[styles.value, { color: '#ff6363' }]}>
                +{outcome.threatPointsEarned}
              </Text>
            </View>
          </View>

          <View style={styles.tipBox}>
            <Text style={styles.tipText}>
              {cleared
                ? 'Return to Stage Select to upgrade your defenses before the next deployment.'
                : 'Review your threat assessment answers — wrong calls reduce base health at deployment.'}
            </Text>
          </View>

          <TouchableOpacity
            style={[styles.continueBtn, { borderColor: accent }]}
            onPress={onContinue}
            activeOpacity={0.7}
          >
            <Text style={[styles.continueBtnText, { color: accent }]}>RETURN TO STAGE SELECT</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#080e1a' },
  safe: { flex: 1 },
  content: {
    flex: 1,
    paddingHorizontal: normP(24),
    paddingTop: normP(16),
    paddingBottom: normP(24),
    justifyContent: 'center',
  },
  kicker: {
    color: '#5a7aaa',
    fontFamily: 'PixelFont',
    fontSize: normP(10),
    letterSpacing: 2,
    textAlign: 'center',
    marginBottom: normP(8),
  },
  title: {
    fontFamily: 'PixelFont',
    fontSize: normP(22),
    textAlign: 'center',
    marginBottom: normP(8),
  },
  subtitle: {
    color: '#8a9bc0',
    fontFamily: 'PixelFont',
    fontSize: normP(11),
    textAlign: 'center',
    marginBottom: normP(24),
  },
  card: {
    backgroundColor: '#0c1525',
    borderWidth: 1,
    borderColor: '#1e3050',
    borderRadius: normP(14),
    padding: normP(16),
    marginBottom: normP(16),
  },
  cardTitle: {
    color: '#5a7aaa',
    fontFamily: 'PixelFont',
    fontSize: normP(8),
    letterSpacing: 2,
    marginBottom: normP(12),
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: normP(10),
  },
  label: { color: '#8a9bc0', fontSize: normP(12) },
  value: { fontFamily: 'PixelFont', fontSize: normP(14) },
  tipBox: {
    backgroundColor: '#0f1e35',
    borderWidth: 1,
    borderColor: '#1e3050',
    borderRadius: normP(12),
    padding: normP(12),
    marginBottom: normP(20),
  },
  tipText: { color: '#5a7aaa', fontSize: normP(12), lineHeight: normP(18), textAlign: 'center' },
  continueBtn: {
    backgroundColor: '#0c1525',
    borderWidth: 2,
    borderRadius: normP(12),
    paddingVertical: normP(16),
    alignItems: 'center',
  },
  continueBtnText: { fontFamily: 'PixelFont', fontSize: normP(12), letterSpacing: 1 },
});

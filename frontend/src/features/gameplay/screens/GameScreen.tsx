import React, { useCallback, useMemo, useState } from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import { useAuthStore } from '../../../store/useAuthStore';
import { useProgressionStore } from '../../../store/useProgressionStore';
import { getStageBriefing } from '../data/briefings';
import { getQuestionsForStage } from '../data/questions';
import { computeCombatPayload, computeStageRewards } from '../engine/combatBridge';
import AssessmentResultsScreen from './AssessmentResultsScreen';
import MissionBriefingScreen from './MissionBriefingScreen';
import PostActionReportScreen from './PostActionReportScreen';
import ThreatAssessmentScreen from './ThreatAssessmentScreen';
import TowerDefenseScreen from './TowerDefenseScreen';
import MenteeVetoModal from './MenteeVetoModal';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';
import type {
  BktAssessmentSummary,
  CombatPayload,
  GamePhase,
  GameRouteParams,
  StageOutcome,
} from '../types';

type Props = {
  route: { params?: GameRouteParams };
  navigation: {
    navigate: (screen: string, params?: Record<string, unknown>) => void;
    replace: (screen: string, params?: Record<string, unknown>) => void;
  };
};

export default function GameScreen({ route, navigation }: Props) {
  const stage = route?.params?.stage ?? 1;
  const moduleName = route?.params?.moduleName ?? 'Module 1: The Basics';
  const briefing = useMemo(() => getStageBriefing(stage), [stage]);

  const studentId = useAuthStore((s) => s.user?._id ?? null);
  const buildingLevels = useProgressionStore((s) => s.buildingLevels);
  const applyStageClear = useProgressionStore((s) => s.applyStageClear);
  const setCurrentStage = useProgressionStore((s) => s.setCurrentStage);

  const [phase, setPhase] = useState<GamePhase>('BRIEFING');
  const [combat, setCombat] = useState<CombatPayload | null>(null);
  const [outcome, setOutcome] = useState<StageOutcome | null>(null);

  // VETO LOGIC STATE
  const [bounties, setBounties] = useState<any[]>([]);
  const [vetoBounty, setVetoBounty] = useState<any | null>(null);

  React.useEffect(() => {
    if (!studentId) return;
    const fetchBounties = async () => {
      try {
        const apiUrl = process.env.EXPO_PUBLIC_API_URL;
        const token = Platform.OS === 'web'
          ? await AsyncStorage.getItem('userToken')
          : await SecureStore.getItemAsync('userToken');
        const res = await fetch(`${apiUrl}/bounties/student/${studentId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.ok) setBounties(await res.json());
      } catch (e) {
        console.error('Error fetching bounties for game check:', e);
      }
    };
    fetchBounties();
  }, [studentId]);

  const totalQuestions = useMemo(() => getQuestionsForStage(stage).length, [stage]);

  const handleBriefingBegin = useCallback(() => {
    setPhase('THREAT_ASSESSMENT');
  }, []);

  const handleAssessmentComplete = useCallback(
    (correctCount: number, _answers: boolean[], bkt: BktAssessmentSummary) => {
      const payload = computeCombatPayload(correctCount, totalQuestions, buildingLevels, bkt);
      setCombat(payload);
      
      // MECHANIC 3: Mentee Veto Intercept
      if (payload.masteryPl >= 0.40) {
        const matchingBounty = bounties.find(b => 
          b.mentee_id === studentId && 
          b.topic === briefing.primaryTopic && 
          b.status === 'ACCEPTED'
        );
        if (matchingBounty) {
          setVetoBounty(matchingBounty);
          return; // Wait for modal choice before moving to RESULTS
        }
      }
      
      setPhase('RESULTS');
    },
    [buildingLevels, totalQuestions, bounties, studentId, briefing.primaryTopic],
  );

  const handleVetoConfirm = async () => {
    try {
      const apiUrl = process.env.EXPO_PUBLIC_API_URL;
      const token = Platform.OS === 'web'
        ? await AsyncStorage.getItem('userToken')
        : await SecureStore.getItemAsync('userToken');
      await fetch(`${apiUrl}/bounties/${vetoBounty.id}/validate`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}` }
      });
    } catch (e) {
      console.error(e);
    }
    setVetoBounty(null);
    setPhase('RESULTS');
  };

  const handleVetoDeny = async () => {
    try {
      const apiUrl = process.env.EXPO_PUBLIC_API_URL;
      const token = Platform.OS === 'web'
        ? await AsyncStorage.getItem('userToken')
        : await SecureStore.getItemAsync('userToken');
      await fetch(`${apiUrl}/bounties/${vetoBounty.id}/self-clear`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}` }
      });
    } catch (e) {
      console.error(e);
    }
    setVetoBounty(null);
    setPhase('RESULTS');
  };

  const handleResultsContinue = useCallback(() => {
    setPhase('TOWER_DEFENSE');
  }, []);

  const handleStageEnd = useCallback(
    (cleared: boolean) => {
      const rewards = computeStageRewards(cleared);
      if (cleared) {
        applyStageClear(stage, rewards.materialsEarned, rewards.threatPointsEarned);
      }
      setOutcome({
        cleared,
        stage,
        materialsEarned: rewards.materialsEarned,
        threatPointsEarned: rewards.threatPointsEarned,
      });
      setPhase('POST_REPORT');
    },
    [applyStageClear, stage],
  );

  const handleExitMission = useCallback(() => {
    navigation.replace('Dashboard');
  }, [navigation]);

  const handleReturnToStageSelect = useCallback(() => {
    setCurrentStage(stage);
    navigation.replace('Dashboard', { showStageSelect: true });
  }, [navigation, setCurrentStage, stage]);

  return (
    <View style={styles.root}>
      {phase === 'BRIEFING' && (
        <MissionBriefingScreen
          stage={stage}
          moduleName={moduleName}
          briefing={briefing}
          onBegin={handleBriefingBegin}
          onAbort={handleExitMission}
        />
      )}

      {phase === 'THREAT_ASSESSMENT' && (
        <ThreatAssessmentScreen
          stage={stage}
          moduleName={moduleName}
          primaryTopic={briefing.primaryTopic}
          studentId={studentId}
          onComplete={handleAssessmentComplete}
        />
      )}

      {phase === 'RESULTS' && combat && (
        <AssessmentResultsScreen combat={combat} onContinue={handleResultsContinue} />
      )}

      {phase === 'TOWER_DEFENSE' && combat && (
        <TowerDefenseScreen
          stage={stage}
          combat={combat}
          onStageEnd={handleStageEnd}
          onExit={handleExitMission}
        />
      )}

      {phase === 'POST_REPORT' && outcome && (
        <PostActionReportScreen
          outcome={outcome}
          onContinue={handleReturnToStageSelect}
        />
      )}

      {vetoBounty && (
        <MenteeVetoModal
          visible={!!vetoBounty}
          mentorName={vetoBounty.mentor?.name || 'Mentor'}
          topic={vetoBounty.topic}
          onConfirm={handleVetoConfirm}
          onDeny={handleVetoDeny}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#080e1a',
  },
});

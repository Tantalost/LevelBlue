import {
  GOLD_PER_CORRECT_ANSWER,
  MAX_BASE_HEALTH,
  STAGE_CLEAR_MATERIALS,
  STAGE_CLEAR_THREAT_POINTS,
} from '../constants/stages';
import type {
  AssessmentGrade,
  BktAssessmentSummary,
  BuildingLevels,
  CombatPayload,
} from '../types';
import { buildingLevelsToBuffs } from './buildingBuffs';

export function gradeFromCorrectCount(
  correctCount: number,
  totalQuestions: number,
): AssessmentGrade {
  const ratio = correctCount / totalQuestions;
  if (ratio >= 0.8) return 'S';
  if (ratio >= 0.6) return 'A';
  if (ratio >= 0.4) return 'B';
  if (ratio >= 0.2) return 'C';
  return 'D';
}

export function gradeFromMastery(masteryPl: number): AssessmentGrade {
  if (masteryPl >= 0.8) return 'S';
  if (masteryPl >= 0.6) return 'A';
  if (masteryPl >= 0.4) return 'B';
  if (masteryPl >= 0.2) return 'C';
  return 'D';
}

export function computeCombatPayload(
  correctCount: number,
  totalQuestions: number,
  buildingLevels: BuildingLevels,
  bkt: BktAssessmentSummary,
): CombatPayload {
  const wrongCount = totalQuestions - correctCount;
  const masteryPl = bkt.masteryPl;

  // High P(L) boosts gold; wrong answers still penalize base health.
  const masteryGoldMultiplier = 0.6 + masteryPl * 0.8;
  const startingGold = Math.round(
    correctCount * GOLD_PER_CORRECT_ANSWER * masteryGoldMultiplier,
  );

  const healthFromMastery = Math.round(MAX_BASE_HEALTH * masteryPl);
  const healthFromAccuracy = Math.max(1, MAX_BASE_HEALTH - wrongCount);
  const baseHealth = Math.max(
    1,
    Math.min(MAX_BASE_HEALTH, Math.round((healthFromMastery + healthFromAccuracy) / 2)),
  );

  const grade = bktSyncedGrade(bkt, correctCount, totalQuestions);

  return {
    startingGold,
    baseHealth,
    towerBuffs: buildingLevelsToBuffs(buildingLevels),
    correctCount,
    wrongCount,
    grade,
    totalQuestions,
    masteryPl,
    primaryTopic: bkt.primaryTopic,
    bktSynced: bkt.bktSynced,
  };
}

function bktSyncedGrade(
  bkt: BktAssessmentSummary,
  correctCount: number,
  totalQuestions: number,
): AssessmentGrade {
  if (bkt.bktSynced) {
    return gradeFromMastery(bkt.masteryPl);
  }
  return gradeFromCorrectCount(correctCount, totalQuestions);
}

export function computeStageRewards(cleared: boolean) {
  if (!cleared) {
    return { materialsEarned: 0, threatPointsEarned: 0 };
  }
  return {
    materialsEarned: STAGE_CLEAR_MATERIALS,
    threatPointsEarned: STAGE_CLEAR_THREAT_POINTS,
  };
}

export function formatMasteryPercent(masteryPl: number): string {
  return `${Math.round(masteryPl * 100)}%`;
}

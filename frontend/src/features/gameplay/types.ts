import type { BktTopic } from './constants/bktTopics';

export type BuildingKey = 'tower' | 'glade' | 'forge';

export type BuildingLevels = {
  tower: number;
  glade: number;
  forge: number;
};

export type TowerType = 'basic';

export type TowerBuffs = {
  damage: number;
  range: number;
  cooldown: number;
};

export type Enemy = {
  id: number;
  distance: number;
  hp: number;
  speed: number;
};

export type Tower = {
  id: number;
  type: TowerType;
  x: number;
  y: number;
  cooldown: number;
};

export type BoardLayout = {
  x: number;
  y: number;
  width: number;
  height: number;
};

export type TileCoord = { x: number; y: number };

export type GamePhase =
  | 'BRIEFING'
  | 'THREAT_ASSESSMENT'
  | 'RESULTS'
  | 'TOWER_DEFENSE'
  | 'POST_REPORT';

export type AssessmentGrade = 'S' | 'A' | 'B' | 'C' | 'D';

export type BktAssessmentSummary = {
  masteryPl: number;
  primaryTopic: BktTopic;
  topicMastery: Partial<Record<BktTopic, number>>;
  bktSynced: boolean;
};

export type TFQuestion = {
  id: number;
  topic: BktTopic;
  type: 'true_false';
  text: string;
  answer: boolean;
};

export type MCQuestion = {
  id: number;
  topic: BktTopic;
  type: 'multiple_choice';
  text: string;
  options: string[];
  answer: number;
};

export type SEQuestion = {
  id: number;
  topic: BktTopic;
  type: 'spot_error';
  stem: string;
  items: string[];
  answer: number;
};

export type AssessmentQuestion = TFQuestion | MCQuestion | SEQuestion;

export type CombatPayload = {
  startingGold: number;
  baseHealth: number;
  towerBuffs: TowerBuffs;
  correctCount: number;
  wrongCount: number;
  grade: AssessmentGrade;
  totalQuestions: number;
  masteryPl: number;
  primaryTopic: BktTopic;
  bktSynced: boolean;
};

export type StageOutcome = {
  cleared: boolean;
  stage: number;
  materialsEarned: number;
  threatPointsEarned: number;
};

export type GameRouteParams = {
  stage?: number;
  moduleId?: number;
  moduleName?: string;
};

import { create } from 'zustand';
import type { BuildingKey, BuildingLevels } from '../features/gameplay/types';

const BUILDING_UPGRADE_COST = 25;

type ProgressionState = {
  materials: number;
  threatPoints: number;
  highestUnlockedStage: number;
  currentStage: number;
  buildingLevels: BuildingLevels;
  setCurrentStage: (stage: number) => void;
  upgradeBuilding: (building: BuildingKey) => boolean;
  applyStageClear: (clearedStage: number, materialsEarned: number, threatPointsEarned: number) => void;
};

export const useProgressionStore = create<ProgressionState>((set, get) => ({
  materials: 1150,
  threatPoints: 2400,
  highestUnlockedStage: 1,
  currentStage: 1,
  buildingLevels: { tower: 1, glade: 1, forge: 1 },

  setCurrentStage: (stage) => set({ currentStage: stage }),

  upgradeBuilding: (building) => {
    const { materials, buildingLevels } = get();
    if (materials < BUILDING_UPGRADE_COST) return false;
    set({
      materials: materials - BUILDING_UPGRADE_COST,
      buildingLevels: {
        ...buildingLevels,
        [building]: buildingLevels[building] + 1,
      },
    });
    return true;
  },

  applyStageClear: (clearedStage, materialsEarned, threatPointsEarned) => {
    const { highestUnlockedStage, materials, threatPoints } = get();
    set({
      materials: materials + materialsEarned,
      threatPoints: threatPoints + threatPointsEarned,
      highestUnlockedStage: Math.max(highestUnlockedStage, clearedStage + 1),
      currentStage: Math.min(clearedStage + 1, 5),
    });
  },
}));

export { BUILDING_UPGRADE_COST };

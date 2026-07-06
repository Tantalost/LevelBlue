import type { BuildingLevels, TowerBuffs } from '../types';

export function buildingLevelsToBuffs(levels: BuildingLevels): TowerBuffs {
  return {
    damage: 8 * levels.tower,
    range: 0.5 * levels.glade,
    cooldown: 100 * levels.forge,
  };
}

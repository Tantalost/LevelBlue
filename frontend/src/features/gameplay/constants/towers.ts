import type { TowerType } from '../types';

export type TowerStatBlock = {
  cost: number;
  range: number;
  damage: number;
  cooldown: number;
};

export const TOWER_STATS: Record<TowerType, TowerStatBlock> = {
  basic: { cost: 25, range: 2.2, damage: 18, cooldown: 650 },
};

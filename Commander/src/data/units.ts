import { Unit, UnitType } from '../types';

export const createUnit = (
  id: string,
  type: UnitType,
  team: 'Blue' | 'Red',
  x: number = 0,
  y: number = 0
): Unit => {
  const unitStats = getUnitStats(type);
  
  return {
    id,
    type,
    team,
    x,
    y,
    hp: unitStats.maxHp,
    maxHp: unitStats.maxHp,
    attack: unitStats.attack,
    defense: unitStats.defense,
    movement: unitStats.movement,
    attackRange: unitStats.attackRange,
    moved: false,
    attacked: false,
    canCounterAttack: unitStats.canCounterAttack,
    unitClass: unitStats.unitClass,
    fuel: unitStats.maxFuel,
    maxFuel: unitStats.maxFuel,
    xp: 0
  };
};

const getUnitStats = (type: UnitType) => {
  switch (type) {
    case 'Infantry':
      return {
        maxHp: 10,
        attack: 4,
        defense: 2,
        movement: 3,
        attackRange: { min: 1, max: 1 },
        canCounterAttack: true,
        unitClass: 'Infantry' as const,
        maxFuel: 50
      };
    case 'Tank':
      return {
        maxHp: 20,
        attack: 8,
        defense: 6,
        movement: 4,
        attackRange: { min: 1, max: 1 },
        canCounterAttack: true,
        unitClass: 'Vehicle' as const,
        maxFuel: 40
      };
    case 'ArmoredCar':
      return {
        maxHp: 15,
        attack: 6,
        defense: 4,
        movement: 6,
        attackRange: { min: 1, max: 1 },
        canCounterAttack: true,
        unitClass: 'Vehicle' as const,
        maxFuel: 60
      };
    case 'Artillery':
      return {
        maxHp: 12,
        attack: 10,
        defense: 2,
        movement: 2,
        attackRange: { min: 2, max: 4 },
        canCounterAttack: false,
        unitClass: 'Vehicle' as const,
        maxFuel: 30
      };
    case 'AntiTank':
      return {
        maxHp: 8,
        attack: 6,
        defense: 3,
        movement: 2,
        attackRange: { min: 1, max: 2 },
        canCounterAttack: true,
        unitClass: 'Infantry' as const,
        maxFuel: 40
      };
  }
};

export const getPlayerStartingUnits = (): Unit[] => [
  createUnit('player-infantry-1', 'Infantry', 'Blue'),
  createUnit('player-infantry-2', 'Infantry', 'Blue'),
  createUnit('player-infantry-3', 'Infantry', 'Blue'),
  createUnit('player-infantry-4', 'Infantry', 'Blue'),
  createUnit('player-infantry-5', 'Infantry', 'Blue'),
  createUnit('player-tank-1', 'Tank', 'Blue'),
  createUnit('player-tank-2', 'Tank', 'Blue'),
  createUnit('player-tank-3', 'Tank', 'Blue'),
  createUnit('player-armored-1', 'ArmoredCar', 'Blue'),
  createUnit('player-armored-2', 'ArmoredCar', 'Blue')
];

export const getEnemyStartingUnits = (): Unit[] => [
  createUnit('enemy-infantry-1', 'Infantry', 'Red'),
  createUnit('enemy-infantry-2', 'Infantry', 'Red'),
  createUnit('enemy-tank-1', 'Tank', 'Red'),
  createUnit('enemy-artillery-1', 'Artillery', 'Red')
];
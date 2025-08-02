import { Unit, UnitType, Weapon, WeaponType } from '../types';

// Weapon creation functions
const createWeapon = (
  id: string,
  name: string,
  type: WeaponType,
  ammunition: number,
  range: { min: number; max: number },
  attack: number,
  effectiveness?: { [key: string]: number }
): Weapon => ({
  id,
  name,
  type,
  ammunition,
  maxAmmunition: ammunition,
  range,
  attack,
  effectiveness
});

// Faction-specific weapon definitions
const createBlueWeapons = (type: UnitType): Weapon[] => {
  switch (type) {
    case 'Tank':
      return [
        createWeapon('blue-tank-main-gun', '50mm主砲', '50mm主砲', 12, { min: 1, max: 1 }, 9),
        createWeapon('blue-tank-mg', '30cal機銃', '30cal機銃', 6, { min: 1, max: 1 }, 7)
      ];
    case 'ArmoredCar':
      return [
        createWeapon('blue-armored-mg', '30cal機銃', '30cal機銃', 6, { min: 1, max: 1 }, 7)
      ];
    case 'AntiTank':
      return [
        createWeapon('blue-antitank-gun', '57mm対戦車砲', '57mm対戦車砲', 10, { min: 1, max: 2 }, 8),
        createWeapon('blue-antitank-rifle', 'M1ライフル', 'M1ライフル', 4, { min: 1, max: 1 }, 5)
      ];
    case 'Artillery':
      return [
        createWeapon('blue-artillery-howitzer', '155mm榴弾砲', '155mm榴弾砲', 5, { min: 2, max: 6 }, 12),
        createWeapon('blue-artillery-rifle', 'M1ライフル', 'M1ライフル', 4, { min: 1, max: 1 }, 5)
      ];
    case 'Infantry':
      return [
        createWeapon('blue-infantry-mg', 'BAR機銃', 'BAR機銃', 10, { min: 1, max: 1 }, 5)
      ];
    default:
      return [];
  }
};

const createRedWeapons = (type: UnitType): Weapon[] => {
  switch (type) {
    case 'Tank':
      return [
        createWeapon('red-tank-main-gun', '37mm主砲', '37mm主砲', 11, { min: 1, max: 1 }, 8),
        createWeapon('red-tank-mg', '7.7mm機銃', '7.7mm機銃', 5, { min: 1, max: 1 }, 6)
      ];
    case 'ArmoredCar':
      return [
        createWeapon('red-armored-mg', '7.7mm機銃', '7.7mm機銃', 5, { min: 1, max: 1 }, 6)
      ];
    case 'AntiTank':
      return [
        createWeapon('red-antitank-gun', '47mm対戦車砲', '47mm対戦車砲', 9, { min: 1, max: 1 }, 7),
        createWeapon('red-antitank-rifle', '6.5mmライフル', '6.5mmライフル', 3, { min: 1, max: 1 }, 4)
      ];
    case 'Artillery':
      return [
        createWeapon('red-artillery-howitzer', '105mm野砲', '105mm野砲', 4, { min: 2, max: 5 }, 10),
        createWeapon('red-artillery-rifle', '6.5mmライフル', '6.5mmライフル', 3, { min: 1, max: 1 }, 4)
      ];
    case 'Infantry':
      return [
        createWeapon('red-infantry-mg', '99式軽機銃', '99式軽機銃', 8, { min: 1, max: 1 }, 4)
      ];
    default:
      return [];
  }
};

// Legacy function for backward compatibility
const createUnitWeapons = (type: UnitType, team?: 'Blue' | 'Red'): Weapon[] => {
  if (team === 'Blue') {
    return createBlueWeapons(type);
  } else if (team === 'Red') {
    return createRedWeapons(type);
  }
  // Default fallback to Blue weapons for compatibility
  return createBlueWeapons(type);
};

export const createUnit = (
  id: string,
  type: UnitType,
  team: 'Blue' | 'Red',
  x: number = 0,
  y: number = 0
): Unit => {
  const unitStats = getUnitStats(type);
  const weapons = createUnitWeapons(type, team);
  
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
    xp: 0,
    weapons
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
        attackRange: { min: 2, max: 5 },
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
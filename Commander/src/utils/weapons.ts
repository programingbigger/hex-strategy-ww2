import { Unit, Weapon, UnitClass } from '../types';

// Weapon utility functions

/**
 * 攻撃に使用可能な武器を取得する。
 * isSupplyKit: true の武器と canInitiateAttack: false の武器は除外する。
 */
export const getAttackableWeapons = (unit: Unit): Weapon[] => {
  if (!unit.weapons || !Array.isArray(unit.weapons)) {
    return [];
  }
  return unit.weapons.filter(weapon =>
    weapon.ammunition > 0 &&
    weapon.isSupplyKit !== true &&
    weapon.canInitiateAttack !== false
  );
};

export const getAvailableWeapons = (unit: Unit): Weapon[] => {
  if (!unit.weapons || !Array.isArray(unit.weapons)) {
    return [];
  }
  return unit.weapons.filter(weapon => weapon.ammunition > 0);
};

export const getWeaponsInRange = (unit: Unit, targetDistance: number): Weapon[] => {
  return getAttackableWeapons(unit).filter(weapon =>
    targetDistance >= weapon.range.min && targetDistance <= weapon.range.max
  );
};
/**
 * Get the primary attack range from unit's weapons
 * @param unit Unit to get attack range for
 * @returns Attack range object with min and max values
 */
export const getUnitAttackRange = (unit: Unit): { min: number; max: number } => {
  const weapons = getAvailableWeapons(unit);
  if (weapons.length === 0) {
    return { min: 1, max: 1 }; // Default range if no weapons
  }
  
  // Use the first weapon's range as primary range
  // TODO: Could be enhanced to find optimal range across all weapons
  return weapons[0].range;
};

/**
 * Get the primary attack power for a unit against a specific target class
 * @param unit Unit to get attack power for
 * @param targetClass Target unit class to attack
 * @returns Attack power value
 */
export const getUnitAttackPower = (unit: Unit, targetClass: UnitClass = 'Infantry'): number => {
  const weapons = getAvailableWeapons(unit);
  if (weapons.length === 0) {
    return 0; // No attack if no weapons
  }
  
  // Use the first weapon's attack power
  const weapon = weapons[0];
  if (Array.isArray(weapon.attack)) {
    const classAttack = weapon.attack.find(a => a.unitClass === targetClass);
    return classAttack ? classAttack.attack : 0;
  }
  
  return typeof weapon.attack === 'number' ? weapon.attack : 0;
};

export const canCounterAttack = (defender: Unit, attacker: Unit): boolean => {
  if (!defender.canCounterAttack) {
    return false;
  }
  
  // Check if defender has ammunition for appropriate counter-attack weapon
  const counterWeapon = selectCounterAttackWeapon(defender, attacker);
  if (!counterWeapon) {
    return false;
  }
  
  // Check if attacker is within effective range of counter-attack weapon
  const distance = 1; // Counter-attacks typically happen at range 1
  return distance >= counterWeapon.range.min && distance <= counterWeapon.range.max;
};

export const getMainWeapon = (unit: Unit): Weapon | undefined => {
  if (!unit.weapons || !Array.isArray(unit.weapons) || unit.weapons.length === 0) {
    return undefined;
  }
  return unit.weapons[0];
};

export const selectCounterAttackWeapon = (unit: Unit, attacker?: Unit): Weapon | undefined => {
  // Counter-attack weapon selection rules by unit type as per requirements
  
  if (!unit.weapons || !Array.isArray(unit.weapons) || unit.weapons.length === 0) {
    return undefined;
  }
  
  const availableWeapons = getAvailableWeapons(unit);
  if (availableWeapons.length === 0) {
    return undefined;
  }
  
  // Unit-type specific counter-attack weapon selection
  switch (unit.type) {
    case 'Tank': {
      // Always use main weapon (主砲). If main weapon is out of ammunition, use remaining sub-weapons
      const mainWeapon = getMainWeapon(unit);
      if (mainWeapon && mainWeapon.ammunition > 0) {
        return mainWeapon;
      }
      // Use any available sub-weapon
      return availableWeapons[0];
    }
    
    case 'ArmoredCar': {
      // Always use machine gun (機銃) regardless of attacking weapon type
      const machineGun = availableWeapons.find(w => 
        w.type === '36MG機銃' || w.type === '30cal機銃' || w.type === '7.7mm機銃'
      );
      return machineGun || availableWeapons[0];
    }
    
    case 'Infantry': {
      // Always use machine gun (機銃) regardless of attacking weapon type
      // Infantry uses legacy system but we handle it here for consistency
      return availableWeapons[0];
    }
    
    case 'Artillery': {
      // Use rifle (ライフル) for range-1 attacks (only weapon available at close range)
      const rifle = availableWeapons.find(w => 
        w.type === '9mmライフル' || w.type === 'M1ライフル' || w.type === '6.5mmライフル'
      );
      return rifle || availableWeapons[0];
    }
    
    case 'AntiTank': {
      // Use main gun (主砲) against armored targets, rifle (ライフル) against infantry targets
      if (attacker) {
        if (attacker.unitClass === 'Vehicle') {
          const mainGun = availableWeapons.find(w => 
            w.type === '37mm主砲' || w.type === '57mm対戦車砲' || w.type === '47mm対戦車砲'
          );
          return mainGun || availableWeapons[0];
        } else {
          const rifle = availableWeapons.find(w => 
            w.type === '9mmライフル' || w.type === 'M1ライフル' || w.type === '6.5mmライフル'
          );
          return rifle || availableWeapons[0];
        }
      }
      // Default to main weapon
      return availableWeapons[0];
    }
    
    default:
      return availableWeapons[0];
  }
};

export const consumeAmmunition = (unit: Unit, weaponId: string): Unit => {
  if (!unit.weapons || !Array.isArray(unit.weapons)) {
    return unit;
  }
  return {
    ...unit,
    weapons: unit.weapons.map(weapon => 
      weapon.id === weaponId 
        ? { ...weapon, ammunition: Math.max(0, weapon.ammunition - 1) }
        : weapon
    )
  };
};

export const hasAnyAmmunition = (unit: Unit): boolean => {
  if (!unit.weapons || !Array.isArray(unit.weapons)) {
    return false;
  }
  return unit.weapons.some(weapon => weapon.ammunition > 0);
};

export const getWeaponById = (unit: Unit, weaponId: string): Weapon | undefined => {
  if (!unit.weapons || !Array.isArray(unit.weapons)) {
    return undefined;
  }
  return unit.weapons.find(weapon => weapon.id === weaponId);
};

export const getMaxAttackRange = (unit: Unit): number => {
  const attackableWeapons = getAttackableWeapons(unit);
  if (attackableWeapons.length === 0) return 0;

  return Math.max(...attackableWeapons.map(weapon => weapon.range.max));
};

export const getMinAttackRange = (unit: Unit): number => {
  const attackableWeapons = getAttackableWeapons(unit);
  if (attackableWeapons.length === 0) return 0;

  return Math.min(...attackableWeapons.map(weapon => weapon.range.min));
};

// UnitClass-based attack utility functions
export const getWeaponAttackVsUnitClass = (weapon: Weapon, targetUnitClass: UnitClass): number => {
  // Handle both legacy number format and new unitClass array format
  if (typeof weapon.attack === 'number') {
    return weapon.attack;
  }

  if (Array.isArray(weapon.attack)) {
    const unitClassAttack = weapon.attack.find(attack => attack.unitClass === targetUnitClass);
    return unitClassAttack ? unitClassAttack.attack : 0;
  }

  return 0;
};

export const getBestWeaponVsUnitClass = (unit: Unit, targetUnitClass: UnitClass, targetDistance: number): Weapon | undefined => {
  const weaponsInRange = getWeaponsInRange(unit, targetDistance);
  if (weaponsInRange.length === 0) return undefined;

  // Find weapon with highest attack value against target unit class
  let bestWeapon: Weapon | undefined;
  let bestAttack = -1;

  for (const weapon of weaponsInRange) {
    const attack = getWeaponAttackVsUnitClass(weapon, targetUnitClass);
    if (attack > bestAttack) {
      bestAttack = attack;
      bestWeapon = weapon;
    }
  }

  return bestWeapon;
};

export const calculateEffectiveAttack = (weapon: Weapon, targetUnitClass: UnitClass): number => {
  return getWeaponAttackVsUnitClass(weapon, targetUnitClass);
};

export const getUnitClassAttackSummary = (unit: Unit): Record<UnitClass | 'Aircraft', number> => {
  const summary: Record<UnitClass | 'Aircraft', number> = {
    Infantry: 0,
    Vehicle: 0,
    Tank: 0,
    Aircraft: 0
  };

  const availableWeapons = getAvailableWeapons(unit);

  for (const unitClass of Object.keys(summary) as (UnitClass | 'Aircraft')[]) {
    let maxAttack = 0;

    for (const weapon of availableWeapons) {
      const attack = getWeaponAttackVsUnitClass(weapon, unitClass as UnitClass);
      maxAttack = Math.max(maxAttack, attack);
    }

    summary[unitClass] = maxAttack;
  }

  return summary;
};
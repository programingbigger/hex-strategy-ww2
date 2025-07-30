import { Unit, Weapon } from '../types';

// Weapon utility functions
export const getAvailableWeapons = (unit: Unit): Weapon[] => {
  if (!unit.weapons || !Array.isArray(unit.weapons)) {
    return [];
  }
  return unit.weapons.filter(weapon => weapon.ammunition > 0);
};

export const getWeaponsInRange = (unit: Unit, targetDistance: number): Weapon[] => {
  return getAvailableWeapons(unit).filter(weapon => 
    targetDistance >= weapon.range.min && targetDistance <= weapon.range.max
  );
};

export const getMainWeapon = (unit: Unit): Weapon | undefined => {
  if (!unit.weapons || !Array.isArray(unit.weapons) || unit.weapons.length === 0) {
    return undefined;
  }
  return unit.weapons[0];
};

export const selectCounterAttackWeapon = (unit: Unit): Weapon | undefined => {
  // Counter-attack weapon selection logic
  // 1. Main weapon if available
  const mainWeapon = getMainWeapon(unit);
  if (mainWeapon && mainWeapon.ammunition > 0) {
    return mainWeapon;
  }
  
  // 2. Any available weapon with priority
  const availableWeapons = getAvailableWeapons(unit);
  if (availableWeapons.length > 0) {
    return availableWeapons[0];
  }
  
  // 3. No weapons available
  return undefined;
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
  const availableWeapons = getAvailableWeapons(unit);
  if (availableWeapons.length === 0) return 0;
  
  return Math.max(...availableWeapons.map(weapon => weapon.range.max));
};

export const getMinAttackRange = (unit: Unit): number => {
  const availableWeapons = getAvailableWeapons(unit);
  if (availableWeapons.length === 0) return 0;
  
  return Math.min(...availableWeapons.map(weapon => weapon.range.min));
};
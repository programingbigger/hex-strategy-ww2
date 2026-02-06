import { useCallback } from 'react';
import {
  Unit,
  Coordinate,
  BoardLayout,
  BattleReport,
  Team,
  Weapon,
  BattleLogEntry,
  BattleLogState,
  TerrainType,
  Tile,
  WeatherType
} from '../../types';
import { 
  coordToString,
  getDistance
} from '../../utils/map';
import {
  getWeaponsInRange,
  selectCounterAttackWeapon,
  consumeAmmunition,
  getWeaponAttackVsUnitClass
} from '../../utils/weapons';
import { TERRAIN_STATS } from '../../config/constants';
import { logBattle } from '../../utils/battleLogger';

// Helper functions for safe HP updates
const applySafeHealing = (unit: Unit, healAmount: number): Unit => {
  const newHp = Math.min(unit.maxHp, unit.hp + healAmount);
  return { ...unit, hp: newHp };
};

const applySafeFuelResupply = (unit: Unit, fuelAmount: number): Unit => {
  const newFuel = Math.min(unit.maxFuel || 60, fuelAmount);
  return { ...unit, fuel: newFuel };
};

const safeUpdateUnitHP = (unit: Unit, newHp: number, context: string): Unit => {
  const clampedHp = Math.max(0, Math.min(unit.maxHp, newHp));
  if (clampedHp !== newHp) {
    console.warn(`HP clamped for ${unit.type} (${unit.id}) in context: ${context}. Original: ${newHp}, Clamped: ${clampedHp}`);
  }
  return { ...unit, hp: clampedHp };
};

const HPChangeEvent = (unitId: string, oldHp: number, newHp: number, context: string) => ({
  type: 'HP_CHANGE' as const,
  unitId,
  oldHp,
  newHp,
  context,
  timestamp: new Date().toISOString()
});

const HPChangeLogger = (event: ReturnType<typeof HPChangeEvent>) => {
  console.log(`🔄 HP Change: Unit ${event.unitId} | ${event.oldHp} → ${event.newHp} | Context: ${event.context} | ${event.timestamp}`);
};

export interface BattleSystemHook {
  createBattleLogEntry: (
    attacker: Unit,
    defender: Unit,
    weapon: Weapon | null,
    damage: number,
    counterAttack?: {
      weapon: Weapon;
      damage: number;
      unitDestroyed?: boolean;
    }
  ) => BattleLogEntry;
  addBattleLogEntry: (entry: BattleLogEntry) => void;
  handleAttack: (attacker: Unit, defender: Unit) => void;
  handleAttackWithWeapon: (attacker: Unit, defender: Unit, weapon: Weapon) => void;
  handleWeaponSelect: (weapon: Weapon) => void;
  handleWeaponSelectionClose: () => void;
}

interface BattleSystemDeps {
  boardLayout: BoardLayout;
  units: Unit[];
  turn: number;
  activeTeam: Team;
  weather: WeatherType;
  weaponSelectionState: {
    isOpen: boolean;
    attacker: Unit | null;
    target: Unit | null;
  };
  setUnits: (units: Unit[]) => void;
  setSelectedUnitId: (id: string | null) => void;
  setBattleReport: (report: BattleReport | null | ((prev: BattleReport | null) => BattleReport | null)) => void;
  setWeaponSelectionState: (state: { isOpen: boolean; attacker: Unit | null; target: Unit | null }) => void;
  setBattleLog: (log: BattleLogState | ((prev: BattleLogState) => BattleLogState)) => void;
  checkWinCondition: (units: Unit[], boardLayout: BoardLayout) => void;
}

/**
 * Calculate weather attack penalty
 * Snow: -20% attack power
 * Blizzard: -40% attack power
 * Synced Blue units are immune to weather penalties
 */
const calculateWeatherPenalty = (
  attackPower: number,
  weather: WeatherType,
  unit: Unit
): number => {
  // Synced Blue units are immune to weather penalties
  if (unit.team === 'Blue' && unit.isSynced === true) {
    return attackPower;
  }

  // Apply weather penalties
  if (weather === 'Snow') {
    return Math.floor(attackPower * 0.8); // -20%
  } else if (weather === 'Blizzard') {
    return Math.floor(attackPower * 0.6); // -40%
  }

  return attackPower;
};

export const useBattleSystem = (deps: BattleSystemDeps): BattleSystemHook => {
  const {
    boardLayout,
    units,
    turn,
    activeTeam,
    weather,
    weaponSelectionState,
    setUnits,
    setSelectedUnitId,
    setBattleReport,
    setWeaponSelectionState,
    setBattleLog,
    checkWinCondition
  } = deps;

  const createBattleLogEntry = useCallback((
    attacker: Unit,
    defender: Unit,
    weapon: Weapon | null,
    damage: number,
    counterAttack?: {
      weapon: Weapon;
      damage: number;
      unitDestroyed?: boolean;
    }
  ): BattleLogEntry => {
    const defenderTile = boardLayout.get(coordToString(defender));
    
    const currentPhase: 'Player Phase' | 'Enemy Phase' = activeTeam === 'Blue' ? 'Player Phase' : 'Enemy Phase';
    
    logBattle(`🎯 Creating battle log entry: ${attacker.type} vs ${defender.type}`, {
      attackerTeam: attacker.team,
      defenderTeam: defender.team,
      damage,
      weaponUsed: weapon?.name || 'Legacy Attack',
      counterAttack: counterAttack ? counterAttack.weapon.name : 'None'
    });

    const entry: BattleLogEntry = {
      id: `battle-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`,
      turn,
      phase: currentPhase,
      timestamp: new Date(),
      attacker: {
        team: attacker.team,
        unitName: attacker.name || attacker.type,
        unitType: attacker.type,
        hpBefore: attacker.hp,
        hpAfter: Math.max(0, attacker.hp - (counterAttack?.damage || 0)),
        position: { x: attacker.x, y: attacker.y }
      },
      defender: {
        team: defender.team,
        unitName: defender.name || defender.type,
        unitType: defender.type,
        hpBefore: defender.hp,
        hpAfter: Math.max(0, defender.hp - damage),
        position: { x: defender.x, y: defender.y }
      },
      location: {
        hex: { x: defender.x, y: defender.y },
        terrain: defenderTile?.terrain as TerrainType || 'Plains',
        defenseBonus: defenderTile ? TERRAIN_STATS[defenderTile.terrain]?.defenseBonus : 0
      },
      weapon: {
        name: weapon?.name || 'Legacy Attack',
        type: weapon?.type || '37mm主砲'
      },
      result: {
        damageDealt: damage,
        damageTaken: counterAttack?.damage || 0,
        unitDestroyed: (defender.hp - damage) <= 0
      },
      counterAttack: counterAttack ? {
        weapon: {
          name: counterAttack.weapon.name,
          type: counterAttack.weapon.type
        },
        damageDealt: counterAttack.damage,
        damageTaken: damage,
        unitDestroyed: (attacker.hp - counterAttack.damage) <= 0
      } : undefined
    };

    return entry;
  }, [boardLayout, turn, activeTeam]);

  const addBattleLogEntry = useCallback((entry: BattleLogEntry) => {
    setBattleLog(prevLog => {
      const newEntries = [...prevLog.entries, entry];
      
      if (newEntries.length > prevLog.maxEntries) {
        newEntries.shift();
      }
      
      logBattle(`📝 Added battle log entry (${newEntries.length}/${prevLog.maxEntries})`);
      
      return {
        ...prevLog,
        entries: newEntries
      };
    });
  }, [setBattleLog]);

  const handleAttack = useCallback((attacker: Unit, defender: Unit) => {
    const attackerTile = boardLayout.get(coordToString(attacker));
    const defenderTile = boardLayout.get(coordToString(defender));

    if (!attackerTile || !defenderTile) return;

    const attackerTerrainStats = TERRAIN_STATS[attackerTile.terrain];
    const defenderTerrainStats = TERRAIN_STATS[defenderTile.terrain];

    let attackPower = (attacker.attackVs?.[defender.unitClass] ?? attacker.attack) + attackerTerrainStats.attackBonus;

    // Crystal Link Communication System: Synced units get +10% attack bonus (legacy system)
    if (attacker.team === 'Blue' && attacker.isSynced === true) {
      const baseAttack = attacker.attackVs?.[defender.unitClass] ?? attacker.attack;
      const syncBonus = Math.floor(baseAttack * 0.1);
      attackPower += syncBonus;
    }

    // Apply weather penalty (synced Blue units are immune)
    attackPower = calculateWeatherPenalty(attackPower, weather, attacker);

    let defensePower = (defender.defenseVs?.[attacker.unitClass] ?? defender.defense) + defenderTerrainStats.defenseBonus;

    if (attacker.type === 'Artillery') {
      defensePower = (defender.defenseVs?.[attacker.unitClass] ?? defender.defense);
    }

    const damage = Math.max(1, attackPower - defensePower);

    const reportText = `${attacker.type} attacks ${defender.type} for ${damage} damage!`;

    setBattleReport({
      attacker,
      defender,
      damage,
      report: reportText,
    });

    let updatedUnits = units.map(u => {
      if (u.id === defender.id) {
        return safeUpdateUnitHP(u, u.hp - damage, 'combat');
      }
      if (u.id === attacker.id) {
        const newXp = Math.min(100, u.xp + damage);
        return { ...u, xp: newXp, attacked: true, moved: true };
      }
      return u;
    });

    updatedUnits = updatedUnits.filter(u => u.hp > 0);

    let counterAttackData: {
      weapon: Weapon;
      damage: number;
      unitDestroyed?: boolean;
    } | undefined;

    const currentDefender = updatedUnits.find(u => u.id === defender.id);
    if (currentDefender && currentDefender.hp > 0 && currentDefender.canCounterAttack && attacker.type !== 'Artillery') {
      const counterAttackerTile = boardLayout.get(coordToString(currentDefender));
      const counterDefenderTile = boardLayout.get(coordToString(attacker));

      if (counterAttackerTile && counterDefenderTile) {
        const counterAttackerTerrainStats = TERRAIN_STATS[counterAttackerTile.terrain];
        const counterDefenderTerrainStats = TERRAIN_STATS[counterDefenderTile.terrain];

        let counterAttackPower = (currentDefender.attackVs?.[attacker.unitClass] ?? currentDefender.attack) + counterAttackerTerrainStats.attackBonus;

        // Crystal Link Communication System: Synced units get +10% attack bonus on counter-attack (legacy system)
        if (currentDefender.team === 'Blue' && currentDefender.isSynced === true) {
          const baseCounterAttack = currentDefender.attackVs?.[attacker.unitClass] ?? currentDefender.attack;
          const syncBonus = Math.floor(baseCounterAttack * 0.1);
          counterAttackPower += syncBonus;
        }

        // Apply weather penalty on counter-attack (synced Blue units are immune)
        counterAttackPower = calculateWeatherPenalty(counterAttackPower, weather, currentDefender);

        const counterDefensePower = (attacker.defenseVs?.[currentDefender.unitClass] ?? attacker.defense) + counterDefenderTerrainStats.defenseBonus;

        const counterDamage = Math.max(1, counterAttackPower - counterDefensePower);

        const legacyCounterWeapon: Weapon = {
          id: 'legacy-counter',
          name: `${currentDefender.type} Counter-Attack`,
          type: '37mm主砲',
          ammunition: 1,
          maxAmmunition: 1,
          range: { min: 1, max: 1 },
          attack: [
            { unitClass: 'Infantry', attack: currentDefender.attack },
            { unitClass: 'Vehicle', attack: currentDefender.attack },
            { unitClass: 'Tank', attack: currentDefender.attack },
            { unitClass: 'Aircraft', attack: currentDefender.attack }
          ]
        };

        counterAttackData = {
          weapon: legacyCounterWeapon,
          damage: counterDamage,
          unitDestroyed: (attacker.hp - counterDamage) <= 0
        };

        const counterReportText = `\n\nCounter-attack! ${currentDefender.type} attacks ${attacker.type} for ${counterDamage} damage!`;

        setBattleReport((prevReport: BattleReport | null) => prevReport ? ({
          ...prevReport,
          counterDamage,
          report: prevReport.report + counterReportText,
        }) : null);

        updatedUnits = updatedUnits.map(u => {
          if (u.id === attacker.id) {
            return safeUpdateUnitHP(u, u.hp - counterDamage, 'combat');
          }
          if (u.id === currentDefender.id) {
            const newXp = Math.min(100, u.xp + counterDamage);
            return { ...u, xp: newXp };
          }
          return u;
        }).filter(u => u.hp > 0);
      }
    }

    const legacyWeapon: Weapon = {
      id: 'legacy-attack',
      name: `${attacker.type} Attack`,
      type: '37mm主砲',
      ammunition: 1,
      maxAmmunition: 1,
      range: { min: 1, max: 1 },
      attack: [
        { unitClass: 'Infantry', attack: attacker.attack },
        { unitClass: 'Vehicle', attack: attacker.attack },
        { unitClass: 'Tank', attack: attacker.attack },
        { unitClass: 'Aircraft', attack: attacker.attack }
      ]
    };

    const battleLogEntry = createBattleLogEntry(
      attacker,
      defender,
      legacyWeapon,
      damage,
      counterAttackData
    );

    addBattleLogEntry(battleLogEntry);

    setUnits(updatedUnits);
    setSelectedUnitId(null);
    checkWinCondition(updatedUnits, boardLayout);
  }, [boardLayout, units, checkWinCondition, createBattleLogEntry, addBattleLogEntry, setBattleReport, setUnits, setSelectedUnitId]);

  const handleAttackWithWeapon = useCallback((attacker: Unit, defender: Unit, weapon: Weapon) => {
    const attackerTile = boardLayout.get(coordToString(attacker));
    const defenderTile = boardLayout.get(coordToString(defender));
    if (!attackerTile || !defenderTile) return;

    const attackerTerrainStats = TERRAIN_STATS[attackerTile.terrain];
    const defenderTerrainStats = TERRAIN_STATS[defenderTile.terrain];

    const baseAttackPower = getWeaponAttackVsUnitClass(weapon, defender.unitClass);
    let attackPower = baseAttackPower + attackerTerrainStats.attackBonus;

    // Crystal Link Communication System: Synced units get +10% attack bonus (rounded down)
    // This represents improved coordination and weather penalty nullification
    if (attacker.team === 'Blue' && attacker.isSynced === true) {
      const syncBonus = Math.floor(baseAttackPower * 0.1);
      attackPower += syncBonus;
      console.log('🔷 Crystal Link Sync Bonus:', {
        unit: attacker.name || attacker.type,
        baseAttack: baseAttackPower,
        syncBonus,
        totalAttack: attackPower
      });
    }

    // Apply weather penalty (synced Blue units are immune)
    attackPower = calculateWeatherPenalty(attackPower, weather, attacker);

    let defensePower = (defender.defenseVs?.[attacker.unitClass] ?? defender.defense) + defenderTerrainStats.defenseBonus;
    if (attacker.type === 'Artillery') {
      defensePower = (defender.defenseVs?.[attacker.unitClass] ?? defender.defense);
    }

    const damage = Math.max(1, attackPower - defensePower);
    const reportText = `${attacker.type}が${weapon.name}で${defender.type}を攻撃！ ${damage}ダメージ！`;
    
    console.log('=== ATTACK DEBUG ===');
    console.log('Attack damage calculation:', {
      baseAttackPower: getWeaponAttackVsUnitClass(weapon, defender.unitClass),
      attackPower,
      defensePower,
      damage,
      attackerType: attacker.type,
      attackerTeam: attacker.team,
      defenderType: defender.type,
      defenderTeam: defender.team,
      defenderUnitClass: defender.unitClass,
      weaponUsed: weapon.name
    });

    setBattleReport({
      attacker,
      defender,
      damage,
      report: reportText,
      weaponUsed: weapon,
    });

    let updatedUnits = units.map(u => {
      if (u.id === defender.id) {
        const updatedUnit = safeUpdateUnitHP(u, u.hp - damage, 'combat');
        console.log('Defender HP update:', {
          oldHp: u.hp,
          damage,
          newHp: updatedUnit.hp,
          unitId: u.id,
          unitType: u.type,
          unitTeam: u.team
        });
        return updatedUnit;
      }
      if (u.id === attacker.id) {
        const newXp = Math.min(100, u.xp + damage);
        const updatedUnit = consumeAmmunition(u, weapon.id);
        
        if (u.team === 'Red' && u.type === 'Tank') {
          console.error('=== RED ARMY TANK AMMUNITION CONSUMPTION CHECK ===');
          console.error('Tank state during attack:', {
            originalTankHp: u.hp,
            updatedTankHp: updatedUnit.hp,
            hpChanged: u.hp !== updatedUnit.hp,
            weaponUsed: weapon.id,
            originalWeapons: u.weapons?.map(w => ({ id: w.id, ammo: w.ammunition })),
            updatedWeapons: updatedUnit.weapons?.map(w => ({ id: w.id, ammo: w.ammunition }))
          });
          
          if (updatedUnit.hp !== u.hp) {
            console.error('HP CORRUPTION DETECTED during ammunition consumption!');
            return { ...updatedUnit, hp: u.hp, xp: newXp, attacked: true, moved: true };
          }
        }
        
        console.log('Attacker after ammunition consumption:', {
          originalUnit: u.id,
          originalHp: u.hp,
          updatedUnit: updatedUnit.id,
          updatedHp: updatedUnit.hp,
          weaponUsed: weapon.id,
          weaponsAfter: updatedUnit.weapons?.map(w => ({ id: w.id, ammo: w.ammunition }))
        });
        return { ...updatedUnit, xp: newXp, attacked: true, moved: true };
      }
      return u;
    });
    updatedUnits = updatedUnits.filter(u => u.hp > 0);

    let counterAttackData: {
      weapon: Weapon;
      damage: number;
      unitDestroyed?: boolean;
    } | undefined;

    const currentDefender = updatedUnits.find(u => u.id === defender.id);
    if (currentDefender && currentDefender.hp > 0 && currentDefender.canCounterAttack && attacker.type !== 'Artillery') {
      const counterWeapon = selectCounterAttackWeapon(currentDefender, attacker);
      
      const counterDistance = getDistance(currentDefender, attacker);
      const canPerformCounterAttack = counterWeapon && 
        counterDistance >= counterWeapon.range.min && 
        counterDistance <= counterWeapon.range.max;
      
      if (canPerformCounterAttack) {
        const counterAttackerTile = boardLayout.get(coordToString(currentDefender));
        const counterDefenderTile = boardLayout.get(coordToString(attacker));
        
        if (counterAttackerTile && counterDefenderTile) {
          const counterAttackerTerrainStats = TERRAIN_STATS[counterAttackerTile.terrain];
          const counterDefenderTerrainStats = TERRAIN_STATS[counterDefenderTile.terrain];

          const counterBaseAttackPower = getWeaponAttackVsUnitClass(counterWeapon, attacker.unitClass);
          let counterAttackPower = counterBaseAttackPower + counterAttackerTerrainStats.attackBonus;

          // Crystal Link Communication System: Synced units get +10% attack bonus on counter-attack
          if (currentDefender.team === 'Blue' && currentDefender.isSynced === true) {
            const syncBonus = Math.floor(counterBaseAttackPower * 0.1);
            counterAttackPower += syncBonus;
            console.log('🔷 Crystal Link Sync Bonus (Counter-Attack):', {
              unit: currentDefender.name || currentDefender.type,
              baseAttack: counterBaseAttackPower,
              syncBonus,
              totalAttack: counterAttackPower
            });
          }

          // Apply weather penalty on counter-attack (synced Blue units are immune)
          counterAttackPower = calculateWeatherPenalty(counterAttackPower, weather, currentDefender);

          const counterDefensePower = (attacker.defenseVs?.[currentDefender.unitClass] ?? attacker.defense) + counterDefenderTerrainStats.defenseBonus;
          const counterDamage = Math.max(1, counterAttackPower - counterDefensePower);
          
          counterAttackData = {
            weapon: counterWeapon,
            damage: counterDamage,
            unitDestroyed: (attacker.hp - counterDamage) <= 0
          };
          
          console.log('=== COUNTER-ATTACK DEBUG ===');
          console.log('Attacker before counter:', {
            id: attacker.id,
            type: attacker.type,
            team: attacker.team,
            hp: attacker.hp,
            maxHp: attacker.maxHp
          });
          console.log('Counter damage calculation:', {
            counterBaseAttackPower,
            counterAttackPower,
            counterDefensePower,
            counterDamage,
            attackerUnit: attacker.unitClass,
            defenderUnit: currentDefender.unitClass
          });
          
          const counterReportText = `\n\n反撃！ ${currentDefender.type}が${counterWeapon.name}で${attacker.type}を攻撃！ ${counterDamage}ダメージ！`;
          
          setBattleReport((prevReport: BattleReport | null) => prevReport ? ({
            ...prevReport,
            counterDamage,
            report: prevReport.report + counterReportText,
            counterWeaponUsed: counterWeapon,
          }) : null);
          
          updatedUnits = updatedUnits.map(u => {
            if (u.id === attacker.id) {
              const updatedUnit = safeUpdateUnitHP(u, u.hp - counterDamage, 'combat');
              
              if (u.team === 'Red' && u.type === 'Tank') {
                console.error('=== RED ARMY TANK HP BUG ALERT ===');
                console.error('Tank HP about to be updated:', {
                  tankId: u.id,
                  originalHp: u.hp,
                  maxHp: u.maxHp,
                  counterDamage,
                  calculatedNewHp: updatedUnit.hp,
                  counterWeaponUsed: counterWeapon?.name,
                  counterAttackPower,
                  counterDefensePower,
                  attackerUnit: attacker.unitClass,
                  defenderUnit: currentDefender.unitClass
                });
              }
              
              console.log('Attacker HP update:', {
                oldHp: u.hp,
                counterDamage,
                newHp: updatedUnit.hp,
                unitId: u.id,
                unitType: u.type,
                unitTeam: u.team
              });
              return updatedUnit;
            }
            if (u.id === currentDefender.id) {
              const newXp = Math.min(100, u.xp + counterDamage);
              const updatedUnit = consumeAmmunition(u, counterWeapon.id);
              console.log('Defender after counter-attack ammunition consumption:', {
                originalUnit: u.id,
                updatedUnit: updatedUnit.id,
                weaponUsed: counterWeapon.id,
                weaponsAfter: updatedUnit.weapons?.map(w => ({ id: w.id, ammo: w.ammunition }))
              });
              return { ...updatedUnit, xp: newXp };
            }
            return u;
          }).filter(u => u.hp > 0);
          console.log('=== END COUNTER-ATTACK DEBUG ===');
        }
      }
    }

    const battleLogEntry = createBattleLogEntry(
      attacker,
      defender,
      weapon,
      damage,
      counterAttackData
    );

    addBattleLogEntry(battleLogEntry);

    setUnits(updatedUnits);
    setSelectedUnitId(null);
    checkWinCondition(updatedUnits, boardLayout);
  }, [boardLayout, units, checkWinCondition, createBattleLogEntry, addBattleLogEntry, setBattleReport, setUnits, setSelectedUnitId]);

  const handleWeaponSelect = useCallback((weapon: Weapon) => {
    if (weaponSelectionState.attacker && weaponSelectionState.target) {
      handleAttackWithWeapon(weaponSelectionState.attacker, weaponSelectionState.target, weapon);
      setWeaponSelectionState({ isOpen: false, attacker: null, target: null });
    }
  }, [weaponSelectionState, handleAttackWithWeapon, setWeaponSelectionState]);

  const handleWeaponSelectionClose = useCallback(() => {
    setWeaponSelectionState({ isOpen: false, attacker: null, target: null });
  }, [setWeaponSelectionState]);

  return {
    createBattleLogEntry,
    addBattleLogEntry,
    handleAttack,
    handleAttackWithWeapon,
    handleWeaponSelect,
    handleWeaponSelectionClose,
  };
};
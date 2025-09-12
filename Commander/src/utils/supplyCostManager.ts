import { Unit, Team, BoardLayout } from '../types';
import { coordToString } from './map';
import { calculateSupplyCost, processSupplyWithCost, SupplyCost } from './costManager';

export interface SupplyRequest {
  unitId: string;
  supplyTypes: ('ammunition' | 'fuel' | 'repair')[];
  force?: boolean;
}

export interface SupplyResult {
  unitId: string;
  success: boolean;
  suppliedUnit: Unit;
  supplyCost: SupplyCost;
  message: string;
}

export interface SupplyOperationResult {
  success: boolean;
  results: SupplyResult[];
  totalCost: number;
  updatedFunds: { [team: string]: number };
  errors: string[];
}

/**
 * Apply supply operations with cost deduction
 */
export const applySupplyOperationsWithCost = async (
  units: Unit[],
  boardLayout: BoardLayout,
  currentFunds: { [team: string]: number },
  team: Team,
  forceSupply = false
): Promise<SupplyOperationResult> => {
  const results: SupplyResult[] = [];
  const errors: string[] = [];
  let workingFunds = { ...currentFunds };
  let totalCost = 0;
  let overallSuccess = true;

  // Filter units that are eligible for supply (on friendly cities/capitals)
  const eligibleUnits = units.filter(unit => {
    if (unit.team !== team) return false;
    
    const unitTile = boardLayout.get(coordToString(unit));
    if (!unitTile) return false;
    
    const isSupplyTerrain = unitTile.terrain === 'City' || unitTile.terrain === 'Capital';
    const isOwnedByTeam = unitTile.owner === unit.team;
    
    return isSupplyTerrain && isOwnedByTeam;
  });

  console.log(`🏥 Supply Operations for ${team}: ${eligibleUnits.length} eligible units`);

  for (const unit of eligibleUnits) {
    const supplyProcess = await processSupplyWithCost(unit, workingFunds, forceSupply);
    
    if (supplyProcess.success && supplyProcess.supplyCost.total > 0) {
      // Apply the actual supply effects to the unit
      const suppliedUnit = applySupplyEffectsToUnit(unit);
      
      results.push({
        unitId: unit.id,
        success: true,
        suppliedUnit,
        supplyCost: supplyProcess.supplyCost,
        message: supplyProcess.message
      });

      workingFunds = supplyProcess.updatedFunds;
      totalCost += supplyProcess.supplyCost.total;
      
      console.log(`✅ Supplied ${unit.type}(${unit.id}) - Cost: ${supplyProcess.supplyCost.total}`);
    } else if (supplyProcess.supplyCost.total === 0) {
      // Unit doesn't need supply
      results.push({
        unitId: unit.id,
        success: true,
        suppliedUnit: unit,
        supplyCost: supplyProcess.supplyCost,
        message: 'Unit does not need supply'
      });
    } else {
      // Supply failed due to insufficient funds
      results.push({
        unitId: unit.id,
        success: false,
        suppliedUnit: unit,
        supplyCost: supplyProcess.supplyCost,
        message: supplyProcess.message
      });
      
      errors.push(`${unit.type}(${unit.id}): ${supplyProcess.message}`);
      overallSuccess = false;
      
      console.log(`❌ Failed to supply ${unit.type}(${unit.id}) - ${supplyProcess.message}`);
    }
  }

  return {
    success: overallSuccess,
    results,
    totalCost,
    updatedFunds: workingFunds,
    errors
  };
};

/**
 * Apply actual supply effects to a unit (HP, fuel, ammunition restoration)
 */
const applySupplyEffectsToUnit = (unit: Unit): Unit => {
  const UNIT_HEAL_HP = 2; // Same as original system
  
  // Heal HP
  const needsHealing = unit.hp < unit.maxHp;
  const newHp = needsHealing ? Math.min(unit.maxHp, unit.hp + UNIT_HEAL_HP) : unit.hp;
  
  // Restore fuel
  const maxFuel = unit.maxFuel || 60;
  const newFuel = maxFuel;
  
  // Restore ammunition
  let resuppliedWeapons = unit.weapons;
  if (unit.weapons && Array.isArray(unit.weapons)) {
    resuppliedWeapons = unit.weapons.map(weapon => ({
      ...weapon,
      ammunition: weapon.maxAmmunition
    }));
  }
  
  return {
    ...unit,
    hp: newHp,
    fuel: newFuel,
    weapons: resuppliedWeapons
  };
};

/**
 * Calculate supply costs for all units of a team
 */
export const calculateTeamSupplyBudget = async (
  units: Unit[],
  boardLayout: BoardLayout,
  team: Team
): Promise<{
  totalCost: number;
  unitCosts: { [unitId: string]: SupplyCost };
  eligibleUnits: Unit[];
  ineligibleUnits: Unit[];
}> => {
  const teamUnits = units.filter(unit => unit.team === team);
  const eligibleUnits: Unit[] = [];
  const ineligibleUnits: Unit[] = [];
  const unitCosts: { [unitId: string]: SupplyCost } = {};
  let totalCost = 0;

  for (const unit of teamUnits) {
    const unitTile = boardLayout.get(coordToString(unit));
    const isSupplyTerrain = unitTile?.terrain === 'City' || unitTile?.terrain === 'Capital';
    const isOwnedByTeam = unitTile?.owner === unit.team;
    
    if (isSupplyTerrain && isOwnedByTeam) {
      eligibleUnits.push(unit);
      const supplyCost = await calculateSupplyCost(unit);
      unitCosts[unit.id] = supplyCost;
      totalCost += supplyCost.total;
    } else {
      ineligibleUnits.push(unit);
      unitCosts[unit.id] = { ammunition: 0, fuel: 0, repair: 0, total: 0 };
    }
  }

  return {
    totalCost,
    unitCosts,
    eligibleUnits,
    ineligibleUnits
  };
};

/**
 * Validate if team can afford supply operations
 */
export const validateSupplyBudget = async (
  units: Unit[],
  boardLayout: BoardLayout,
  team: Team,
  currentFunds: { [team: string]: number }
): Promise<{
  canAfford: boolean;
  totalCost: number;
  currentFunds: number;
  missingFunds: number;
  affordableUnits: string[];
  unaffordableUnits: string[];
}> => {
  const budget = await calculateTeamSupplyBudget(units, boardLayout, team);
  const teamFunds = currentFunds[team] || 0;
  const canAfford = teamFunds >= budget.totalCost;
  const missingFunds = Math.max(0, budget.totalCost - teamFunds);
  
  const affordableUnits: string[] = [];
  const unaffordableUnits: string[] = [];
  let runningCost = 0;
  
  // Sort eligible units by cost (cheapest first)
  const sortedUnits = budget.eligibleUnits
    .map(unit => ({
      unit,
      cost: budget.unitCosts[unit.id].total
    }))
    .sort((a, b) => a.cost - b.cost);
  
  for (const { unit, cost } of sortedUnits) {
    if (runningCost + cost <= teamFunds) {
      affordableUnits.push(unit.id);
      runningCost += cost;
    } else {
      unaffordableUnits.push(unit.id);
    }
  }
  
  return {
    canAfford,
    totalCost: budget.totalCost,
    currentFunds: teamFunds,
    missingFunds,
    affordableUnits,
    unaffordableUnits
  };
};

/**
 * Selective supply - supply only specific units or supply types
 */
export const applySelectiveSupply = async (
  units: Unit[],
  boardLayout: BoardLayout,
  currentFunds: { [team: string]: number },
  supplyRequests: SupplyRequest[]
): Promise<SupplyOperationResult> => {
  const results: SupplyResult[] = [];
  const errors: string[] = [];
  let workingFunds = { ...currentFunds };
  let totalCost = 0;
  let overallSuccess = true;

  for (const request of supplyRequests) {
    const unit = units.find(u => u.id === request.unitId);
    if (!unit) {
      errors.push(`Unit ${request.unitId} not found`);
      continue;
    }

    // Check if unit is eligible for supply
    const unitTile = boardLayout.get(coordToString(unit));
    const isSupplyTerrain = unitTile?.terrain === 'City' || unitTile?.terrain === 'Capital';
    const isOwnedByTeam = unitTile?.owner === unit.team;
    
    if (!isSupplyTerrain || !isOwnedByTeam) {
      errors.push(`Unit ${request.unitId} is not on a friendly supply location`);
      continue;
    }

    const supplyProcess = await processSupplyWithCost(unit, workingFunds, request.force);
    
    if (supplyProcess.success) {
      const suppliedUnit = applySupplyEffectsToUnit(unit);
      
      results.push({
        unitId: unit.id,
        success: true,
        suppliedUnit,
        supplyCost: supplyProcess.supplyCost,
        message: supplyProcess.message
      });

      workingFunds = supplyProcess.updatedFunds;
      totalCost += supplyProcess.supplyCost.total;
    } else {
      results.push({
        unitId: unit.id,
        success: false,
        suppliedUnit: unit,
        supplyCost: supplyProcess.supplyCost,
        message: supplyProcess.message
      });
      
      errors.push(`${unit.type}(${unit.id}): ${supplyProcess.message}`);
      overallSuccess = false;
    }
  }

  return {
    success: overallSuccess,
    results,
    totalCost,
    updatedFunds: workingFunds,
    errors
  };
};
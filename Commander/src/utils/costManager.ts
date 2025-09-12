import { Unit, Team } from '../types';
import { armyManager } from '../data/units';

// Cost calculation interfaces
export interface SupplyCost {
  ammunition: number;
  fuel: number;
  repair: number;
  total: number;
}

export interface ProductionCost {
  unitId: string;
  cost: number;
}

export interface CostCalculationResult {
  canAfford: boolean;
  totalCost: number;
  currentFunds: number;
  remainingFunds: number;
}

// Use the same army manager as the rest of the application

/**
 * Get unit template by ID from army organization data
 */
export const getUnitTemplate = (unitId: string, faction: Team) => {
  // Get all unit templates for the faction
  const allTemplates = armyManager.getUnitTemplatesBy(faction);
  
  // Find the template by ID or type
  return allTemplates.find(template => 
    template.id === unitId || template.type === unitId
  ) || null;
};

/**
 * Calculate supply costs for a unit based on what it needs
 */
export const calculateSupplyCost = async (unit: Unit): Promise<SupplyCost> => {
  const template = await getUnitTemplate(unit.id, unit.team);
  if (!template || !template.cost || !template.cost.supply) {
    console.warn(`No cost data found for unit ${unit.type} (${unit.id})`);
    return { ammunition: 0, fuel: 0, repair: 0, total: 0 };
  }

  const supplyCostData = template.cost.supply;
  let totalCost = 0;
  
  // Calculate ammunition cost
  let ammunitionCost = 0;
  if (unit.weapons && Array.isArray(unit.weapons)) {
    const needsAmmunition = unit.weapons.some(weapon => weapon.ammunition < weapon.maxAmmunition);
    if (needsAmmunition) {
      ammunitionCost = supplyCostData.ammunition || 0;
      totalCost += ammunitionCost;
    }
  }

  // Calculate fuel cost
  let fuelCost = 0;
  const maxFuel = unit.maxFuel || 60;
  if (unit.fuel < maxFuel) {
    fuelCost = supplyCostData.fuel || 0;
    totalCost += fuelCost;
  }

  // Calculate repair cost
  let repairCost = 0;
  if (unit.hp < unit.maxHp) {
    repairCost = supplyCostData.repair || 0;
    totalCost += repairCost;
  }

  return {
    ammunition: ammunitionCost,
    fuel: fuelCost,
    repair: repairCost,
    total: totalCost
  };
};

/**
 * Calculate production cost for a unit
 */
export const calculateProductionCost = (unitId: string, faction: Team): Promise<ProductionCost> => {
  return new Promise((resolve) => {
    const template = getUnitTemplate(unitId, faction);
    if (!template || !template.cost || typeof template.cost.production !== 'number') {
      console.warn(`No production cost data found for unit ${unitId}, using default cost 0`);
      resolve({ unitId, cost: 0 });
      return;
    }

    resolve({
      unitId,
      cost: template.cost.production
    });
  });
};

/**
 * Check if a team can afford a specific cost
 */
export const canAffordCost = (
  cost: number, 
  currentFunds: number
): CostCalculationResult => {
  const canAfford = currentFunds >= cost;
  const remainingFunds = canAfford ? currentFunds - cost : currentFunds;

  return {
    canAfford,
    totalCost: cost,
    currentFunds,
    remainingFunds
  };
};

/**
 * Apply cost to team funds (deduct the cost)
 */
export const applyCostToFunds = (
  currentFunds: { [team: string]: number },
  team: Team,
  cost: number
): { [team: string]: number } => {
  const teamFunds = currentFunds[team] || 0;
  
  if (teamFunds < cost) {
    console.warn(`Insufficient funds for ${team}. Required: ${cost}, Available: ${teamFunds}`);
    return currentFunds; // Don't modify funds if insufficient
  }

  return {
    ...currentFunds,
    [team]: teamFunds - cost
  };
};

/**
 * Get all supply costs for multiple units
 */
export const calculateMultipleSupplyCosts = async (units: Unit[]): Promise<{ [unitId: string]: SupplyCost }> => {
  const costs: { [unitId: string]: SupplyCost } = {};
  
  for (const unit of units) {
    costs[unit.id] = await calculateSupplyCost(unit);
  }
  
  return costs;
};

/**
 * Calculate total supply cost for a team's units
 */
export const calculateTeamSupplyCost = async (units: Unit[], team: Team): Promise<number> => {
  const teamUnits = units.filter(unit => unit.team === team);
  let totalCost = 0;
  
  for (const unit of teamUnits) {
    const supplyCost = await calculateSupplyCost(unit);
    totalCost += supplyCost.total;
  }
  
  return totalCost;
};

/**
 * Validate and process supply operation with cost deduction
 */
export const processSupplyWithCost = async (
  unit: Unit,
  currentFunds: { [team: string]: number },
  forceSupply = false // If true, supply even if can't afford (for testing/admin)
): Promise<{
  success: boolean;
  supplyCost: SupplyCost;
  costResult: CostCalculationResult;
  updatedFunds: { [team: string]: number };
  message: string;
}> => {
  const supplyCost = await calculateSupplyCost(unit);
  const costResult = canAffordCost(supplyCost.total, currentFunds[unit.team] || 0);
  
  if (!costResult.canAfford && !forceSupply) {
    return {
      success: false,
      supplyCost,
      costResult,
      updatedFunds: currentFunds,
      message: `Insufficient funds for supply. Required: ${supplyCost.total}, Available: ${costResult.currentFunds}`
    };
  }

  const updatedFunds = supplyCost.total > 0 
    ? applyCostToFunds(currentFunds, unit.team, supplyCost.total)
    : currentFunds;

  return {
    success: true,
    supplyCost,
    costResult,
    updatedFunds,
    message: `Supply completed. Cost: ${supplyCost.total}`
  };
};

/**
 * Validate and process unit production with cost deduction
 */
export const processProductionWithCost = async (
  unitId: string,
  faction: Team,
  currentFunds: { [team: string]: number },
  forceProduction = false
): Promise<{
  success: boolean;
  productionCost: ProductionCost;
  costResult: CostCalculationResult;
  updatedFunds: { [team: string]: number };
  message: string;
}> => {
  const productionCost = await calculateProductionCost(unitId, faction);
  const costResult = canAffordCost(productionCost.cost, currentFunds[faction] || 0);
  
  if (!costResult.canAfford && !forceProduction) {
    return {
      success: false,
      productionCost,
      costResult,
      updatedFunds: currentFunds,
      message: `Insufficient funds for production. Required: ${productionCost.cost}, Available: ${costResult.currentFunds}`
    };
  }

  const updatedFunds = applyCostToFunds(currentFunds, faction, productionCost.cost);

  return {
    success: true,
    productionCost,
    costResult,
    updatedFunds,
    message: `Production completed. Cost: ${productionCost.cost}`
  };
};
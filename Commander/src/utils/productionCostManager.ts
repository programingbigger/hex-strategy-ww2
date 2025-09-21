import { Team, Unit } from '../types';
import { calculateProductionCost, processProductionWithCost, ProductionCost } from './costManager';

export interface ProductionRequest {
  unitId: string;
  faction: Team;
  x: number;
  y: number;
  quantity?: number;
}

export interface ProductionResult {
  success: boolean;
  units: Unit[];
  totalCost: number;
  remainingFunds: number;
  errors: string[];
}

export interface ProductionValidation {
  canProduce: boolean;
  totalCost: number;
  currentFunds: number;
  missingFunds: number;
  costBreakdown: ProductionCost[];
}

/**
 * Validate if a production request can be fulfilled
 */
export const validateProductionRequest = async (
  request: ProductionRequest,
  currentFunds: { [team: string]: number }
): Promise<ProductionValidation> => {
  const quantity = request.quantity || 1;
  const costBreakdown: ProductionCost[] = [];
  let totalCost = 0;
  
  // Calculate cost for each unit
  for (let i = 0; i < quantity; i++) {
    const productionCost = await calculateProductionCost(request.unitId, request.faction);
    costBreakdown.push(productionCost);
    totalCost += productionCost.cost;
  }
  
  const currentTeamFunds = currentFunds[request.faction] || 0;
  const canProduce = currentTeamFunds >= totalCost;
  const missingFunds = Math.max(0, totalCost - currentTeamFunds);
  
  return {
    canProduce,
    totalCost,
    currentFunds: currentTeamFunds,
    missingFunds,
    costBreakdown
  };
};

/**
 * Process multiple production requests
 */
export const processProductionRequests = async (
  requests: ProductionRequest[],
  currentFunds: { [team: string]: number },
  forceProduction = false
): Promise<{
  results: ProductionResult[];
  finalFunds: { [team: string]: number };
  totalCost: number;
  overallSuccess: boolean;
}> => {
  const results: ProductionResult[] = [];
  let workingFunds = { ...currentFunds };
  let totalCost = 0;
  let overallSuccess = true;
  
  for (const request of requests) {
    const result = await processSingleProductionRequest(request, workingFunds, forceProduction);
    results.push(result);
    
    if (result.success) {
      workingFunds = {
        ...workingFunds,
        [request.faction]: result.remainingFunds
      };
      totalCost += result.totalCost;
    } else {
      overallSuccess = false;
      if (!forceProduction) {
        // Stop processing if any request fails and we're not forcing
        break;
      }
    }
  }
  
  return {
    results,
    finalFunds: workingFunds,
    totalCost,
    overallSuccess
  };
};

/**
 * Process a single production request
 */
export const processSingleProductionRequest = async (
  request: ProductionRequest,
  currentFunds: { [team: string]: number },
  forceProduction = false
): Promise<ProductionResult> => {
  const errors: string[] = [];
  const units: Unit[] = [];
  const quantity = request.quantity || 1;
  let totalCost = 0;
  let workingFunds = { ...currentFunds };
  
  // Validate the request first
  const validation = await validateProductionRequest(request, currentFunds);
  
  if (!validation.canProduce && !forceProduction) {
    return {
      success: false,
      units: [],
      totalCost: 0,
      remainingFunds: currentFunds[request.faction] || 0,
      errors: [`Insufficient funds. Required: ${validation.totalCost}, Available: ${validation.currentFunds}, Missing: ${validation.missingFunds}`]
    };
  }
  
  // Process each unit production
  for (let i = 0; i < quantity; i++) {
    const productionResult = await processProductionWithCost(
      request.unitId,
      request.faction,
      workingFunds,
      forceProduction
    );
    
    if (productionResult.success) {
      // Create the actual unit using ArmyManager
      const unitId = `${request.unitId}-${Date.now()}-${i}`;
      try {
        // Use ArmyManager to create unit with correct weapons from armyOrganization.json
        const { ArmyManager } = await import('../data/armyLoader');
        const armyManager = ArmyManager.getInstance();
        
        const newUnit = armyManager.createUnitFromTemplate(
          request.unitId,
          unitId,
          request.x,
          request.y
        );
        
        if (!newUnit) {
          throw new Error(`Failed to create unit from template: ${request.unitId}`);
        }
        
        units.push(newUnit);
        totalCost += productionResult.productionCost.cost;
        workingFunds = productionResult.updatedFunds;
      } catch (error) {
        errors.push(`Failed to create unit ${request.unitId}: ${error}`);
      }
    } else {
      errors.push(`Failed to produce unit ${i + 1}: ${productionResult.message}`);
      if (!forceProduction) {
        break; // Stop if any unit fails and we're not forcing
      }
    }
  }
  
  const success = units.length > 0;
  const remainingFunds = workingFunds[request.faction] || 0;
  
  return {
    success,
    units,
    totalCost,
    remainingFunds,
    errors
  };
};;

/**
 * Get available units for production for a team based on budget
 */
export const getAffordableUnits = async (
  availableUnitIds: string[],
  faction: Team,
  currentFunds: { [team: string]: number }
): Promise<{
  affordable: string[];
  tooExpensive: string[];
  costBreakdown: { [unitId: string]: number };
}> => {
  const teamFunds = currentFunds[faction] || 0;
  const affordable: string[] = [];
  const tooExpensive: string[] = [];
  const costBreakdown: { [unitId: string]: number } = {};
  
  for (const unitId of availableUnitIds) {
    const productionCost = await calculateProductionCost(unitId, faction);
    costBreakdown[unitId] = productionCost.cost;
    
    if (productionCost.cost <= teamFunds) {
      affordable.push(unitId);
    } else {
      tooExpensive.push(unitId);
    }
  }
  
  return {
    affordable,
    tooExpensive,
    costBreakdown
  };
};

/**
 * Calculate maximum quantity that can be produced for a unit type
 */
export const calculateMaxProducibleQuantity = async (
  unitId: string,
  faction: Team,
  currentFunds: { [team: string]: number }
): Promise<{
  maxQuantity: number;
  costPerUnit: number;
  totalBudget: number;
}> => {
  const teamFunds = currentFunds[faction] || 0;
  const productionCost = await calculateProductionCost(unitId, faction);
  const maxQuantity = productionCost.cost > 0 ? Math.floor(teamFunds / productionCost.cost) : 0;
  
  return {
    maxQuantity,
    costPerUnit: productionCost.cost,
    totalBudget: teamFunds
  };
};
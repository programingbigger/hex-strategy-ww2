import { Unit, Coordinate, Tile, Team } from '../types';
import { 
  EngineerActionType, 
  processEngineerActionWithCost, 
  validateEngineerAction,
  EngineerActionResult,
  DEFAULT_ENGINEER_COST_CONFIG,
  EngineerCostConfig 
} from './engineerActionCostManager';

export interface EngineerActionWithCostResult {
  canPerform: boolean;
  fundsCost: number;
  materialCost: number;
  result?: EngineerActionResult;
  validationErrors: string[];
}

export interface EngineerActionCostHook {
  validateAction: (
    actionType: EngineerActionType,
    engineer: Unit,
    currentFunds: { [team: string]: number }
  ) => EngineerActionWithCostResult;
  
  processActionWithCost: (
    actionType: EngineerActionType,
    engineer: Unit,
    targetCoord: Coordinate,
    targetTile: Tile,
    currentFunds: { [team: string]: number },
    onFundsUpdate: (newFunds: { [team: string]: number }) => void
  ) => EngineerActionResult;
  
  getActionCost: (actionType: EngineerActionType) => {
    fundsCost: number;
    materialCost: number;
  };
  
  canAffordAction: (
    actionType: EngineerActionType,
    engineer: Unit,
    currentFunds: { [team: string]: number }
  ) => {
    canAfford: boolean;
    missingFunds: number;
    missingMaterials: number;
  };
}

/**
 * Create engineer action cost hook
 */
export const createEngineerActionCostHook = (
  config: EngineerCostConfig = DEFAULT_ENGINEER_COST_CONFIG
): EngineerActionCostHook => {
  
  const validateAction = (
    actionType: EngineerActionType,
    engineer: Unit,
    currentFunds: { [team: string]: number }
  ): EngineerActionWithCostResult => {
    const validation = validateEngineerAction(actionType, engineer, currentFunds, config);
    
    return {
      canPerform: validation.canPerform,
      fundsCost: validation.fundsCost,
      materialCost: validation.materialCost,
      validationErrors: validation.errors
    };
  };
  
  const processActionWithCost = (
    actionType: EngineerActionType,
    engineer: Unit,
    targetCoord: Coordinate,
    targetTile: Tile,
    currentFunds: { [team: string]: number },
    onFundsUpdate: (newFunds: { [team: string]: number }) => void
  ): EngineerActionResult => {
    const result = processEngineerActionWithCost(
      actionType,
      engineer,
      targetCoord,
      targetTile,
      currentFunds,
      config
    );
    
    // Update funds if action was successful and funds changed
    if (result.success && result.fundsCost > 0) {
      onFundsUpdate(result.updatedFunds);
      
      console.log(`💰 Engineer Action Cost Applied:`, {
        action: actionType,
        team: engineer.team,
        fundsCost: result.fundsCost,
        materialCost: result.materialCost,
        remainingFunds: result.updatedFunds[engineer.team]
      });
    }
    
    return result;
  };
  
  const getActionCost = (actionType: EngineerActionType) => {
    return {
      fundsCost: config.costs[actionType] || 0,
      materialCost: getMaterialCostForActionType(actionType)
    };
  };
  
  const canAffordAction = (
    actionType: EngineerActionType,
    engineer: Unit,
    currentFunds: { [team: string]: number }
  ) => {
    const validation = validateEngineerAction(actionType, engineer, currentFunds, config);
    
    return {
      canAfford: validation.canPerform,
      missingFunds: validation.missingFunds,
      missingMaterials: validation.missingMaterials
    };
  };
  
  return {
    validateAction,
    processActionWithCost,
    getActionCost,
    canAffordAction
  };
};

// Helper function to get material cost (matches existing system)
const getMaterialCostForActionType = (actionType: EngineerActionType): number => {
  switch (actionType) {
    case 'enhance_city': return 1;
    case 'build_bridge': return 2;
    case 'build_fortress': return 1;
    case 'destroy_fortress': return 2;
    default: return 0;
  }
};;

/**
 * Enhanced engineer action processor that integrates with existing material system
 */
export interface EnhancedEngineerActionProcessor {
  canPerformAction: (
    actionType: EngineerActionType,
    engineer: Unit,
    currentFunds: { [team: string]: number }
  ) => {
    canPerform: boolean;
    reasons: string[];
    costs: {
      funds: number;
      materials: number;
    };
  };
  
  executeActionWithCosts: (
    actionType: EngineerActionType,
    engineer: Unit,
    targetCoord: Coordinate,
    targetTile: Tile,
    currentFunds: { [team: string]: number },
    onSuccess: (result: {
      updatedFunds: { [team: string]: number };
      message: string;
      costs: { funds: number; materials: number };
    }) => void,
    onFailure: (errors: string[]) => void
  ) => void;
}

export const createEnhancedEngineerActionProcessor = (
  config: EngineerCostConfig = DEFAULT_ENGINEER_COST_CONFIG
): EnhancedEngineerActionProcessor => {
  const costHook = createEngineerActionCostHook(config);
  
  return {
    canPerformAction: (actionType, engineer, currentFunds) => {
      const validation = costHook.validateAction(actionType, engineer, currentFunds);
      const costs = costHook.getActionCost(actionType);
      
      return {
        canPerform: validation.canPerform,
        reasons: validation.validationErrors,
        costs: {
          funds: costs.fundsCost,
          materials: costs.materialCost
        }
      };
    },
    
    executeActionWithCosts: (actionType, engineer, targetCoord, targetTile, currentFunds, onSuccess, onFailure) => {
      const validation = costHook.validateAction(actionType, engineer, currentFunds);
      
      if (!validation.canPerform) {
        onFailure(validation.validationErrors);
        return;
      }
      
      // Process with cost deduction
      const result = costHook.processActionWithCost(
        actionType,
        engineer,
        targetCoord,
        targetTile,
        currentFunds,
        (updatedFunds) => {
          // This callback will be triggered in processActionWithCost
        }
      );
      
      if (result.success) {
        onSuccess({
          updatedFunds: result.updatedFunds,
          message: result.message,
          costs: {
            funds: result.fundsCost,
            materials: result.materialCost
          }
        });
      } else {
        onFailure(result.errors);
      }
    }
  };
};
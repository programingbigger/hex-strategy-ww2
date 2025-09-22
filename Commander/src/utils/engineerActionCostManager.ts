import { Unit, Team, Coordinate, Tile } from '../types';
import { canAffordCost, CostCalculationResult, applyCostToFunds } from './costManager';

// Engineer action types matching the existing system
export type EngineerActionType = 
  | 'enhance_city'      // 増築
  | 'build_bridge'      // 架橋  
  | 'build_fortress'    // 要塞化
  | 'destroy_fortress'; // 要塞無力化

// Cost configuration for each engineer action
export interface EngineerActionCosts {
  enhance_city: number;
  build_bridge: number;
  build_fortress: number;
  destroy_fortress: number;
}

// Default cost configuration - can be made configurable later
export const DEFAULT_ENGINEER_ACTION_COSTS: EngineerActionCosts = {
  enhance_city: 50,      // 増築: Moderate cost for upgrading cities
  build_bridge: 75,      // 架橋: Higher cost for infrastructure building
  build_fortress: 100,   // 要塞化: High cost for military fortification
  destroy_fortress: 60   // 要塞無力化: Moderate cost for demolition
};

// Result interface for engineer action cost operations
export interface EngineerActionResult {
  success: boolean;
  actionType: EngineerActionType;
  cost: number;
  targetCoord: Coordinate;
  targetTile: Tile;
  materialCost: number;
  fundsCost: number;
  updatedFunds: { [team: string]: number };
  message: string;
  errors: string[];
}

// Configuration for cost settings
export interface EngineerCostConfig {
  costs: EngineerActionCosts;
  enableFundsCost: boolean;
  enableMaterialCost: boolean;
  requireBothResources: boolean; // true = need both funds AND materials, false = either/or
}

// Default configuration
export const DEFAULT_ENGINEER_COST_CONFIG: EngineerCostConfig = {
  costs: DEFAULT_ENGINEER_ACTION_COSTS,
  enableFundsCost: true,
  enableMaterialCost: true,
  requireBothResources: true
};

/**
 * Get the fund cost for a specific engineer action
 */
export const getEngineerActionCost = (
  actionType: EngineerActionType,
  config: EngineerCostConfig = DEFAULT_ENGINEER_COST_CONFIG
): number => {
  if (!config.enableFundsCost) return 0;
  return config.costs[actionType] || 0;
};

/**
 * Get material cost for engineer action (from existing system)
 */
export const getMaterialCostForAction = (actionType: EngineerActionType): number => {
  switch (actionType) {
    case 'enhance_city':
      return 1;
    case 'build_bridge':
      return 2;
    case 'build_fortress':
      return 1;
    case 'destroy_fortress':
      return 2;
    default:
      return 0;
  }
};;

/**
 * Validate if engineer can perform action (funds + materials check)
 */
export const validateEngineerAction = (
  actionType: EngineerActionType,
  engineer: Unit,
  currentFunds: { [team: string]: number },
  config: EngineerCostConfig = DEFAULT_ENGINEER_COST_CONFIG
): {
  canAfford: boolean;
  hasMaterials: boolean;
  canPerform: boolean;
  fundsCost: number;
  materialCost: number;
  currentFunds: number;
  availableMaterials: number;
  missingFunds: number;
  missingMaterials: number;
  errors: string[];
} => {
  const errors: string[] = [];
  const fundsCost = getEngineerActionCost(actionType, config);
  const materialCost = getMaterialCostForAction(actionType);
  const teamFunds = currentFunds[engineer.team] || 0;
  
  // Check funds
  const fundsValidation = canAffordCost(fundsCost, teamFunds);
  
  // Check materials
  const materialWeapon = engineer.weapons?.find(w => w.type === '資材');
  const availableMaterials = materialWeapon?.ammunition || 0;
  const hasMaterials = availableMaterials >= materialCost;
  
  const missingFunds = Math.max(0, fundsCost - teamFunds);
  const missingMaterials = Math.max(0, materialCost - availableMaterials);
  
  // Determine if action can be performed based on configuration
  let canPerform = false;
  if (config.requireBothResources) {
    canPerform = fundsValidation.canAfford && hasMaterials;
  } else {
    // Either funds OR materials (but not both required)
    canPerform = (config.enableFundsCost ? fundsValidation.canAfford : true) && 
                 (config.enableMaterialCost ? hasMaterials : true);
  }
  
  if (!fundsValidation.canAfford && config.enableFundsCost) {
    errors.push(`Insufficient funds. Required: ${fundsCost}, Available: ${teamFunds}`);
  }
  
  if (!hasMaterials && config.enableMaterialCost) {
    errors.push(`Insufficient materials. Required: ${materialCost}, Available: ${availableMaterials}`);
  }

  return {
    canAfford: fundsValidation.canAfford,
    hasMaterials,
    canPerform,
    fundsCost,
    materialCost,
    currentFunds: teamFunds,
    availableMaterials,
    missingFunds,
    missingMaterials,
    errors
  };
};

/**
 * Process engineer action with cost deduction
 */
export const processEngineerActionWithCost = (
  actionType: EngineerActionType,
  engineer: Unit,
  targetCoord: Coordinate,
  targetTile: Tile,
  currentFunds: { [team: string]: number },
  config: EngineerCostConfig = DEFAULT_ENGINEER_COST_CONFIG,
  forceAction = false
): EngineerActionResult => {
  const validation = validateEngineerAction(actionType, engineer, currentFunds, config);
  const fundsCost = validation.fundsCost;
  const materialCost = validation.materialCost;
  
  if (!validation.canPerform && !forceAction) {
    return {
      success: false,
      actionType,
      cost: fundsCost,
      targetCoord,
      targetTile,
      materialCost,
      fundsCost,
      updatedFunds: currentFunds,
      message: `Cannot perform ${actionType}: ${validation.errors.join(', ')}`,
      errors: validation.errors
    };
  }
  
  // Deduct funds if enabled
  let updatedFunds = currentFunds;
  if (config.enableFundsCost && fundsCost > 0) {
    updatedFunds = applyCostToFunds(currentFunds, engineer.team, fundsCost);
  }
  
  return {
    success: true,
    actionType,
    cost: fundsCost,
    targetCoord,
    targetTile,
    materialCost,
    fundsCost,
    updatedFunds,
    message: `${actionType} completed successfully. Funds cost: ${fundsCost}, Materials cost: ${materialCost}`,
    errors: []
  };
};

/**
 * Get cost breakdown for all engineer actions for a team
 */
export const getEngineerActionCostBreakdown = (
  team: Team,
  currentFunds: { [team: string]: number },
  config: EngineerCostConfig = DEFAULT_ENGINEER_COST_CONFIG
): {
  team: Team;
  currentFunds: number;
  actions: {
    [K in EngineerActionType]: {
      actionType: K;
      fundsCost: number;
      materialCost: number;
      affordable: boolean;
      enabled: boolean;
    }
  }
} => {
  const teamFunds = currentFunds[team] || 0;
  const actions = {} as any;
  
  for (const actionType of Object.keys(config.costs) as EngineerActionType[]) {
    const fundsCost = getEngineerActionCost(actionType, config);
    const materialCost = getMaterialCostForAction(actionType);
    const affordable = teamFunds >= fundsCost;
    const enabled = config.enableFundsCost || config.enableMaterialCost;
    
    actions[actionType] = {
      actionType,
      fundsCost,
      materialCost,
      affordable,
      enabled
    };
  }
  
  return {
    team,
    currentFunds: teamFunds,
    actions
  };
};

/**
 * Calculate total engineering budget for multiple actions
 */
export const calculateEngineeringBudget = (
  plannedActions: { actionType: EngineerActionType; quantity: number }[],
  config: EngineerCostConfig = DEFAULT_ENGINEER_COST_CONFIG
): {
  totalFundsCost: number;
  totalMaterialCost: number;
  actionBreakdown: Array<{
    actionType: EngineerActionType;
    quantity: number;
    fundsCostPerAction: number;
    materialCostPerAction: number;
    totalFundsCost: number;
    totalMaterialCost: number;
  }>;
} => {
  let totalFundsCost = 0;
  let totalMaterialCost = 0;
  const actionBreakdown: Array<{
    actionType: EngineerActionType;
    quantity: number;
    fundsCostPerAction: number;
    materialCostPerAction: number;
    totalFundsCost: number;
    totalMaterialCost: number;
  }> = [];
  
  for (const plannedAction of plannedActions) {
    const fundsCostPerAction = getEngineerActionCost(plannedAction.actionType, config);
    const materialCostPerAction = getMaterialCostForAction(plannedAction.actionType);
    const totalActionFundsCost = fundsCostPerAction * plannedAction.quantity;
    const totalActionMaterialCost = materialCostPerAction * plannedAction.quantity;
    
    totalFundsCost += totalActionFundsCost;
    totalMaterialCost += totalActionMaterialCost;
    
    actionBreakdown.push({
      actionType: plannedAction.actionType,
      quantity: plannedAction.quantity,
      fundsCostPerAction,
      materialCostPerAction,
      totalFundsCost: totalActionFundsCost,
      totalMaterialCost: totalActionMaterialCost
    });
  }
  
  return {
    totalFundsCost,
    totalMaterialCost,
    actionBreakdown
  };
};

/**
 * Helper function to get action name in Japanese
 */
export const getActionNameJP = (actionType: EngineerActionType): string => {
  switch (actionType) {
    case 'enhance_city': return '増築';
    case 'build_bridge': return '架橋';
    case 'build_fortress': return '要塞化';
    case 'destroy_fortress': return '要塞無力化';
    default: return actionType;
  }
};;
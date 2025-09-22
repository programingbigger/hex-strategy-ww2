import { useCallback } from 'react';
import { Unit, Team } from '../../types';
import { 
  EngineerActionType,
  validateEngineerAction,
  processEngineerActionWithCost,
  getActionNameJP,
  DEFAULT_ENGINEER_COST_CONFIG,
  EngineerCostConfig 
} from '../../utils/engineerActionCostManager';

export interface EnhancedEngineerActionsHook {
  // Cost validation functions
  validateEngineerActionCost: (
    actionType: EngineerActionType,
    engineer: Unit,
    currentFunds: { [team: string]: number }
  ) => {
    canAfford: boolean;
    hasMaterials: boolean;
    canPerform: boolean;
    fundsCost: number;
    materialCost: number;
    errors: string[];
  };
  
  // Pre-action cost check
  canPerformEngineerAction: (
    actionType: EngineerActionType,
    engineer: Unit,
    currentFunds: { [team: string]: number }
  ) => boolean;
  
  // Get cost information
  getEngineerActionCosts: (actionType: EngineerActionType) => {
    fundsCost: number;
    materialCost: number;
    actionNameJP: string;
  };
  
  // Process action with cost deduction
  processEngineerActionWithCostDeduction: (
    actionType: EngineerActionType,
    engineer: Unit,
    currentFunds: { [team: string]: number },
    onSuccess: (result: {
      updatedFunds: { [team: string]: number };
      fundsCost: number;
      materialCost: number;
      message: string;
    }) => void,
    onFailure: (errors: string[]) => void
  ) => void;
}

interface EnhancedEngineerActionsDeps {
  currentFunds: { [team: string]: number };
  setFunds: (funds: { [team: string]: number }) => void;
  config?: EngineerCostConfig;
}

export const useEnhancedEngineerActions = (
  deps: EnhancedEngineerActionsDeps
): EnhancedEngineerActionsHook => {
  const { currentFunds, setFunds, config = DEFAULT_ENGINEER_COST_CONFIG } = deps;
  
  const validateEngineerActionCost = useCallback((
    actionType: EngineerActionType,
    engineer: Unit,
    funds: { [team: string]: number }
  ) => {
    return validateEngineerAction(actionType, engineer, funds, config);
  }, [config]);
  
  const canPerformEngineerAction = useCallback((
    actionType: EngineerActionType,
    engineer: Unit,
    funds: { [team: string]: number }
  ): boolean => {
    const validation = validateEngineerAction(actionType, engineer, funds, config);
    return validation.canPerform;
  }, [config]);
  
  const getEngineerActionCosts = useCallback((actionType: EngineerActionType) => {
    return {
      fundsCost: config.costs[actionType] || 0,
      materialCost: getMaterialCostForAction(actionType),
      actionNameJP: getActionNameJP(actionType)
    };
  }, [config]);
  
  const processEngineerActionWithCostDeduction = useCallback((
    actionType: EngineerActionType,
    engineer: Unit,
    funds: { [team: string]: number },
    onSuccess: (result: {
      updatedFunds: { [team: string]: number };
      fundsCost: number;
      materialCost: number;
      message: string;
    }) => void,
    onFailure: (errors: string[]) => void
  ) => {
    // Validate first
    const validation = validateEngineerAction(actionType, engineer, funds, config);
    
    if (!validation.canPerform) {
      onFailure(validation.errors);
      return;
    }
    
    // Process cost deduction
    const result = processEngineerActionWithCost(
      actionType,
      engineer,
      { x: engineer.x, y: engineer.y }, // dummy coord for cost processing
      { x: engineer.x, y: engineer.y, terrain: 'Plains' } as any, // dummy tile
      funds,
      config
    );
    
    if (result.success) {
      // Update funds if changed
      if (result.fundsCost > 0) {
        setFunds(result.updatedFunds);
      }
      
      onSuccess({
        updatedFunds: result.updatedFunds,
        fundsCost: result.fundsCost,
        materialCost: result.materialCost,
        message: result.message
      });
      
      console.log(`🔧 Engineer Action Cost Applied: ${getActionNameJP(actionType)}`, {
        action: actionType,
        team: engineer.team,
        fundsCost: result.fundsCost,
        materialCost: result.materialCost,
        remainingFunds: result.updatedFunds[engineer.team]
      });
    } else {
      onFailure(result.errors);
    }
  }, [config, setFunds]);
  
  return {
    validateEngineerActionCost,
    canPerformEngineerAction,
    getEngineerActionCosts,
    processEngineerActionWithCostDeduction
  };
};

// Helper function to match existing system
const getMaterialCostForAction = (actionType: EngineerActionType): number => {
  switch (actionType) {
    case 'enhance_city': return 1;
    case 'build_bridge': return 2;
    case 'build_fortress': return 1;
    case 'destroy_fortress': return 2;
    default: return 0;
  }
};;
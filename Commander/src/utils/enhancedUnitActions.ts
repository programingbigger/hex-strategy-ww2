import { Unit } from '../types';
import { EngineerActionType, processEngineerActionWithCost, DEFAULT_ENGINEER_COST_CONFIG, EngineerCostConfig } from './engineerActionCostManager';

export interface EnhancedMaterialActionResult {
  success: boolean;
  fundsCost: number;
  materialCost: number;
  updatedFunds: { [team: string]: number };
  message: string;
  errors: string[];
}

/**
 * Enhanced material action handler that processes costs before executing the original action
 */
export const createEnhancedMaterialActionHandler = (
  originalHandler: (action: EngineerActionType) => void,
  currentFunds: { [team: string]: number },
  setFunds: (funds: { [team: string]: number }) => void,
  selectedUnit: Unit | null,
  config: EngineerCostConfig = DEFAULT_ENGINEER_COST_CONFIG
) => {
  return {
    handleMaterialActionWithCost: (
      action: EngineerActionType,
      onCostProcessed?: (result: EnhancedMaterialActionResult) => void
    ): void => {
      if (!selectedUnit) {
        const errorResult: EnhancedMaterialActionResult = {
          success: false,
          fundsCost: 0,
          materialCost: 0,
          updatedFunds: currentFunds,
          message: 'No unit selected',
          errors: ['No unit selected']
        };
        
        if (onCostProcessed) onCostProcessed(errorResult);
        return;
      }
      
      // Process costs first
      const costResult = processEngineerActionWithCost(
        action,
        selectedUnit,
        { x: selectedUnit.x, y: selectedUnit.y },
        { x: selectedUnit.x, y: selectedUnit.y, terrain: 'Plains' } as any,
        currentFunds,
        config
      );
      
      if (!costResult.success) {
        const errorResult: EnhancedMaterialActionResult = {
          success: false,
          fundsCost: costResult.fundsCost,
          materialCost: costResult.materialCost,
          updatedFunds: currentFunds,
          message: costResult.message,
          errors: costResult.errors
        };
        
        if (onCostProcessed) onCostProcessed(errorResult);
        return;
      }
      
      // Update funds if cost was applied
      if (costResult.fundsCost > 0) {
        setFunds(costResult.updatedFunds);
        console.log(`💰 Engineer Action Fund Deduction: ${action}`, {
          team: selectedUnit.team,
          cost: costResult.fundsCost,
          remainingFunds: costResult.updatedFunds[selectedUnit.team]
        });
      }
      
      // Execute the original material action
      try {
        originalHandler(action);
        
        const successResult: EnhancedMaterialActionResult = {
          success: true,
          fundsCost: costResult.fundsCost,
          materialCost: costResult.materialCost,
          updatedFunds: costResult.updatedFunds,
          message: `${action} completed successfully. Funds cost: ${costResult.fundsCost}`,
          errors: []
        };
        
        if (onCostProcessed) onCostProcessed(successResult);
        
      } catch (error) {
        // If original action fails, we might want to refund the cost
        // For now, we'll log the error and not refund (realistic behavior)
        console.error(`Engineer action ${action} failed after cost deduction:`, error);
        
        const failureResult: EnhancedMaterialActionResult = {
          success: false,
          fundsCost: costResult.fundsCost,
          materialCost: costResult.materialCost,
          updatedFunds: costResult.updatedFunds,
          message: `${action} failed after cost deduction: ${error}`,
          errors: [`Action execution failed: ${error}`]
        };
        
        if (onCostProcessed) onCostProcessed(failureResult);
      }
    },
    
    // Check if action can be performed (including cost validation)
    canPerformMaterialAction: (action: EngineerActionType): {
      canPerform: boolean;
      fundsCost: number;
      materialCost: number;
      reasons: string[];
    } => {
      if (!selectedUnit) {
        return {
          canPerform: false,
          fundsCost: 0,
          materialCost: 0,
          reasons: ['No unit selected']
        };
      }
      
      const costResult = processEngineerActionWithCost(
        action,
        selectedUnit,
        { x: selectedUnit.x, y: selectedUnit.y },
        { x: selectedUnit.x, y: selectedUnit.y, terrain: 'Plains' } as any,
        currentFunds,
        config,
        true // dry run - don't actually apply costs
      );
      
      return {
        canPerform: costResult.success,
        fundsCost: costResult.fundsCost,
        materialCost: costResult.materialCost,
        reasons: costResult.errors
      };
    },
    
    // Get cost information for UI display
    getActionCostInfo: (action: EngineerActionType): {
      fundsCost: number;
      materialCost: number;
      canAfford: boolean;
    } => {
      if (!selectedUnit) {
        return { fundsCost: 0, materialCost: 0, canAfford: false };
      }
      
      const costResult = processEngineerActionWithCost(
        action,
        selectedUnit,
        { x: selectedUnit.x, y: selectedUnit.y },
        { x: selectedUnit.x, y: selectedUnit.y, terrain: 'Plains' } as any,
        currentFunds,
        config,
        true // dry run
      );
      
      return {
        fundsCost: costResult.fundsCost,
        materialCost: costResult.materialCost,
        canAfford: costResult.success
      };
    }
  };
};

/**
 * Integration helper for existing game logic
 */
export interface EngineerActionCostIntegration {
  // Validates and processes engineer action with cost deduction
  processEngineerAction: (
    action: EngineerActionType,
    selectedUnit: Unit,
    currentFunds: { [team: string]: number },
    originalActionHandler: () => void,
    onCostApplied: (updatedFunds: { [team: string]: number }, cost: number) => void,
    onActionFailed: (errors: string[]) => void
  ) => void;
  
  // Pre-validates if action can be performed
  canPerformAction: (
    action: EngineerActionType,
    selectedUnit: Unit,
    currentFunds: { [team: string]: number }
  ) => {
    canPerform: boolean;
    costInfo: { funds: number; materials: number };
    errors: string[];
  };
}

export const createEngineerActionCostIntegration = (
  config: EngineerCostConfig = DEFAULT_ENGINEER_COST_CONFIG
): EngineerActionCostIntegration => {
  return {
    processEngineerAction: (
      action,
      selectedUnit,
      currentFunds,
      originalActionHandler,
      onCostApplied,
      onActionFailed
    ) => {
      // Process cost first
      const costResult = processEngineerActionWithCost(
        action,
        selectedUnit,
        { x: selectedUnit.x, y: selectedUnit.y },
        { x: selectedUnit.x, y: selectedUnit.y, terrain: 'Plains' } as any,
        currentFunds,
        config
      );
      
      if (!costResult.success) {
        onActionFailed(costResult.errors);
        return;
      }
      
      // Apply cost if any
      if (costResult.fundsCost > 0) {
        onCostApplied(costResult.updatedFunds, costResult.fundsCost);
      }
      
      // Execute original action
      try {
        originalActionHandler();
        console.log(`🔧 Engineer Action Completed: ${action} (Cost: ${costResult.fundsCost})`);
      } catch (error) {
        console.error(`Engineer action failed after cost deduction:`, error);
        onActionFailed([`Action execution failed: ${error}`]);
      }
    },
    
    canPerformAction: (action, selectedUnit, currentFunds) => {
      const costResult = processEngineerActionWithCost(
        action,
        selectedUnit,
        { x: selectedUnit.x, y: selectedUnit.y },
        { x: selectedUnit.x, y: selectedUnit.y, terrain: 'Plains' } as any,
        currentFunds,
        config,
        true // dry run
      );
      
      return {
        canPerform: costResult.success,
        costInfo: {
          funds: costResult.fundsCost,
          materials: costResult.materialCost
        },
        errors: costResult.errors
      };
    }
  };
};
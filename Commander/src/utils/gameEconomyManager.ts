import { Unit, Team, BoardLayout } from '../types';
import { calculateIncomeForAllTeams } from './incomeManager';
import { applySupplyOperationsWithCost, validateSupplyBudget } from './supplyCostManager';
import { processProductionRequests, validateProductionRequest, getAffordableUnits, ProductionRequest } from './productionCostManager';
import { canAffordCost, CostCalculationResult } from './costManager';

export interface EconomicSummary {
  currentFunds: { [team: string]: number };
  income: { [team: string]: number };
  supplyCosts: { [team: string]: number };
  productionCapacity: { [team: string]: string[] };
  netIncome: { [team: string]: number };
}

export interface TurnEconomicOperation {
  team: Team;
  income: number;
  supplyCost: number;
  productionCost: number;
  startingFunds: number;
  endingFunds: number;
  supplyResults: any;
  productionResults: any;
}

/**
 * Main economic manager for handling all cost operations during turn processing
 */
export class GameEconomyManager {
  private funds: { [team: string]: number };
  
  constructor(initialFunds: { [team: string]: number }) {
    this.funds = { ...initialFunds };
  }

  /**
   * Get current funds for all teams
   */
  getCurrentFunds(): { [team: string]: number } {
    return { ...this.funds };
  }

  /**
   * Set funds for all teams
   */
  setFunds(newFunds: { [team: string]: number }): void {
    this.funds = { ...newFunds };
  }

  /**
   * Process full economic turn for a team
   */
  async processTeamEconomicTurn(
    team: Team,
    units: Unit[],
    boardLayout: BoardLayout,
    productionRequests?: ProductionRequest[],
    applyIncome = true
  ): Promise<TurnEconomicOperation> {
    const startingFunds = this.funds[team] || 0;
    let currentFunds = { ...this.funds };

    console.log(`💰 Processing economic turn for ${team} - Starting funds: ${startingFunds}`);

    // 1. Apply income
    let income = 0;
    if (applyIncome) {
      const incomeResults = await calculateIncomeForAllTeams(boardLayout, currentFunds);
      currentFunds = incomeResults;
      income = incomeResults[team] - startingFunds;
      console.log(`📈 Income applied for ${team}: +${income}`);
    }

    // 2. Process supply operations
    const supplyResults = await applySupplyOperationsWithCost(
      units,
      boardLayout,
      currentFunds,
      team,
      false // Don't force supply if can't afford
    );

    if (supplyResults.success) {
      currentFunds = supplyResults.updatedFunds;
      console.log(`🏥 Supply operations completed for ${team}: -${supplyResults.totalCost}`);
    } else {
      console.log(`⚠️ Some supply operations failed for ${team}: ${supplyResults.errors.join(', ')}`);
    }

    // 3. Process production requests
    const productionResults = await processProductionRequests(
      productionRequests || [],
      currentFunds,
      false // Don't force production if can't afford
    );

    if (productionResults.overallSuccess) {
      currentFunds = productionResults.finalFunds;
      console.log(`🏭 Production completed for ${team}: -${productionResults.totalCost}`);
    } else {
      console.log(`⚠️ Some production operations failed for ${team}`);
    }

    const endingFunds = currentFunds[team] || 0;
    this.funds = currentFunds;

    return {
      team,
      income,
      supplyCost: supplyResults.totalCost,
      productionCost: productionResults.totalCost,
      startingFunds,
      endingFunds,
      supplyResults,
      productionResults
    };
  }

  /**
   * Generate economic summary for all teams
   */
  async generateEconomicSummary(
    units: Unit[],
    boardLayout: BoardLayout,
    availableUnitIds: { [team: string]: string[] }
  ): Promise<EconomicSummary> {
    const currentFunds = { ...this.funds };
    const summary: EconomicSummary = {
      currentFunds,
      income: {},
      supplyCosts: {},
      productionCapacity: {},
      netIncome: {}
    };

    // Calculate income
    const incomeResults = await calculateIncomeForAllTeams(boardLayout, currentFunds);
    for (const team of ['Blue', 'Red'] as Team[]) {
      summary.income[team] = incomeResults[team] - currentFunds[team];
    }

    // Calculate supply costs
    for (const team of ['Blue', 'Red'] as Team[]) {
      const supplyBudget = await validateSupplyBudget(units, boardLayout, team, currentFunds);
      summary.supplyCosts[team] = supplyBudget.totalCost;
    }

    // Calculate production capacity
    for (const team of ['Blue', 'Red'] as Team[]) {
      const teamUnitIds = availableUnitIds[team] || [];
      const affordableUnits = await getAffordableUnits(teamUnitIds, team, currentFunds);
      summary.productionCapacity[team] = affordableUnits.affordable;
    }

    // Calculate net income
    for (const team of ['Blue', 'Red'] as Team[]) {
      summary.netIncome[team] = summary.income[team] - summary.supplyCosts[team];
    }

    return summary;
  }

  /**
   * Check if a team can afford specific operations
   */
  async validateTeamOperations(
    team: Team,
    units: Unit[],
    boardLayout: BoardLayout,
    productionRequests?: ProductionRequest[]
  ): Promise<{
    canAffordSupply: boolean;
    canAffordProduction: boolean;
    canAffordAll: boolean;
    supplyCost: number;
    productionCost: number;
    totalCost: number;
    currentFunds: number;
    missingFunds: number;
  }> {
    const currentFunds = this.getCurrentFunds();
    const teamFunds = currentFunds[team] || 0;

    // Calculate supply costs
    const supplyValidation = await validateSupplyBudget(units, boardLayout, team, currentFunds);
    
    // Calculate production costs
    let productionCost = 0;
    if (productionRequests) {
      for (const request of productionRequests) {
        const validation = await validateProductionRequest(request, currentFunds);
        productionCost += validation.totalCost;
      }
    }

    const totalCost = supplyValidation.totalCost + productionCost;
    const canAffordSupply = supplyValidation.canAfford;
    const canAffordProduction = teamFunds >= productionCost;
    const canAffordAll = teamFunds >= totalCost;
    const missingFunds = Math.max(0, totalCost - teamFunds);

    return {
      canAffordSupply,
      canAffordProduction,
      canAffordAll,
      supplyCost: supplyValidation.totalCost,
      productionCost,
      totalCost,
      currentFunds: teamFunds,
      missingFunds
    };
  }

  /**
   * Emergency funding - add funds to a team (for testing/admin purposes)
   */
  addEmergencyFunding(team: Team, amount: number): void {
    this.funds[team] = (this.funds[team] || 0) + amount;
    console.log(`🆘 Emergency funding: +${amount} to ${team} (New total: ${this.funds[team]})`);
  }

  /**
   * Get economic status for UI display
   */
  getEconomicStatus(): {
    funds: { [team: string]: number };
    timestamp: number;
  } {
    return {
      funds: { ...this.funds },
      timestamp: Date.now()
    };
  }
}

/**
 * Create a new economy manager instance
 */
export const createGameEconomyManager = (initialFunds: { [team: string]: number }): GameEconomyManager => {
  return new GameEconomyManager(initialFunds);
};

/**
 * Helper function to validate if any operation can be afforded
 */
export const canAffordOperation = (cost: number, availableFunds: number): CostCalculationResult => {
  return canAffordCost(cost, availableFunds);
};
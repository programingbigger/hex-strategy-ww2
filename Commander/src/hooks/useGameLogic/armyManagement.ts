import { useCallback } from 'react';
import {
  Unit,
  Faction,
  MilitaryBranch,
  UnitCategory,
  Coordinate,
  Team
} from '../../types';
import { ProducibleUnit } from '../../components/game/ProductionModal';
import { getDeploymentLimit } from '../../utils/deploymentLimits';
import { armyManager } from '../../data/units';
import { getDistance } from '../../utils/map';

export interface ArmyManagementHook {
  getUnitsByBranch: (faction: Faction, branch: MilitaryBranch) => Unit[];
  getUnitsByCategory: (faction: Faction, category: UnitCategory) => Unit[];
  getAvailableUnitsFromArmy: (faction: Faction, branch?: MilitaryBranch, category?: UnitCategory) => any[];
  createUnitFromArmy: (templateId: string, instanceId: string, x: number, y: number) => Unit | null;
  getBranchesFor: (faction: Faction) => MilitaryBranch[];
  getCategoriesFor: (faction: Faction, branch: MilitaryBranch) => UnitCategory[];
  getCommandStructure: () => any;
  calculateCommandBonus: (unit: Unit) => { attack: number; defense: number };
  handleUnitProduction: (unitTemplate: ProducibleUnit) => Promise<void>;
  handleProductionClose: () => void;
}

interface ArmyManagementDeps {
  units: Unit[];
  productionState: {
    isOpen: boolean;
    capital: Coordinate | null;
    producibleUnits: ProducibleUnit[];
  };
  setUnits: (units: Unit[] | ((prev: Unit[]) => Unit[])) => void;
  setProductionState: (state: {
    isOpen: boolean;
    capital: Coordinate | null;
    producibleUnits: ProducibleUnit[];
  }) => void;
  armyFunds: { [team: string]: number };
  setArmyFunds: (funds: { [team: string]: number }) => void;
  mapId: string;
}

export const useArmyManagement = (deps: ArmyManagementDeps): ArmyManagementHook => {
  const {
    units,
    productionState,
    setUnits,
    setProductionState,
    armyFunds,
    setArmyFunds,
    mapId
  } = deps;

  const getUnitsByBranch = useCallback((faction: Faction, branch: MilitaryBranch): Unit[] => {
    return units.filter(unit => unit.faction === faction && unit.branch === branch);
  }, [units]);

  const getUnitsByCategory = useCallback((faction: Faction, category: UnitCategory): Unit[] => {
    return units.filter(unit => unit.faction === faction && unit.category === category);
  }, [units]);

  const getAvailableUnitsFromArmy = useCallback((faction: Faction, branch?: MilitaryBranch, category?: UnitCategory) => {
    return armyManager.getUnitTemplatesBy(faction, branch, category);
  }, []);

  const createUnitFromArmy = useCallback((templateId: string, instanceId: string, x: number, y: number): Unit | null => {
    return armyManager.createUnitFromTemplate(templateId, instanceId, x, y);
  }, []);

  const getBranchesFor = useCallback((faction: Faction): MilitaryBranch[] => {
    return armyManager.getBranches(faction);
  }, []);

  const getCategoriesFor = useCallback((faction: Faction, branch: MilitaryBranch): UnitCategory[] => {
    return armyManager.getCategories(faction, branch);
  }, []);

  const getCommandStructure = useCallback(() => {
    return armyManager.getCommandStructure();
  }, []);

  const calculateCommandBonus = useCallback((unit: Unit): { attack: number; defense: number } => {
    const commandStructure = getCommandStructure();
    const sameUnitBonus = commandStructure.bonuses['同一師団'];
    const commanderBonus = commandStructure.bonuses['指揮官効果'];
    
    const nearbyUnits = units.filter(u => 
      u.faction === unit.faction && 
      u.id !== unit.id &&
      getDistance({x: u.x, y: u.y}, {x: unit.x, y: unit.y}) <= (commanderBonus.範囲 || 2)
    );

    let attackBonus = 0;
    let defenseBonus = 0;

    if (nearbyUnits.length > 0) {
      const sameTypeUnits = nearbyUnits.filter(u => u.type === unit.type);
      if (sameTypeUnits.length > 0) {
        attackBonus += sameUnitBonus?.attack || 0;
        defenseBonus += sameUnitBonus?.defense || 0;
      }

      attackBonus += commanderBonus?.効果 || 0;
      defenseBonus += commanderBonus?.効果 || 0;
    }

    return { attack: attackBonus, defense: defenseBonus };
  }, [units, getCommandStructure]);

  const handleUnitProduction = useCallback(async (unitTemplate: ProducibleUnit) => {
    if (!productionState.capital) return;

    // Determine the team from the unit template
    const team = unitTemplate.faction === 'Blue' ? 'Blue' as Team : 'Red' as Team;

    // Check deployment limit before attempting production
    try {
      const deploymentLimit = await getDeploymentLimit(mapId, team);
      const currentTeamUnits = units.filter(unit => unit.team === team).length;

      if (currentTeamUnits >= deploymentLimit) {
        alert(`上限に達したため、生産できません。\n現在のユニット数: ${currentTeamUnits}/${deploymentLimit}`);
        return;
      }
    } catch (error) {
      console.error('Failed to check deployment limit:', error);
      // Continue with production if limit check fails
    }

    // Import the production cost manager dynamically
    const { processSingleProductionRequest } = await import('../../utils/productionCostManager');
    
    // Create production request
    const productionRequest = {
      unitId: unitTemplate.id,
      faction: team,
      x: productionState.capital.x,
      y: productionState.capital.y,
      quantity: 1
    };

    try {
      // Process production with cost
      const result = await processSingleProductionRequest(
        productionRequest, 
        armyFunds, 
        false // Don't force production
      );

      if (result.success && result.units.length > 0) {
        // Production successful - add units and deduct funds
        const producedUnits = result.units.map(unit => ({ 
          ...unit, 
          moved: true, 
          attacked: true 
        }));
        
        setUnits(prevUnits => [...prevUnits, ...producedUnits]);
        setArmyFunds({
          ...armyFunds,
          [team]: result.remainingFunds
        });
        
        setProductionState({ isOpen: false, capital: null, producibleUnits: [] });
      } else {
        // Production failed - show error
        console.error('Production failed:', result.errors);
        alert(`生産に失敗しました: ${result.errors.join(', ')}`);
      }
    } catch (error) {
      console.error('Production error:', error);
      alert('生産エラーが発生しました。');
    }
  }, [productionState.capital, setUnits, setProductionState, armyFunds, setArmyFunds, units, mapId]);

  const handleProductionClose = useCallback(() => {
    setProductionState({ isOpen: false, capital: null, producibleUnits: [] });
  }, [setProductionState]);

  return {
    getUnitsByBranch,
    getUnitsByCategory,
    getAvailableUnitsFromArmy,
    createUnitFromArmy,
    getBranchesFor,
    getCategoriesFor,
    getCommandStructure,
    calculateCommandBonus,
    handleUnitProduction,
    handleProductionClose,
  };
};;
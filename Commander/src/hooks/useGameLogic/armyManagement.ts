import { useCallback } from 'react';
import {
  Unit,
  Faction,
  MilitaryBranch,
  UnitCategory,
  Coordinate
} from '../../types';
import { ProducibleUnit } from '../../components/game/ProductionModal';
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
  handleUnitProduction: (unitTemplate: ProducibleUnit) => void;
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
}

export const useArmyManagement = (deps: ArmyManagementDeps): ArmyManagementHook => {
  const {
    units,
    productionState,
    setUnits,
    setProductionState
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

  const handleUnitProduction = useCallback((unitTemplate: ProducibleUnit) => {
    if (!productionState.capital) return;

    const newUnitId = `${unitTemplate.id}-${Date.now()}`;
    const newUnit = armyManager.createUnitFromTemplate(
      unitTemplate.id,
      newUnitId,
      productionState.capital.x,
      productionState.capital.y
    );

    if (newUnit) {
      const producedUnit = { ...newUnit, moved: true, attacked: true };
      setUnits(prevUnits => [...prevUnits, producedUnit]);
    }

    setProductionState({ isOpen: false, capital: null, producibleUnits: [] });
  }, [productionState.capital, setUnits, setProductionState]);

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
};
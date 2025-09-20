import { Unit, ArmyOrganization, ArmyUnitTemplate, Faction, MilitaryBranch, UnitCategory } from '../types';
import armyOrganizationData from './armyOrganization.json';

export class ArmyManager {
  private static instance: ArmyManager;
  private armyData: ArmyOrganization;

  private constructor() {
    this.armyData = armyOrganizationData as ArmyOrganization;
  }

  public static getInstance(): ArmyManager {
    if (!ArmyManager.instance) {
      ArmyManager.instance = new ArmyManager();
    }
    return ArmyManager.instance;
  }

  // Get all available unit templates for a faction and branch
  public getUnitTemplatesBy(
    faction: Faction,
    branch?: MilitaryBranch,
    category?: UnitCategory
  ): ArmyUnitTemplate[] {
    const factionData = this.armyData.factions[faction];
    if (!factionData) return [];

    if (!branch) {
      // Return all units from all branches
      const allUnits: ArmyUnitTemplate[] = [];
      Object.values(factionData.branches).forEach(branchData => {
        Object.values(branchData.unitCategories).forEach(categoryData => {
          allUnits.push(...categoryData.units);
        });
      });
      return allUnits;
    }

    const branchData = factionData.branches[branch];
    if (!branchData) return [];

    if (!category) {
      // Return all units from the specified branch
      const branchUnits: ArmyUnitTemplate[] = [];
      Object.values(branchData.unitCategories).forEach(categoryData => {
        branchUnits.push(...categoryData.units);
      });
      return branchUnits;
    }

    // Return units from specific category
    const categoryData = branchData.unitCategories[category];
    return categoryData ? categoryData.units : [];
  }

  // Create a unit instance from template
  public createUnitFromTemplate(
    templateId: string,
    instanceId: string,
    x: number = 0,
    y: number = 0
  ): Unit | null {
    // Find template in all factions and branches
    for (const faction of Object.keys(this.armyData.factions) as Faction[]) {
      const templates = this.getUnitTemplatesBy(faction);
      const template = templates.find(t => t.id === templateId);
      
      if (template) {
        return this.createUnitFromTemplateData(template, instanceId, x, y);
      }
    }
    return null;
  }

  private createUnitFromTemplateData(
    template: ArmyUnitTemplate,
    instanceId: string,
    x: number,
    y: number
  ): Unit {
    return {
      id: instanceId,
      type: template.type,
      team: template.faction, // Keep legacy team compatibility
      faction: template.faction,
      branch: template.branch,
      category: template.category,
      name: template.name,
      x,
      y,
      hp: template.stats.maxHp,
      maxHp: template.stats.maxHp,
      attack: template.stats.attack,
      defense: template.stats.defense,
      movement: template.stats.movement,
      attackRange: template.stats.attackRange,
      moved: false,
      attacked: false,
      canCounterAttack: template.stats.canCounterAttack,
      unitClass: template.stats.unitClass,
      fuel: template.stats.maxFuel,
      maxFuel: template.stats.maxFuel,
      xp: 0,
      weapons: template.weapons.map(weapon => ({
        ...weapon,
        ammunition: weapon.maxAmmunition // Reset ammunition to max
      }))
    };
  }

  // Get available branches for a faction
  public getBranches(faction: Faction): MilitaryBranch[] {
    const factionData = this.armyData.factions[faction];
    return factionData ? Object.keys(factionData.branches) as MilitaryBranch[] : [];
  }

  // Get available categories for a faction and branch
  public getCategories(faction: Faction, branch: MilitaryBranch): UnitCategory[] {
    const factionData = this.armyData.factions[faction];
    if (!factionData) return [];
    
    const branchData = factionData.branches[branch];
    return branchData ? Object.keys(branchData.unitCategories) as UnitCategory[] : [];
  }

  // Get faction info
  public getFactionInfo(faction: Faction) {
    return this.armyData.factions[faction];
  }

  // Get command structure
  public getCommandStructure() {
    return this.armyData.commandStructure;
  }

  // Legacy compatibility functions
  public getPlayerStartingUnits(): Unit[] {
    const units: Unit[] = [];
    const templates = this.getUnitTemplatesBy('Blue', '陸');
    
    // Create starting units based on legacy setup
    const unitCounts = {
      'blue-infantry-standard': 5,
      'blue-tank-medium': 3,
      'blue-armored-car': 2
    };

    Object.entries(unitCounts).forEach(([templateId, count]) => {
      const template = templates.find(t => t.id === templateId);
      if (template) {
        for (let i = 1; i <= count; i++) {
          const unit = this.createUnitFromTemplateData(
            template,
            `${template.id}-${i}`,
            0,
            0
          );
          units.push(unit);
        }
      }
    });

    return units;
  }

  public getEnemyStartingUnits(): Unit[] {
    const units: Unit[] = [];
    const templates = this.getUnitTemplatesBy('Red', '陸');
    
    // Create starting units based on legacy setup
    const unitCounts = {
      'red-infantry-standard': 2,
      'red-tank-medium': 1,
      'red-artillery-howitzer': 1
    };

    Object.entries(unitCounts).forEach(([templateId, count]) => {
      const template = templates.find(t => t.id === templateId);
      if (template) {
        for (let i = 1; i <= count; i++) {
          const unit = this.createUnitFromTemplateData(
            template,
            `enemy-${template.type}-${i}`,
            0,
            0
          );
          units.push(unit);
        }
      }
    });

    return units;
  }
}

// Export singleton instance
export const armyManager = ArmyManager.getInstance();

// Export legacy functions for backward compatibility
export const getPlayerStartingUnits = () => armyManager.getPlayerStartingUnits();
export const getEnemyStartingUnits = () => armyManager.getEnemyStartingUnits();

// Export new unit creation function
export const createUnitFromArmy = (
  templateId: string,
  instanceId: string,
  x: number = 0,
  y: number = 0
): Unit | null => {
  return armyManager.createUnitFromTemplate(templateId, instanceId, x, y);
};
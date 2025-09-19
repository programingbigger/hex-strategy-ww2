import { BoardLayout, Team } from '../types';

interface IncomeSettings {
  incomeSettings: {
    Capital: {
      baseIncome: number;
      hpIncomeMultiplier: number;
      description: string;
    };
    City: {
      baseIncome: number;
      hpIncomeMultiplier: number;
      description: string;
    };
  };
  calculationMethod: {
    description: string;
    example: Record<string, string>;
  };
}

let incomeSettings: IncomeSettings | null = null;

export const loadIncomeSettings = async (): Promise<IncomeSettings | null> => {
  if (incomeSettings) {
    return incomeSettings;
  }

  try {
    const response = await fetch('/settings/income_settings.json');
    if (!response.ok) {
      console.error('Failed to load income settings:', response.statusText);
      return null;
    }
    incomeSettings = await response.json();
    console.log('📊 Income settings loaded:', incomeSettings);
    return incomeSettings;
  } catch (error) {
    console.error('Error loading income settings:', error);
    return null;
  }
};

export const calculateTeamIncome = (team: Team, boardLayout: BoardLayout, settings: IncomeSettings): number => {
  let totalIncome = 0;

  // Count cities and capitals owned by the team
  const ownedTerrain = Array.from(boardLayout.values()).filter(tile => 
    tile.owner === team && (tile.terrain === 'City' || tile.terrain === 'Capital')
  );

  console.log(`💰 Calculating income for ${team}:`, 
    ownedTerrain.map(tile => ({ 
      terrain: tile.terrain, 
      hp: tile.hp, 
      maxHp: tile.maxHp 
    }))
  );

  for (const tile of ownedTerrain) {
    if (tile.terrain !== 'City' && tile.terrain !== 'Capital') continue;
    
    const terrainSettings = settings.incomeSettings[tile.terrain];
    if (!terrainSettings) continue;

    const currentHp = tile.hp || 0;
    const { baseIncome, hpIncomeMultiplier } = terrainSettings;
    
    // Calculate income: baseIncome + Math.floor(currentHP / hpIncomeMultiplier) * baseIncome
    const hpBonus = Math.floor(currentHp / hpIncomeMultiplier);
    const terrainIncome = baseIncome + (hpBonus * baseIncome);
    
    totalIncome += terrainIncome;
    
    console.log(`  ${tile.terrain} (HP: ${currentHp}): ${baseIncome} + ${hpBonus} × ${baseIncome} = ${terrainIncome}`);
  }

  console.log(`💰 Total income for ${team}: ${totalIncome}`);
  return totalIncome;
};

export const calculateIncomeForAllTeams = async (
  boardLayout: BoardLayout, 
  currentFunds: { [team: string]: number }
): Promise<{ [team: string]: number }> => {
  const settings = await loadIncomeSettings();
  if (!settings) {
    console.warn('⚠️ Income settings not available, skipping income calculation');
    return currentFunds;
  }

  const teams: Team[] = ['Blue', 'Red'];
  const newFunds = { ...currentFunds };

  for (const team of teams) {
    const income = calculateTeamIncome(team, boardLayout, settings);
    newFunds[team] = (newFunds[team] || 0) + income;
    console.log(`💰 ${team} team: ${currentFunds[team] || 0} + ${income} = ${newFunds[team]}`);
  }

  return newFunds;
};
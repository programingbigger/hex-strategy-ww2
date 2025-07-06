
export type Team = 'Blue' | 'Red';
export type WeatherType = 'Sunny' | 'Rain' | 'HeavyRain' | 'Storm';
export type UnitType = 'Infantry' | 'Tank' | 'ArmoredCar' | 'Artillery' | 'AntiTank';
export type TerrainType = 'Plains' | 'Forest' | 'Mountain' | 'River' | 'Road' | 'Bridge' | 'City' | 'Mud';
export type GameState = 'playing' | 'gameOver';
export type UnitClass = 'vehicle' | 'infantry';

export interface Coordinate {
  x: number;
  y: number;
}

export interface Unit {
  id: string;
  type: UnitType;
  team: Team;
  hp: number;
  maxHp: number;
  attack: number;
  attackVs?: { [key in UnitClass]?: number }; // Optional: Special attack values
  defense: number;
  defenseVs?: { [key in UnitClass]?: number }; // Optional: Special defense values
  movement: number;
  attackRange: { min: number; max: number };
  x: number;
  y: number;
  moved: boolean;
  attacked: boolean;
  canCounterAttack: boolean;
  unitClass: UnitClass;
}

export interface Tile {
  x: number;
  y: number;
  terrain: TerrainType;
  zocByTeam?: Team; // Optional, indicates which team's ZOC this tile is in
  owner?: Team | null; // Optional: Indicates the team that owns the city
  capturingProcess?: {
    by: Unit['id'];
    team: Team;
    turnsLeft: number;
  } | null;
}

export type BoardLayout = Map<string, Tile>;

export interface UnitStats {
  maxHp: number;
  attack: number;
  attackVs?: { [key in UnitClass]?: number };
  defense: number;
  defenseVs?: { [key in UnitClass]?: number };
  movement: number;
  attackRange: { min: number; max: number };
  canCounterAttack: boolean;
  unitClass: UnitClass;
}

export interface TerrainStats {
  defenseBonus: number;
  attackBonus: number;
  movementCost: {
    [key in UnitType]?: number;
  } & { default: number };
}

export interface BattleReport {
  attacker: Unit;
  defender: Unit;
  damage: number;
  report: string;
}

export interface GameStateSnapshot {
    units: Unit[];
    turn: number;
    activeTeam: Team;
    selectedUnitId: string | null;
}

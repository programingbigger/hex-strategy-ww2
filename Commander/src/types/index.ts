export type GameScreen = 
  | 'title'
  | 'home'
  | 'scenario-select'
  | 'battle-prep'
  | 'deployment'
  | 'battle'
  | 'result';

export interface GameMap {
  id: string;
  name: string;
  description: string;
  difficulty: 'Easy' | 'Normal' | 'Hard';
  thumbnail?: string;
  deploymentCenter?: { q: number; r: number };
}

export type Team = 'Blue' | 'Red';

export type UnitType = 'Infantry' | 'Tank' | 'ArmoredCar' | 'Artillery' | 'AntiTank';

export type UnitClass = 'Infantry' | 'Vehicle';

export type WeaponType = '37mm主砲' | '36MG機銃' | '9mmライフル' | '105mm野砲';

export interface Weapon {
  id: string;
  name: string;
  type: WeaponType;
  ammunition: number;
  maxAmmunition: number;
  range: { min: number; max: number };
  attack: number;
  effectiveness?: { [key in UnitClass]?: number };
}

export type WeatherType = 'Clear' | 'Rain' | 'HeavyRain';

export type TerrainType = 'Plains' | 'Forest' | 'Mountain' | 'River' | 'Road' | 'Bridge' | 'City' | 'Mud' | 'Sea';

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
  attack: number; // Legacy - will be deprecated in favor of weapons
  defense: number;
  movement: number;
  attackRange: { min: number; max: number }; // Legacy - will be deprecated
  x: number;
  y: number;
  moved: boolean;
  attacked: boolean;
  canCounterAttack: boolean;
  unitClass: UnitClass;
  fuel: number;
  maxFuel: number;
  xp: number;
  attackVs?: { [key in UnitClass]?: number };
  defenseVs?: { [key in UnitClass]?: number };
  weapons: Weapon[]; // New weapon system
}

export interface Tile {
  x: number;
  y: number;
  terrain: TerrainType;
  owner?: Team;
  hp?: number;
  maxHp?: number;
}

export type BoardLayout = Map<string, Tile>;

export interface GameState {
  currentScreen: GameScreen;
  selectedMap?: GameMap;
  units: Unit[];
  board: BoardLayout;
  activeTeam: Team;
  turn: number;
  winner?: Team;
  gameState?: 'playing' | 'gameOver';
  weather?: WeatherType;
  weatherDuration?: number;
  battlePrep?: BattlePrepState;
}

export interface BattleResult {
  winner: Team;
  turnsToWin: number;
  unitsLost: number;
}

export interface BattleReport {
  attacker: Unit;
  defender: Unit;
  damage: number;
  counterDamage?: number;
  report: string;
  weaponUsed?: Weapon;
  counterWeaponUsed?: Weapon;
}

export interface GameStateSnapshot {
  units: Unit[];
  turn: number;
  activeTeam: Team;
  selectedUnitId: string | null;
}

export interface TerrainStats {
  defenseBonus: number;
  attackBonus: number;
  movementCost: { [key: string]: number; default: number };
}

export interface UnitStats {
  maxHp: number;
  attack: number;
  defense: number;
  movement: number;
  attackRange: { min: number; max: number };
  canCounterAttack: boolean;
  unitClass: UnitClass;
  maxFuel: number;
  attackVs?: { [key in UnitClass]?: number };
  defenseVs?: { [key in UnitClass]?: number };
  isArtillery?: boolean;
}

export interface MapData {
  gameStatus: {
    gameState: string;
    turn: number;
    activeTeam: Team;
    winner: Team | null;
    weather: WeatherType;
    weatherDuration: number;
  };
  board: {
    tiles: Tile[];
  };
  units: Unit[];
  deploymentCenter?: { q: number; r: number };
}

export interface BattlePrepState {
  selectedUnits: Unit[];
  deployedUnits: Map<string, { x: number; y: number }>;
  victoryConditions: string[];
}

export interface DeploymentCoordinate {
  q: number;
  r: number;
}
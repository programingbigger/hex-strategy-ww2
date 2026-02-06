export type GameScreen =
  | 'title'
  | 'home'
  | 'scenario-select'
  | 'tutorial-intro'
  | 'tutorial-select'
  | 'battle-prep'
  | 'deployment'
  | 'battle';

export interface GameMap {
  id: string;
  name: string;
  description: string;
}

export type Team = 'Blue' | 'Red';

export type Faction = 'Blue' | 'Red';

export type MilitaryBranch = '陸' | '海' | '空';

export type UnitCategory = 'infantry' | 'armor' | 'artillery' | 'antitank' | 'support' | 'destroyer' | 'cruiser' | 'battleship' | 'fighter' | 'bomber' | 'transport';

export type UnitType = 'Infantry' | 'Tank' | 'ArmoredCar' | 'Artillery' | 'AntiTank' | 'Engineer' | 'Transport' | 'SupplyWagon' | 'SupplyTruck';

export type UnitClass = 'Infantry' | 'Vehicle' | 'Tank' | 'Aircraft';

export type WeaponType = 
  | '37mm主砲' | '36MG機銃' | '9mmライフル' | '105mm野砲'  // Legacy weapons
  | '50mm主砲' | '30cal機銃' | '57mm対戦車砲' | 'M1ライフル' | '155mm榴弾砲' | 'BAR機銃'  // Blue faction weapons
  | '7.7mm機銃' | '47mm対戦車砲' | '6.5mmライフル' | '99式軽機銃'  // Red faction weapons
  | '7.92mm機銃' | '資材'  // New weapon types  // Red faction weapons
  | '補給物資' | '自衛用ライフル';  // 補給ユニットの武装

export interface UnitClassAttack {
  unitClass: UnitClass | 'Tank' | 'Aircraft';
  attack: number;
}

export interface Weapon {
  id: string;
  name: string;
  type: WeaponType;
  ammunition: number;
  maxAmmunition: number;
  range: { min: number; max: number };
  attack: number | UnitClassAttack[];
  effectiveness?: { [key in UnitClass]?: number };
  canInitiateAttack?: boolean; // false: 反撃でのみ使用可能（自発的攻撃不可）
  isSupplyKit?: boolean; // true: 補給物資（攻撃武器ではない）
}

export type WeatherType = 'Clear' | 'Rain' | 'Storm' | 'Cloudy' | 'Snow' | 'Blizzard' | 'Fog';
// Environmental levels system to track weather accumulation effects
export interface EnvironmentalLevels {
  wetness: number;  // Ground wetness level (replaces weatherDuration for rain/storm)
  snow: number;     // Snow accumulation level (for snow/blizzard weather)
}

export type TerrainType = 'Plains' | 'Forest' | 'Mountain' | 'River' | 'Road' | 'Bridge' | 'City' | 'Mud' | 'Sea' | 'Capital' | 'Airport' | 'Bocage' | 'Snow' | 'Desert' | 'Reef' | 'Fortress' | 'Port' | 'FrozenRiver' | 'FrozenSea';

export interface Coordinate {
  x: number;
  y: number;
}

export interface Unit {
  id: string;
  type: UnitType;
  team: Team;
  faction?: Faction; // New: for army organization compatibility
  branch?: MilitaryBranch; // New: military branch
  category?: UnitCategory; // New: unit category within branch
  name?: string; // New: display name from JSON
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
  loaded?: boolean; // New: for transport system - indicates if unit is loaded in transport
  transportId?: string; // New: for transport system - ID of transport unit
  supplyStock?: number; // 補給ユニットの現在の補給物資量
  maxSupplyStock?: number; // 補給ユニットの最大補給物資量

  // 雪上電撃戦システム (Snow Blitzkrieg System)
  snowMobility?: number; // 雪上機動フラグ: 0 = 通常ペナルティ, 1 = 雪上でも移動速度を損なわない
  communicationRange?: number; // 通信範囲（hex単位）: このユニットの通信可能距離
  isCommunicationHub?: boolean; // 通信中継車フラグ: true = 通信ハブとして機能し、範囲を拡張する

  // 水晶同期通信網システム (Crystal Link Communication System)
  isSynced?: boolean; // 同期状態フラグ: true = 通信網に接続され同期している, false/undefined = 孤立状態
  signalSource?: boolean; // 信号源フラグ: true = このユニットは信号を生成できる（Hub）
  signalRadius?: number; // 信号生成半径（hex単位）: 信号源がこの範囲内のユニットを同期させる
  relayRadius?: number; // 中継半径（hex単位）: 同期状態のユニットがこの範囲内に信号を中継する
}

export interface Tile {
  x: number;
  y: number;
  terrain: TerrainType;
  owner?: Team;
  hp?: number;
  maxHp?: number;
  order?: number; // For production order
}

export type BoardLayout = Map<string, Tile>;

export interface GameState {
  currentScreen: GameScreen;
  previousScreen?: GameScreen; // Track previous screen for navigation context
  selectedMap?: GameMap;
  units: Unit[];
  board: BoardLayout;
  activeTeam: Team;
  turn: number;
  month?: number; // Month of the year (1-12) for weather probability
  year?: number; // Year for date display
  day?: number; // Day of the month for date display
  winner?: Team;
  gameState?: 'playing' | 'gameOver';
  weather?: WeatherType;
  environmentalLevels?: EnvironmentalLevels;
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
  reconnaissance: number; // 索敵能力（範囲）

  // 雪上電撃戦システム (Snow Blitzkrieg System)
  snowMobility?: number; // 雪上機動フラグ: 0 = 通常ペナルティ, 1 = 雪上でも移動速度を損なわない
  communicationRange?: number; // 通信範囲（hex単位）: このユニットの通信可能距離
  isCommunicationHub?: boolean; // 通信中継車フラグ: true = 通信ハブとして機能し、範囲を拡張する

  // 水晶同期通信網システム (Crystal Link Communication System)
  signalSource?: boolean; // 信号源フラグ: true = このユニットは信号を生成できる（Hub）
  signalRadius?: number; // 信号生成半径（hex単位）: 信号源がこの範囲内のユニットを同期させる
  relayRadius?: number; // 中継半径（hex単位）: 同期状態のユニットがこの範囲内に信号を中継する
}

// Unit stats as they appear in armyOrganization.json (without attack and attackRange)
export interface ArmyUnitStats {
  maxHp: number;
  defense: number;
  movement: number;
  canCounterAttack: boolean;
  unitClass: UnitClass;
  maxFuel: number;
  attackVs?: { [key in UnitClass]?: number };
  defenseVs?: { [key in UnitClass]?: number };
  isArtillery?: boolean;
  reconnaissance: number; // 索敵能力（範囲）

  // 雪上電撃戦システム (Snow Blitzkrieg System)
  snowMobility?: number; // 雪上機動フラグ: 0 = 通常ペナルティ, 1 = 雪上でも移動速度を損なわない
  communicationRange?: number; // 通信範囲（hex単位）: このユニットの通信可能距離
  isCommunicationHub?: boolean; // 通信中継車フラグ: true = 通信ハブとして機能し、範囲を拡張する

  // 水晶同期通信網システム (Crystal Link Communication System)
  signalSource?: boolean; // 信号源フラグ: true = このユニットは信号を生成できる（Hub）
  signalRadius?: number; // 信号生成半径（hex単位）: 信号源がこの範囲内のユニットを同期させる
  relayRadius?: number; // 中継半径（hex単位）: 同期状態のユニットがこの範囲内に信号を中継する
}

// Victory condition types
export type VictoryCondition = 
  | 'unit_elimination'    // All enemy units destroyed
  | 'capital_capture'     // All enemy capitals captured
  | 'city_capture'        // All cities captured
  | 'turn_limit'          // Turn limit reached
  | 'custom';             // Custom scenario-specific conditions

export interface VictoryResult {
  condition: VictoryCondition;
  winner: Team;
  description: string;
  turnsElapsed: number;
}

// Unit configuration for available units on each map
export interface UnitConfig {
  id: string;
  faction: Team;
  count: number;
  unitId: string;
}

export interface MapData {
  gameStatus: {
    gameState: string;
    turn: number;
    activeTeam: Team;
    winner: Team | null;
    weather: WeatherType;
    environmentalLevels: EnvironmentalLevels;
    // New victory system fields
    turnLimit?: number;           // Maximum turns (undefined = no limit)
    attackingTeam?: Team;         // Which team is attacking (loses on timeout)
    defendingTeam?: Team;         // Which team is defending (wins on timeout)
    enabledVictoryConditions?: VictoryCondition[]; // Active victory conditions
  };
  armyFunds?: { [team: string]: number };
  deploymentLimits?: { [team: string]: number };  // Maximum units that can be deployed per team ⭐️
  availableUnits?: UnitConfig[];  // Units available for deployment on this map
  producibleUnits?: { [faction: string]: string[] };  // Units that can be produced by each faction on this map
  board: {
    tiles: Tile[];
  };
  units: Unit[];
  deploymentCenter?: { q: number; r: number };
  initialCameraPosition?: { x: number; y: number };
}

export interface BattlePrepState {
  selectedUnits: Unit[];
  deployedUnits: Map<string, { x: number; y: number }>;
  victoryConditions: string[];
  startDate?: {
    year: number;
    month: number;
    day: number;
  };
}

export interface DeploymentCoordinate {
  q: number;
  r: number;
}

// Cost structure for units
export interface UnitCost {
  production: number;
  supply: {
    ammunition: number;
    fuel: number;
    repair: number;
  };
}

// New: Army Organization Types
export interface ArmyUnitTemplate {
  id: string;
  name: string;
  type: UnitType;
  faction: Faction;
  branch: MilitaryBranch;
  category: UnitCategory;
  stats: UnitStats;
  weapons: Weapon[];
  cost: UnitCost;
  supply?: {
    maxSupplyStock: number;
  };
}

// Unit template as it appears in armyOrganization.json
export interface ArmyUnitTemplateJSON {
  id: string;
  name: string;
  type: UnitType;
  faction: Faction;
  branch: MilitaryBranch;
  category: UnitCategory;
  stats: ArmyUnitStats; // Uses ArmyUnitStats without attack/attackRange
  weapons: Weapon[];
  cost: UnitCost;
  supply?: {
    maxSupplyStock: number;
  };
}

export interface UnitCategoryData {
  name: string;
  units: ArmyUnitTemplateJSON[]; // Use JSON version without attack/attackRange in stats
}

export interface MilitaryBranchData {
  name: string;
  unitCategories: Record<string, UnitCategoryData>;
}

export interface FactionData {
  name: string;
  description: string;
  branches: Record<MilitaryBranch, MilitaryBranchData>;
}

export interface CommandStructure {
  hierarchy: string[];
  bonuses: {
    [key: string]: {
      attack?: number;
      defense?: number;
      範囲?: number;
      効果?: number;
    };
  };
}

export interface ArmyOrganization {
  metadata: {
    version: string;
    description: string;
    lastUpdated: string;
  };
  factions: Record<Faction, FactionData>;
  commandStructure: CommandStructure;
}

// 🎯 Battle Log Types for Player UI
export interface BattleLogEntry {
  id: string;
  turn: number;
  phase: 'Player Phase' | 'Enemy Phase';
  timestamp: Date;
  attacker: {
    team: Team;
    unitName: string;
    unitType: UnitType;
    hpBefore: number;
    hpAfter: number;
    position: Coordinate;
  };
  defender: {
    team: Team;
    unitName: string;
    unitType: UnitType;
    hpBefore: number;
    hpAfter: number;
    position: Coordinate;
  };
  location: {
    hex: Coordinate;
    terrain: TerrainType;
    defenseBonus?: number;
  };
  weapon: {
    name: string;
    type: WeaponType;
  };
  result: {
    damageDealt: number;
    damageTaken: number;
    unitDestroyed?: boolean;
  };
  counterAttack?: {
    weapon: {
      name: string;
      type: WeaponType;
    };
    damageDealt: number;
    damageTaken: number;
    unitDestroyed?: boolean;
  };
}

export interface BattleLogState {
  entries: BattleLogEntry[];
  maxEntries: number;
  isVisible: boolean;
  autoScroll: boolean;
}

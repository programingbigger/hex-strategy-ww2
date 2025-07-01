
export type Team = 'Blue' | 'Red';
export type UnitType = 'Infantry' | 'Tank' | 'ArmoredCar';
export type TerrainType = 'Plains' | 'Forest' | 'Mountain' | 'River' | 'Road' | 'Bridge';
export type GameState = 'playing' | 'gameOver';

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
  defense: number;
  movement: number;
  x: number;
  y: number;
  moved: boolean;
  attacked: boolean;
  canCounterAttack: boolean;
}

export interface Tile {
  x: number;
  y: number;
  terrain: TerrainType;
}

export type BoardLayout = Map<string, Tile>;

export interface UnitStats {
  maxHp: number;
  attack: number;
  defense: number;
  movement: number;
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

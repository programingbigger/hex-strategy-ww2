
export enum Screen {
  Home = 'HOME',
  Game = 'GAME',
  Tutorial = 'TUTORIAL',
  Story = 'STORY',
  Load = 'LOAD',
}

export enum Player {
  Allies = 'ALLIES',
  Axis = 'AXIS',
}

export enum UnitType {
  Infantry = 'INFANTRY',
  Tank = 'TANK',
  Artillery = 'ARTILLERY',
}

export enum Terrain {
  Plains = 'PLAINS',
  Forest = 'FOREST',
  Mountain = 'MOUNTAIN',
  Water = 'WATER',
}

export interface HexPosition {
  q: number;
  r: number;
}

export interface Tile {
  id: string;
  position: HexPosition;
  terrain: Terrain;
}

export interface Unit {
  id: string;
  type: UnitType;
  player: Player;
  position: HexPosition;
  health: number;
  movement: number;
  hasMoved: boolean;
}

export interface GameState {
  map: Tile[][];
  units: Unit[];
  currentTurn: Player;
  selectedUnitId: string | null;
}

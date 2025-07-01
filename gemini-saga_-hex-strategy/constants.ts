import type { UnitStats, TerrainStats, UnitType, Team, Coordinate } from './types';

export const MAP_MIN_Q = -12;
export const MAP_MAX_Q = 12;
export const MAP_MIN_R = -6;
export const MAP_MAX_R = 6;
export const HEX_SIZE = 48;

export const UNIT_STATS: Record<UnitType, UnitStats> = {
  Infantry: { maxHp: 10, attack: 4, defense: 2, movement: 3, canCounterAttack: true, attackRange: { min: 1, max: 1 } },
  Tank: { maxHp: 20, attack: 7, defense: 5, movement: 4, canCounterAttack: true, attackRange: { min: 1, max: 1 } },
  ArmoredCar: { maxHp: 15, attack: 5, defense: 4, movement: 6, canCounterAttack: true, attackRange: { min: 1, max: 1 } },
  Artillery: { maxHp: 12, attack: 8, defense: 3, movement: 2, canCounterAttack: false, attackRange: { min: 2, max: 5 } },
};

export const TERRAIN_STATS: Record<string, TerrainStats> = {
  Plains: {
    defenseBonus: 0,
    attackBonus: 0,
    movementCost: { default: 1 },
  },
  Forest: {
    defenseBonus: 2,
    attackBonus: 0,
    movementCost: { Infantry: 1, Tank: 3, ArmoredCar: 2, Artillery: 3, default: 2 },
  },
  Mountain: {
    defenseBonus: 3,
    attackBonus: 2,
    movementCost: { Infantry: 2, Artillery: Infinity, default: Infinity },
  },
  River: {
    defenseBonus: -2,
    attackBonus: -1,
    movementCost: { Infantry: 2, Artillery: Infinity, default: Infinity },
  },
  Road: {
    defenseBonus: -1,
    attackBonus: 0,
    movementCost: { default: 1 },
  },
  Bridge: {
    defenseBonus: -1,
    attackBonus: 0,
    movementCost: { default: 1 },
  },
};

export const INITIAL_UNIT_POSITIONS: Record<Team, Array<Coordinate & { type: UnitType }>> = {
    Blue: [
        { x: -5, y: 0, type: 'Tank' },
        { x: -6, y: 0, type: 'Tank' },
        { x: -7, y: 0, type: 'Tank' },
        { x: -6, y: 1, type: 'Infantry' },
        { x: -6, y: -1, type: 'Infantry' },
        { x: -6, y: -2, type: 'Infantry' },
        { x: -6, y: 2, type: 'Infantry' },
        { x: -7, y: 1, type: 'ArmoredCar' },
        { x: -7, y: 2, type: 'ArmoredCar' },
        { x: -7, y: -1, type: 'ArmoredCar' },
        { x: -8, y: 0, type: 'Artillery' },
    ],
    Red: [
        { x: 5, y: 0, type: 'Tank' },
        { x: 5, y: 1, type: 'Tank' },
        { x: 5, y: 2, type: 'Tank' },
        { x: 6, y: -1, type: 'Infantry' },
        { x: 6, y: 1, type: 'Infantry' },
        { x: 6, y: 0, type: 'Infantry' },
        { x: 7, y: 0, type: 'ArmoredCar' },
        { x: 7, y: -1, type: 'ArmoredCar' },
        { x: 7, y: 1, type: 'ArmoredCar' },
        { x: 8, y: 0, type: 'Artillery' },
    ],
};

export const TEAM_COLORS: Record<Team, { primary: string; secondary: string; hex: string; glow: string; }> = {
    Blue: { primary: 'bg-blue-600', secondary: 'border-blue-400', hex: '#2563eb', glow: 'url(#glow-blue)' },
    Red: { primary: 'bg-red-600', secondary: 'border-red-400', hex: '#dc2626', glow: 'url(#glow-red)' },
};

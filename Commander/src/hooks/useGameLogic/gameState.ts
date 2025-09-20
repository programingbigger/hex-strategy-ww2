import { useState, useCallback } from 'react';
import {
  Unit,
  BoardLayout,
  Team,
  WeatherType,
  EnvironmentalLevels,
  GameStateSnapshot,
  MapData,
  VictoryCondition,
  VictoryResult
} from '../../types';
import { loadMapFromJSON } from '../../utils/map';
import { logBattle } from '../../utils/battleLogger';

export interface GameStateHook {
  gameState: 'playing' | 'gameOver';
  turn: number;
  month: number;
  year: number;
  day: number;
  activeTeam: Team;
  boardLayout: BoardLayout;
  units: Unit[];
  selectedUnitId: string | null;
  weather: WeatherType;
  environmentalLevels: EnvironmentalLevels;
  winner: Team | null;
  victoryResult: VictoryResult | null;
  turnLimit: number | undefined;
  attackingTeam: Team;
  defendingTeam: Team;
  enabledVictoryConditions: VictoryCondition[];
  history: GameStateSnapshot[];
  armyFunds: { [team: string]: number };
  
  setGameState: (state: 'playing' | 'gameOver') => void;
  setTurn: (turn: number) => void;
  setMonth: (month: number) => void;
  setYear: (year: number) => void;
  setDay: (day: number) => void;
  setActiveTeam: (team: Team) => void;
  setBoardLayout: (layout: BoardLayout) => void;
  setUnits: (units: Unit[] | ((prev: Unit[]) => Unit[])) => void;
  setSelectedUnitId: (id: string | null) => void;
  setWeather: (weather: WeatherType) => void;
  setEnvironmentalLevels: (levels: EnvironmentalLevels) => void;
  setWinner: (winner: Team | null) => void;
  setVictoryResult: (result: VictoryResult | null) => void;
  setHistory: (history: GameStateSnapshot[] | ((prevHistory: GameStateSnapshot[]) => GameStateSnapshot[])) => void;
  setArmyFunds: (funds: { [team: string]: number }) => void;
  
  loadGame: (mapData: MapData) => void;
  saveStateToHistory: () => void;
}

export const useGameState = (): GameStateHook => {
  const [gameState, setGameState] = useState<'playing' | 'gameOver'>('playing');
  const [turn, setTurn] = useState<number>(1);
  const [month, setMonth] = useState<number>(1); // Start with January
  const [year, setYear] = useState<number>(1944); // Start with 1944
  const [day, setDay] = useState<number>(1); // Start with 1st day
  const [activeTeam, setActiveTeam] = useState<Team>('Blue');
  const [boardLayout, setBoardLayout] = useState<BoardLayout>(new Map());
  const [units, setUnits] = useState<Unit[]>([]);
  const [selectedUnitId, setSelectedUnitId] = useState<string | null>(null);
  const [weather, setWeather] = useState<WeatherType>('Rain');
  const [environmentalLevels, setEnvironmentalLevels] = useState<EnvironmentalLevels>({ wetness: 0, snow: 0 });
  const [winner, setWinner] = useState<Team | null>(null);
  const [victoryResult, setVictoryResult] = useState<VictoryResult | null>(null);
  const [turnLimit, setTurnLimit] = useState<number | undefined>(undefined);
  const [attackingTeam, setAttackingTeam] = useState<Team>('Blue');
  const [defendingTeam, setDefendingTeam] = useState<Team>('Red');
  const [enabledVictoryConditions, setEnabledVictoryConditions] = useState<VictoryCondition[]>([
    'unit_elimination', 'capital_capture', 'city_capture'
  ]);
  const [history, setHistory] = useState<GameStateSnapshot[]>([]);
  const [armyFunds, setArmyFunds] = useState<{ [team: string]: number }>({ Blue: 0, Red: 0 });

  const loadGame = useCallback((mapData: MapData) => {
    const { board, units: loadedUnits } = loadMapFromJSON(mapData);
    setBoardLayout(board);
    setUnits(loadedUnits);
    setTurn(mapData.gameStatus.turn);
    setActiveTeam(mapData.gameStatus.activeTeam);
    setGameState(mapData.gameStatus.gameState as 'playing' | 'gameOver');
    setWinner(mapData.gameStatus.winner);
    setWeather(mapData.gameStatus.weather);
    setEnvironmentalLevels(mapData.gameStatus.environmentalLevels);
    
    setTurnLimit(mapData.gameStatus.turnLimit);
    setAttackingTeam(mapData.gameStatus.attackingTeam || 'Blue');
    setDefendingTeam(mapData.gameStatus.defendingTeam || 'Red');
    setEnabledVictoryConditions(mapData.gameStatus.enabledVictoryConditions || [
      'unit_elimination', 'capital_capture', 'city_capture'
    ]);
    
    setArmyFunds(mapData.armyFunds || { Blue: 0, Red: 0 });
    
    setSelectedUnitId(null);
    setVictoryResult(null);
    setHistory([]);
    
    logBattle('🎮 New game loaded - Battle log cleared');
  }, []);

  const saveStateToHistory = useCallback(() => {
    const snapshot: GameStateSnapshot = {
      units: JSON.parse(JSON.stringify(units)),
      turn,
      activeTeam,
      selectedUnitId,
    };
    setHistory(prevHistory => [...prevHistory, snapshot]);
  }, [units, turn, activeTeam, selectedUnitId]);

  return {
    gameState,
    turn,
    month,
    year,
    day,
    activeTeam,
    boardLayout,
    units,
    selectedUnitId,
    weather,
    environmentalLevels,
    winner,
    victoryResult,
    turnLimit,
    attackingTeam,
    defendingTeam,
    enabledVictoryConditions,
    history,
    armyFunds,
    
    setGameState,
    setTurn,
    setMonth,
    setYear,
    setDay,
    setActiveTeam,
    setBoardLayout,
    setUnits,
    setSelectedUnitId,
    setWeather,
    setEnvironmentalLevels,
    setWinner,
    setVictoryResult,
    setHistory,
    setArmyFunds,
    
    loadGame,
    saveStateToHistory,
  };
};;
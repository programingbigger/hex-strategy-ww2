import { useState, useCallback } from 'react';
import {
  Unit,
  BoardLayout,
  Team,
  WeatherType,
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
  activeTeam: Team;
  boardLayout: BoardLayout;
  units: Unit[];
  selectedUnitId: string | null;
  weather: WeatherType;
  weatherDuration: number;
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
  setActiveTeam: (team: Team) => void;
  setBoardLayout: (layout: BoardLayout) => void;
  setUnits: (units: Unit[] | ((prev: Unit[]) => Unit[])) => void;
  setSelectedUnitId: (id: string | null) => void;
  setWeather: (weather: WeatherType) => void;
  setWeatherDuration: (duration: number) => void;
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
  const [activeTeam, setActiveTeam] = useState<Team>('Blue');
  const [boardLayout, setBoardLayout] = useState<BoardLayout>(new Map());
  const [units, setUnits] = useState<Unit[]>([]);
  const [selectedUnitId, setSelectedUnitId] = useState<string | null>(null);
  const [weather, setWeather] = useState<WeatherType>('Rain');
  const [weatherDuration, setWeatherDuration] = useState(0);
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
    setWeatherDuration(mapData.gameStatus.weatherDuration);
    
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
    activeTeam,
    boardLayout,
    units,
    selectedUnitId,
    weather,
    weatherDuration,
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
    setActiveTeam,
    setBoardLayout,
    setUnits,
    setSelectedUnitId,
    setWeather,
    setWeatherDuration,
    setWinner,
    setVictoryResult,
    setHistory,
    setArmyFunds,
    
    loadGame,
    saveStateToHistory,
  };
};;
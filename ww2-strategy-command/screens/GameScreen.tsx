
import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { Screen, GameState, Player, UnitType, Terrain, HexPosition, Tile, Unit } from '../types';
import Hexagon from '../components/Hexagon';
import UnitIcon from '../components/UnitIcon';
import GameInfoPanel from '../components/GameInfoPanel';

interface GameScreenProps {
  onNavigate: (screen: Screen) => void;
}

const MAP_WIDTH = 12; // in hexes
const MAP_HEIGHT = 9; // in hexes

// Initial Game State Generator
const generateInitialState = (): GameState => {
  const map: Tile[][] = [];
  for (let r = 0; r < MAP_HEIGHT; r++) {
    map[r] = [];
    for (let q = 0; q < MAP_WIDTH; q++) {
        let terrain = Terrain.Plains;
        if (Math.random() > 0.75) terrain = Terrain.Forest;
        if (Math.random() > 0.95) terrain = Terrain.Mountain;
      map[r][q] = { id: `${q}-${r}`, position: { q, r }, terrain };
    }
  }

  const units: Unit[] = [
    { id: 'a1', type: UnitType.Infantry, player: Player.Allies, position: { q: 1, r: 4 }, health: 100, movement: 2, hasMoved: false },
    { id: 'a2', type: UnitType.Tank, player: Player.Allies, position: { q: 2, r: 3 }, health: 100, movement: 4, hasMoved: false },
    { id: 'x1', type: UnitType.Infantry, player: Player.Axis, position: { q: 10, r: 4 }, health: 100, movement: 2, hasMoved: false },
    { id: 'x2', type: UnitType.Tank, player: Player.Axis, position: { q: 9, r: 5 }, health: 100, movement: 4, hasMoved: false },
  ];

  return {
    map,
    units,
    currentTurn: Player.Allies,
    selectedUnitId: null,
  };
};

// --- Hex Grid Helper Functions ---
const hexDistance = (a: HexPosition, b: HexPosition): number => {
    // Using axial coordinates distance formula
    const dq = Math.abs(a.q - b.q);
    const dr = Math.abs(a.r - b.r);
    const ds = Math.abs((-a.q - a.r) - (-b.q - b.r));
    return (dq + dr + ds) / 2;
};

const getReachableHexes = (start: HexPosition, range: number, units: Unit[], map: Tile[][]): HexPosition[] => {
    const reachable: HexPosition[] = [];
    const occupiedPositions = new Set(units.map(u => `${u.position.q},${u.position.r}`));

    for (let r = 0; r < MAP_HEIGHT; r++) {
        for (let q = 0; q < MAP_WIDTH; q++) {
            const pos = {q, r};
            if (hexDistance(start, pos) <= range && !occupiedPositions.has(`${q},${r}`)) {
                reachable.push(pos);
            }
        }
    }
    return reachable;
}


const GameScreen: React.FC<GameScreenProps> = ({ onNavigate }) => {
  const [gameState, setGameState] = useState<GameState>(generateInitialState);
  
  const selectedUnit = useMemo(() => {
    return gameState.units.find(u => u.id === gameState.selectedUnitId) ?? null;
  }, [gameState.selectedUnitId, gameState.units]);

  const reachableHexes = useMemo(() => {
    if (!selectedUnit || selectedUnit.hasMoved) return [];
    return getReachableHexes(selectedUnit.position, selectedUnit.movement, gameState.units, gameState.map);
  }, [selectedUnit, gameState.units, gameState.map]);

  const handleHexClick = (pos: HexPosition) => {
    const unitAtPos = gameState.units.find(u => u.position.q === pos.q && u.position.r === pos.r);
    
    // 1. Select a unit
    if (unitAtPos && unitAtPos.player === gameState.currentTurn && !unitAtPos.hasMoved) {
        setGameState(prev => ({ ...prev, selectedUnitId: unitAtPos.id }));
        return;
    }
    
    // 2. Move selected unit
    if (selectedUnit && !selectedUnit.hasMoved && reachableHexes.some(h => h.q === pos.q && h.r === pos.r)) {
        setGameState(prev => ({
            ...prev,
            units: prev.units.map(u => u.id === selectedUnit.id ? { ...u, position: pos, hasMoved: true } : u),
            selectedUnitId: null,
        }));
        return;
    }

    // 3. Deselect unit
    if (selectedUnit) {
        setGameState(prev => ({ ...prev, selectedUnitId: null }));
    }
  };

  const handleEndTurn = () => {
    setGameState(prev => {
        const nextTurn = prev.currentTurn === Player.Allies ? Player.Axis : Player.Allies;
        return {
            ...prev,
            currentTurn: nextTurn,
            selectedUnitId: null,
            units: prev.units.map(u => ({...u, hasMoved: false})),
        }
    });
  };

  // Render constants
  const HEX_SIZE_RENDER = 50;
  const HEX_WIDTH_RENDER = Math.sqrt(3) * HEX_SIZE_RENDER;
  const HEX_HEIGHT_RENDER = 2 * HEX_SIZE_RENDER;

  return (
    <div className="flex w-full h-screen bg-gray-900">
      <div className="flex-grow relative overflow-auto">
        <div className="absolute p-4" style={{width: `${MAP_WIDTH * HEX_WIDTH_RENDER * 0.75 + HEX_WIDTH_RENDER * 0.25}px`, height: `${MAP_HEIGHT * HEX_HEIGHT_RENDER + HEX_HEIGHT_RENDER/2}px`}}>
        {gameState.map.flat().map(tile => {
          const unitOnTile = gameState.units.find(u => u.position.q === tile.position.q && u.position.r === tile.position.r);
          const isSelected = selectedUnit?.position.q === tile.position.q && selectedUnit?.position.r === tile.position.r;
          const isReachable = reachableHexes.some(h => h.q === tile.position.q && h.r === tile.position.r);

          const left = tile.position.q * HEX_WIDTH_RENDER * 0.75;
          const top = tile.position.r * HEX_HEIGHT_RENDER + (tile.position.q % 2 === 1 ? HEX_HEIGHT_RENDER / 2 : 0);

          return (
            <div key={tile.id} className="absolute" style={{ left: `${left}px`, top: `${top}px` }}>
              <Hexagon 
                terrain={tile.terrain}
                isHighlighted={isSelected ?? false}
                isReachable={isReachable}
                onClick={() => handleHexClick(tile.position)}
              >
                {unitOnTile && (
                  <div className="animate-fade-in">
                    <UnitIcon type={unitOnTile.type} player={unitOnTile.player} hasMoved={unitOnTile.hasMoved} />
                  </div>
                )}
              </Hexagon>
            </div>
          );
        })}
        </div>
      </div>
      <div className="w-[350px] flex-shrink-0">
        <GameInfoPanel
          selectedUnit={selectedUnit}
          currentTurn={gameState.currentTurn}
          onEndTurn={handleEndTurn}
          onExitGame={() => onNavigate(Screen.Home)}
        />
      </div>
    </div>
  );
};

export default GameScreen;

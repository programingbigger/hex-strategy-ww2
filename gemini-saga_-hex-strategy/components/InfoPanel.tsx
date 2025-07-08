import React from 'react';
import { TERRAIN_STATS, UNIT_STATS } from '../constants';
import type { Tile, Unit, GameState, Team, UnitType } from '../types';

interface InfoPanelProps {
  hoveredHex: Tile | null;
  hoveredUnit: Unit | null;
  gameState: GameState;
  winner: Team | null;
  onRestart: () => void;
  selectedUnit: Unit | null;
  selectedUnitTile: Tile | null;
  onAction: (action: 'wait' | 'undo' | 'capture') => void;
}

const TerrainInfo: React.FC<{ tile: Tile }> = ({ tile }) => {
  const stats = TERRAIN_STATS[tile.terrain];
  return (
    <div>
      <h3 className="text-xl font-bold mb-2 text-yellow-300">{tile.terrain}</h3>
      {tile.terrain === 'City' && tile.hp !== undefined && (
        <p>HP: <span className="font-mono">{tile.hp} / {tile.maxHp}</span></p>
      )}
      <p>Defense Bonus: <span className="font-mono">{stats.defenseBonus > 0 ? `+${stats.defenseBonus}` : stats.defenseBonus}</span></p>
      <p>Attack Bonus: <span className="font-mono">{stats.attackBonus > 0 ? `+${stats.attackBonus}` : stats.attackBonus}</span></p>
      <div className="mt-2 pt-2 border-t border-gray-600">
        <h4 className="font-semibold">Movement Costs:</h4>
        {(Object.keys(UNIT_STATS) as UnitType[]).map(unitType => {
          const cost = stats.movementCost[unitType] ?? stats.movementCost.default;
          return (
            <p key={unitType} className="text-sm">{unitType}: <span className="font-mono">{cost === Infinity ? '∞' : cost}</span></p>
          )
        })}
      </div>
    </div>
  );
};

const UnitInfo: React.FC<{ unit: Unit }> = ({ unit }) => {
  return (
    <div className="mt-4 pt-4 border-t border-gray-600">
      <h3 className="text-xl font-bold mb-2 text-blue-400">{unit.team} {unit.type}</h3>
      <p>HP: <span className="font-mono">{unit.hp} / {unit.maxHp}</span></p>
      <p>Attack: <span className="font-mono">{unit.attack}</span></p>
      <p>Defense: <span className="font-mono">{unit.defense}</span></p>
      <p>Movement: <span className="font-mono">{unit.movement}</span></p>
      <p>Status: <span className="font-mono">{unit.moved ? (unit.attacked ? 'Acted' : 'Moved') : 'Ready'}</span></p>
    </div>
  );
};

const ActionPanel: React.FC<{ unit: Unit, tile: Tile | null, onAction: (action: 'wait' | 'undo' | 'capture') => void }> = ({ unit, tile, onAction }) => {
  const canCapture = unit.type === 'Infantry' && tile?.terrain === 'City' && tile.owner !== unit.team;

  return (
    <div className="mt-4">
      <h3 className="text-xl font-bold mb-2 text-green-400">Actions</h3>
      <div className="flex flex-col gap-2">
        {canCapture && (
            <button
                onClick={() => onAction('capture')}
                className="bg-purple-600 hover:bg-purple-500 text-white font-bold py-2 px-4 rounded transition-colors"
            >
                Capture
            </button>
        )}
         <button 
          onClick={() => onAction('wait')}
          disabled={unit.attacked || !unit.moved}
          className="bg-yellow-600 hover:bg-yellow-500 text-white font-bold py-2 px-4 rounded disabled:bg-gray-500 disabled:cursor-not-allowed transition-colors"
        >
          Wait
        </button>
        {unit.moved && <button 
          onClick={() => onAction('undo')}
          className="bg-gray-600 hover:bg-gray-500 text-white font-bold py-2 px-4 rounded transition-colors"
        >
          Undo Move
        </button>}
      </div>
    </div>
  )
}

export const InfoPanel: React.FC<InfoPanelProps> = ({ hoveredHex, hoveredUnit, gameState, winner, onRestart, selectedUnit, selectedUnitTile, onAction }) => {
  if (gameState === 'gameOver') {
    return (
      <div className="w-64 bg-gray-800 p-4 flex-shrink-0 flex flex-col items-center justify-center border-l-2 border-gray-700">
        <h2 className="text-3xl font-bold mb-4">Game Over</h2>
        <p className="text-xl mb-6">{winner} Team Wins!</p>
        <button
          onClick={onRestart}
          className="bg-green-600 hover:bg-green-500 text-white font-bold py-3 px-6 rounded-lg text-lg transition duration-300 ease-in-out transform hover:scale-105"
        >
          Restart Game
        </button>
      </div>
    );
  }

  return (
    <aside className="w-64 bg-gray-800 p-4 flex-shrink-0 border-l-2 border-gray-700 overflow-y-auto">
      {selectedUnit ? (
        <div>
          <h2 className="text-2xl font-bold border-b pb-2 border-gray-600">Selected Unit</h2>
          <UnitInfo unit={selectedUnit} />
          {!selectedUnit.attacked && <ActionPanel unit={selectedUnit} tile={selectedUnitTile} onAction={onAction} />}
        </div>
      ) : (
        <div>
          <h2 className="text-2xl font-bold border-b pb-2 border-gray-600">Info Panel</h2>
          {hoveredHex ? <TerrainInfo tile={hoveredHex} /> : <p className="mt-4 text-gray-400">Hover over a tile to see details.</p>}
          {hoveredUnit && <UnitInfo unit={hoveredUnit} />}
        </div>
      )}
    </aside>
  );
};
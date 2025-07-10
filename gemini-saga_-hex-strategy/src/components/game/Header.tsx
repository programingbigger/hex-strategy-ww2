
import React from 'react';
import type { Team, Unit, Coordinate, WeatherType } from '@/types';
import { UNIT_STATS, TEAM_COLORS } from '@/config/constants';

interface HeaderProps {
  turn: number;
  activeTeam: Team;
  units: Unit[];
  onEndTurn: () => void;
  selectedUnit: Unit | null;
  hoveredHexCoord: Coordinate | null;
  weather: WeatherType;
}

const TeamInfo: React.FC<{ team: Team; units: Unit[]; isActive: boolean }> = ({ team, units, isActive }) => {
  const teamColor = TEAM_COLORS[team];
  const unitCount = units.filter(u => u.team === team).length;
  return (
    <div className={`p-2 rounded-lg transition-all duration-300 ${isActive ? `${teamColor.primary} shadow-lg` : 'bg-gray-700'}`}>
      <h2 className="font-bold text-lg">{team} Team</h2>
      <p>Units Left: {unitCount}</p>
    </div>
  );
};

export const Header: React.FC<HeaderProps> = ({
  turn,
  activeTeam,
  units,
  onEndTurn,
  selectedUnit,
  hoveredHexCoord,
  weather,
}) => {
  return (
    <header className="bg-gray-800 text-white p-2 shadow-md z-10 flex justify-between items-center border-b border-gray-700">
      <div className="flex items-center gap-4">
        <TeamInfo team="Blue" units={units} isActive={activeTeam === 'Blue'} />
        <div className="text-center">
            <h1 className="text-2xl font-bold tracking-wider">Turn {turn}</h1>
            <p className="text-sm text-gray-400">Weather: {weather}</p> {/* Weather Display */}
        </div>
        <TeamInfo team="Red" units={units} isActive={activeTeam === 'Red'} />
      </div>

      <div className="flex items-center gap-4 text-sm text-gray-300">
        <div className="text-right w-48">
          {selectedUnit ? (
            <div>
              <p className="font-bold">{selectedUnit.type}</p>
              <p>HP: {selectedUnit.hp}/{selectedUnit.maxHp} | ATK: {selectedUnit.attack} | DEF: {selectedUnit.defense} | MOV: {selectedUnit.movement}</p>
            </div>
          ) : (
             <p>No unit selected</p>
          )}
        </div>
        <div className="w-24">
            {hoveredHexCoord && <p>Cursor: ({hoveredHexCoord.x}, {hoveredHexCoord.y})</p>}
        </div>
      </div>
      
      <button
        onClick={onEndTurn}
        className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-2 px-4 rounded-lg transition duration-300 ease-in-out transform hover:scale-105"
      >
        End Turn
      </button>
    </header>
  );
};

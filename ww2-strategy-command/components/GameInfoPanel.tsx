
import React from 'react';
import { Unit, Player, Screen } from '../types';

interface GameInfoPanelProps {
  selectedUnit: Unit | null;
  currentTurn: Player;
  onEndTurn: () => void;
  onExitGame: () => void;
}

const InfoRow: React.FC<{ label: string; value: string | number }> = ({ label, value }) => (
  <div className="flex justify-between items-baseline py-2 border-b border-gray-600">
    <span className="text-sm font-special text-gray-400 uppercase">{label}</span>
    <span className="text-lg font-bold">{value}</span>
  </div>
);

const GameInfoPanel: React.FC<GameInfoPanelProps> = ({ selectedUnit, currentTurn, onEndTurn, onExitGame }) => {
  const turnColor = currentTurn === Player.Allies ? 'text-green-400' : 'text-red-400';

  return (
    <div className="w-full h-full bg-gray-800/80 backdrop-blur-sm p-4 flex flex-col border-l-2 border-gray-600">
      <div className="flex-grow">
        <h2 className="font-special text-3xl mb-4 text-center border-b-2 border-gray-600 pb-2">STATUS REPORT</h2>
        
        <div className="mb-6 p-3 bg-black/30 rounded">
            <div className="flex justify-between items-center">
                <span className="font-special text-xl text-gray-400">CURRENT TURN</span>
                <span className={`text-2xl font-bold ${turnColor}`}>{currentTurn}</span>
            </div>
        </div>

        <h3 className="font-special text-2xl mb-2 text-center text-gray-300">SELECTED UNIT</h3>
        <div className="bg-black/30 rounded p-4 min-h-[200px]">
          {selectedUnit ? (
            <div className="space-y-2">
              <InfoRow label="Unit Type" value={selectedUnit.type} />
              <InfoRow label="Faction" value={selectedUnit.player} />
              <InfoRow label="Health" value={`${selectedUnit.health}%`} />
              <InfoRow label="Movement" value={selectedUnit.movement} />
              <InfoRow label="Status" value={selectedUnit.hasMoved ? 'Moved' : 'Ready'} />
            </div>
          ) : (
            <div className="flex items-center justify-center h-full text-gray-500 font-special">
              <p>No unit selected.</p>
              <p>Click a unit on the map.</p>
            </div>
          )}
        </div>
      </div>
      
      <div className="space-y-3">
        <button
          onClick={onEndTurn}
          className="w-full bg-yellow-600 hover:bg-yellow-500 text-gray-900 font-bold py-3 px-4 rounded transition-colors duration-200 font-special text-xl"
        >
          END TURN
        </button>
        <button
          onClick={onExitGame}
          className="w-full bg-gray-600 hover:bg-gray-500 text-white font-bold py-2 px-4 rounded transition-colors duration-200 font-special text-lg"
        >
          EXIT TO MAIN MENU
        </button>
      </div>
    </div>
  );
};

export default GameInfoPanel;

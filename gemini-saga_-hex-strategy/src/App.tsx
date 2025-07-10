import React from 'react';
import { GameBoard } from '@/components/game/GameBoard';
import { Header } from '@/components/game/Header';
import { InfoPanel } from '@/components/game/InfoPanel';
import { BattleReportModal } from '@/components/game/BattleReportModal';
import { useGameLogic } from '@/hooks/useGameLogic';

const App: React.FC = () => {
    const {
        gameState,
        turn,
        activeTeam,
        boardLayout,
        units,
        selectedUnit,
        hoveredHex,
        battleReport,
        isLoadingAI,
        winner,
        weather,
        reachableTiles,
        attackableTiles,
        selectedUnitTile,
        initializeGame,
        handleEndTurn,
        handleHexClick,
        handleAction,
        setHoveredHex,
        setBattleReport,
    } = useGameLogic();

    return (
        <div className="flex flex-col h-screen font-sans bg-gray-900 text-gray-200">
            <Header
                turn={turn}
                activeTeam={activeTeam}
                units={units}
                onEndTurn={handleEndTurn}
                selectedUnit={selectedUnit}
                hoveredHexCoord={hoveredHex}
                weather={weather}
            />
            <div className="flex-grow flex overflow-hidden relative">
                <GameBoard
                    boardLayout={boardLayout}
                    units={units}
                    onHexClick={handleHexClick}
                    onHexHover={setHoveredHex}
                    selectedUnit={selectedUnit}
                    reachableTiles={reachableTiles}
                    attackableTiles={attackableTiles}
                    activeTeam={activeTeam}
                    weather={weather}
                />
                <InfoPanel
                    hoveredHex={hoveredHex ? boardLayout.get(hoveredHex.x + ',' + hoveredHex.y) : null}
                    hoveredUnit={hoveredHex ? units.find(u => u.x === hoveredHex.x && u.y === hoveredHex.y) : null}
                    gameState={gameState}
                    winner={winner}
                    onRestart={initializeGame}
                    selectedUnit={selectedUnit}
                    selectedUnitTile={selectedUnitTile}
                    onAction={handleAction}
                />
            </div>
            {battleReport && (
                <BattleReportModal
                    report={battleReport}
                    onClose={() => setBattleReport(null)}
                />
            )}
            {isLoadingAI && (
                <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="flex flex-col items-center">
                        <svg className="animate-spin -ml-1 mr-3 h-10 w-10 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        <p className="mt-2 text-lg">AIが戦闘レポートを生成中...</p>
                    </div>
                </div>
            )}
        </div>
    );
};

export default App;
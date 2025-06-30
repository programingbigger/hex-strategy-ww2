import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { GameBoard } from './components/GameBoard';
import { Header } from './components/Header';
import { InfoPanel } from './components/InfoPanel';
import { BattleReportModal } from './components/BattleReportModal';
import { generateBoardLayout, calculateReachableTiles, coordToString, getDistance, getNeighbors } from './utils/map';
import { generateBattleReport } from './services/battleReport.ts';
import { UNIT_STATS, TERRAIN_STATS, INITIAL_UNIT_POSITIONS } from './constants';
import type { Team, Unit, Tile, Coordinate, BoardLayout, BattleReport, GameState } from './types';

const App: React.FC = () => {
    const [gameState, setGameState] = useState<GameState>('playing');
    const [turn, setTurn] = useState<number>(1);
    const [activeTeam, setActiveTeam] = useState<Team>('Blue');
    const [boardLayout, setBoardLayout] = useState<BoardLayout>(new Map());
    const [units, setUnits] = useState<Unit[]>([]);
    const [selectedUnitId, setSelectedUnitId] = useState<string | null>(null);
    const [hoveredHex, setHoveredHex] = useState<Coordinate | null>(null);
    const [battleReport, setBattleReport] = useState<BattleReport | null>(null);
    const [isLoadingAI, setIsLoadingAI] = useState<boolean>(false);
    const [winner, setWinner] = useState<Team | null>(null);

    const initializeGame = useCallback(() => {
        const newBoardLayout = generateBoardLayout();
        const initialUnits: Unit[] = [];
        let unitIdCounter = 0;

        for (const team in INITIAL_UNIT_POSITIONS) {
            const currentTeam = team as Team;
            INITIAL_UNIT_POSITIONS[currentTeam].forEach(pos => {
                const unitStats = UNIT_STATS[pos.type];
                initialUnits.push({
                    id: `u-${unitIdCounter++}`,
                    type: pos.type,
                    team: currentTeam,
                    hp: unitStats.maxHp,
                    ...unitStats,
                    x: pos.x,
                    y: pos.y,
                    moved: false,
                    attacked: false,
                });
            });
        }

        setBoardLayout(newBoardLayout);
        setUnits(initialUnits);
        setTurn(1);
        setActiveTeam('Blue');
        setSelectedUnitId(null);
        setBattleReport(null);
        setIsLoadingAI(false);
        setGameState('playing');
        setWinner(null);
    }, []);

    useEffect(() => {
        initializeGame();
    }, [initializeGame]);

    const selectedUnit = useMemo(() => units.find(u => u.id === selectedUnitId), [units, selectedUnitId]);

    const reachableTiles = useMemo(() => {
        if (!selectedUnit || selectedUnit.moved) return [];
        return calculateReachableTiles({ x: selectedUnit.x, y: selectedUnit.y }, selectedUnit.movement, boardLayout, units);
    }, [selectedUnit, boardLayout, units]);

    const attackableTiles = useMemo(() => {
        if (!selectedUnit || selectedUnit.attacked) return [];
        const neighbors = getNeighbors({ x: selectedUnit.x, y: selectedUnit.y });
        return neighbors.filter(coord =>
            units.some(u => u.x === coord.x && u.y === coord.y && u.team !== selectedUnit.team)
        );
    }, [selectedUnit, units]);

    const handleEndTurn = useCallback(() => {
        const nextTeam = activeTeam === 'Blue' ? 'Red' : 'Blue';
        setActiveTeam(nextTeam);
        if (nextTeam === 'Blue') {
            setTurn(t => t + 1);
        }
        setUnits(units.map(u => ({ ...u, moved: false, attacked: false })));
        setSelectedUnitId(null);
    }, [activeTeam, units]);

    const checkWinCondition = useCallback((currentUnits: Unit[]) => {
        const blueUnits = currentUnits.filter(u => u.team === 'Blue');
        const redUnits = currentUnits.filter(u => u.team === 'Red');

        if (redUnits.length === 0) {
            setGameState('gameOver');
            setWinner('Blue');
        } else if (blueUnits.length === 0) {
            setGameState('gameOver');
            setWinner('Red');
        }
    }, []);
    
    const handleAttack = useCallback(async (attacker: Unit, defender: Unit) => {
        const attackerTile = boardLayout.get(coordToString(attacker));
        const defenderTile = boardLayout.get(coordToString(defender));

        if (!attackerTile || !defenderTile) return;

        const attackerTerrainStats = TERRAIN_STATS[attackerTile.terrain];
        const defenderTerrainStats = TERRAIN_STATS[defenderTile.terrain];

        const attackPower = attacker.attack + attackerTerrainStats.attackBonus;
        const defensePower = defender.defense + defenderTerrainStats.defenseBonus;

        const damage = Math.max(1, attackPower - defensePower);

        setIsLoadingAI(true);
        const reportText = await generateBattleReport(attacker, defender, defenderTile.terrain, damage);
        setIsLoadingAI(false);

        setBattleReport({
            attacker,
            defender,
            damage,
            report: reportText,
        });
        
        const newUnits = units.map(u => {
            if (u.id === defender.id) {
                return { ...u, hp: Math.max(0, u.hp - damage) };
            }
            if(u.id === attacker.id) {
                return { ...u, attacked: true, moved: true };
            }
            return u;
        }).filter(u => u.hp > 0);
        
        setUnits(newUnits);
        setSelectedUnitId(null);
        checkWinCondition(newUnits);

    }, [boardLayout, units, checkWinCondition]);

    const handleHexClick = useCallback((coord: Coordinate) => {
        if (gameState === 'gameOver' || isLoadingAI) return;

        const unitOnHex = units.find(u => u.x === coord.x && u.y === coord.y);

        if (selectedUnit) {
            // Deselect or perform action
            if (unitOnHex && unitOnHex.id === selectedUnit.id) {
                // Deselect by clicking self
                setSelectedUnitId(null);
                return;
            }

            const isAttackable = attackableTiles.some(t => t.x === coord.x && t.y === coord.y);
            if (isAttackable && unitOnHex && unitOnHex.team !== selectedUnit.team) {
                handleAttack(selectedUnit, unitOnHex);
                return;
            }

            const isReachable = reachableTiles.some(t => t.x === coord.x && t.y === coord.y);
            if (isReachable && !unitOnHex) {
                // Move unit
                setUnits(units.map(u => u.id === selectedUnit.id ? { ...u, ...coord, moved: true } : u));
                // Don't deselect, allow for attack or wait
                return;
            }
            
            // Invalid action, deselect
            setSelectedUnitId(null);

        } else {
            // Select a unit
            if (unitOnHex && unitOnHex.team === activeTeam) {
                setSelectedUnitId(unitOnHex.id);
            }
        }
    }, [gameState, isLoadingAI, units, selectedUnit, activeTeam, reachableTiles, attackableTiles, handleAttack]);

    const handleAction = (action: 'wait' | 'undo') => {
        if (!selectedUnit) return;

        if (action === 'wait') {
            setUnits(units.map(u => u.id === selectedUnit.id ? { ...u, moved: true, attacked: true } : u));
            setSelectedUnitId(null);
        } else if (action === 'undo') {
            // This logic requires storing previous position. For simplicity, we can revert to original position this turn.
            // A more robust implementation would store pre-move state.
            // For now, let's assume undo is only possible before an attack.
            const originalUnitState = units.find(u => u.id === selectedUnit.id);
            if(originalUnitState) {
                // This is a simplified undo. It just deselects the unit if it moved.
                // A better approach would be to store the unit's state before moving.
                // For this implementation, we will just deselect to keep it simple.
                 setSelectedUnitId(null);
            }
        }
    };
    
    return (
        <div className="flex flex-col h-screen font-sans bg-gray-900 text-gray-200">
            <Header
                turn={turn}
                activeTeam={activeTeam}
                units={units}
                onEndTurn={handleEndTurn}
                selectedUnit={selectedUnit}
                hoveredHexCoord={hoveredHex}
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
                />
                <InfoPanel
                    hoveredHex={hoveredHex ? boardLayout.get(coordToString(hoveredHex)) : null}
                    hoveredUnit={hoveredHex ? units.find(u => u.x === hoveredHex.x && u.y === hoveredHex.y) : null}
                    gameState={gameState}
                    winner={winner}
                    onRestart={initializeGame}
                    selectedUnit={selectedUnit}
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

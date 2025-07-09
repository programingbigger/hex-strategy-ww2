import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { GameBoard } from './components/GameBoard';
import { Header } from './components/Header';
import { InfoPanel } from './components/InfoPanel';
import { BattleReportModal } from './components/BattleReportModal';
import { generateBoardLayout, calculateReachableTiles, coordToString, getDistance, getNeighbors, findPath } from './utils/map';
import { generateBattleReport } from './services/battleReport.ts';
import { UNIT_STATS, TERRAIN_STATS, INITIAL_UNIT_POSITIONS, CITY_HP, CITY_HEAL_RATE, CAPTURE_DAMAGE_HIGH_HP, CAPTURE_DAMAGE_LOW_HP } from './constants';
import type { Team, Unit, Tile, Coordinate, BoardLayout, BattleReport, GameState, WeatherType, GameStateSnapshot } from './types';

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
    const [weather, setWeather] = useState<WeatherType>('Sunny');
    const [weatherDuration, setWeatherDuration] = useState(0);
    const [history, setHistory] = useState<GameStateSnapshot[]>([]);

    const saveStateToHistory = useCallback(() => {
        const snapshot: GameStateSnapshot = {
            units: JSON.parse(JSON.stringify(units)), // Deep copy
            turn,
            activeTeam,
            selectedUnitId,
        };
        setHistory(prevHistory => [...prevHistory, snapshot]);
    }, [units, turn, activeTeam, selectedUnitId]);

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
                    xp: 0,
                    fuel: unitStats.maxFuel, // Initialize fuel
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
        setHistory([]);
    }, []);

    useEffect(() => {
        initializeGame();
    }, [initializeGame]);

    const selectedUnit = useMemo(() => units.find(u => u.id === selectedUnitId), [units, selectedUnitId]);

    const selectedUnitTile = useMemo(() => {
        if (!selectedUnit) return null;
        return boardLayout.get(coordToString(selectedUnit)) ?? null;
    }, [selectedUnit, boardLayout]);

    const reachableTiles = useMemo(() => {
        if (!selectedUnit || selectedUnit.moved) return [];
        return calculateReachableTiles({ x: selectedUnit.x, y: selectedUnit.y }, selectedUnit.movement, selectedUnit.fuel, boardLayout, units, activeTeam);
    }, [selectedUnit, boardLayout, units]);

    const attackableTiles = useMemo(() => {
        if (!selectedUnit || selectedUnit.attacked) return [];

        const attackRangeMin = selectedUnit.attackRange.min;
        const attackRangeMax = selectedUnit.attackRange.max;

        const potentialTargets: Coordinate[] = [];
        for (const [key, tile] of boardLayout.entries()) {
            const distance = getDistance({ x: selectedUnit.x, y: selectedUnit.y }, tile);
            if (distance >= attackRangeMin && distance <= attackRangeMax) {
                potentialTargets.push(tile);
            }
        }

        return potentialTargets.filter(coord =>
            units.some(u => u.x === coord.x && u.y === coord.y && u.team !== selectedUnit.team)
        );
    }, [selectedUnit, units, boardLayout]);

    const handleEndTurn = useCallback(() => {
        const nextTeam = activeTeam === 'Blue' ? 'Red' : 'Blue';
        setActiveTeam(nextTeam);

        const newBoardLayout = new Map(boardLayout);

        // City HP recovery logic
        newBoardLayout.forEach((tile, key) => {
            if (tile.terrain === 'City' && tile.owner !== activeTeam) {
                const newHp = Math.min(tile.maxHp || CITY_HP, (tile.hp || 0) + CITY_HEAL_RATE);
                newBoardLayout.set(key, { ...tile, hp: newHp });
            }
        });

        if (nextTeam === 'Blue') {
            setTurn(t => t + 1);
            // Weather update logic
            const weathers: WeatherType[] = ['Sunny', 'Rain', 'HeavyRain'];
            const nextWeather = weathers[Math.floor(Math.random() * weathers.length)];
            let newDuration = weatherDuration;
            if (nextWeather === 'Rain') {
                newDuration++; // nextWeatherが'Rain'なら+1
            } else if (nextWeather === 'HeavyRain') {
                newDuration += 2; // nextWeatherが'HeavyRain'なら+2
            } else {
                newDuration = 0; // 'Sunny'など、その他の天気の場合はリセット
            }
            setWeather(nextWeather);
            setWeatherDuration(newDuration);
            // Terrain change logic
            let changed = false;
            if (['Rain', 'HeavyRain'].includes(nextWeather) && newDuration >= 3) {
                newBoardLayout.forEach((tile, key) => {
                    if (tile.terrain === 'Plains') {
                        newBoardLayout.set(key, { ...tile, terrain: 'Mud' });
                        changed = true;
                    }
                });
            } else if (nextWeather === 'Sunny') {
                newBoardLayout.forEach((tile, key) => {
                    if (tile.terrain === 'Mud') {
                        newBoardLayout.set(key, { ...tile, terrain: 'Plains' });
                        changed = true;
                    }
                });
            }
            if (changed) {
                setBoardLayout(newBoardLayout);
            }
        }
        setBoardLayout(newBoardLayout);
        setUnits(units.map(u => ({ ...u, moved: false, attacked: false })));
        setSelectedUnitId(null);
        checkWinCondition(units, newBoardLayout);
    }, [activeTeam, units, weather, weatherDuration, boardLayout]);

    const checkWinCondition = useCallback((currentUnits: Unit[], currentBoard: BoardLayout) => {
        const blueUnits = currentUnits.filter(u => u.team === 'Blue');
        const redUnits = currentUnits.filter(u => u.team === 'Red');

        if (redUnits.length === 0) {
            setGameState('gameOver');
            setWinner('Blue');
            return;
        }
        if (blueUnits.length === 0) {
            setGameState('gameOver');
            setWinner('Red');
            return;
        }

        const cities = Array.from(currentBoard.values()).filter(t => t.terrain === 'City');
        const blueCities = cities.filter(c => c.owner === 'Blue').length;
        const redCities = cities.filter(c => c.owner === 'Red').length;

        if (cities.length > 0) {
            if (blueCities === cities.length) {
                setGameState('gameOver');
                setWinner('Blue');
            } else if (redCities === cities.length) {
                setGameState('gameOver');
                setWinner('Red');
            }
        }
    }, []);
    
    const handleAttack = useCallback(async (attacker: Unit, defender: Unit) => {
        const attackerTile = boardLayout.get(coordToString(attacker));
        const defenderTile = boardLayout.get(coordToString(defender));

        if (!attackerTile || !defenderTile) return;

        const attackerTerrainStats = TERRAIN_STATS[attackerTile.terrain];
        const defenderTerrainStats = TERRAIN_STATS[defenderTile.terrain];

        const attackPower = (attacker.attackVs?.[defender.unitClass] ?? attacker.attack) + attackerTerrainStats.attackBonus;
        let defensePower = (defender.defenseVs?.[attacker.unitClass] ?? defender.defense) + defenderTerrainStats.defenseBonus;

        // Indirect fire: Artillery ignores terrain defense bonus
        if (attacker.type === 'Artillery') {
            defensePower = (defender.defenseVs?.[attacker.unitClass] ?? defender.defense); // Ignores terrain, but not special defense
        }

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
        
        let updatedUnits = units.map(u => {
            if (u.id === defender.id) {
                return { ...u, hp: Math.max(0, u.hp - damage) };
            }
            if(u.id === attacker.id) {
                // ダメージ分XPを増やし、上限を100に設定
                const newXp = Math.min(100, u.xp + damage);
                return { ...u, xp: newXp, attacked: true, moved: true };
            }
            return u;
        });

        // Filter out destroyed units after initial attack
        updatedUnits = updatedUnits.filter(u => u.hp > 0);

        // Counter-attack logic
        const currentDefender = updatedUnits.find(u => u.id === defender.id);
        if (currentDefender && currentDefender.hp > 0 && currentDefender.canCounterAttack && currentDefender.type !== 'Artillery') {
            const counterAttackerTile = boardLayout.get(coordToString(currentDefender));
            const counterDefenderTile = boardLayout.get(coordToString(attacker));

            if (counterAttackerTile && counterDefenderTile) {
                const counterAttackerTerrainStats = TERRAIN_STATS[counterAttackerTile.terrain];
                const counterDefenderTerrainStats = TERRAIN_STATS[counterDefenderTile.terrain];

                const counterAttackPower = (currentDefender.attackVs?.[attacker.unitClass] ?? currentDefender.attack) + counterAttackerTerrainStats.attackBonus;
                const counterDefensePower = (attacker.defenseVs?.[currentDefender.unitClass] ?? attacker.defense) + counterDefenderTerrainStats.defenseBonus;

                const counterDamage = Math.max(1, counterAttackPower - counterDefensePower);

                const counterReportText = await generateBattleReport(currentDefender, attacker, counterDefenderTile.terrain, counterDamage);

                setBattleReport(prevReport => ({
                    attacker: prevReport!.attacker,
                    defender: prevReport!.defender,
                    damage: prevReport!.damage,
                    report: prevReport!.report + `\n\n**Counter-attack!**\n` + counterReportText,
                }));

                updatedUnits = updatedUnits.map(u => {
                    if (u.id === attacker.id) {
                        return { ...u, hp: Math.max(0, u.hp - counterDamage) };
                    }
                    // 反撃側にも経験値を付与
                    if (u.id === currentDefender.id) {
                        const newXp = Math.min(100, u.xp + counterDamage);
                        return { ...u, xp: newXp };
                    }
                    return u;
                }).filter(u => u.hp > 0); // Filter again after counter-attack
            }
        }
        
        setUnits(updatedUnits);
        setSelectedUnitId(null);
        checkWinCondition(updatedUnits, boardLayout);

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
                saveStateToHistory();
                handleAttack(selectedUnit, unitOnHex);
                return;
            }

            const isReachable = reachableTiles.some(t => t.x === coord.x && t.y === coord.y);
            if (isReachable && !unitOnHex) {
                saveStateToHistory();
                // Move unit and deduct fuel
                const path = findPath(selectedUnit, coord, boardLayout, units, activeTeam);
                const fuelCost = path ? path.length - 1 : 0;
                setUnits(units.map(u => u.id === selectedUnit.id ? { ...u, ...coord, moved: true, fuel: u.fuel - fuelCost } : u));
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

    const handleAction = (action: 'wait' | 'undo' | 'capture') => {
        if (!selectedUnit) return;
    
        if (action === 'wait') {
            saveStateToHistory();
            setUnits(units.map(u => u.id === selectedUnit.id ? { ...u, moved: true, attacked: true } : u));
            setSelectedUnitId(null);
        } else if (action === 'capture') {
            if (selectedUnit.type === 'Infantry' && selectedUnitTile?.terrain === 'City') {
                saveStateToHistory();
                const newBoardLayout = new Map(boardLayout);
                const tileKey = coordToString(selectedUnit);
                const currentTile = newBoardLayout.get(tileKey);
    
                if (currentTile && currentTile.hp && currentTile.hp > 0) {
                    const damageRange = selectedUnit.hp > selectedUnit.maxHp / 2 ? CAPTURE_DAMAGE_HIGH_HP : CAPTURE_DAMAGE_LOW_HP;
                    const damage = Math.floor(Math.random() * (damageRange.max - damageRange.min + 1)) + damageRange.min;
                    const newHp = Math.max(0, currentTile.hp - damage);
    
                    if (newHp === 0) {
                        newBoardLayout.set(tileKey, { ...currentTile, hp: 4, owner: selectedUnit.team });
                    } else {
                        newBoardLayout.set(tileKey, { ...currentTile, hp: newHp });
                    }
                    setBoardLayout(newBoardLayout);
                }
                // 修正箇所：占領後にユニットが行動済みになるように moved: true を追加
                setUnits(units.map(u => u.id === selectedUnit.id ? { ...u, moved: true, attacked: true } : u));
                setSelectedUnitId(null);
            }
        } else if (action === 'undo') {
            if (history.length > 0) {
                const lastState = history[history.length - 1];
                setUnits(lastState.units);
                setTurn(lastState.turn);
                setActiveTeam(lastState.activeTeam);
                setSelectedUnitId(lastState.selectedUnitId);
                setHistory(prevHistory => prevHistory.slice(0, -1));
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
                    hoveredHex={hoveredHex ? boardLayout.get(coordToString(hoveredHex)) : null}
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

import React, { useState, useEffect } from 'react';
import { GameScreen, GameState, Unit, BattlePrepState, Coordinate } from '../types';
import GameBoard from '../components/game/GameBoard';
import { coordToString, calculateDeployableTilesFromCapitals, isCoordinateDeployable, getInitialCameraPosition } from '../utils/map';
import { useCamera } from '../hooks/useCamera';
import { getUnitNameById } from '../utils/unitNames';

interface UnitDeploymentScreenProps {
  gameState: GameState;
  onNavigate: (screen: GameScreen) => void;
  onUpdateBattlePrep: (battlePrep: BattlePrepState) => void;
  onStartBattle: () => void;
}

const UnitDeploymentScreen: React.FC<UnitDeploymentScreenProps> = ({
  gameState,
  onNavigate,
  onUpdateBattlePrep,
  onStartBattle
}) => {
  const [selectedUnitForDeployment, setSelectedUnitForDeployment] = useState<Unit | null>(null);
  const [deployedUnits, setDeployedUnits] = useState<Map<string, { x: number; y: number }>>(
    gameState.battlePrep?.deployedUnits || new Map()
  );
  const [hoveredUnit, setHoveredUnit] = useState<Unit | null>(null);
  const [hoveredTerrain, setHoveredTerrain] = useState<{terrain: string, coord: Coordinate} | null>(null);
  const [showConfirmation, setShowConfirmation] = useState(false);

  // Camera hook for automatic positioning
  const { setCameraPosition } = useCamera();

  // Automatically position camera using initial camera position from map or order=1 fallback
  useEffect(() => {
    const focusCoordinate = getInitialCameraPosition(gameState);
    if (focusCoordinate) {
      // Convert hex coordinates to world coordinates for camera positioning
      // Hex coordinates use a different coordinate system, so we need to convert them
      const worldX = focusCoordinate.x * 86.6; // Approximate hex width conversion
      const worldY = focusCoordinate.y * 75;   // Approximate hex height conversion
      setCameraPosition(worldX, worldY);
      console.log(`🎯 Camera positioned at initial coordinate: (${focusCoordinate.x}, ${focusCoordinate.y}) -> world (${worldX}, ${worldY})`);
    } else {
      console.warn('⚠️ No initial camera position found');
    }
  }, [gameState, setCameraPosition]);

  const selectedUnits = gameState.battlePrep?.selectedUnits || [];
  
  // Get current team for deployment (assuming Blue team for now - can be made dynamic)
  const deploymentTeam = gameState.activeTeam || 'Blue';
  
  // Calculate deployable tiles from team capitals
  const deployableTiles = calculateDeployableTilesFromCapitals(gameState.board, deploymentTeam);

  const handleUnitListClick = (unit: Unit) => {
    if (selectedUnitForDeployment?.id === unit.id) {
      // Cancel deployment mode
      setSelectedUnitForDeployment(null);
    } else if (!deployedUnits.has(unit.id)) {
      // Select unit for deployment
      setSelectedUnitForDeployment(unit);
    }
  };

  const canDeployUnitOnTerrain = (unit: Unit, coord: Coordinate): boolean => {
    const tileKey = coordToString(coord);
    const tile = gameState.board.get(tileKey);
    if (!tile) return false;
    
    // Vehicle restrictions
    if (unit.unitClass === 'Vehicle') {
      if (tile.terrain === 'River' || tile.terrain === 'Sea' || tile.terrain === 'Mountain') {
        return false;
      }
    }
    
    return true;
  };

  const handleHexClick = (coord: Coordinate) => {
    if (selectedUnitForDeployment) {
      // Check if coordinate is within deployable range from capitals
      if (!isCoordinateDeployable(gameState.board, deploymentTeam, coord)) {
        console.warn(`Cannot deploy unit at (${coord.x}, ${coord.y}): Not within capital deployment range`);
        return; // Not within capital deployment range
      }
      
      // Check if unit can be deployed on this terrain
      if (!canDeployUnitOnTerrain(selectedUnitForDeployment, coord)) {
        console.warn(`Cannot deploy unit at (${coord.x}, ${coord.y}): Terrain restriction`);
        return; // Cannot deploy here due to terrain
      }
      
      // Deploy the selected unit
      const newDeployedUnits = new Map(deployedUnits);
      newDeployedUnits.set(selectedUnitForDeployment.id, { x: coord.x, y: coord.y });
      setDeployedUnits(newDeployedUnits);
      setSelectedUnitForDeployment(null);
      
      // Update battle prep state
      const updatedBattlePrep: BattlePrepState = {
        ...gameState.battlePrep!,
        deployedUnits: newDeployedUnits
      };
      onUpdateBattlePrep(updatedBattlePrep);
    } else {
      // Check if there's a deployed unit at this location
      const deployedUnit = selectedUnits.find(unit => {
        const deployment = deployedUnits.get(unit.id);
        return deployment && deployment.x === coord.x && deployment.y === coord.y;
      });
      
      if (deployedUnit) {
        // Double-click to redeploy (for now, single-click to select)
        setSelectedUnitForDeployment(deployedUnit);
      }
    }
  };

  const handleUnitRedeploy = (unit: Unit) => {
    // Remove unit from deployed units
    const newDeployedUnits = new Map(deployedUnits);
    newDeployedUnits.delete(unit.id);
    setDeployedUnits(newDeployedUnits);
    
    // Update battle prep state
    const updatedBattlePrep: BattlePrepState = {
      ...gameState.battlePrep!,
      deployedUnits: newDeployedUnits
    };
    onUpdateBattlePrep(updatedBattlePrep);
  };

  const handleStartBattle = () => {
    if (deployedUnits.size === selectedUnits.length) {
      setShowConfirmation(true);
    }
  };

  const confirmStartBattle = () => {
    setShowConfirmation(false);
    onStartBattle();
  };

  const cancelStartBattle = () => {
    setShowConfirmation(false);
  };

  const returnToUnitSelection = () => {
    // Preserve deployment state
    const updatedBattlePrep: BattlePrepState = {
      ...gameState.battlePrep!,
      deployedUnits
    };
    onUpdateBattlePrep(updatedBattlePrep);
    onNavigate('battle-prep');
  };

  // Create units for rendering on the board
  const boardUnits: Unit[] = [];
  selectedUnits.forEach(unit => {
    const deployment = deployedUnits.get(unit.id);
    if (deployment) {
      boardUnits.push({
        ...unit,
        x: deployment.x,
        y: deployment.y
      });
    }
  });

  const headerText = selectedUnitForDeployment 
    ? "Please deploy the unit on the map"
    : "Please select a unit to deploy";

  const allUnitsDeployed = deployedUnits.size === selectedUnits.length;

  return (
    <div className="screen deployment-screen" style={{ 
      fontFamily: '"Yu Gothic", "Hiragino Sans", "Meiryo", sans-serif',
      fontSize: '18px'
    }}>
      <div className="deployment-header">
        <div style={{ textAlign: 'center', marginBottom: '15px' }}>
          <h1 style={{ 
            fontSize: '32px',
            fontWeight: 'bold',
            margin: '0',
            color: '#3498db'
          }}>配置フェーズ (Deployment Phase)</h1>
        </div>
        <p style={{ 
          textAlign: 'center', 
          fontSize: '18px',
          marginBottom: '20px' 
        }}>{headerText}</p>
        
        <div style={{ 
          display: 'flex', 
          gap: '20px', 
          marginTop: '15px', 
          justifyContent: 'center', 
          alignItems: 'center',
          flexWrap: 'wrap'
        }}>
          <button
            className="menu-button"
            onClick={returnToUnitSelection}
            style={{ 
              background: 'rgba(231, 76, 60, 0.3)',
              border: '2px solid #e74c3c',
              padding: '15px 30px',
              fontSize: '16px',
              fontWeight: 'bold',
              borderRadius: '8px',
              minWidth: '200px',
              cursor: 'pointer'
            }}
          >
            Return to Unit Selection
          </button>
          <button
            className="menu-button"
            onClick={handleStartBattle}
            disabled={!allUnitsDeployed}
            style={{
              background: allUnitsDeployed 
                ? 'rgba(39, 174, 96, 0.4)' 
                : 'rgba(127, 140, 141, 0.3)',
              border: allUnitsDeployed
                ? '2px solid #27ae60'
                : '2px solid #7f8c8d',
              padding: '15px 30px',
              fontSize: '16px',
              fontWeight: 'bold',
              borderRadius: '8px',
              minWidth: '200px',
              cursor: allUnitsDeployed ? 'pointer' : 'not-allowed',
              opacity: allUnitsDeployed ? 1 : 0.6
            }}
          >
            Start Battle
          </button>
        </div>
      </div>

      <div className="deployment-container" style={{ display: 'flex', height: '70vh' }}>
        <div className="deployment-map" style={{ flex: 1 }}>
          <GameBoard
            boardLayout={gameState.board}
            units={boardUnits}
            selectedUnitId={selectedUnitForDeployment?.id || null}
            reachableTiles={selectedUnitForDeployment ? deployableTiles : []}
            attackableTiles={[]}
            engineerTargetTiles={[]}
            transportTargetTiles={[]}
            onHexClick={handleHexClick}
            onHexHover={(coord) => {
              const unit = boardUnits.find(u => u.x === coord.x && u.y === coord.y);
              setHoveredUnit(unit || null);
              
              // Set terrain info
              const tileKey = coordToString(coord);
              const tile = gameState.board.get(tileKey);
              if (tile) {
                setHoveredTerrain({ terrain: tile.terrain, coord });
              } else {
                setHoveredTerrain(null);
              }
            }}
            onHexLeave={() => {
              setHoveredUnit(null);
              setHoveredTerrain(null);
            }}
          />
        </div>

        <div className="deployment-sidebar" style={{ 
          width: '300px', 
          padding: '25px',
          background: 'rgba(52, 73, 94, 0.1)',
          borderLeft: '2px solid #3498db'
        }}>
          <h3 style={{ fontSize: '22px', marginBottom: '15px' }}>選択されたユニット</h3>
          <div style={{ 
            marginBottom: '15px', 
            fontSize: '18px',
            fontWeight: 'bold',
            textAlign: 'center'
          }}>
            配置済み: {deployedUnits.size}/{selectedUnits.length}
          </div>
          
          <div className="unit-list" style={{ marginBottom: '20px' }}>
            {selectedUnits.map(unit => {
              const isDeployed = deployedUnits.has(unit.id);
              const isSelectedForDeployment = selectedUnitForDeployment?.id === unit.id;
              
              return (
                <div
                  key={unit.id}
                  className={`unit-item ${isSelectedForDeployment ? 'selected' : ''}`}
                  onClick={() => handleUnitListClick(unit)}
                  style={{
                    padding: '15px',
                    margin: '8px 0',
                    border: '2px solid #3498db',
                    borderRadius: '8px',
                    background: isDeployed 
                      ? 'rgba(39, 174, 96, 0.3)' 
                      : 'rgba(52, 152, 219, 0.2)',
                    cursor: 'pointer',
                    fontSize: '16px'
                  }}
                >
                  <div style={{
                    fontWeight: 'bold',
                    fontSize: '18px',
                    marginBottom: '8px'
                  }}>
                    {getUnitNameById(unit.id)} {isDeployed ? '(配置済み)' : '(準備中)'}
                  </div>
                  <div style={{ fontSize: '16px', opacity: 0.9 }}>
                    HP: {unit.hp} | ATK: {unit.attack} | DEF: {unit.defense}
                  </div>
                  {isDeployed && (
                    <div style={{ 
                      marginTop: '12px',
                      display: 'flex',
                      justifyContent: 'center'
                    }}>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleUnitRedeploy(unit);
                        }}
                        style={{
                          padding: '8px 16px',
                          fontSize: '14px',
                          fontWeight: 'bold',
                          background: 'linear-gradient(135deg, rgba(231, 76, 60, 0.4), rgba(192, 57, 43, 0.6))',
                          border: '2px solid #e74c3c',
                          borderRadius: '8px',
                          cursor: 'pointer',
                          color: 'white',
                          textShadow: '1px 1px 2px rgba(0, 0, 0, 0.5)',
                          boxShadow: '0 3px 8px rgba(231, 76, 60, 0.3)',
                          transition: 'all 0.2s ease',
                          minWidth: '90px',
                          transform: 'scale(1)',
                          position: 'relative'
                        }}
                        onMouseEnter={(e) => {
                          const target = e.target as HTMLButtonElement;
                          target.style.transform = 'scale(1.05)';
                          target.style.boxShadow = '0 4px 12px rgba(231, 76, 60, 0.5)';
                          target.style.background = 'linear-gradient(135deg, rgba(231, 76, 60, 0.6), rgba(192, 57, 43, 0.8))';
                        }}
                        onMouseLeave={(e) => {
                          const target = e.target as HTMLButtonElement;
                          target.style.transform = 'scale(1)';
                          target.style.boxShadow = '0 3px 8px rgba(231, 76, 60, 0.3)';
                          target.style.background = 'linear-gradient(135deg, rgba(231, 76, 60, 0.4), rgba(192, 57, 43, 0.6))';
                        }}
                      >
                        再配置
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>


          {/* Information Panel */}
          <div className="info-panel" style={{ 
            padding: '20px',
            background: 'rgba(52, 73, 94, 0.2)',
            borderRadius: '10px',
            fontSize: '16px'
          }}>
            <h4 style={{ fontSize: '20px', marginBottom: '15px' }}>ユニット情報</h4>
            {hoveredUnit ? (
              <div style={{ lineHeight: '1.8' }}>
                <div style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '10px' }}>{getUnitNameById(hoveredUnit.id)}</div>
                <div>HP: {hoveredUnit.hp}/{hoveredUnit.maxHp}</div>
                <div>攻撃力: {hoveredUnit.attack}</div>
                <div>防御力: {hoveredUnit.defense}</div>
                <div>移動力: {hoveredUnit.movement}</div>
                <div>射程: {hoveredUnit.attackRange.min}-{hoveredUnit.attackRange.max}</div>
                <div>燃料: {hoveredUnit.fuel}/{hoveredUnit.maxFuel}</div>
              </div>
            ) : (
              <div style={{ opacity: 0.7 }}>ユニットにカーソルを合わせると詳細が表示されます</div>
            )}
          </div>
        </div>
      </div>

      {/* Terrain Information Panel - positioned at bottom */}
      <div className="terrain-info-panel" style={{ 
        position: 'fixed',
        bottom: '20px',
        left: '50%',
        transform: 'translateX(-50%)',
        width: '400px',
        maxWidth: '90vw',
        padding: '20px',
        background: 'rgba(52, 73, 94, 0.95)',
        borderRadius: '12px',
        border: '2px solid #3498db',
        zIndex: 100,
        fontSize: '16px',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)'
      }}>
        <h4 style={{ 
          fontSize: '20px', 
          marginBottom: '15px',
          textAlign: 'center',
          color: '#3498db'
        }}>地形情報</h4>
        {hoveredTerrain ? (
          <div style={{ lineHeight: '1.6', textAlign: 'center' }}>
            <div style={{ 
              fontSize: '18px', 
              fontWeight: 'bold', 
              marginBottom: '8px',
              color: '#f39c12'
            }}>地形: {hoveredTerrain.terrain}</div>
            <div style={{ fontSize: '16px', opacity: 0.9 }}>位置: ({hoveredTerrain.coord.x}, {hoveredTerrain.coord.y})</div>
            {/* Display terrain stats if available */}
          </div>
        ) : (
          <div style={{ 
            opacity: 0.7, 
            textAlign: 'center',
            fontStyle: 'italic'
          }}>地形にカーソルを合わせると詳細が表示されます</div>
        )}
      </div>

      {/* Confirmation Modal */}
      {showConfirmation && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1000
        }}>
          <div style={{
            background: '#2c3e50',
            padding: '30px',
            borderRadius: '8px',
            textAlign: 'center',
            border: '1px solid #3498db'
          }}>
            <h3 style={{ fontSize: '24px' }}>本当に戦闘を開始しますか？</h3>
            <div style={{ marginTop: '20px', display: 'flex', gap: '10px', justifyContent: 'center' }}>
              <button
                onClick={confirmStartBattle}
                style={{
                  padding: '15px 30px',
                  background: 'rgba(39, 174, 96, 0.4)',
                  border: '2px solid #27ae60',
                  borderRadius: '8px',
                  color: 'white',
                  cursor: 'pointer',
                  fontSize: '18px',
                  fontWeight: 'bold'
                }}
              >
                はい
              </button>
              <button
                onClick={cancelStartBattle}
                style={{
                  padding: '15px 30px',
                  background: 'rgba(231, 76, 60, 0.4)',
                  border: '2px solid #e74c3c',
                  borderRadius: '8px',
                  color: 'white',
                  cursor: 'pointer',
                  fontSize: '18px',
                  fontWeight: 'bold'
                }}
              >
                いいえ
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UnitDeploymentScreen;
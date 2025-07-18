import React, { useState } from 'react';
import { GameScreen, GameState, Unit, BattlePrepState, Coordinate } from '../types';
import GameBoard from '../components/game/GameBoard';
import { coordToString } from '../utils/map';

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
  const [showConfirmation, setShowConfirmation] = useState(false);

  const selectedUnits = gameState.battlePrep?.selectedUnits || [];
  const deploymentCenter = gameState.selectedMap?.deploymentCenter || { q: -4, r: -2 };

  // Calculate deployable tiles within 5-hex radius
  const getDeployableTiles = (): Coordinate[] => {
    const deployableTiles: Coordinate[] = [];
    const radius = 5;
    
    for (let q = -radius; q <= radius; q++) {
      for (let r = Math.max(-radius, -q - radius); r <= Math.min(radius, -q + radius); r++) {
        const x = deploymentCenter.q + q;
        const y = deploymentCenter.r + r;
        
        // Check if tile exists in board
        if (gameState.board.has(coordToString({ x, y }))) {
          deployableTiles.push({ x, y });
        }
      }
    }
    
    return deployableTiles;
  };

  const deployableTiles = getDeployableTiles();

  const handleUnitListClick = (unit: Unit) => {
    if (selectedUnitForDeployment?.id === unit.id) {
      // Cancel deployment mode
      setSelectedUnitForDeployment(null);
    } else if (!deployedUnits.has(unit.id)) {
      // Select unit for deployment
      setSelectedUnitForDeployment(unit);
    }
  };

  const handleHexClick = (coord: Coordinate) => {
    if (selectedUnitForDeployment) {
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
    <div className="screen deployment-screen">
      <div className="deployment-header">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
          <h1>Deployment Phase</h1>
          <button
            className="menu-button"
            onClick={handleStartBattle}
            disabled={!allUnitsDeployed}
            style={{
              background: allUnitsDeployed 
                ? 'rgba(39, 174, 96, 0.3)' 
                : 'rgba(127, 140, 141, 0.3)'
            }}
          >
            Start Battle
          </button>
        </div>
        <p>{headerText}</p>
        
        <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
          <button
            className="menu-button"
            onClick={returnToUnitSelection}
            style={{ background: 'rgba(231, 76, 60, 0.2)' }}
          >
            Return to Unit Selection
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
            onHexClick={handleHexClick}
            onHexHover={(coord) => {
              const unit = boardUnits.find(u => u.x === coord.x && u.y === coord.y);
              setHoveredUnit(unit || null);
            }}
            onHexLeave={() => setHoveredUnit(null)}
          />
        </div>

        <div className="deployment-sidebar" style={{ 
          width: '300px', 
          padding: '20px',
          background: 'rgba(52, 73, 94, 0.1)',
          borderLeft: '1px solid #3498db'
        }}>
          <h3>Selected Units</h3>
          <div style={{ marginBottom: '10px' }}>
            <strong>Deployed: {deployedUnits.size}/{selectedUnits.length}</strong>
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
                    padding: '10px',
                    margin: '5px 0',
                    border: '1px solid #3498db',
                    borderRadius: '4px',
                    background: isDeployed 
                      ? 'rgba(39, 174, 96, 0.2)' 
                      : 'rgba(52, 152, 219, 0.2)',
                    cursor: 'pointer'
                  }}
                >
                  <div style={{ fontWeight: 'bold' }}>
                    {unit.type} {isDeployed ? '(Deployed)' : '(Ready)'}
                  </div>
                  <div style={{ fontSize: '0.9em', opacity: 0.8 }}>
                    HP: {unit.hp} | ATK: {unit.attack} | DEF: {unit.defense}
                  </div>
                  {isDeployed && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleUnitRedeploy(unit);
                      }}
                      style={{
                        marginTop: '5px',
                        padding: '2px 6px',
                        fontSize: '0.8em',
                        background: 'rgba(231, 76, 60, 0.3)',
                        border: '1px solid #e74c3c',
                        borderRadius: '3px',
                        cursor: 'pointer'
                      }}
                    >
                      Redeploy
                    </button>
                  )}
                </div>
              );
            })}
          </div>

          {/* Information Panel */}
          <div className="info-panel" style={{ 
            padding: '15px',
            background: 'rgba(52, 73, 94, 0.2)',
            borderRadius: '8px'
          }}>
            <h4>Unit Information</h4>
            {hoveredUnit ? (
              <div>
                <div><strong>{hoveredUnit.type}</strong></div>
                <div>HP: {hoveredUnit.hp}/{hoveredUnit.maxHp}</div>
                <div>Attack: {hoveredUnit.attack}</div>
                <div>Defense: {hoveredUnit.defense}</div>
                <div>Movement: {hoveredUnit.movement}</div>
                <div>Range: {hoveredUnit.attackRange.min}-{hoveredUnit.attackRange.max}</div>
                <div>Fuel: {hoveredUnit.fuel}/{hoveredUnit.maxFuel}</div>
              </div>
            ) : (
              <div>Hover over a unit to see details</div>
            )}
          </div>
        </div>
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
            <h3>Are you sure you want to start the battle?</h3>
            <div style={{ marginTop: '20px', display: 'flex', gap: '10px', justifyContent: 'center' }}>
              <button
                onClick={confirmStartBattle}
                style={{
                  padding: '10px 20px',
                  background: 'rgba(39, 174, 96, 0.3)',
                  border: '1px solid #27ae60',
                  borderRadius: '4px',
                  color: 'white',
                  cursor: 'pointer'
                }}
              >
                Yes
              </button>
              <button
                onClick={cancelStartBattle}
                style={{
                  padding: '10px 20px',
                  background: 'rgba(231, 76, 60, 0.3)',
                  border: '1px solid #e74c3c',
                  borderRadius: '4px',
                  color: 'white',
                  cursor: 'pointer'
                }}
              >
                No
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UnitDeploymentScreen;
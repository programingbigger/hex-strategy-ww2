import React, { useState } from 'react';
import { GameScreen, GameState, Unit } from '../types';
import { getPlayerStartingUnits } from '../data/units';

interface BattlePrepScreenProps {
  gameState: GameState;
  onNavigate: (screen: GameScreen) => void;
}

const BattlePrepScreen: React.FC<BattlePrepScreenProps> = ({ gameState, onNavigate }) => {
  const [selectedUnits] = useState<Unit[]>(getPlayerStartingUnits());
  const [deployedUnits, setDeployedUnits] = useState<Unit[]>([]);

  const handleUnitSelect = (unit: Unit) => {
    if (deployedUnits.find(u => u.id === unit.id)) {
      setDeployedUnits(prev => prev.filter(u => u.id !== unit.id));
    } else if (deployedUnits.length < 10) {
      const deployedUnit = { ...unit, x: -2, y: 0 };
      setDeployedUnits(prev => [...prev, deployedUnit]);
    } else {
      alert('Maximum 10 units can be deployed!');
    }
  };

  const startBattle = () => {
    if (deployedUnits.length === 0) {
      alert('Please deploy at least one unit before starting battle!');
      return;
    }
    if (deployedUnits.length > 10) {
      alert('Maximum 10 units can be deployed!');
      return;
    }
    onNavigate('battle');
  };

  return (
    <div className="screen battle-prep-screen">
      <h1 className="screen-title">Battle Preparation</h1>
      
      {gameState.selectedMap && (
        <div style={{ marginBottom: '20px', textAlign: 'center' }}>
          <h2>{gameState.selectedMap.name}</h2>
          <p>{gameState.selectedMap.description}</p>
        </div>
      )}
      
      <div className="prep-container">
        <div className="prep-map">
          <h3>Deployment Zone</h3>
          <div style={{ 
            background: 'rgba(52, 73, 94, 0.5)', 
            border: '2px dashed #3498db',
            borderRadius: '8px',
            padding: '20px',
            minHeight: '300px',
            display: 'flex',
            flexDirection: 'column',
            gap: '10px'
          }}>
            <p style={{ opacity: 0.8 }}>Deploy your units in the blue zone</p>
            {deployedUnits.map(unit => (
              <div 
                key={unit.id}
                style={{
                  background: 'rgba(52, 152, 219, 0.3)',
                  border: '1px solid #3498db',
                  borderRadius: '4px',
                  padding: '8px',
                  cursor: 'pointer'
                }}
                onClick={() => handleUnitSelect(unit)}
              >
                {unit.type} (HP: {unit.hp}, ATK: {unit.attack}, DEF: {unit.defense})
              </div>
            ))}
          </div>
          
          <div style={{ marginTop: '20px', textAlign: 'center' }}>
            <h4>Victory Conditions</h4>
            <p>• Eliminate all enemy units OR capture all cities</p>
            <h4>Defeat Conditions</h4>
            <p>• All your units are eliminated</p>
          </div>
        </div>
        
        <div className="prep-sidebar">
          <h3>Available Units</h3>
          <div className="unit-list">
            {selectedUnits.map(unit => (
              <div 
                key={unit.id}
                className={`unit-item ${deployedUnits.find(u => u.id === unit.id) ? 'selected' : ''}`}
                onClick={() => handleUnitSelect(unit)}
              >
                <div style={{ fontWeight: 'bold' }}>{unit.type}</div>
                <div style={{ fontSize: '0.9em', opacity: 0.8 }}>
                  HP: {unit.hp} | ATK: {unit.attack} | DEF: {unit.defense} | MOV: {unit.movement}
                </div>
                <div style={{ fontSize: '0.8em', opacity: 0.6 }}>
                  Range: {unit.attackRange.min}-{unit.attackRange.max} | Fuel: {unit.fuel}
                </div>
              </div>
            ))}
          </div>
          
          <div style={{ marginTop: '20px' }}>
            <div style={{ marginBottom: '10px' }}>
              <strong>Deployed: {deployedUnits.length}/10</strong>
            </div>
            
            <button 
              className="menu-button"
              onClick={startBattle}
              style={{ 
                width: '100%', 
                marginBottom: '10px',
                background: deployedUnits.length > 0 ? 'rgba(39, 174, 96, 0.3)' : 'rgba(127, 140, 141, 0.3)'
              }}
            >
              Start Battle
            </button>
            
            <button 
              className="menu-button"
              onClick={() => onNavigate('scenario-select')}
              style={{ width: '100%', background: 'rgba(231, 76, 60, 0.2)' }}
            >
              Back to Map Select
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BattlePrepScreen;
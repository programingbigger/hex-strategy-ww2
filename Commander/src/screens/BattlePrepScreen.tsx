import React, { useState } from 'react';
import { GameScreen, GameState, Unit, BattlePrepState } from '../types';
import { getPlayerStartingUnits } from '../data/units';

interface BattlePrepScreenProps {
  gameState: GameState;
  onNavigate: (screen: GameScreen) => void;
  onUpdateBattlePrep: (battlePrep: BattlePrepState) => void;
}

const BattlePrepScreen: React.FC<BattlePrepScreenProps> = ({ gameState, onNavigate, onUpdateBattlePrep }) => {
  const availableUnits = getPlayerStartingUnits();
  const [selectedUnits, setSelectedUnits] = useState<Unit[]>(
    gameState.battlePrep?.selectedUnits || []
  );

  const handleUnitSelect = (unit: Unit) => {
    if (selectedUnits.find(u => u.id === unit.id)) {
      setSelectedUnits(prev => prev.filter(u => u.id !== unit.id));
    } else if (selectedUnits.length < 10) {
      setSelectedUnits(prev => [...prev, unit]);
    } else {
      alert('Maximum 10 units can be selected!');
    }
  };

  const resetSelection = () => {
    setSelectedUnits([]);
  };

  const proceedToDeployment = () => {
    if (selectedUnits.length === 0) {
      alert('Please select at least one unit before proceeding!');
      return;
    }
    
    const battlePrep: BattlePrepState = {
      selectedUnits,
      deployedUnits: gameState.battlePrep?.deployedUnits || new Map(),
      victoryConditions: [
        'Eliminate all enemy units',
        'OR capture all cities'
      ]
    };
    
    onUpdateBattlePrep(battlePrep);
    onNavigate('deployment');
  };

  return (
    <div className="screen battle-prep-screen">
      <h1 className="screen-title">Battle Preparation</h1>
      
      {/* Victory Conditions Display */}
      <div style={{ marginBottom: '20px', textAlign: 'center', padding: '15px', background: 'rgba(52, 73, 94, 0.2)', borderRadius: '8px' }}>
        <h3>Victory Conditions</h3>
        <p>• Eliminate all enemy units OR capture all cities</p>
        <h4>Defeat Conditions</h4>
        <p>• All your units are eliminated</p>
      </div>
      
      {gameState.selectedMap && (
        <div style={{ marginBottom: '20px', textAlign: 'center' }}>
          <h2>{gameState.selectedMap.name}</h2>
          <p>{gameState.selectedMap.description}</p>
        </div>
      )}
      
      <div className="prep-container">
        <div className="prep-map">
          <h3>Available Units</h3>
          <div className="unit-list">
            {availableUnits.map(unit => (
              <div 
                key={unit.id}
                className={`unit-item ${selectedUnits.find(u => u.id === unit.id) ? 'selected' : ''}`}
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
        </div>
        
        <div className="prep-sidebar">
          <h3>Selected Units</h3>
          <div style={{ marginBottom: '10px' }}>
            <strong>Selected: {selectedUnits.length}/10</strong>
          </div>
          
          <div style={{ 
            background: 'rgba(52, 73, 94, 0.5)', 
            border: '2px dashed #3498db',
            borderRadius: '8px',
            padding: '20px',
            minHeight: '200px',
            display: 'flex',
            flexDirection: 'column',
            gap: '10px'
          }}>
            {selectedUnits.length === 0 ? (
              <p style={{ opacity: 0.8 }}>No units selected</p>
            ) : (
              selectedUnits.map(unit => (
                <div 
                  key={unit.id}
                  style={{
                    background: 'rgba(52, 152, 219, 0.3)',
                    border: '1px solid #3498db',
                    borderRadius: '4px',
                    padding: '8px'
                  }}
                >
                  {unit.type} (HP: {unit.hp}, ATK: {unit.attack}, DEF: {unit.defense})
                </div>
              ))
            )}
          </div>
          
          <div style={{ marginTop: '20px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <button 
              className="menu-button"
              onClick={proceedToDeployment}
              style={{ 
                width: '100%',
                background: selectedUnits.length > 0 ? 'rgba(39, 174, 96, 0.3)' : 'rgba(127, 140, 141, 0.3)'
              }}
            >
              Proceed to Deployment Phase
            </button>
            
            <button 
              className="menu-button"
              onClick={resetSelection}
              style={{ width: '100%', background: 'rgba(241, 196, 15, 0.2)' }}
            >
              Reset Selection
            </button>
            
            <button 
              className="menu-button"
              onClick={() => onNavigate('scenario-select')}
              style={{ width: '100%', background: 'rgba(231, 76, 60, 0.2)' }}
            >
              Map Selection
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BattlePrepScreen;
import React, { useState, useEffect } from 'react';
import { Faction, MilitaryBranch, UnitCategory, Team } from '../../types';
import { calculateProductionCost, ProductionCost } from '../../utils/costManager';

// This represents a unit template from armyOrganization.json
export interface ProducibleUnit {
  id: string;
  name: string;
  type: string;
  faction: Faction;
  branch: MilitaryBranch;
  category: UnitCategory;
  stats: {
    maxHp: number;
    attack: number;
    defense: number;
    movement: number;
  };
}

interface ProductionModalProps {
  isOpen: boolean;
  producibleUnits: ProducibleUnit[];
  onUnitSelect: (unit: ProducibleUnit) => void;
  onClose: () => void;
  currentFunds?: number;
  activeTeam?: Team;
}

export const ProductionModal: React.FC<ProductionModalProps> = ({
  isOpen,
  producibleUnits,
  onUnitSelect,
  onClose,
  currentFunds = 0,
  activeTeam = 'Blue',
}) => {
  const [selectedUnitId, setSelectedUnitId] = useState<string>('');
  const [unitCosts, setUnitCosts] = useState<{[unitId: string]: number}>({});
  const [isLoadingCosts, setIsLoadingCosts] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setSelectedUnitId('');
      loadUnitCosts();
    }
  }, [isOpen, producibleUnits]);

  const loadUnitCosts = async () => {
    if (producibleUnits.length === 0) return;
    
    setIsLoadingCosts(true);
    const costs: {[unitId: string]: number} = {};
    
    try {
      await Promise.all(
        producibleUnits.map(async (unit) => {
          const costData = await calculateProductionCost(unit.id, activeTeam);
          costs[unit.id] = costData.cost;
        })
      );
      setUnitCosts(costs);
    } catch (error) {
      console.error('Failed to load unit costs:', error);
    } finally {
      setIsLoadingCosts(false);
    }
  };

  if (!isOpen) return null;

  const handleConfirmSelection = () => {
    const selectedUnit = producibleUnits.find(u => u.id === selectedUnitId);
    if (selectedUnit) {
      const unitCost = unitCosts[selectedUnit.id] || 0;
      if (unitCost <= currentFunds) {
        onUnitSelect(selectedUnit);
      } else {
        alert(`資金不足です。必要: ${unitCost}, 保有: ${currentFunds}`);
      }
    }
  };
  
  const canAfford = (unitId: string): boolean => {
    const cost = unitCosts[unitId] || 0;
    return cost <= currentFunds;
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div
      className="production-modal-backdrop"
      onClick={handleBackdropClick}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
      }}
    >
      <div
        className="production-modal"
        style={{
          backgroundColor: '#2a2a2a',
          border: '2px solid #444',
          borderRadius: '8px',
          padding: '20px',
          minWidth: '400px',
          maxWidth: '80%',
          color: '#fff',
        }}
      >
        <div className="modal-header" style={{ marginBottom: '20px' }}>
          <h3 style={{ margin: 0, color: '#ffd700' }}>ユニット生産</h3>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <p style={{ margin: '8px 0', fontSize: '14px', color: '#ccc' }}>
              生産するユニットを選択してください。
            </p>
            <div style={{ fontSize: '14px', fontWeight: 'bold', color: '#90EE90' }}>
              保有資金: ￥{currentFunds.toLocaleString()}
            </div>
          </div>
        </div>

        <div className="units-list" style={{ maxHeight: '400px', overflowY: 'auto' }}>
          {producibleUnits.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '20px', color: '#888' }}>
              生産可能なユニットがありません。
            </div>
          ) : (
            producibleUnits.map(unit => {
              const isSelected = selectedUnitId === unit.id;
              const unitCost = unitCosts[unit.id] || 0;
              const affordable = canAfford(unit.id);
              const opacity = affordable ? 1.0 : 0.6;
              
              return (
                <div
                  key={unit.id}
                  className="unit-option"
                  onClick={() => affordable && setSelectedUnitId(unit.id)}
                  style={{
                    padding: '12px',
                    margin: '8px 0',
                    backgroundColor: isSelected ? '#444' : '#333',
                    border: `2px solid ${isSelected ? '#ffd700' : (affordable ? '#555' : '#800')}`,
                    borderRadius: '6px',
                    cursor: affordable ? 'pointer' : 'not-allowed',
                    transition: 'all 0.2s ease',
                    opacity: opacity,
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div style={{ flex: 1 }}>
                      <div className="unit-name" style={{ fontWeight: 'bold', color: '#ffd700' }}>
                        {unit.name} ({unit.type})
                      </div>
                      <div className="unit-stats" style={{ fontSize: '12px', color: '#ccc' }}>
                        HP: {unit.stats.maxHp}, 攻撃: {unit.stats.attack}, 防御: {unit.stats.defense}, 移動: {unit.stats.movement}
                      </div>
                    </div>
                    <div className="unit-cost" style={{ 
                      fontSize: '14px', 
                      fontWeight: 'bold',
                      color: affordable ? '#90EE90' : '#FF6B6B',
                      minWidth: '80px',
                      textAlign: 'right'
                    }}>
                      {isLoadingCosts ? '...' : `￥${unitCost.toLocaleString()}`}
                    </div>
                  </div>
                  {!affordable && (
                    <div style={{ fontSize: '10px', color: '#FF6B6B', marginTop: '4px' }}>
                      資金不足 (不足: ￥{(unitCost - currentFunds).toLocaleString()})
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        <div className="modal-footer" style={{ marginTop: '20px', display: 'flex', justifyContent: 'space-between' }}>
          <button onClick={onClose} style={{ padding: '10px 20px', backgroundColor: '#555', color: '#fff', border: 'none', borderRadius: '4px' }}>
            キャンセル
          </button>
          <button
            onClick={handleConfirmSelection}
            disabled={!selectedUnitId || !canAfford(selectedUnitId)}
            style={{
              padding: '10px 20px',
              backgroundColor: (selectedUnitId && canAfford(selectedUnitId)) ? '#28a745' : '#666',
              color: '#fff',
              border: 'none',
              borderRadius: '4px',
              cursor: (selectedUnitId && canAfford(selectedUnitId)) ? 'pointer' : 'not-allowed',
            }}
          >
            {selectedUnitId && unitCosts[selectedUnitId] ? `生産 (￥${unitCosts[selectedUnitId].toLocaleString()})` : '生産'}
          </button>
        </div>
      </div>
    </div>
  );
};

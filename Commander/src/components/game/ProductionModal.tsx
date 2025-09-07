import React from 'react';
import { Faction, MilitaryBranch, UnitCategory } from '../../types';

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
}

export const ProductionModal: React.FC<ProductionModalProps> = ({
  isOpen,
  producibleUnits,
  onUnitSelect,
  onClose,
}) => {
  const [selectedUnitId, setSelectedUnitId] = React.useState<string>('');

  React.useEffect(() => {
    if (isOpen) {
      setSelectedUnitId('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleConfirmSelection = () => {
    const selectedUnit = producibleUnits.find(u => u.id === selectedUnitId);
    if (selectedUnit) {
      onUnitSelect(selectedUnit);
    }
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
          <p style={{ margin: '8px 0', fontSize: '14px', color: '#ccc' }}>
            生産するユニットを選択してください。
          </p>
        </div>

        <div className="units-list" style={{ maxHeight: '400px', overflowY: 'auto' }}>
          {producibleUnits.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '20px', color: '#888' }}>
              生産可能なユニットがありません。
            </div>
          ) : (
            producibleUnits.map(unit => {
              const isSelected = selectedUnitId === unit.id;
              return (
                <div
                  key={unit.id}
                  className="unit-option"
                  onClick={() => setSelectedUnitId(unit.id)}
                  style={{
                    padding: '12px',
                    margin: '8px 0',
                    backgroundColor: isSelected ? '#444' : '#333',
                    border: `2px solid ${isSelected ? '#ffd700' : '#555'}`,
                    borderRadius: '6px',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                  }}
                >
                  <div className="unit-name" style={{ fontWeight: 'bold', color: '#ffd700' }}>
                    {unit.name} ({unit.type})
                  </div>
                  <div className="unit-stats" style={{ fontSize: '12px', color: '#ccc' }}>
                    HP: {unit.stats.maxHp}, 攻撃: {unit.stats.attack}, 防御: {unit.stats.defense}, 移動: {unit.stats.movement}
                  </div>
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
            disabled={!selectedUnitId}
            style={{
              padding: '10px 20px',
              backgroundColor: selectedUnitId ? '#28a745' : '#666',
              color: '#fff',
              border: 'none',
              borderRadius: '4px',
              cursor: selectedUnitId ? 'pointer' : 'not-allowed',
            }}
          >
            生産
          </button>
        </div>
      </div>
    </div>
  );
};

import React, { useState } from 'react';
import { Unit } from '../../types';

interface UnitSelectionModalProps {
  isOpen: boolean;
  transportUnit: Unit | null;
  loadedUnits: Unit[];
  onUnitSelect: (unit: Unit) => void;
  onCancel: () => void;
}

const UnitSelectionModal: React.FC<UnitSelectionModalProps> = ({
  isOpen,
  transportUnit,
  loadedUnits,
  onUnitSelect,
  onCancel
}) => {
  const [selectedUnit, setSelectedUnit] = useState<Unit | null>(null);

  if (!isOpen || !transportUnit || loadedUnits.length === 0) return null;

  const handleUnitClick = (unit: Unit) => {
    setSelectedUnit(unit);
  };

  const handleConfirmSelection = () => {
    if (selectedUnit) {
      onUnitSelect(selectedUnit);
      setSelectedUnit(null);
    }
  };

  const handleCancel = () => {
    setSelectedUnit(null);
    onCancel();
  };

  return (
    <div 
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 1000
      }}
      onClick={handleCancel}
    >
      <div 
        style={{
          background: 'white',
          borderRadius: '12px',
          padding: '24px',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
          minWidth: '450px',
          maxWidth: '550px',
          maxHeight: '70vh',
          overflowY: 'auto'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          marginBottom: '20px',
          borderBottom: '2px solid #e0e0e0',
          paddingBottom: '12px'
        }}>
          <span style={{ fontSize: '24px', marginRight: '12px' }}>🎯</span>
          <h3 style={{
            margin: 0,
            fontSize: '20px',
            fontWeight: 'bold',
            color: '#333'
          }}>
            降車するユニットを選択してください
          </h3>
        </div>

        {/* Transport Unit Info */}
        <div style={{
          background: '#f8f9fa',
          borderRadius: '8px',
          padding: '12px',
          marginBottom: '16px',
          border: '1px solid #dee2e6'
        }}>
          <div style={{ fontSize: '14px', color: '#666', marginBottom: '4px' }}>
            輸送ユニット:
          </div>
          <div style={{ fontSize: '16px', fontWeight: 'bold', color: '#333' }}>
            {transportUnit.name || transportUnit.type} ({transportUnit.team})
          </div>
        </div>

        {/* Instructions */}
        <div style={{
          background: '#e3f2fd',
          borderRadius: '8px',
          padding: '12px',
          marginBottom: '16px',
          fontSize: '14px',
          color: '#0d47a1',
          border: '1px solid #bbdefb'
        }}>
          ℹ️ 降車させるユニットを1つ選択してください。選択したユニットがハイライト表示されます。
        </div>

        {/* Unit Selection List */}
        <div style={{
          marginBottom: '24px'
        }}>
          <div style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '12px', color: '#333' }}>
            搭載中のユニット ({loadedUnits.length}体):
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {loadedUnits.map((unit) => {
              const isSelected = selectedUnit?.id === unit.id;
              return (
                <div
                  key={unit.id}
                  onClick={() => handleUnitClick(unit)}
                  style={{
                    padding: '12px 16px',
                    borderRadius: '8px',
                    border: isSelected 
                      ? '2px solid #007bff' 
                      : '1px solid #dee2e6',
                    background: isSelected 
                      ? '#e7f3ff' 
                      : '#ffffff',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    boxShadow: isSelected 
                      ? '0 2px 8px rgba(0, 123, 255, 0.3)' 
                      : '0 1px 3px rgba(0, 0, 0, 0.1)'
                  }}
                  onMouseEnter={(e) => {
                    if (!isSelected) {
                      const target = e.target as HTMLDivElement;
                      target.style.background = '#f8f9fa';
                      target.style.borderColor = '#adb5bd';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isSelected) {
                      const target = e.target as HTMLDivElement;
                      target.style.background = '#ffffff';
                      target.style.borderColor = '#dee2e6';
                    }
                  }}
                >
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}>
                    <div>
                      <div style={{
                        fontSize: '16px',
                        fontWeight: 'bold',
                        color: isSelected ? '#007bff' : '#333',
                        marginBottom: '4px'
                      }}>
                        {isSelected && '✓ '}{unit.name || unit.type}
                      </div>
                      <div style={{ 
                        fontSize: '14px', 
                        color: '#666',
                        display: 'flex',
                        gap: '12px'
                      }}>
                        <span>HP: {unit.hp}/{unit.maxHp}</span>
                        <span>燃料: {unit.fuel}/{unit.maxFuel}</span>
                        <span>チーム: {unit.team}</span>
                      </div>
                    </div>
                    {isSelected && (
                      <div style={{
                        width: '24px',
                        height: '24px',
                        borderRadius: '50%',
                        background: '#007bff',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'white',
                        fontSize: '16px',
                        fontWeight: 'bold'
                      }}>
                        ✓
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Buttons */}
        <div style={{
          display: 'flex',
          gap: '12px',
          justifyContent: 'flex-end'
        }}>
          <button
            onClick={handleCancel}
            style={{
              padding: '12px 24px',
              border: '2px solid #6c757d',
              borderRadius: '6px',
              background: 'white',
              color: '#6c757d',
              fontSize: '16px',
              fontWeight: '500',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => {
              const target = e.target as HTMLButtonElement;
              target.style.background = '#6c757d';
              target.style.color = 'white';
            }}
            onMouseLeave={(e) => {
              const target = e.target as HTMLButtonElement;
              target.style.background = 'white';
              target.style.color = '#6c757d';
            }}
          >
            キャンセル
          </button>
          <button
            onClick={handleConfirmSelection}
            disabled={!selectedUnit}
            style={{
              padding: '12px 24px',
              border: selectedUnit ? '2px solid #007bff' : '2px solid #ccc',
              borderRadius: '6px',
              background: selectedUnit ? '#007bff' : '#ccc',
              color: 'white',
              fontSize: '16px',
              fontWeight: '500',
              cursor: selectedUnit ? 'pointer' : 'not-allowed',
              transition: 'all 0.2s',
              opacity: selectedUnit ? 1 : 0.6
            }}
            onMouseEnter={(e) => {
              if (selectedUnit) {
                const target = e.target as HTMLButtonElement;
                target.style.background = '#0056b3';
                target.style.borderColor = '#0056b3';
              }
            }}
            onMouseLeave={(e) => {
              if (selectedUnit) {
                const target = e.target as HTMLButtonElement;
                target.style.background = '#007bff';
                target.style.borderColor = '#007bff';
              }
            }}
          >
            選択
          </button>
        </div>
      </div>
    </div>
  );
};

export default UnitSelectionModal;
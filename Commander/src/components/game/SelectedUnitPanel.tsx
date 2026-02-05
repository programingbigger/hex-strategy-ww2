import React from 'react';
import { Unit } from '../../types';
import { getUnitNameById } from '../../utils/unitNames';
import '../../styles/military-museum-theme.css';

interface SelectedUnitPanelProps {
  className?: string;
  selectedUnit: Unit | null;
  units: Unit[];
  onShowUnitDetails?: (unit: Unit) => void;
}

const SelectedUnitPanel: React.FC<SelectedUnitPanelProps> = ({
  className,
  selectedUnit,
  units,
  onShowUnitDetails
}) => {
  // Helper function to get transport capacity info
  const getTransportCapacity = (): { capacity: number } | null => {
    if (!selectedUnit || selectedUnit.type !== 'Transport') return null;

    try {
      const armyData = require('../../data/armyOrganization.json');
      const factionData = armyData.factions[selectedUnit.team];
      const supportCategory = factionData?.branches?.['陸']?.unitCategories?.support;
      const transportTemplate = supportCategory?.units?.find((u: any) => u.type === 'Transport');

      if (transportTemplate?.transport) {
        return { capacity: transportTemplate.transport.capacity };
      }
    } catch (error) {
      console.warn('Failed to get transport capacity info:', error);
    }

    return { capacity: 2 }; // fallback
  };

  // Helper function to get loaded units in transport
  const getLoadedUnits = (): Unit[] => {
    if (!selectedUnit || selectedUnit.type !== 'Transport' || !units) return [];
    return units.filter(unit => unit.loaded && unit.transportId === selectedUnit.id);
  };

  // Progress bar component
  const ProgressBar: React.FC<{ current: number; max: number; color: string }> = ({ current, max, color }) => {
    const percentage = Math.max(0, Math.min(100, (current / max) * 100));
    return (
      <div style={{
        width: '120px',
        height: '8px',
        background: '#ddd',
        borderRadius: '4px',
        overflow: 'hidden',
        display: 'inline-block',
        marginLeft: '8px'
      }}>
        <div style={{
          width: `${percentage}%`,
          height: '100%',
          background: color,
          transition: 'width 0.3s ease'
        }} />
      </div>
    );
  };

  const handleUnitDoubleClick = () => {
    if (selectedUnit && onShowUnitDetails) {
      onShowUnitDetails(selectedUnit);
    }
  };

  const handleDetailsClick = () => {
    if (selectedUnit && onShowUnitDetails) {
      onShowUnitDetails(selectedUnit);
    }
  };

  return (
    <div className={className}>
      {/* Header */}
      <div className="panel-header">
        <h3 className="panel-title">ユニット情報</h3>
      </div>

      {/* SELECTED UNIT Section */}
      {selectedUnit ? (
        <div className="panel-content">
          {/* 基本ユニット情報セクション */}
          <div className="panel-section">
            <h4 className="section-title">基本情報</h4>
            <div className="unit-name-plate" onDoubleClick={handleUnitDoubleClick}>
              <span className={selectedUnit.team === 'Blue' ? 'team-blue' : 'team-red'}>
                {getUnitNameById(selectedUnit.id)} ({selectedUnit.team === 'Blue' ? '青軍' : '赤軍'})
              </span>
              <div className="unit-category">
                {selectedUnit.branch} • {selectedUnit.category}
              </div>
            </div>

            <div className="stats-container">
              <div className="stat-item">
                <span>✚ 耐久</span>
                <ProgressBar current={selectedUnit.hp} max={selectedUnit.maxHp} color="var(--earth-success)" />
                <span>{selectedUnit.hp}/{selectedUnit.maxHp}</span>
              </div>
              <div className="stat-item">
                <span>⛽ 燃料</span>
                <ProgressBar current={selectedUnit.fuel} max={selectedUnit.maxFuel} color="var(--earth-warning)" />
                <span>{selectedUnit.fuel}/{selectedUnit.maxFuel}</span>
              </div>
            </div>

            {/* 補給ユニットの補給物資量 */}
            {(selectedUnit.type === 'SupplyWagon' || selectedUnit.type === 'SupplyTruck') && (
              <div className="supply-stock">
                <div className="stat-item">
                  <span>📦 補給物資</span>
                  <ProgressBar current={selectedUnit.supplyStock ?? 0} max={selectedUnit.maxSupplyStock ?? 1} color="var(--earth-info, #5b9bd5)" />
                  <span>{selectedUnit.supplyStock ?? 0}/{selectedUnit.maxSupplyStock ?? 0}</span>
                </div>
              </div>
            )}

            {/* 輸送ユニットの搭載情報 */}
            {selectedUnit.type === 'Transport' && (
              <div className="transport-cargo">
                <h5 className="section-subtitle">🚛 搭載</h5>
                <div className="cargo-info">
                  搭載数: {getLoadedUnits().length} / {getTransportCapacity()?.capacity || 2}
                  {getLoadedUnits().length > 0 && (
                    <div className="loaded-units">
                      {getLoadedUnits().map(unit => (
                        <div key={unit.id} className="loaded-unit">
                          {getUnitNameById(unit.id)}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            <button
              className="military-button details-button"
              onClick={handleDetailsClick}
              disabled={!selectedUnit}
            >
              詳細スペック
            </button>
          </div>
        </div>
      ) : (
        <div className="panel-content">
          <div className="no-unit-selected">
            ユニット未選択
          </div>
        </div>
      )}

      {/* ショートカットセクション */}
      <div className="panel-section">
        <h4 className="section-title">⌨️ ショートカット</h4>
        <div className="shortcuts-list">
          <div className="shortcut-item">
            <span>ターン終了</span>
            <kbd>Cmd+E</kbd>
          </div>
          <div className="shortcut-item">
            <span>選択解除</span>
            <kbd>Esc</kbd>
          </div>
          <div className="shortcut-item">
            <span>選択ユニットへ移動</span>
            <kbd>Space</kbd>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SelectedUnitPanel;
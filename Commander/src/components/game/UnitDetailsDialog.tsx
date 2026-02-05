import React, { useState, useEffect, useCallback } from 'react';
import { Unit } from '../../types';
import { getUnitNameById } from '../../utils/unitNames';
import '../../styles/military-museum-theme.css';

interface UnitDetailsDialogProps {
  isOpen: boolean;
  unit: Unit | null;
  onClose: () => void;
}

interface WeaponAttackTable {
  weaponName: string;
  attackValues: { [unitType: string]: number | string };
}

const UnitDetailsDialog: React.FC<UnitDetailsDialogProps> = ({
  isOpen,
  unit,
  onClose
}) => {
  const [currentWeaponIndex, setCurrentWeaponIndex] = useState(0);

  const handleKeyPress = useCallback((event: KeyboardEvent) => {
    if (!isOpen || !unit?.weapons) return;

    if (event.key === 'ArrowLeft') {
      event.preventDefault();
      setCurrentWeaponIndex(prev =>
        prev > 0 ? prev - 1 : unit.weapons!.length - 1
      );
    } else if (event.key === 'ArrowRight') {
      event.preventDefault();
      setCurrentWeaponIndex(prev =>
        prev < unit.weapons!.length - 1 ? prev + 1 : 0
      );
    } else if (event.key === 'Escape') {
      event.preventDefault();
      onClose();
    }
  }, [isOpen, unit?.weapons, onClose]);

  useEffect(() => {
    if (isOpen) {
      document.addEventListener('keydown', handleKeyPress);
      return () => document.removeEventListener('keydown', handleKeyPress);
    }
  }, [isOpen, handleKeyPress]);

  useEffect(() => {
    setCurrentWeaponIndex(0);
  }, [unit]);

  if (!isOpen || !unit) return null;

  const weapons = unit.weapons || [];
  const currentWeapon = weapons[currentWeaponIndex];

  const getAttackTable = (weapon: any): WeaponAttackTable => {
    const attackValues: { [unitClass: string]: number | string } = {};

    // Use real weapon effectiveness data from armyOrganization.json
    if (weapon.attack && Array.isArray(weapon.attack)) {
      // weapon.attack is an array of { unitClass: string, attack: number }
      weapon.attack.forEach((effectiveness: any) => {
        attackValues[effectiveness.unitClass] = effectiveness.attack;
      });
    } else {
      // Fallback for legacy weapons with single attack value
      const fallbackAttack = typeof weapon.attack === 'number' ? weapon.attack : 3;
      attackValues['Infantry'] = fallbackAttack;
      attackValues['Tank'] = Math.max(0, fallbackAttack - 1);
      attackValues['Vehicle'] = fallbackAttack;
      attackValues['Aircraft'] = Math.max(0, fallbackAttack - 2);
    }

    return {
      weaponName: weapon.name || weapon.type || 'Unknown Weapon',
      attackValues: attackValues
    };
  };

  const ProgressBar: React.FC<{ current: number; max: number; color: string }> = ({ current, max, color }) => {
    const percentage = Math.max(0, Math.min(100, (current / max) * 100));
    return (
      <div className="progress-bar-container">
        <div className="progress-bar-track">
          <div
            className="progress-bar-fill"
            style={{ width: `${percentage}%`, backgroundColor: color }}
          />
        </div>
      </div>
    );
  };

  return (
    <div className="dialog-overlay" onClick={onClose}>
      <div className="unit-details-dialog" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="dialog-header">
          <h2 className="dialog-title">
            {getUnitNameById(unit.id)} 詳細情報
          </h2>
          <button className="dialog-close-btn" onClick={onClose}>×</button>
        </div>

        {/* Basic Info Section (1/3) */}
        <div className="dialog-basic-info">
          <div className="basic-info-grid">
            <div className="info-item">
              <span className="info-label">✚ 耐久</span>
              <ProgressBar current={unit.hp} max={unit.maxHp} color="var(--earth-success)" />
              <span className="info-value">{unit.hp}/{unit.maxHp}</span>
            </div>
            <div className="info-item">
              <span className="info-label">⛽ 燃料</span>
              <ProgressBar current={unit.fuel} max={unit.maxFuel} color="var(--earth-warning)" />
              <span className="info-value">{unit.fuel}/{unit.maxFuel}</span>
            </div>
            {weapons.map((weapon, index) => (
              weapon.ammunition !== undefined && (
                <div key={index} className="info-item">
                  <span className="info-label">🔫 {weapon.name || weapon.type}</span>
                  <ProgressBar
                    current={weapon.ammunition}
                    max={weapon.maxAmmunition || weapon.ammunition}
                    color="var(--earth-danger)"
                  />
                  <span className="info-value">{weapon.ammunition}/{weapon.maxAmmunition || weapon.ammunition}</span>
                </div>
              )
            ))}

            {/* 補給ユニットの補給物資量 */}
            {(unit.type === 'SupplyWagon' || unit.type === 'SupplyTruck') && (
              <div className="info-item">
                <span className="info-label">📦 補給物資</span>
                <ProgressBar
                  current={unit.supplyStock ?? 0}
                  max={unit.maxSupplyStock ?? 1}
                  color="var(--earth-info, #5b9bd5)"
                />
                <span className="info-value">{unit.supplyStock ?? 0}/{unit.maxSupplyStock ?? 0}</span>
              </div>
            )}

            {/* Weapon Range Information */}
            {currentWeapon && currentWeapon.range && (
              <div className="info-item">
                <span className="info-label">🎯 射程</span>
                <span className="info-value">
                  {currentWeapon.range.min || 1} - {currentWeapon.range.max || 1}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Weapon Attack Table Section (2/3) */}
        <div className="dialog-attack-tables">
          {weapons.length > 0 && (
            <>
              {/* Weapon Navigation */}
              <div className="weapon-navigation">
                <button
                  className="nav-arrow left"
                  onClick={() => setCurrentWeaponIndex(prev =>
                    prev > 0 ? prev - 1 : weapons.length - 1
                  )}
                  disabled={weapons.length <= 1}
                >
                  ◀
                </button>
                <span className="weapon-name">
                  {currentWeapon?.name || currentWeapon?.type || 'Unknown Weapon'}
                  ({currentWeaponIndex + 1}/{weapons.length})
                </span>
                <button
                  className="nav-arrow right"
                  onClick={() => setCurrentWeaponIndex(prev =>
                    prev < weapons.length - 1 ? prev + 1 : 0
                  )}
                  disabled={weapons.length <= 1}
                >
                  ▶
                </button>
              </div>

              {/* Attack Table */}
              {currentWeapon && (
                <div className="attack-table">
                  <h4 className="table-title">攻撃力早見表</h4>
                  <div className="table-grid">
                    <div className="table-header">対象ユニット</div>
                    <div className="table-header">攻撃力</div>

                    {(() => {
                      const attackTable = getAttackTable(currentWeapon);
                      // Define logical order for unit classes
                      const unitClassOrder = ['Infantry', 'Tank', 'Vehicle', 'Aircraft', 'Artillery', 'AntiTank'];
                      const orderedEntries = unitClassOrder
                        .filter(unitClass => attackTable.attackValues.hasOwnProperty(unitClass))
                        .map(unitClass => [unitClass, attackTable.attackValues[unitClass]]);

                      // Add any additional unit classes not in the predefined order
                      Object.entries(attackTable.attackValues).forEach(([unitClass, value]) => {
                        if (!unitClassOrder.includes(unitClass)) {
                          orderedEntries.push([unitClass, value]);
                        }
                      });

                      return orderedEntries.map(([unitType, value]) => (
                        <React.Fragment key={unitType}>
                          <div className="table-cell unit-type">{unitType}</div>
                          <div className="table-cell attack-value">{value || 0}</div>
                        </React.Fragment>
                      ));
                    })()}
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Controls hint */}
        <div className="dialog-controls">
          <span>◀▶ 武器切替 | ESC 閉じる</span>
        </div>
      </div>
    </div>
  );
};

export default UnitDetailsDialog;
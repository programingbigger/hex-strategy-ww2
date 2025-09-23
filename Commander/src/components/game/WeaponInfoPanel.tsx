import React from 'react';
import { Unit, Weapon, UnitClass } from '../../types';
import { getWeaponAttackVsUnitClass } from '../../utils/weapons';

interface WeaponInfoPanelProps {
  unit: Unit | null;
}

export const WeaponInfoPanel: React.FC<WeaponInfoPanelProps> = ({ unit }) => {
  if (!unit) return null;
  
  // Show info for all units - if no weapons, show basic attack info
  const hasWeapons = unit.weapons && Array.isArray(unit.weapons) && unit.weapons.length > 0;

  return (
    <div 
      className="weapon-info-panel"
      style={{
        backgroundColor: '#2a2a2a',
        border: '1px solid #444',
        borderRadius: '6px',
        padding: '12px',
        marginTop: '10px',
        color: '#fff'
      }}
    >
      <div 
        className="panel-header"
        style={{
          fontSize: '14px',
          fontWeight: 'bold',
          color: '#ffd700',
          marginBottom: '8px',
          borderBottom: '1px solid #444',
          paddingBottom: '4px'
        }}
      >
        🔫 武装状況 ({unit.team})
      </div>
      
      <div className="weapons-list">
        {hasWeapons ? unit.weapons!.map((weapon: Weapon, index: number) => (
          <div
            key={weapon.id}
            className="weapon-item"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '6px 0',
              borderBottom: index < (unit.weapons?.length || 0) - 1 ? '1px solid #333' : 'none'
            }}
          >
            <div className="weapon-details">
              <div 
                className="weapon-name"
                style={{
                  fontSize: '13px',
                  fontWeight: 'bold',
                  color: weapon.ammunition > 0 ? '#4CAF50' : '#888'
                }}
              >
                {weapon.name}
                {index === 0 && (
                  <span style={{ 
                    fontSize: '10px', 
                    color: '#ffd700',
                    marginLeft: '4px',
                    fontWeight: 'normal'
                  }}>
                    (メイン)
                  </span>
                )}
              </div>
              <div
                className="weapon-stats"
                style={{
                  fontSize: '11px',
                  color: '#ccc',
                  marginTop: '2px'
                }}
              >
                <div>射程{weapon.range.min}-{weapon.range.max} | 命中率85%</div>
                <div style={{ marginTop: '2px', fontSize: '10px' }}>
                  <span title="歩兵への攻撃力">👥{getWeaponAttackVsUnitClass(weapon, 'Infantry')}</span>
                  {' | '}
                  <span title="車両への攻撃力">🚗{getWeaponAttackVsUnitClass(weapon, 'Vehicle')}</span>
                  {' | '}
                  <span title="戦車への攻撃力">🛡️{getWeaponAttackVsUnitClass(weapon, 'Tank')}</span>
                  {' | '}
                  <span title="航空機への攻撃力">✈️{getWeaponAttackVsUnitClass(weapon, 'Aircraft')}</span>
                </div>
              </div>
            </div>
            
            <div 
              className="ammo-indicator"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '4px'
              }}
            >
              <div 
                className="ammo-count"
                style={{
                  fontSize: '12px',
                  fontWeight: 'bold',
                  color: weapon.ammunition > 0 ? '#4CAF50' : '#f44336'
                }}
              >
                {weapon.ammunition}/{weapon.maxAmmunition}
              </div>
              <div 
                className="ammo-bar"
                style={{
                  width: '30px',
                  height: '6px',
                  backgroundColor: '#444',
                  borderRadius: '3px',
                  overflow: 'hidden'
                }}
              >
                <div
                  style={{
                    width: `${(weapon.ammunition / weapon.maxAmmunition) * 100}%`,
                    height: '100%',
                    backgroundColor: weapon.ammunition > weapon.maxAmmunition * 0.3 
                      ? '#4CAF50' 
                      : weapon.ammunition > 0 
                        ? '#FF9800' 
                        : '#f44336',
                    transition: 'width 0.3s ease'
                  }}
                />
              </div>
            </div>
          </div>
        )) : (
          <div
            className="legacy-weapon-item"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '6px 0'
            }}
          >
            <div className="weapon-details">
              <div 
                className="weapon-name"
                style={{
                  fontSize: '13px',
                  fontWeight: 'bold',
                  color: '#4CAF50'
                }}
              >
                基本武装
              </div>
              <div
                className="weapon-stats"
                style={{
                  fontSize: '11px',
                  color: '#ccc',
                  marginTop: '2px'
                }}
              >
                <div>攻撃力{unit.attack} | 射程{unit.attackRange.min}-{unit.attackRange.max} | 命中率85%</div>
                <div style={{ marginTop: '2px', fontSize: '10px', color: '#999' }}>
                  旧式武装システム（全対象共通攻撃力）
                </div>
              </div>
            </div>
            
            <div 
              className="ammo-indicator"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '4px'
              }}
            >
              <div 
                className="ammo-count"
                style={{
                  fontSize: '12px',
                  fontWeight: 'bold',
                  color: '#4CAF50'
                }}
              >
                ∞
              </div>
            </div>
          </div>
        )}
      </div>
      
      {hasWeapons && unit.weapons!.every(w => w.ammunition === 0) && (
        <div 
          className="no-ammo-warning"
          style={{
            marginTop: '8px',
            padding: '6px',
            backgroundColor: '#4a1a1a',
            border: '1px solid #f44336',
            borderRadius: '4px',
            fontSize: '11px',
            color: '#f44336',
            textAlign: 'center'
          }}
        >
          ⚠️ 全ての弾薬が尽きています
        </div>
      )}
    </div>
  );
};
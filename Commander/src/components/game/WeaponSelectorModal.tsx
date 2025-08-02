import React from 'react';
import { Unit, Weapon } from '../../types';
import { getWeaponsInRange } from '../../utils/weapons';
import { getDistance } from '../../utils/map';

interface WeaponSelectorModalProps {
  isOpen: boolean;
  attacker: Unit;
  target: Unit;
  onWeaponSelect: (weapon: Weapon) => void;
  onClose: () => void;
}

export const WeaponSelectorModal: React.FC<WeaponSelectorModalProps> = ({
  isOpen,
  attacker,
  target,
  onWeaponSelect,
  onClose
}) => {
  const distance = getDistance(attacker, target);
  const availableWeapons = getWeaponsInRange(attacker, distance);
  
  // No auto-selection - let players choose freely
  const [selectedWeaponId, setSelectedWeaponId] = React.useState<string>('');
  
  // Helper function to identify most effective weapon for display purposes only
  const getMostEffectiveWeapon = () => {
    if (availableWeapons.length === 0) return null;
    
    return availableWeapons.reduce((best, current) => {
      const currentEffectiveness = current.effectiveness?.[target.unitClass] ?? current.attack;
      const bestEffectiveness = best.effectiveness?.[target.unitClass] ?? best.attack;
      return currentEffectiveness > bestEffectiveness ? current : best;
    });
  };
  
  // Reset selection only when modal opens (not on every availableWeapons change)
  React.useEffect(() => {
    if (isOpen) {
      setSelectedWeaponId('');
    }
  }, [isOpen]);
  
  if (!isOpen) return null;

  // Remove unused handleWeaponClick function
  
  const handleConfirmSelection = () => {
    const selectedWeapon = availableWeapons.find(w => w.id === selectedWeaponId);
    if (selectedWeapon && selectedWeapon.ammunition > 0) {
      onWeaponSelect(selectedWeapon);
      onClose();
    }
  };
  
  const getEffectivenessDisplay = (weapon: Weapon) => {
    const effectiveness = weapon.effectiveness?.[target.unitClass] ?? weapon.attack;
    const baseAttack = weapon.attack;
    if (effectiveness > baseAttack) {
      return `攻撃力: ${weapon.attack} (対${target.unitClass}: +${effectiveness - baseAttack})`;
    } else if (effectiveness < baseAttack) {
      return `攻撃力: ${weapon.attack} (対${target.unitClass}: ${effectiveness - baseAttack})`;
    } else {
      return `攻撃力: ${weapon.attack}`;
    }
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div 
      className="weapon-selector-modal-backdrop"
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
        zIndex: 1000
      }}
    >
      <div 
        className="weapon-selector-modal"
        style={{
          backgroundColor: '#2a2a2a',
          border: '2px solid #444',
          borderRadius: '8px',
          padding: '20px',
          minWidth: '400px',
          maxWidth: '80%',
          color: '#fff'
        }}
      >
        <div className="modal-header" style={{ marginBottom: '20px' }}>
          <h3 style={{ margin: 0, color: '#ffd700' }}>武器選択</h3>
          <p style={{ margin: '8px 0', fontSize: '14px', color: '#ccc' }}>
            {attacker.type} → {target.type} (距離: {distance}hex)
          </p>
          <p style={{ margin: '8px 0', fontSize: '12px', color: '#ffd700', fontWeight: 'bold' }}>
            ⚡ 使用する武器をクリックして選択してください
          </p>
        </div>

        <div className="weapons-list">
          {availableWeapons.length === 0 ? (
            <div style={{ 
              textAlign: 'center', 
              padding: '20px', 
              color: '#888',
              fontStyle: 'italic' 
            }}>
              射程内の使用可能な武器がありません
            </div>
          ) : (
            availableWeapons.map((weapon) => {
              const isSelected = selectedWeaponId === weapon.id;
              const isOutOfAmmo = weapon.ammunition === 0;
              const hitProbability = 85; // Base hit probability - can be enhanced later
              const mostEffective = getMostEffectiveWeapon();
              const isMostEffective = mostEffective?.id === weapon.id;
              
              return (
                <div
                  key={weapon.id}
                  className="weapon-option"
                  onClick={() => !isOutOfAmmo && setSelectedWeaponId(weapon.id)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '12px',
                    margin: '8px 0',
                    backgroundColor: isSelected ? '#444' : '#333',
                    border: `2px solid ${isSelected ? '#ffd700' : (isOutOfAmmo ? '#666' : '#555')}`,
                    borderRadius: '6px',
                    cursor: isOutOfAmmo ? 'not-allowed' : 'pointer',
                    opacity: isOutOfAmmo ? 0.5 : 1,
                    transition: 'all 0.2s ease'
                  }}
                  onMouseEnter={(e) => {
                    if (!isOutOfAmmo) {
                      e.currentTarget.style.backgroundColor = isSelected ? '#555' : '#444';
                      e.currentTarget.style.borderColor = isSelected ? '#ffd700' : '#888';
                    }
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = isSelected ? '#444' : '#333';
                    e.currentTarget.style.borderColor = isSelected ? '#ffd700' : (isOutOfAmmo ? '#666' : '#555');
                  }}
                >
                  <div className="weapon-info" style={{ flex: 1 }}>
                    <div className="weapon-name" style={{ 
                      fontWeight: 'bold', 
                      color: isOutOfAmmo ? '#888' : '#ffd700',
                      marginBottom: '4px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px'
                    }}>
                      {isSelected && <span style={{ color: '#ffd700' }}>◉</span>}
                      {!isSelected && <span style={{ color: '#666' }}>○</span>}
                      {weapon.name}
                      {isMostEffective && !isOutOfAmmo && <span style={{ fontSize: '10px', color: '#4CAF50', backgroundColor: '#1a4a1a', padding: '2px 4px', borderRadius: '3px' }}>推奨</span>}
                      {isOutOfAmmo && <span style={{ fontSize: '10px', color: '#f44336' }}>(弾薬切れ)</span>}
                    </div>
                    <div className="weapon-stats" style={{ 
                      fontSize: '11px', 
                      color: isOutOfAmmo ? '#666' : '#ccc',
                      lineHeight: '1.3'
                    }}>
                      <div>{getEffectivenessDisplay(weapon)}</div>
                      <div>射程: {weapon.range.min}-{weapon.range.max}hex | 命中率: {hitProbability}%</div>
                    </div>
                  </div>
                  <div className="weapon-ammo" style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    minWidth: '60px'
                  }}>
                    <div style={{ 
                      fontSize: '14px', 
                      color: weapon.ammunition > 0 ? '#4CAF50' : '#f44336',
                      fontWeight: 'bold'
                    }}>
                      {weapon.ammunition}/{weapon.maxAmmunition}
                    </div>
                    <div style={{ fontSize: '10px', color: '#888' }}>
                      弾薬
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        <div className="modal-footer" style={{ 
          marginTop: '20px', 
          display: 'flex',
          justifyContent: 'space-between',
          gap: '12px'
        }}>
          <button
            onClick={onClose}
            style={{
              padding: '10px 20px',
              backgroundColor: '#555',
              color: '#fff',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '14px'
            }}
          >
            キャンセル
          </button>
          <button
            onClick={handleConfirmSelection}
            disabled={!selectedWeaponId || availableWeapons.find(w => w.id === selectedWeaponId)?.ammunition === 0}
            style={{
              padding: '10px 20px',
              backgroundColor: selectedWeaponId ? '#28a745' : '#666',
              color: '#fff',
              border: 'none',
              borderRadius: '4px',
              cursor: selectedWeaponId ? 'pointer' : 'not-allowed',
              fontSize: '14px',
              fontWeight: 'bold'
            }}
          >
            {selectedWeaponId ? '選択した武器で攻撃' : '武器を選択してください'}
          </button>
        </div>
      </div>
    </div>
  );
};
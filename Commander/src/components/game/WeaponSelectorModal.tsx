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
  if (!isOpen) return null;

  const distance = getDistance(attacker, target);
  const availableWeapons = getWeaponsInRange(attacker, distance);

  const handleWeaponClick = (weapon: Weapon) => {
    onWeaponSelect(weapon);
    onClose();
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
            availableWeapons.map((weapon) => (
              <div
                key={weapon.id}
                className="weapon-option"
                onClick={() => handleWeaponClick(weapon)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '12px',
                  margin: '8px 0',
                  backgroundColor: '#333',
                  border: '1px solid #555',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#444';
                  e.currentTarget.style.borderColor = '#ffd700';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = '#333';
                  e.currentTarget.style.borderColor = '#555';
                }}
              >
                <div className="weapon-info">
                  <div className="weapon-name" style={{ 
                    fontWeight: 'bold', 
                    color: '#ffd700',
                    marginBottom: '4px'
                  }}>
                    {weapon.name}
                  </div>
                  <div className="weapon-stats" style={{ 
                    fontSize: '12px', 
                    color: '#ccc' 
                  }}>
                    攻撃力: {weapon.attack} | 射程: {weapon.range.min}-{weapon.range.max}
                  </div>
                </div>
                <div className="weapon-ammo" style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center'
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
            ))
          )}
        </div>

        <div className="modal-footer" style={{ 
          marginTop: '20px', 
          textAlign: 'right' 
        }}>
          <button
            onClick={onClose}
            style={{
              padding: '8px 16px',
              backgroundColor: '#555',
              color: '#fff',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            キャンセル
          </button>
        </div>
      </div>
    </div>
  );
};
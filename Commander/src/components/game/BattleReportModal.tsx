import React from 'react';
import { BattleReport } from '../../types';

interface BattleReportModalProps {
  battleReport: BattleReport | null;
  onClose: () => void;
}

const BattleReportModal: React.FC<BattleReportModalProps> = ({
  battleReport,
  onClose
}) => {
  if (!battleReport) return null;
  
  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0, 0, 0, 0.7)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000
    }}>
      <div style={{
        background: 'white',
        borderRadius: '10px',
        padding: '30px',
        maxWidth: '500px',
        width: '90%',
        boxShadow: '0 10px 30px rgba(0, 0, 0, 0.3)'
      }}>
        <h2 style={{ margin: '0 0 20px 0', color: '#333', textAlign: 'center' }}>Battle Report</h2>
        
        <div style={{ marginBottom: '20px' }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            marginBottom: '15px',
            padding: '15px',
            background: '#f8f9fa',
            borderRadius: '8px'
          }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontWeight: 'bold', color: '#0066cc' }}>
                {battleReport.attacker.type}
              </div>
              <div style={{ fontSize: '12px', color: '#666' }}>
                {battleReport.attacker.team} Team
              </div>
              <div style={{ fontSize: '14px', marginTop: '5px' }}>
                HP: {battleReport.attacker.hp}/{battleReport.attacker.maxHp}
              </div>
            </div>
            
            <div style={{ alignSelf: 'center', fontSize: '24px' }}>⚔️</div>
            
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontWeight: 'bold', color: '#cc0000' }}>
                {battleReport.defender.type}
              </div>
              <div style={{ fontSize: '12px', color: '#666' }}>
                {battleReport.defender.team} Team
              </div>
              <div style={{ fontSize: '14px', marginTop: '5px' }}>
                HP: {battleReport.defender.hp}/{battleReport.defender.maxHp}
              </div>
            </div>
          </div>
          
          <div style={{
            padding: '15px',
            background: '#fff3cd',
            borderRadius: '8px',
            border: '1px solid #ffeaa7'
          }}>
            <div style={{ whiteSpace: 'pre-line', lineHeight: '1.5' }}>
              {battleReport.report}
            </div>
            
            {battleReport.damage > 0 && (
              <div style={{ marginTop: '10px', fontWeight: 'bold', color: '#e74c3c' }}>
                Damage dealt: {battleReport.damage}
              </div>
            )}
            
            {battleReport.counterDamage && battleReport.counterDamage > 0 && (
              <div style={{ marginTop: '5px', fontWeight: 'bold', color: '#e74c3c' }}>
                Counter damage: {battleReport.counterDamage}
              </div>
            )}
          </div>
        </div>
        
        <div style={{ textAlign: 'center' }}>
          <button
            onClick={onClose}
            style={{
              padding: '10px 30px',
              fontSize: '16px',
              background: '#007bff',
              color: 'white',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer',
              transition: 'background-color 0.2s'
            }}
            onMouseOver={(e) => e.currentTarget.style.background = '#0056b3'}
            onMouseOut={(e) => e.currentTarget.style.background = '#007bff'}
          >
            Continue
          </button>
        </div>
      </div>
    </div>
  );
};

export default BattleReportModal;
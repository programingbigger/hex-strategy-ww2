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
        <h2 style={{ margin: '0 0 20px 0', color: '#2c3e50', textAlign: 'center', fontSize: '24px', fontWeight: 'bold' }}>Battle Report</h2>
        
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
              <div style={{ fontWeight: 'bold', color: '#2980b9', fontSize: '18px' }}>
                {battleReport.attacker.type}
              </div>
              <div style={{ fontSize: '14px', color: '#34495e', fontWeight: '500' }}>
                {battleReport.attacker.team} Team
              </div>
              <div style={{ fontSize: '16px', marginTop: '8px', color: '#2c3e50', fontWeight: 'bold' }}>
                HP: {battleReport.attacker.hp}/{battleReport.attacker.maxHp}
              </div>
            </div>
            
            <div style={{ alignSelf: 'center', fontSize: '24px' }}>⚔️</div>
            
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontWeight: 'bold', color: '#e74c3c', fontSize: '18px' }}>
                {battleReport.defender.type}
              </div>
              <div style={{ fontSize: '14px', color: '#34495e', fontWeight: '500' }}>
                {battleReport.defender.team} Team
              </div>
              <div style={{ fontSize: '16px', marginTop: '8px', color: '#2c3e50', fontWeight: 'bold' }}>
                HP: {battleReport.defender.hp}/{battleReport.defender.maxHp}
              </div>
            </div>
          </div>
          
          <div style={{
            padding: '20px',
            background: '#f8f9fa',
            borderRadius: '8px',
            border: '2px solid #dee2e6'
          }}>
            <div style={{ 
              whiteSpace: 'pre-line', 
              lineHeight: '1.6', 
              fontSize: '16px',
              color: '#2c3e50',
              fontWeight: '500',
              marginBottom: '15px'
            }}>
              {battleReport.report}
            </div>
            
            {/* Damage Summary Section */}
            <div style={{
              background: 'linear-gradient(135deg, #e8f5e8 0%, #f0f8f0 100%)',
              borderRadius: '8px',
              padding: '15px',
              border: '1px solid #28a745'
            }}>
              <h4 style={{
                margin: '0 0 10px 0',
                color: '#155724',
                fontSize: '18px',
                fontWeight: 'bold',
                textAlign: 'center'
              }}>
                💥 Battle Results
              </h4>
              
              {battleReport.damage > 0 && (
                <div style={{ 
                  marginBottom: '8px', 
                  fontSize: '16px',
                  fontWeight: 'bold',
                  color: '#dc3545',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  background: 'rgba(220, 53, 69, 0.1)',
                  padding: '8px 12px',
                  borderRadius: '4px'
                }}>
                  <span>🎯 {battleReport.attacker.type} → {battleReport.defender.type}:</span>
                  <span style={{ fontSize: '18px' }}>{battleReport.damage} damage</span>
                </div>
              )}
              
              {battleReport.counterDamage && battleReport.counterDamage > 0 && (
                <div style={{ 
                  fontSize: '16px',
                  fontWeight: 'bold',
                  color: '#fd7e14',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  background: 'rgba(253, 126, 20, 0.1)',
                  padding: '8px 12px',
                  borderRadius: '4px'
                }}>
                  <span>🔄 {battleReport.defender.type} → {battleReport.attacker.type}:</span>
                  <span style={{ fontSize: '18px' }}>{battleReport.counterDamage} damage</span>
                </div>
              )}
              
              {(!battleReport.damage || battleReport.damage === 0) && (!battleReport.counterDamage || battleReport.counterDamage === 0) && (
                <div style={{
                  fontSize: '16px',
                  fontWeight: 'bold',
                  color: '#6c757d',
                  textAlign: 'center',
                  fontStyle: 'italic'
                }}>
                  No damage dealt
                </div>
              )}
            </div>
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
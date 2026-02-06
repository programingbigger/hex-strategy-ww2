import React from 'react';
import { EnvironmentalLevels } from '../../types';

interface EnvironmentalLevelsDisplayProps {
  environmentalLevels: EnvironmentalLevels;
}

const EnvironmentalLevelsDisplay: React.FC<EnvironmentalLevelsDisplayProps> = ({
  environmentalLevels
}) => {
  const { wetness, snow } = environmentalLevels;

  return (
    <div
      className="environmental-levels-display"
      style={{
        position: 'fixed',
        top: '80px',
        right: '20px',
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
        backgroundColor: 'rgba(42, 42, 42, 0.9)',
        padding: '12px',
        borderRadius: '8px',
        border: '1px solid #555',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.3)',
        zIndex: 1000,
        minWidth: '140px'
      }}
    >
      {/* Title */}
      <div style={{
        fontSize: '12px',
        color: '#a0aec0',
        textAlign: 'center',
        fontWeight: 'bold',
        borderBottom: '1px solid #555',
        paddingBottom: '6px',
        marginBottom: '4px'
      }}>
        環境レベル
      </div>

      {/* Wetness Level */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '8px'
      }}>
        <div style={{
          fontSize: '11px',
          color: '#e2e8f0',
          display: 'flex',
          alignItems: 'center',
          gap: '4px'
        }}>
          <span style={{ fontSize: '14px' }}>💧</span>
          <span>湿度</span>
        </div>
        <div style={{
          backgroundColor: '#1a202c',
          color: wetness > 0 ? '#4299e1' : '#718096',
          padding: '4px 10px',
          borderRadius: '4px',
          fontSize: '13px',
          fontWeight: 'bold',
          border: '1px solid #555',
          minWidth: '40px',
          textAlign: 'center'
        }}>
          {wetness}
        </div>
      </div>

      {/* Snow Level */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '8px'
      }}>
        <div style={{
          fontSize: '11px',
          color: '#e2e8f0',
          display: 'flex',
          alignItems: 'center',
          gap: '4px'
        }}>
          <span style={{ fontSize: '14px' }}>❄️</span>
          <span>積雪</span>
        </div>
        <div style={{
          backgroundColor: '#1a202c',
          color: snow > 0 ? '#63b3ed' : '#718096',
          padding: '4px 10px',
          borderRadius: '4px',
          fontSize: '13px',
          fontWeight: 'bold',
          border: '1px solid #555',
          minWidth: '40px',
          textAlign: 'center'
        }}>
          {snow}
        </div>
      </div>

      {/* Visual Bar for Wetness */}
      <div style={{
        marginTop: '4px'
      }}>
        <div style={{
          height: '4px',
          backgroundColor: '#2d3748',
          borderRadius: '2px',
          overflow: 'hidden'
        }}>
          <div style={{
            height: '100%',
            width: `${Math.min((wetness / 5) * 100, 100)}%`,
            backgroundColor: wetness > 0 ? '#4299e1' : 'transparent',
            transition: 'width 0.3s ease'
          }} />
        </div>
      </div>

      {/* Visual Bar for Snow */}
      <div>
        <div style={{
          height: '4px',
          backgroundColor: '#2d3748',
          borderRadius: '2px',
          overflow: 'hidden'
        }}>
          <div style={{
            height: '100%',
            width: `${Math.min((snow / 5) * 100, 100)}%`,
            backgroundColor: snow > 0 ? '#63b3ed' : 'transparent',
            transition: 'width 0.3s ease'
          }} />
        </div>
      </div>
    </div>
  );
};

export default EnvironmentalLevelsDisplay;

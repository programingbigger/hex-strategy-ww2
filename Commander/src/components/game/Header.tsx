import React from 'react';
import { Team, WeatherType } from '../../types';

interface HeaderProps {
  turn: number;
  activeTeam: Team;
  weather: WeatherType;
  blueUnits: number;
  redUnits: number;
  onEndTurn: () => void;
  onSave?: () => void;
  onLoad?: () => void;
}

const Header: React.FC<HeaderProps> = ({
  turn,
  activeTeam,
  weather,
  blueUnits,
  redUnits,
  onEndTurn,
  onSave,
  onLoad
}) => {
  const getWeatherEmoji = (weather: WeatherType) => {
    switch (weather) {
      case 'Clear': return '☀️';
      case 'Rain': return '🌧️';
      case 'HeavyRain': return '⛈️';
      default: return '☀️';
    }
  };
  
  return (
    <div style={{
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      color: 'white',
      padding: '15px 30px',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      boxShadow: '0 2px 10px rgba(0,0,0,0.2)'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '30px' }}>
        <div style={{ fontSize: '24px', fontWeight: 'bold' }}>
          Turn {turn}
        </div>
        
        <div style={{
          padding: '8px 16px',
          background: activeTeam === 'Blue' ? '#0066cc' : '#cc0000',
          borderRadius: '20px',
          fontSize: '16px',
          fontWeight: 'bold'
        }}>
          {activeTeam} Team's Turn
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ fontSize: '20px' }}>{getWeatherEmoji(weather)}</span>
          <span style={{ fontSize: '16px' }}>{weather}</span>
        </div>
        
        <div style={{ display: 'flex', gap: '20px', fontSize: '16px' }}>
          <div style={{ color: '#87ceeb' }}>
            🔵 Blue: {blueUnits}
          </div>
          <div style={{ color: '#ffb6c1' }}>
            🔴 Red: {redUnits}
          </div>
        </div>
      </div>
      
      <div style={{ display: 'flex', gap: '10px' }}>
        {onSave && (
          <button
            onClick={onSave}
            style={{
              padding: '10px 20px',
              background: 'rgba(255, 255, 255, 0.2)',
              color: 'white',
              border: '1px solid rgba(255, 255, 255, 0.3)',
              borderRadius: '5px',
              cursor: 'pointer',
              fontSize: '14px'
            }}
          >
            Save
          </button>
        )}
        
        {onLoad && (
          <button
            onClick={onLoad}
            style={{
              padding: '10px 20px',
              background: 'rgba(255, 255, 255, 0.2)',
              color: 'white',
              border: '1px solid rgba(255, 255, 255, 0.3)',
              borderRadius: '5px',
              cursor: 'pointer',
              fontSize: '14px'
            }}
          >
            Load
          </button>
        )}
        
        <button
          onClick={onEndTurn}
          style={{
            padding: '12px 24px',
            background: '#28a745',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer',
            fontSize: '16px',
            fontWeight: 'bold',
            transition: 'background-color 0.2s'
          }}
          onMouseOver={(e) => e.currentTarget.style.background = '#218838'}
          onMouseOut={(e) => e.currentTarget.style.background = '#28a745'}
        >
          End Turn
        </button>
      </div>
    </div>
  );
};

export default Header;
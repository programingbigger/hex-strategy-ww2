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
      background: 'rgba(102, 126, 234, 0.9)',
      color: 'white',
      padding: '10px 15px',
      borderRadius: '10px',
      boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
      backdropFilter: 'blur(10px)',
      minWidth: '300px'
    }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ fontSize: '18px', fontWeight: 'bold' }}>
            Turn {turn}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '16px' }}>{getWeatherEmoji(weather)}</span>
            <span style={{ fontSize: '14px' }}>{weather}</span>
          </div>
        </div>
        
        <div style={{
          padding: '6px 12px',
          background: activeTeam === 'Blue' ? 'rgba(0, 102, 204, 0.8)' : 'rgba(204, 0, 0, 0.8)',
          borderRadius: '15px',
          fontSize: '14px',
          fontWeight: 'bold',
          textAlign: 'center'
        }}>
          {activeTeam} Team's Turn
        </div>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px' }}>
          <div style={{ color: '#87ceeb' }}>
            🔵 {blueUnits}
          </div>
          <div style={{ color: '#ffb6c1' }}>
            🔴 {redUnits}
          </div>
        </div>
        
        <button
          onClick={onEndTurn}
          style={{
            padding: '8px 16px',
            background: '#28a745',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer',
            fontSize: '14px',
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
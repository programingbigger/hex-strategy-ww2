import React from 'react';
import { Team, WeatherType } from '../../types';

interface HeaderProps {
  turn: number;
  activeTeam: Team;
  weather: WeatherType;
  blueUnits: number;
  redUnits: number;
  onSave?: () => void;
  onLoad?: () => void;
}

const Header: React.FC<HeaderProps> = ({
  turn,
  activeTeam,
  weather,
  blueUnits,
  redUnits,
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
      color: 'white',
      padding: '15px 30px',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      height: '70px',
      boxSizing: 'border-box',
      position: 'relative'
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
      
      <div style={{ 
        position: 'absolute', 
        right: '30px',
        display: 'flex', 
        gap: '10px' 
      }}>
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
        

      </div>
    </div>
  );
};

export default Header;
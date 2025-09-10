import React from 'react';
import { Team, WeatherType } from '../../types';
import '../../styles/military-museum-theme.css';

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
      case 'Storm': return '⛈️';
      case 'Cloudy': return '☁️';
      default: return '☀️';
    }
  };;
  
  return (
    <div className="military-header" style={{
      padding: '15px 30px',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      height: '70px',
      boxSizing: 'border-box',
      position: 'relative'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
        <div className="military-stencil" style={{ 
          fontSize: '16px', 
          fontWeight: 'bold',
          padding: '6px 12px'
        }}>
          TURN {turn}
        </div>
        
        <div className="military-stencil" style={{
          padding: '6px 12px',
          background: activeTeam === 'Blue' ? 'var(--museum-brass)' : 'var(--museum-rust)',
          fontSize: '14px',
          fontWeight: 'bold',
          color: 'var(--museum-wood-dark)'
        }}>
          {activeTeam.toUpperCase()} PHASE
        </div>
        
        <div className="military-stencil" style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '8px',
          padding: '4px 8px',
          fontSize: '12px'
        }}>
          <span style={{ fontSize: '16px' }}>{getWeatherEmoji(weather)}</span>
          <span>{weather.toUpperCase()}</span>
        </div>
        
        <div style={{ display: 'flex', gap: '15px', fontSize: '14px' }}>
          <div className="military-stencil" style={{ 
            color: 'var(--museum-wood-dark)',
            background: 'var(--museum-brass)',
            padding: '3px 8px',
            fontSize: '11px'
          }}>
            🔵 BLUE: {blueUnits}
          </div>
          <div className="military-stencil" style={{ 
            color: 'var(--museum-wood-dark)',
            background: 'var(--museum-rust)',
            padding: '3px 8px',
            fontSize: '11px'
          }}>
            🔴 RED: {redUnits}
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
            className="military-button"
            style={{
              fontSize: '12px',
              padding: '6px 12px'
            }}
          >
            SAVE
          </button>
        )}
        
        {onLoad && (
          <button
            onClick={onLoad}
            className="military-button"
            style={{
              fontSize: '12px',
              padding: '6px 12px'
            }}
          >
            LOAD
          </button>
        )}
        

      </div>
    </div>
  );
};

export default Header;
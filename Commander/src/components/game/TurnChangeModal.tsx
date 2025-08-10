import React from 'react';

interface TurnChangeModalProps {
  isOpen: boolean;
  turn: number;
  activeTeam: 'Blue' | 'Red';
  weather: string;
  onClose: () => void;
}

const TurnChangeModal: React.FC<TurnChangeModalProps> = ({
  isOpen,
  turn,
  activeTeam,
  weather,
  onClose
}) => {
  if (!isOpen) return null;

  const getWeatherIcon = (weather: string) => {
    switch (weather) {
      case 'Clear': return '☀️';
      case 'Rain': return '🌧️';
      case 'Snow': return '❄️';
      case 'Fog': return '🌫️';
      default: return '🌤️';
    }
  };

  const getTeamColor = (team: 'Blue' | 'Red') => {
    return team === 'Blue' ? '#3498db' : '#e74c3c';
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.8)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 2500,
      animation: 'fadeIn 0.3s ease-in'
    }}>
      <div style={{
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        borderRadius: '16px',
        padding: '40px',
        minWidth: '500px',
        textAlign: 'center',
        boxShadow: '0 12px 40px rgba(0, 0, 0, 0.4)',
        border: `3px solid ${getTeamColor(activeTeam)}`,
        color: 'white'
      }}>
        <div style={{
          fontSize: '48px',
          marginBottom: '20px'
        }}>
          🚀
        </div>
        
        <h1 style={{
          margin: '0 0 30px 0',
          fontSize: '32px',
          fontWeight: 'bold',
          textShadow: '2px 2px 4px rgba(0,0,0,0.3)'
        }}>
          Turn Changed!
        </h1>
        
        <div style={{
          background: 'rgba(255, 255, 255, 0.1)',
          borderRadius: '12px',
          padding: '25px',
          marginBottom: '30px',
          backdropFilter: 'blur(10px)'
        }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-around',
            alignItems: 'center',
            gap: '30px'
          }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ 
                fontSize: '20px', 
                marginBottom: '8px',
                opacity: 0.8
              }}>
                Turn
              </div>
              <div style={{ 
                fontSize: '36px', 
                fontWeight: 'bold',
                color: '#f39c12'
              }}>
                {turn}
              </div>
            </div>
            
            <div style={{ textAlign: 'center' }}>
              <div style={{ 
                fontSize: '20px', 
                marginBottom: '8px',
                opacity: 0.8
              }}>
                Active Team
              </div>
              <div style={{ 
                fontSize: '28px', 
                fontWeight: 'bold',
                color: getTeamColor(activeTeam),
                textShadow: '2px 2px 4px rgba(0,0,0,0.5)'
              }}>
                {activeTeam} Team
              </div>
            </div>
            
            <div style={{ textAlign: 'center' }}>
              <div style={{ 
                fontSize: '20px', 
                marginBottom: '8px',
                opacity: 0.8
              }}>
                Weather
              </div>
              <div style={{ 
                fontSize: '32px',
                marginBottom: '5px'
              }}>
                {getWeatherIcon(weather)}
              </div>
              <div style={{ 
                fontSize: '18px', 
                fontWeight: 'bold'
              }}>
                {weather}
              </div>
            </div>
          </div>
        </div>
        
        <button
          onClick={onClose}
          style={{
            padding: '15px 40px',
            fontSize: '20px',
            fontWeight: 'bold',
            border: '2px solid white',
            borderRadius: '10px',
            background: 'rgba(255, 255, 255, 0.2)',
            color: 'white',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            backdropFilter: 'blur(10px)'
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.3)';
            e.currentTarget.style.transform = 'translateY(-3px)';
            e.currentTarget.style.boxShadow = '0 6px 20px rgba(0,0,0,0.3)';
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)';
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = 'none';
          }}
        >
          Continue ⚡
        </button>
        
        <div style={{
          marginTop: '20px',
          fontSize: '14px',
          opacity: 0.7
        }}>
          Click to continue or press any key
        </div>
      </div>
    </div>
  );
};

export default TurnChangeModal;
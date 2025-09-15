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
      case 'Storm': return '⛈️';
      case 'Cloudy': return '☁️';
      case 'Snow': return '🌨️';
      case 'Blizzard': return '❄️';
      case 'Fog': return '🌫️';
      default: return '🌤️';
    }
  };;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="military-dialog turn-change-dialog">
        <h2 className="dialog-title">ターン変更</h2>
        
        <div className="turn-info-grid">
          <div className="turn-info-item">
            <div className="turn-info-label">ターン</div>
            <div className="turn-info-value turn-number">{turn}</div>
          </div>
          
          <div className="turn-info-item">
            <div className="turn-info-label">行動フェーズ</div>
            <div className={`turn-info-value team-${activeTeam.toLowerCase()}`}>
              {activeTeam === 'Blue' ? '青軍' : '赤軍'}
            </div>
          </div>
          
          <div className="turn-info-item">
            <div className="turn-info-label">天候</div>
            <div className="turn-info-value weather">
              {getWeatherIcon(weather)} {weather}
            </div>
          </div>
        </div>
        
        <div className="dialog-tip">クリックまたは何かキーを押して継続</div>
      </div>
    </div>
  );
};

export default TurnChangeModal;
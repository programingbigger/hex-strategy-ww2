import React from 'react';
import { Team, WeatherType } from '../../types';
import '../../styles/military-museum-theme.css';

interface HeaderProps {
  className?: string;
  turn: number;
  activeTeam: Team;
  weather: WeatherType;
  blueUnits: number;
  redUnits: number;
  blueFunds?: number;
  redFunds?: number;
  onSave?: () => void;
  onLoad?: () => void;
}

const Header: React.FC<HeaderProps> = ({
  turn,
  activeTeam,
  weather,
  blueUnits,
  redUnits,
  blueFunds,
  redFunds,
  onSave,
  onLoad,
  className
}) => {
  const getWeatherEmoji = (weather: WeatherType) => {
    switch (weather) {
      case 'Clear': return '☀️';
      case 'Rain': return '🌧️';
      case 'Storm': return '⛈️';
      case 'Cloudy': return '☁️';
      case 'Snow': return '🌨️';
      case 'Blizzard': return '❄️';
      default: return '☀️';
    }
  };;

  const formatFunds = (funds?: number): string => {
    if (funds === undefined) return '0';
    return funds.toLocaleString();
  };

  return (
    <div className={className}>
      <div className="header-left">
        <span className="header-item">ターン: {turn}</span>
        <span className={`header-item team-${activeTeam.toLowerCase()}`}>{activeTeam === 'Blue' ? '青軍' : '赤軍'}フェーズ</span>
        <span className="header-item weather">{getWeatherEmoji(weather)} {weather}</span>
        <span className="header-item funds">軍資金：{formatFunds(activeTeam === 'Blue' ? blueFunds : redFunds)}</span>
      </div>
      <div className="header-right">
        <span className="header-item-small blue">青軍: {blueUnits}</span>
        <span className="header-item-small red">赤軍: {redUnits}</span>
        {onSave && <button onClick={onSave} className="military-button">セーブ</button>}
        {onLoad && <button onClick={onLoad} className="military-button">ロード</button>}
      </div>
    </div>
  );
};

export default Header;
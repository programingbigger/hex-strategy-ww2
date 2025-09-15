import React from 'react';
import { Team, WeatherType } from '../../types';
import '../../styles/military-museum-theme.css';

interface HeaderProps {
  className?: string;
  turn: number;
  month: number;
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
  month,
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
      case 'Fog': return '🌫️';
      default: return '☀️';
    }
  };

  const getMonthName = (month: number): string => {
    const monthNames = [
      '1月', '2月', '3月', '4月', '5月', '6月',
      '7月', '8月', '9月', '10月', '11月', '12月'
    ];
    return monthNames[month - 1] || '1月';
  };;

  const formatFunds = (funds?: number): string => {
    if (funds === undefined) return '0';
    return funds.toLocaleString();
  };

  return (
    <div className={className}>
      <div className="header-left">
        <span className="header-item">ターン: {turn}</span>
        <span className="header-item">📅 {getMonthName(month)}</span>
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
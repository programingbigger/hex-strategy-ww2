import React from 'react';
import { Team, WeatherType, EnvironmentalLevels } from '../../types';
import '../../styles/military-museum-theme.css';

interface HeaderProps {
  className?: string;
  turn: number;
  month: number;
  year?: number;
  day?: number;
  activeTeam: Team;
  weather: WeatherType;
  environmentalLevels?: EnvironmentalLevels;
  blueUnits: number;
  redUnits: number;
  blueFunds?: number;
  redFunds?: number;
  blueMaxUnits?: number;
  redMaxUnits?: number;
  onSave?: () => void;
  onLoad?: () => void;
}

const Header: React.FC<HeaderProps> = ({
  turn,
  month,
  year,
  day,
  activeTeam,
  weather,
  environmentalLevels,
  blueUnits,
  redUnits,
  blueFunds,
  redFunds,
  blueMaxUnits,
  redMaxUnits,
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
  };

  const formatDate = (year?: number, month?: number, day?: number): string => {
    if (year && month && day) {
      return `${year}年${getMonthName(month)}${day}日`;
    } else if (month) {
      return getMonthName(month);
    } else {
      return '1月';
    }
  };

  const formatFunds = (funds?: number): string => {
    if (funds === undefined) return '0';
    return funds.toLocaleString();
  };

  return (
    <div className={className} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
      {/* Left side - Controls */}
      <div className="header-controls" style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
        {onSave && <button onClick={onSave} className="military-button">セーブ</button>}
        {onLoad && <button onClick={onLoad} className="military-button">ロード</button>}
      </div>

      {/* Center - Main game information */}
      <div className="header-center" style={{ display: 'flex', gap: '20px', alignItems: 'center', textAlign: 'center' }}>
        <span className="header-item">ターン: {turn}</span>
        <span className="header-item">📅 {formatDate(year, month, day)}</span>
        <span className={`header-item team-${activeTeam.toLowerCase()}`}>{activeTeam === 'Blue' ? '青軍' : '赤軍'}フェーズ</span>
        <span className="header-item weather">{getWeatherEmoji(weather)} {weather}</span>
        {environmentalLevels && (
          <span className="header-item environmental" style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <span style={{ color: environmentalLevels.wetness > 0 ? '#4299e1' : '#718096' }}>💧{environmentalLevels.wetness}</span>
            <span style={{ color: environmentalLevels.snow > 0 ? '#63b3ed' : '#718096' }}>❄️{environmentalLevels.snow}</span>
          </span>
        )}
        <span className="header-item funds">軍資金：{formatFunds(activeTeam === 'Blue' ? blueFunds : redFunds)}</span>
      </div>

      {/* Right side - Unit counts */}
      <div className="header-units" style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
        <span className="header-item-small blue">青軍: {blueUnits}/{blueMaxUnits || 10}</span>
        <span className="header-item-small red">赤軍: {redUnits}/{redMaxUnits || 10}</span>
      </div>
    </div>
  );
};

export default Header;
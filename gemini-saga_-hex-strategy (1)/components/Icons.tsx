import React from 'react';
import type { UnitType, Team } from '../types';
import { TEAM_COLORS } from '../constants';

interface UnitIconProps extends React.SVGProps<SVGSVGElement> {
  type: UnitType;
  team: Team;
}

export const UnitIcon: React.FC<UnitIconProps> = ({ type, team, ...props }) => {
  const color = TEAM_COLORS[team].hex;
  
  const symbol = () => {
    switch(type) {
      case 'Infantry':
        return (
            <>
                <line x1="5" y1="5" x2="55" y2="35" stroke="white" strokeWidth="4" strokeLinecap="round"/>
                <line x1="55" y1="5" x2="5" y2="35" stroke="white" strokeWidth="4" strokeLinecap="round"/>
            </>
        );
      case 'Tank':
         return <ellipse cx="30" cy="20" rx="20" ry="12" stroke="white" strokeWidth="3" fill="none" />;
      case 'ArmoredCar':
         return <line x1="5" y1="35" x2="55" y2="5" stroke="white" strokeWidth="4" strokeLinecap="round"/>;
      default:
        return null;
    }
  }

  return (
    <svg viewBox="0 0 60 40" {...props}>
        <rect width="60" height="40" rx="4" fill={color} stroke="white" strokeWidth="2.5" />
        {symbol()}
    </svg>
  );
};
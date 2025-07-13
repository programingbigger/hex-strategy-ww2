
import React from 'react';
import { UnitType, Player } from '../types';

interface UnitIconProps {
  type: UnitType;
  player: Player;
  hasMoved: boolean;
}

const TankIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" viewBox="0 0 24 24" fill="currentColor">
        <path d="M20.5 16.5c.83 0 1.5-.67 1.5-1.5s-.67-1.5-1.5-1.5-1.5.67-1.5 1.5.67 1.5 1.5 1.5zM3.5 15c0 .83.67 1.5 1.5 1.5s1.5-.67 1.5-1.5-.67-1.5-1.5-1.5-1.5.67-1.5 1.5zM21 13.47c0-.2-.04-.39-.09-.57l-2.2-7.14C18.48 5.09 17.82 4.5 17 4.5H7c-.82 0-1.48.59-1.71 1.26L3.09 12.9c-.05.18-.09.37-.09.57V18h1v-2h16v2h1v-4.53zM7.43 6.5h9.14L18.39 11H5.61L7.43 6.5z"/>
    </svg>
);

const InfantryIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 2c1.1 0 2 .9 2 2s-.9 2-2 2-2-.9-2-2 .9-2 2-2zm9 7h-6v13h-2v-6h-2v6H9V9H3V7h18v2z"/>
    </svg>
);

const ArtilleryIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" viewBox="0 0 24 24" fill="currentColor">
        <path d="M11 11.58V15H4.21c-.45 0-.67.54-.35.85l7.14 7.14c.2.2.51.2.71 0l7.14-7.14c.32-.31.09-.85-.35-.85H13v-3.42c3.42-.48 6-3.35 6-6.91C19 2.01 16.99 0 14.67 0H9.33C7.01 0 5 2.01 5 4.67c0 3.56 2.58 6.43 6 6.91zm.5-9.08c.83 0 1.5.67 1.5 1.5s-.67 1.5-1.5 1.5-1.5-.67-1.5-1.5.67-1.5 1.5-1.5z"/>
    </svg>
);

const unitIcons: Record<UnitType, React.ReactNode> = {
  [UnitType.Tank]: <TankIcon />,
  [UnitType.Infantry]: <InfantryIcon />,
  [UnitType.Artillery]: <ArtilleryIcon />,
};

const playerColors: Record<Player, string> = {
  [Player.Allies]: 'text-green-300',
  [Player.Axis]: 'text-red-300',
};

const UnitIcon: React.FC<UnitIconProps> = ({ type, player, hasMoved }) => {
  const colorClass = playerColors[player];
  const opacityClass = hasMoved ? 'opacity-50' : 'opacity-100';

  return (
    <div className={`transition-opacity duration-300 ${colorClass} ${opacityClass}`}>
      {unitIcons[type]}
    </div>
  );
};

export default UnitIcon;

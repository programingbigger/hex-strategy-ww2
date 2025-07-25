import React from 'react';
import { WeatherType } from '../../types';

interface RainEffectProps {
  weather: WeatherType;
}

const RainEffect: React.FC<RainEffectProps> = ({ weather }) => {
  if (weather !== 'Rain' && weather !== 'HeavyRain') {
    return null;
  }

  const isHeavyRain = weather === 'HeavyRain';
  const dropCount = isHeavyRain ? 150 : 80;
  const opacity = isHeavyRain ? 0.6 : 0.4;
  const animationSpeed = isHeavyRain ? '0.5s' : '0.8s';

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        zIndex: 500, // Below header (1000) but above game content
        overflow: 'hidden'
      }}
    >
      {/* Rain drops */}
      {Array.from({ length: dropCount }, (_, i) => (
        <div
          key={i}
          style={{
            position: 'absolute',
            left: `${Math.random() * 100}%`,
            width: '2px',
            height: `${Math.random() * 15 + 10}px`,
            background: `linear-gradient(to bottom, transparent, rgba(173, 216, 230, ${opacity}))`,
            borderRadius: '1px',
            animation: `rainDrop ${animationSpeed} infinite linear`,
            animationDelay: `${Math.random() * 2}s`,
            transform: 'rotate(10deg)'
          }}
        />
      ))}
      
      {/* Add CSS keyframes for rain animation */}
      <style>
        {`
          @keyframes rainDrop {
            0% {
              transform: translateY(-100vh) rotate(10deg);
              opacity: 0;
            }
            10% {
              opacity: ${opacity};
            }
            90% {
              opacity: ${opacity};
            }
            100% {
              transform: translateY(100vh) rotate(10deg);
              opacity: 0;
            }
          }
        `}
      </style>
    </div>
  );
};

export default RainEffect;
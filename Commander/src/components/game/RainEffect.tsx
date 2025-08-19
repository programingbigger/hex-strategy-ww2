import React from 'react';
import { WeatherType } from '../../types';

interface RainEffectProps {
  weather: WeatherType;
}

const RainEffect: React.FC<RainEffectProps> = ({ weather }) => {
  if (weather !== 'Rain' && weather !== 'HeavyRain' && weather !== 'Storm') {
    return null;
  }

  const isHeavyRain = weather === 'HeavyRain';
  const isStorm = weather === 'Storm';
  const dropCount = isStorm ? 200 : isHeavyRain ? 150 : 80;
  const opacity = isStorm ? 0.8 : isHeavyRain ? 0.6 : 0.4;
  const animationSpeed = isStorm ? '0.3s' : isHeavyRain ? '0.5s' : '0.8s';

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
            width: isStorm ? '3px' : '2px',
            height: `${Math.random() * 15 + 10}px`,
            background: isStorm 
              ? `linear-gradient(to bottom, transparent, rgba(135, 206, 235, ${opacity}))` 
              : `linear-gradient(to bottom, transparent, rgba(173, 216, 230, ${opacity}))`,
            borderRadius: '1px',
            animation: `rainDrop ${animationSpeed} infinite linear`,
            animationDelay: `${Math.random() * 2}s`,
            transform: 'rotate(10deg)'
          }}
        />
      ))}
      
      {/* Lightning effect for storm */}
      {isStorm && (
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            background: 'rgba(255, 255, 255, 0.1)',
            animation: 'lightning 3s infinite',
            animationDelay: `${Math.random() * 5}s`
          }}
        />
      )}
      
      {/* Add CSS keyframes for rain and lightning animation */}
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
          
          @keyframes lightning {
            0%, 90%, 96%, 100% {
              background: rgba(255, 255, 255, 0);
            }
            93%, 94% {
              background: rgba(255, 255, 255, 0.4);
            }
            95% {
              background: rgba(255, 255, 255, 0.6);
            }
          }
        `}
      </style>
    </div>
  );
};

export default RainEffect;